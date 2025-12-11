// Cloudflare Worker for Barcode Generation
// This serves both the documentation page and generates barcodes via URL parameters

export default {
  async fetch(request) {
    const url = new URL(request.url);
    
    // If there's a 'value' parameter, generate a barcode
    if (url.searchParams.has('value')) {
      return new Response(generateBarcodeHTML(url.searchParams), {
        headers: {
          'Content-Type': 'text/html',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    // Otherwise, show the documentation page
    return new Response(getDocumentationHTML(url.origin), {
      headers: { 'Content-Type': 'text/html' }
    });
  }
};

function generateBarcodeHTML(params) {
  const value = params.get('value');
  const format = params.get('format') || 'CODE128';
  const width = params.get('width') || '2';
  const height = params.get('height') || '100';
  const displayValue = params.get('displayValue') !== 'false' ? 'true' : 'false';
  
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jsbarcode/3.11.5/JsBarcode.all.min.js"></script>
  <style>
    body { margin: 0; padding: 0; background: white; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
    canvas { display: block; }
  </style>
</head>
<body>
  <canvas id="barcode"></canvas>
  <script>
    try {
      JsBarcode("#barcode", "${value.replace(/"/g, '\\"')}", {
        format: "${format}",
        width: ${width},
        height: ${height},
        displayValue: ${displayValue}
      });
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
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jsbarcode/3.11.5/JsBarcode.all.min.js"></script>
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
        .test-area {
            margin-top: 20px;
        }
        input, select {
            padding: 8px;
            margin: 5px;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        button {
            background: #4CAF50;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        button:hover {
            background: #45a049;
        }
        #testResult {
            margin-top: 15px;
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
        .success-badge {
            display: inline-block;
            background: #4CAF50;
            color: white;
            padding: 5px 10px;
            border-radius: 4px;
            font-size: 14px;
            margin-left: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>📊 Barcode Generator API <span class="success-badge">✓ LIVE</span></h1>
        <p>Unlimited barcode generation API for Excel's =IMAGE() function</p>

        <div class="section">
            <h2>🚀 Your API Endpoint</h2>
            <p>Use this URL to generate barcodes:</p>
            <div class="example">
                <code id="apiUrl">${origin}?value=YOUR_VALUE</code>
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
                    <td>Width of bars (default: 2)</td>
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
                <strong>Custom size:</strong><br>
                <code>=IMAGE("${origin}?value="&A1&"&width=3&height=80")</code>
            </div>
            <div class="example">
                <strong>Hide text below barcode:</strong><br>
                <code>=IMAGE("${origin}?value="&A1&"&displayValue=false")</code>
            </div>
        </div>

        <div class="section">
            <h2>🧪 Test Generator</h2>
            <div class="test-area">
                <input type="text" id="testValue" placeholder="Enter barcode value" value="123456789">
                <select id="testFormat">
                    <option value="CODE128">CODE128</option>
                    <option value="CODE39">CODE39</option>
                    <option value="EAN13">EAN13</option>
                    <option value="UPC">UPC</option>
                    <option value="ITF14">ITF14</option>
                </select>
                <button onclick="generateTest()">Generate Test Barcode</button>
                <div id="testResult"></div>
            </div>
        </div>

        <div class="section">
            <h2>✅ Quick Start Guide</h2>
            <ol>
                <li>Copy your API URL above: <code>${origin}</code></li>
                <li>Open Excel and enter a barcode value in cell A1 (e.g., "123456")</li>
                <li>In cell B1, enter: <code>=IMAGE("${origin}?value="&A1)</code></li>
                <li>Press Enter - your barcode will appear!</li>
                <li>Drag the formula down to generate multiple barcodes at once</li>
            </ol>
            <p><strong>No rate limits!</strong> Generate thousands of barcodes simultaneously.</p>
        </div>
    </div>

    <script>
        function generateTest() {
            const value = document.getElementById('testValue').value;
            const format = document.getElementById('testFormat').value;
            const resultDiv = document.getElementById('testResult');
            
            if (!value) {
                resultDiv.innerHTML = '<p style="color:red;">Please enter a value</p>';
                return;
            }

            const canvas = document.createElement('canvas');
            
            try {
                JsBarcode(canvas, value, {
                    format: format,
                    width: 2,
                    height: 100,
                    displayValue: true
                });
                
                resultDiv.innerHTML = '';
                resultDiv.appendChild(canvas);
                
                const testUrl = '${origin}?value=' + encodeURIComponent(value) + '&format=' + format;
                resultDiv.innerHTML += '<p style="margin-top:15px;"><strong>Excel Formula:</strong><br><code>=IMAGE("' + testUrl + '")</code></p>';
            } catch (e) {
                resultDiv.innerHTML = '<p style="color:red;">Error: ' + e.message + '</p>';
            }
        }
    </script>
</body>
</html>`;
}
