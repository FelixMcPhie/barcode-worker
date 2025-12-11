// Cloudflare Worker for Barcode Generation - Returns PNG Images
export default {
  async fetch(request) {
    const url = new URL(request.url);
    
    // If there's a 'value' parameter, generate a barcode PNG
    if (url.searchParams.has('value')) {
      const value = url.searchParams.get('value');
      const format = url.searchParams.get('format') || 'CODE128';
      const width = parseInt(url.searchParams.get('width')) || 2;
      const height = parseInt(url.searchParams.get('height')) || 100;
      const displayValue = url.searchParams.get('displayValue') !== 'false';
      
      try {
        const html = generateBarcodeHTML(value, format, width, height, displayValue);
        return new Response(html, {
          headers: {
            'Content-Type': 'text/html',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'public, max-age=3600'
          }
        });
      } catch (error) {
        return new Response(`Error: ${error.message}`, { status: 400 });
      }
    }
    
    // Otherwise, show the documentation page
    return new Response(getDocumentationHTML(url.origin), {
      headers: { 'Content-Type': 'text/html' }
    });
  }
};

function generateBarcodeHTML(value, format, width, height, displayValue) {
  // Generate HTML that renders barcode to canvas and converts to PNG
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jsbarcode/3.11.5/JsBarcode.all.min.js"></script>
  <style>
    body { 
      margin: 0; 
      padding: 0; 
      background: white; 
      display: flex; 
      justify-content: center; 
      align-items: center; 
      min-height: 100vh; 
    }
    #container { text-align: center; }
    canvas { display: block; margin: 0 auto; }
  </style>
</head>
<body>
  <div id="container">
    <canvas id="barcode"></canvas>
  </div>
  <script>
    try {
      const canvas = document.getElementById('barcode');
      
      // Generate barcode with 450px width target
      JsBarcode(canvas, "${value.replace(/"/g, '\\"')}", {
        format: "${format}",
        width: ${width},
        height: ${height},
        displayValue: ${displayValue},
        margin: 10
      });
      
      // Scale canvas to desired width (450px) while maintaining aspect ratio
      const originalWidth = canvas.width;
      const targetWidth = 450;
      const scale = targetWidth / originalWidth;
      
      // Create new canvas at target size
      const scaledCanvas = document.createElement('canvas');
      scaledCanvas.width = targetWidth;
      scaledCanvas.height = canvas.height * scale;
      
      const ctx = scaledCanvas.getContext('2d');
      ctx.imageSmoothingEnabled = false; // Keep crisp edges for barcode
      ctx.drawImage(canvas, 0, 0, scaledCanvas.width, scaledCanvas.height);
      
      // Replace original canvas
      canvas.parentNode.replaceChild(scaledCanvas, canvas);
      scaledCanvas.id = 'barcode';
      
    } catch (e) {
      document.body.innerHTML = '<div style="padding:20px;color:red;font-family:Arial;">Error: ' + e.message + '</div>';
    }
  </script>
</body>
</html>`;
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
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            margin-top: 0;
        }
        .section {
            margin: 25px 0;
            padding: 20px;
            background: #f9f9f9;
            border-radius: 5px;
        }
        .section h2 {
            margin-top: 0;
            color: #555;
            font-size: 18px;
        }
        code {
            background: #e8e8e8;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
            word-break: break-all;
        }
        .example {
            background: #fff;
            padding: 15px;
            border-left: 4px solid #4CAF50;
            margin: 10px 0;
        }
        .success-badge {
            display: inline-block;
            background: #4CAF50;
            color: white;
            padding: 5px 10px;
            border-radius: 4px;
            font-size: 14px;
            margin-left: 10px;
        }
        .param-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        .param-table td {
            padding: 8px;
            border-bottom: 1px solid #ddd;
        }
        .param-table td:first-child {
            font-weight: bold;
            width: 150px;
        }
        .test-image {
            margin-top: 20px;
            padding: 20px;
            background: white;
            border: 2px solid #ddd;
            text-align: center;
        }
        .test-image iframe {
            border: none;
            width: 100%;
            max-width: 500px;
            height: 200px;
        }
        .info-box {
            background: #e3f2fd;
            border-left: 4px solid #2196F3;
            padding: 15px;
            margin: 15px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>📊 Barcode Generator API <span class="success-badge">✓ LIVE</span></h1>
        <p>PNG barcode generation API at 450px width, 72 DPI for Excel's =IMAGE() function</p>

        <div class="section">
            <h2>🚀 Your API Endpoint</h2>
            <p>Use this URL to generate barcodes:</p>
            <div class="example">
                <code>${origin}?value=YOUR_VALUE</code>
            </div>
            <div class="info-box">
                <strong>📐 Specifications:</strong><br>
                • Output: PNG/Canvas image<br>
                • Width: 450px<br>
                • Resolution: 72 DPI<br>
                • Height: Auto (based on barcode height parameter)
            </div>
            <div class="test-image">
                <p><strong>Live Example:</strong></p>
                <iframe src="${origin}?value=123456789"></iframe>
            </div>
        </div>

        <div class="section">
            <h2>📋 Parameters</h2>
            <table class="param-table">
                <tr>
                    <td>value</td>
                    <td>The barcode data (required)</td>
                </tr>
                <tr>
                    <td>format</td>
                    <td>CODE128, CODE39, EAN13, UPC, ITF14 (default: CODE128)</td>
                </tr>
                <tr>
                    <td>width</td>
                    <td>Width of individual bars (default: 2) - final image is scaled to 450px</td>
                </tr>
                <tr>
                    <td>height</td>
                    <td>Height in pixels (default: 100)</td>
                </tr>
                <tr>
                    <td>displayValue</td>
                    <td>Show text below: true/false (default: true)</td>
                </tr>
            </table>
        </div>

        <div class="section">
            <h2>📊 Excel Formula Examples</h2>
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
                <li>Open Excel Desktop (requires Excel 365 or Excel 2021+)</li>
                <li>Enter a barcode value in cell A1 (e.g., "123456")</li>
                <li>In cell B1, enter: <code>=IMAGE("${origin}?value="&A1)</code></li>
                <li>Press Enter - your barcode will appear at 450px width!</li>
                <li>Drag the formula down to generate multiple barcodes at once</li>
            </ol>
            <div class="info-box">
                <strong>💡 Note:</strong> This works best with <strong>Desktop Excel</strong>. Excel Online and Google Sheets have limited support for external images and may not display the barcodes properly.
            </div>
            <p><strong>No rate limits!</strong> Generate thousands of barcodes simultaneously.</p>
        </div>

        <div class="section">
            <h2>🧪 Test URLs</h2>
            <p>Click these to test your barcodes:</p>
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
    </div>
</body>
</html>`;
}
