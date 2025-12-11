// Cloudflare Worker for Barcode Generation - Proxies to barcodeapi.org
// This ensures PNG format which works best with Excel and Google Sheets

export default {
  async fetch(request) {
    const url = new URL(request.url);
    
    // If there's a 'value' parameter, proxy to barcodeapi.org
    if (url.searchParams.has('value')) {
      const value = url.searchParams.get('value');
      const format = url.searchParams.get('format') || 'code128';
      const height = url.searchParams.get('height') || '100';
      const displayValue = url.searchParams.get('displayValue') !== 'false' ? 'true' : 'false';
      
      try {
        // Build barcodeapi.org URL
        const barcodeUrl = `https://barcodeapi.org/api/${format.toLowerCase()}/${encodeURIComponent(value)}?height=${height}&showValue=${displayValue}`;
        
        // Fetch from barcodeapi.org
        const response = await fetch(barcodeUrl);
        
        if (!response.ok) {
          throw new Error(`Barcode generation failed: ${response.status}`);
        }
        
        // Return the PNG image
        return new Response(response.body, {
          headers: {
            'Content-Type': 'image/png',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'public, max-age=31536000'
          }
        });
      } catch (error) {
        // Return a simple error response
        return new Response(`Error: ${error.message}`, { 
          status: 400,
          headers: { 'Content-Type': 'text/plain' }
        });
      }
    }
    
    // Otherwise, show the documentation page
    return new Response(getDocumentationHTML(url.origin), {
      headers: { 'Content-Type': 'text/html' }
    });
  }
};

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
        .warning-box {
            background: #fff3e0;
            border-left: 4px solid #ff9800;
            padding: 18px;
            margin: 18px 0;
            border-radius: 4px;
        }
        .warning-box strong {
            color: #f57c00;
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
        <p>PNG barcode generation API for Excel, Google Sheets, and web applications</p>

        <div class="section">
            <h2>🚀 Your API Endpoint</h2>
            <p>Use this URL to generate barcodes:</p>
            <div class="example">
                <code>${origin}?value=YOUR_VALUE</code>
            </div>
            <div class="info-box">
                <strong>📐 Specifications:</strong><br>
                • Output Format: PNG (Portable Network Graphics)<br>
                • High quality barcode images<br>
                • Compatible with: Excel Desktop, Excel Online, Google Sheets, and all modern browsers<br>
                • Powered by: barcodeapi.org
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
                    <td>Barcode type: code128, code39, ean13, upca (default: code128)</td>
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
            <p><strong>Works with Desktop Excel AND Excel Online:</strong></p>
            <div class="example">
                <strong>Basic usage (value from cell A1):</strong><br>
                <code>=IMAGE("${origin}?value="&A1)</code>
            </div>
            <div class="example">
                <strong>With specific format (CODE39):</strong><br>
                <code>=IMAGE("${origin}?value="&A1&"&format=code39")</code>
            </div>
            <div class="example">
                <strong>Taller barcode (150px height):</strong><br>
                <code>=IMAGE("${origin}?value="&A1&"&height=150")</code>
            </div>
            <div class="example">
                <strong>Hide text below barcode:</strong><br>
                <code>=IMAGE("${origin}?value="&A1&"&displayValue=false")</code>
            </div>
        </div>

        <div class="section">
            <h2>📊 Google Sheets Formula</h2>
            <p>The same formula works in Google Sheets:</p>
            <div class="example">
                <strong>Basic usage:</strong><br>
                <code>=IMAGE("${origin}?value="&A1)</code>
            </div>
        </div>

        <div class="section">
            <h2>✅ Quick Start Guide</h2>
            <ol>
                <li>Open Excel (Desktop or Online) or Google Sheets</li>
                <li>Enter a barcode value in cell A1 (e.g., "ABC123")</li>
                <li>In cell B1, enter: <code>=IMAGE("${origin}?value="&A1)</code></li>
                <li>Press Enter - your barcode will appear!</li>
                <li>Drag the formula down to generate multiple barcodes</li>
            </ol>
            <div class="info-box">
                <strong>💡 Pro Tip:</strong> This API now returns PNG images, which work perfectly in both Desktop Excel, Excel Online, and Google Sheets. The =IMAGE() function requires Excel 365/2021+ for desktop, or you can use Excel Online for free.
            </div>
            <p><strong>✨ No rate limits from our end!</strong> Generate thousands of barcodes simultaneously.</p>
            <div class="warning-box">
                <strong>⚠️ Important:</strong> This API proxies requests to barcodeapi.org, which has its own rate limits (100 requests per hour per IP for free usage). For heavy usage, consider getting an API key from barcodeapi.org or contact them for higher limits.
            </div>
        </div>

        <div class="section">
            <h2>🧪 Test URLs</h2>
            <p>Click these links to test your barcodes:</p>
            <div class="example">
                <a href="${origin}?value=TEST123" target="_blank">${origin}?value=TEST123</a>
            </div>
            <div class="example">
                <a href="${origin}?value=987654321&format=code39" target="_blank">${origin}?value=987654321&format=code39</a>
            </div>
            <div class="example">
                <a href="${origin}?value=BARCODE&height=150&displayValue=false" target="_blank">${origin}?value=BARCODE&height=150&displayValue=false</a>
            </div>
        </div>

        <div class="section">
            <h2>🔧 Supported Barcode Formats</h2>
            <ul>
                <li><strong>code128</strong> - Alphanumeric, compact, most common (default)</li>
                <li><strong>code39</strong> - Alphanumeric with special characters</li>
                <li><strong>ean13</strong> - 13-digit product codes</li>
                <li><strong>upca</strong> - 12-digit UPC codes</li>
                <li><strong>itf14</strong> - 14-digit shipping container codes</li>
            </ul>
        </div>
    </div>
</body>
</html>`;
}
