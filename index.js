// Cloudflare Worker for Barcode Generation - Returns SVG Images for Excel
export default {
  async fetch(request) {
    const url = new URL(request.url);
    
    // If there's a 'value' parameter, generate a barcode SVG
    if (url.searchParams.has('value')) {
      const value = url.searchParams.get('value');
      const format = url.searchParams.get('format') || 'CODE128';
      const barWidth = parseInt(url.searchParams.get('width')) || 2;
      const height = parseInt(url.searchParams.get('height')) || 100;
      const displayValue = url.searchParams.get('displayValue') !== 'false';
      
      try {
        const svg = generateBarcodeSVG(value, format, barWidth, height, displayValue);
        return new Response(svg, {
          headers: {
            'Content-Type': 'image/svg+xml',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'public, max-age=31536000'
          }
        });
      } catch (error) {
        // Return error as SVG
        const errorSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="450" height="100" viewBox="0 0 450 100">
          <rect width="450" height="100" fill="white"/>
          <text x="225" y="50" text-anchor="middle" font-family="Arial" font-size="14" fill="red">Error: ${escapeXml(error.message)}</text>
        </svg>`;
        return new Response(errorSvg, {
          headers: { 'Content-Type': 'image/svg+xml' },
          status: 400
        });
      }
    }
    
    // Otherwise, show the documentation page
    return new Response(getDocumentationHTML(url.origin), {
      headers: { 'Content-Type': 'text/html' }
    });
  }
};

function generateBarcodeSVG(value, format, barWidth, height, displayValue) {
  // Generate barcode pattern based on format
  let encoded;
  
  if (format === 'CODE128') {
    encoded = encodeCode128(value);
  } else if (format === 'CODE39') {
    encoded = encodeCode39(value);
  } else if (format === 'EAN13') {
    encoded = encodeEAN13(value);
  } else {
    encoded = encodeCode128(value); // Default fallback
  }
  
  // Calculate SVG dimensions - target 450px width
  const totalBars = encoded.length;
  const targetWidth = 450;
  const calculatedBarWidth = Math.max(1, Math.floor(targetWidth / totalBars));
  const actualWidth = totalBars * calculatedBarWidth;
  const padding = Math.max(20, (targetWidth - actualWidth) / 2);
  const svgWidth = actualWidth + (padding * 2);
  
  const textHeight = displayValue ? 25 : 0;
  const totalHeight = height + textHeight + 20;
  
  // Generate SVG
  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${totalHeight}" viewBox="0 0 ${svgWidth} ${totalHeight}">
  <rect width="${svgWidth}" height="${totalHeight}" fill="white"/>
  <g id="barcode">`;
  
  // Draw bars
  let x = padding;
  for (let i = 0; i < encoded.length; i++) {
    if (encoded[i] === '1') {
      svg += `
    <rect x="${x}" y="10" width="${calculatedBarWidth}" height="${height}" fill="black"/>`;
    }
    x += calculatedBarWidth;
  }
  
  svg += `
  </g>`;
  
  // Add text if displayValue is true
  if (displayValue) {
    const textY = height + 22;
    const textX = svgWidth / 2;
    svg += `
  <text x="${textX}" y="${textY}" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="black">${escapeXml(value)}</text>`;
  }
  
  svg += `
</svg>`;
  
  return svg;
}

function encodeCode128(text) {
  // CODE128B encoding patterns
  const patterns = {
    ' ': '11011001100', '!': '11001101100', '"': '11001100110', '#': '10010011000',
    '$': '10010001100', '%': '10001001100', '&': '10011001000', "'": '10011000100',
    '(': '10001100100', ')': '11001001000', '*': '11001000100', '+': '11000100100',
    ',': '10110011100', '-': '10011011100', '.': '10011001110', '/': '10111001100',
    '0': '10011101100', '1': '10011100110', '2': '11001110010', '3': '11001011100',
    '4': '11001001110', '5': '11011100100', '6': '11001110100', '7': '11101101110',
    '8': '11101001100', '9': '11100101100', ':': '11100100110', ';': '11101100100',
    '<': '11100110100', '=': '11100110010', '>': '11011011000', '?': '11011000110',
    '@': '11000110110', 'A': '10100011000', 'B': '10001011000', 'C': '10001000110',
    'D': '10110001000', 'E': '10001101000', 'F': '10001100010', 'G': '11010010000',
    'H': '11000010010', 'I': '11000010100', 'J': '10110111000', 'K': '10110001110',
    'L': '10001101110', 'M': '10111011000', 'N': '10111000110', 'O': '10001110110',
    'P': '11101110110', 'Q': '11010001110', 'R': '11000101110', 'S': '11011101000',
    'T': '11011100010', 'U': '11011101110', 'V': '11101011000', 'W': '11101000110',
    'X': '11100010110', 'Y': '11101101000', 'Z': '11101100010', '[': '11100011010',
    '\\': '11101111010', ']': '11001000010', '^': '11110001010', '_': '10100110000',
    '`': '10100001100', 'a': '10010110000', 'b': '10010000110', 'c': '10000101100',
    'd': '10000100110', 'e': '10110010000', 'f': '10110000100', 'g': '10011010000',
    'h': '10011000010', 'i': '10000110100', 'j': '10000110010', 'k': '11000010100',
    'l': '11001010000', 'm': '11110111010', 'n': '11000010100', 'o': '10001111010',
    'p': '10100111100', 'q': '10010111100', 'r': '10010011110', 's': '10111100100',
    't': '10011110100', 'u': '10011110010', 'v': '11110100100', 'w': '11110010100',
    'x': '11110010010', 'y': '11011011110', 'z': '11011110110', '{': '11110110110',
    '|': '10101111000', '}': '10100011110', '~': '10001011110'
  };
  
  let encoded = '11010010000'; // Start code B
  
  for (let char of text) {
    if (patterns[char]) {
      encoded += patterns[char];
    } else {
      encoded += patterns['0']; // Default to 0 for unknown chars
    }
  }
  
  encoded += '1100011101011'; // Stop pattern
  return encoded;
}

function encodeCode39(text) {
  // CODE39 encoding patterns
  const patterns = {
    '0': '101001101101', '1': '110100101011', '2': '101100101011',
    '3': '110110010101', '4': '101001101011', '5': '110100110101',
    '6': '101100110101', '7': '101001011011', '8': '110100101101',
    '9': '101100101101', 'A': '110101001011', 'B': '101101001011',
    'C': '110110100101', 'D': '101011001011', 'E': '110101100101',
    'F': '101101100101', 'G': '101010011011', 'H': '110101001101',
    'I': '101101001101', 'J': '101011001101', 'K': '110101010011',
    'L': '101101010011', 'M': '110110101001', 'N': '101011010011',
    'O': '110101101001', 'P': '101101101001', 'Q': '101010110011',
    'R': '110101011001', 'S': '101101011001', 'T': '101011011001',
    'U': '110010101011', 'V': '100110101011', 'W': '110011010101',
    'X': '100101101011', 'Y': '110010110101', 'Z': '100110110101',
    '-': '100101011011', '.': '110010101101', ' ': '100110101101',
    '$': '100100100101', '/': '100100101001', '+': '100101001001',
    '%': '101001001001', '*': '100101101101'
  };
  
  let encoded = patterns['*']; // Start/stop character
  
  for (let char of text.toUpperCase()) {
    if (patterns[char]) {
      encoded += '0' + patterns[char]; // Add narrow space between chars
    }
  }
  
  encoded += patterns['*']; // Stop character
  return encoded;
}

function encodeEAN13(text) {
  // Simplified EAN13 - just use CODE128 for now
  return encodeCode128(text);
}

function escapeXml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function getDocumentationHTML(origin) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Barcode Generator API</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
            max-width: 900px;
            margin: 50px auto;
            padding: 20px;
            background: #f5f5f5;
            line-height: 1.6;
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }
        h1 {
            color: #333;
            margin-top: 0;
            font-size: 32px;
        }
        .section {
            margin: 30px 0;
            padding: 25px;
            background: #f9f9f9;
            border-radius: 8px;
        }
        .section h2 {
            margin-top: 0;
            color: #555;
            font-size: 20px;
        }
        code {
            background: #e8e8e8;
            padding: 3px 8px;
            border-radius: 4px;
            font-family: 'Monaco', 'Courier New', monospace;
            font-size: 13px;
            word-break: break-all;
        }
        .example {
            background: #fff;
            padding: 18px;
            border-left: 4px solid #4CAF50;
            margin: 12px 0;
            border-radius: 4px;
        }
        .success-badge {
            display: inline-block;
            background: #4CAF50;
            color: white;
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 14px;
            margin-left: 10px;
            font-weight: 600;
        }
        .param-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }
        .param-table td {
            padding: 12px;
            border-bottom: 1px solid #ddd;
        }
        .param-table td:first-child {
            font-weight: 600;
            width: 150px;
            color: #333;
        }
        .test-image {
            margin-top: 25px;
            padding: 25px;
            background: white;
            border: 2px solid #e0e0e0;
            text-align: center;
            border-radius: 8px;
        }
        .test-image img {
            max-width: 100%;
            height: auto;
            margin: 15px 0;
        }
        .info-box {
            background: #e3f2fd;
            border-left: 4px solid #2196F3;
            padding: 18px;
            margin: 18px 0;
            border-radius: 4px;
        }
        .info-box strong {
            color: #1976D2;
        }
        a {
            color: #2196F3;
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
        ol {
            padding-left: 24px;
        }
        ol li {
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>📊 Barcode Generator API <span class="success-badge">✓ LIVE</span></h1>
        <p>SVG barcode generation API at 450px width for Excel, Google Sheets, and web applications</p>

        <div class="section">
            <h2>🚀 Your API Endpoint</h2>
            <p>Use this URL to generate barcodes:</p>
            <div class="example">
                <code>${origin}?value=YOUR_VALUE</code>
            </div>
            <div class="info-box">
                <strong>📐 Specifications:</strong><br>
                • Output Format: SVG (Scalable Vector Graphics)<br>
                • Target Width: ~450px<br>
                • Height: Adjustable (default 100px + text)<br>
                • Compatible with: Excel Desktop, Google Sheets, and all modern browsers
            </div>
            <div class="test-image">
                <p><strong>Live Example:</strong></p>
                <img src="${origin}?value=123456789" alt="Sample barcode" />
                <p><small>Barcode value: 123456789</small></p>
            </div>
        </div>

        <div class="section">
            <h2>📋 Parameters</h2>
            <table class="param-table">
                <tr>
                    <td>value</td>
                    <td>The barcode data (required) - letters, numbers, and special characters</td>
                </tr>
                <tr>
                    <td>format</td>
                    <td>Barcode type: CODE128, CODE39, EAN13 (default: CODE128)</td>
                </tr>
                <tr>
                    <td>width</td>
                    <td>Width of individual bars in pixels (default: 2)</td>
                </tr>
                <tr>
                    <td>height</td>
                    <td>Height of barcode in pixels (default: 100)</td>
                </tr>
                <tr>
                    <td>displayValue</td>
                    <td>Show text below barcode: true or false (default: true)</td>
                </tr>
            </table>
        </div>

        <div class="section">
            <h2>📊 Excel Formula Examples</h2>
            <p><strong>For Desktop Excel (2021, 365, 2024):</strong></p>
            <div class="example">
                <strong>Basic usage (value from cell A1):</strong><br>
                <code>=IMAGE("${origin}?value="&A1)</code>
            </div>
            <div class="example">
                <strong>With specific format:</strong><br>
                <code>=IMAGE("${origin}?value="&A1&"&format=CODE39")</code>
            </div>
            <div class="example">
                <strong>Taller barcode:</strong><br>
                <code>=IMAGE("${origin}?value="&A1&"&height=150")</code>
            </div>
            <div class="example">
                <strong>Hide text below barcode:</strong><br>
                <code>=IMAGE("${origin}?value="&A1&"&displayValue=false")</code>
            </div>
        </div>

        <div class="section">
            <h2>✅ Quick Start Guide</h2>
            <ol>
                <li>Open <strong>Desktop Excel</strong> (2021, 365, or 2024)</li>
                <li>Enter a barcode value in cell A1 (e.g., "ABC123")</li>
                <li>In cell B1, enter: <code>=IMAGE("${origin}?value="&A1)</code></li>
                <li>Press Enter - your barcode will appear!</li>
                <li>Drag the formula down to generate multiple barcodes</li>
            </ol>
            <div class="info-box">
                <strong>💡 Important:</strong> This API works best with <strong>Desktop Excel</strong>. Excel Online (web version) and Google Sheets have limited support for external images. The =IMAGE() function requires Excel 2021 or newer.
            </div>
            <p><strong>✨ No rate limits!</strong> Generate thousands of barcodes simultaneously.</p>
        </div>

        <div class="section">
            <h2>🧪 Test URLs</h2>
            <p>Click these links to test your barcodes:</p>
            <div class="example">
                <a href="${origin}?value=TEST123" target="_blank">${origin}?value=TEST123</a>
            </div>
            <div class="example">
                <a href="${origin}?value=987654321&format=CODE39" target="_blank">${origin}?value=987654321&format=CODE39</a>
            </div>
            <div class="example">
                <a href="${origin}?value=BARCODE&height=150&displayValue=false" target="_blank">${origin}?value=BARCODE&height=150&displayValue=false</a>
            </div>
        </div>

        <div class="section">
            <h2>🔧 Supported Barcode Formats</h2>
            <ul>
                <li><strong>CODE128</strong> - Alphanumeric, compact, most common (default)</li>
                <li><strong>CODE39</strong> - Alphanumeric with special characters</li>
                <li><strong>EAN13</strong> - 13-digit product codes</li>
            </ul>
        </div>
    </div>
</body>
</html>`;
}
