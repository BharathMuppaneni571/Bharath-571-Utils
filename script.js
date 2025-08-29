/* -------------------------------------------------------------
   Utility Toolbox – all custom JavaScript in ONE file
   ------------------------------------------------------------- */

/* ==== 1️⃣ Helper – copy to clipboard ========================= */
function copyToClipboard(containerId) {
  const container = document.getElementById(containerId);
  const resultEl = container.querySelector('.result');
  const range = document.createRange();
  range.selectNodeContents(resultEl);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
  try {
    document.execCommand('copy');
    container.style.boxShadow = '0 0 6px 2px var(--accent-teal)';
    setTimeout(() => (container.style.boxShadow = 'none'), 800);
  } catch (e) {
    alert('Copy failed');
  }
  sel.removeAllRanges();
}

/* ==== 2️⃣ URL Encode / Decode ================================ */
document.getElementById('btnEncodeURL').addEventListener('click', () => {
  const raw = document.getElementById('urlInput').value.trim();
  if (!raw) return alert('Enter a URL or file path first');
  document.querySelector('#urlResult .result').textContent = encodeURIComponent(raw);
});

document.getElementById('btnDecodeURL').addEventListener('click', () => {
  const enc = document.getElementById('urlInput').value.trim();
  if (!enc) return alert('Enter an encoded URL first');
  try {
    document.querySelector('#urlResult .result').textContent = decodeURIComponent(enc);
  } catch {
    document.querySelector('#urlResult .result').textContent = 'Invalid percent‑encoding';
  }
});

/* ==== 3️⃣ Base64 (Text) ====================================== */
document.getElementById('btnEncodeString').addEventListener('click', () => {
  const txt = document.getElementById('strInput').value;
  const b64 = btoa(unescape(encodeURIComponent(txt)));
  document.querySelector('#strResult .result').textContent = b64;
});

document.getElementById('btnDecodeString').addEventListener('click', () => {
  const b64 = document.getElementById('strInput').value;
  try {
    const txt = decodeURIComponent(escape(atob(b64)));
    document.querySelector('#strResult .result').textContent = txt;
  } catch {
    document.querySelector('#strResult .result').textContent = 'Invalid Base64 string';
  }
});

/* ==== 4️⃣ Base64 (File) ====================================== */
document.getElementById('btnFileToBase64').addEventListener('click', () => {
  const file = document.getElementById('fileInput').files[0];
  if (!file) return alert('Select a file first');
  const reader = new FileReader();
  reader.onload = e => {
    const pureB64 = e.target.result.split(',')[1];
    document.querySelector('#fileResult .result').textContent = pureB64;
  };
  reader.readAsDataURL(file);
});

document.getElementById('btnBase64ToFile').addEventListener('click', () => {
  let b64 = document.getElementById('fileB64Input').value.trim();
  const fileName = document.getElementById('downloadFileName').value.trim() || 'download.bin';
  if (!b64) return alert('Paste a Base64 string first');
  if (b64.startsWith('data:')) b64 = b64.split(',')[1];
  const dataUrl = `data:application/octet-stream;base64,${b64}`;
  document.querySelector('#fileResult .result').textContent = b64;
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = fileName;
  a.click();
});

/* ==== 5️⃣ Image ↔ Base64 ===================================== */
document.getElementById('btnImgToBase64').addEventListener('click', () => {
  const file = document.getElementById('imgFile').files[0];
  if (!file) return alert('Select an image first');
  const reader = new FileReader();
  reader.onload = e => {
    const dataUrl = e.target.result;
    document.getElementById('imgResultText').textContent = dataUrl;
    document.getElementById('imgPreview').src = dataUrl;
  };
  reader.readAsDataURL(file);
});

document.getElementById('btnBase64ToImg').addEventListener('click', () => {
  let b64 = document.getElementById('b64Input').value.trim();
  if (!b64) return alert('Paste a Base64 string first');
  if (!b64.startsWith('data:')) b64 = 'data:image/png;base64,' + b64;
  document.getElementById('imgResultText').textContent = b64;
  document.getElementById('imgPreview').src = b64;
  const a = document.createElement('a');
  a.href = b64;
  const ext = b64.includes('image/jpeg') ? 'jpg' :
    b64.includes('image/gif') ? 'gif' : 'png';
  a.download = `image.${ext}`;
  a.click();
});

/* ==== 6️⃣ Code Formatter (robust) ============================= */
document.getElementById('btnFormatCode').addEventListener('click', () => {
  const ext = document.getElementById('fmtExt').value; // json, js, html, css, xml, sql, yaml
  const code = document.getElementById('fmtInput').value;
  let result = '';
  try {
    switch (ext) {
      case 'json':
        // pretty‑print JSON
        const obj = JSON.parse(code);
        result = JSON.stringify(obj, null, 4);
        break;

      case 'js':
        if (typeof js_beautify !== 'function')
          throw new Error('js_beautify not loaded');
        result = js_beautify(code, {
          indent_size: 4
        });
        break;

      case 'html':
        if (typeof html_beautify !== 'function')
          throw new Error('html_beautify not loaded');
        result = html_beautify(code, {
          indent_size: 4
        });
        break;

      case 'css':
        if (typeof css_beautify !== 'function')
          throw new Error('css_beautify not loaded');
        result = css_beautify(code, {
          indent_size: 4
        });
        break;

      case 'xml':
        // Very simple XML pretty‑print – reuse html_beautify if available
        if (typeof html_beautify === 'function')
          result = html_beautify(code, {
            indent_size: 4
          });
        else
          throw new Error('html_beautify (used for XML) not loaded');
        break;

      case 'sql':
        if (typeof sqlFormatter === 'undefined' || typeof sqlFormatter.format !== 'function')
          throw new Error('sqlFormatter not loaded');
        result = sqlFormatter.format(code);
        break;

      case 'yaml':
        if (typeof jsyaml === 'undefined')
          throw new Error('js-yaml not loaded');
        const doc = jsyaml.load(code);
        result = jsyaml.dump(doc, {
          indent: 4
        });
        break;

      default:
        result = 'Unsupported extension';
    }

    document.querySelector('#fmtResult .result').textContent = result;
  } catch (e) {
    // Show a clear message – helpful when a library is missing or JSON/YAML is malformed
    document.querySelector('#fmtResult .result').textContent = 'Error: ' + e.message;
  }
});

/* ==== 7️⃣ QR Code – generate & scan =========================== */
document.getElementById('btnGenerateQR').addEventListener('click', () => {
  const txt = document.getElementById('qrText').value.trim();
  if (!txt) return alert('Enter text to encode');
  const holder = document.getElementById('qrHolder');
  holder.innerHTML = '';
  new QRCode(holder, {
    text: txt,
    width: 200,
    height: 200
  });
});

document.getElementById('btnScanQR').addEventListener('click', () => {
  const file = document.getElementById('qrFile').files[0];
  if (!file) return alert('Select an image with a QR code');
  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imgData.data, canvas.width, canvas.height);
      if (code) {
        document.querySelector('#qrResult .result').textContent = code.data;
      } else {
        alert('No QR code detected');
      }
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
});

/* ==== 8️⃣ QR Batch Export (PDF) ============================== */
document.getElementById('btnExportQRBatch')?.addEventListener('click', () => {
  const lines = document.getElementById('qrBatchInput').value.trim()
    .split('\n')
    .filter(l => l);
  if (!lines.length) return alert('Enter at least one line');
  const {
    jsPDF
  } = window.jspdf;
  const doc = new jsPDF();

  lines.forEach((txt, i) => {
    const canvas = document.createElement('canvas');
    new QRCode(canvas, {
      text: txt,
      width: 100,
      height: 100
    });
    const imgData = canvas.toDataURL('image/png');
    const y = 20 + i * 50;
    doc.addImage(imgData, 'PNG', 15, y, 40, 40);
    doc.text(txt, 60, y + 15);
  });

  const pdfBlob = doc.output('blob');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(pdfBlob);
  a.download = 'qr-batch.pdf';
  a.click();

  document.querySelector('#qrpdfResult .result')
    .textContent = 'PDF generated and downloaded';
});

/* ==== 9️⃣ Hash Calculator ==================================== */
document.getElementById('btnCalcHash')?.addEventListener('click', async () => {
  const algo = document.getElementById('hashAlgo').value;
  const txt = document.getElementById('hashInput').value;
  const encoder = new TextEncoder();
  const data = encoder.encode(txt);
  const hashBuffer = await crypto.subtle.digest(algo, data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  document.querySelector('#hashResult .result').textContent = hashHex;
});

/* ==== 10️⃣ Minifier =========================================== */
document.getElementById('btnMinify')?.addEventListener('click', () => {
  const ext = document.getElementById('minifyExt').value;
  const code = document.getElementById('minifyInput').value;
  let result = '';
  try {
    if (ext === 'json') {
      result = JSON.stringify(JSON.parse(code));
    } else if (ext === 'js') {
      result = js_beautify(code, {
        indent_size: 0
      }).replace(/\s+/g, ' ');
    } else if (ext === 'css') {
      result = css_beautify(code, {
        indent_size: 0
      }).replace(/\s+/g, ' ');
    } else if (ext === 'html') {
      result = html_beautify(code, {
        indent_size: 0
      }).replace(/\s+/g, ' ');
    } else {
      result = 'Unsupported';
    }
    document.querySelector('#minifyResult .result').textContent = result;
  } catch (e) {
    document.querySelector('#minifyResult .result').textContent = 'Error: ' + e.message;
  }
});

/* ==== 11️⃣ Password Generator ================================ */
document.getElementById('btnGeneratePwd')?.addEventListener('click', () => {
  const len = parseInt(document.getElementById('pwdLength').value, 10);
  const charset = [
    document.getElementById('pwdUpper').checked ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' : '',
    document.getElementById('pwdLower').checked ? 'abcdefghijklmnopqrstuvwxyz' : '',
    document.getElementById('pwdNumbers').checked ? '0123456789' : '',
    document.getElementById('pwdSymbols').checked ? '!@#$%^&*()_+[]{}|;:,.<>?' : ''
  ].join('');
  if (!charset) return alert('Select at least one character set');
  const arr = new Uint32Array(len);
  crypto.getRandomValues(arr);
  let pwd = '';
  for (let i = 0; i < len; i++) pwd += charset[arr[i] % charset.length];
  document.querySelector('#pwdResult .result').textContent = pwd;
});

/* ==== 12️⃣ CSV ↔ JSON ========================================= */
document.getElementById('btnCsvToJson')?.addEventListener('click', () => {
  const csv = document.getElementById('csvInput').value.trim();
  if (!csv) return alert('Paste CSV first');
  const rows = Papa.parse(csv, {
    header: true
  }).data;
  document.querySelector('#csvjsonResult .result').textContent = JSON.stringify(rows, null, 4);
});

document.getElementById('btnJsonToCsv')?.addEventListener('click', () => {
  const json = document.getElementById('jsonInput').value.trim();
  if (!json) return alert('Paste JSON first');
  try {
    const arr = JSON.parse(json);
    const csv = Papa.unparse(arr);
    document.querySelector('#csvjsonResult .result').textContent = csv;
  } catch {
    document.querySelector('#csvjsonResult .result').textContent = 'Invalid JSON';
  }
});

/* ==== 13️⃣ URL Shortener / Expander ========================== */
document.getElementById('btnShortenURL')?.addEventListener('click', async () => {
  const long = document.getElementById('longUrl').value.trim();
  if (!long) return alert('Enter a URL');
  try {
    const resp = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(long)}`);
    const short = await resp.text();
    document.querySelector('#urlshortResult .result').textContent = short;
  } catch (e) {
    document.querySelector('#urlshortResult .result').textContent = 'Error: ' + e.message;
  }
});

document.getElementById('btnExpandURL')?.addEventListener('click', async () => {
  const short = document.getElementById('shortUrl').value.trim();
  if (!short) return alert('Enter short URL');
  try {
    const resp = await fetch(short, {
      method: 'HEAD',
      redirect: 'follow'
    });
    document.querySelector('#urlshortResult .result').textContent = resp.url;
  } catch (e) {
    document.querySelector('#urlshortResult .result').textContent = 'Error: ' + e.message;
  }
});

/* ==== 14️⃣ Image Optimizer (Compress to JPEG) =============== */
document.getElementById('btnCompressImage')?.addEventListener('click', () => {
  const file = document.getElementById('optImgFile').files[0];
  if (!file) return alert('Select an image first');
  const quality = parseFloat(document.getElementById('optQuality').value);
  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg', quality);
      document.querySelector('#optImgResult .result').textContent = dataUrl;
      document.getElementById('optImgPreview').src = dataUrl;
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = 'optimized.jpg';
      a.click();
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
});

/* ==== 15️⃣ File Type Detector ================================ */
document.getElementById('btnDetectFile')?.addEventListener('click', () => {
  const file = document.getElementById('detectFile').files[0];
  if (!file) return alert('Select a file');
  const signatures = {
    'FFD8FF': 'JPEG',
    '89504E47': 'PNG',
    '47494638': 'GIF',
    '424D': 'BMP',
    '25504446': 'PDF',
    '504B0304': 'ZIP'
  };
  const reader = new FileReader();
  const slice = file.slice(0, 4);
  reader.onload = e => {
    const arr = new Uint8Array(e.target.result);
    const hex = Array.from(arr).map(b => b.toString(16).toUpperCase().padStart(2, '0')).join('');
    const type = signatures[hex] || 'Unknown';
    document.querySelector('#detectResult .result').textContent = `Signature: ${hex} → ${type}`;
  };
  reader.readAsArrayBuffer(slice);
});

/* ==== 16️⃣ Unicode ↔ HTML Entity ============================= */
document.getElementById('btnEncodeEntity')?.addEventListener('click', () => {
  const txt = document.getElementById('entityInput').value;
  const encoded = txt.replace(/[\u00A0-\u9999<>&]/g,
    i => '&#' + i.charCodeAt(0) + ';');
  document.querySelector('#entityResult .result').textContent = encoded;
});

document.getElementById('btnDecodeEntity')?.addEventListener('click', () => {
  const ent = document.getElementById('entityInput').value;
  const decoded = ent.replace(/&#(\d+);/g,
    (_, n) => String.fromCharCode(n));
  document.querySelector('#entityResult .result').textContent = decoded;
});

/* ==== 17️⃣ Bulk Batch Processor (Base64 → ZIP) =============== */
document.getElementById('btnBatchToBase64Zip')?.addEventListener('click', async () => {
  const files = document.getElementById('batchFiles').files;
  if (!files.length) return alert('Select files');
  const zip = new JSZip();
  const log = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const data = await file.arrayBuffer();
    const b64 = btoa(String.fromCharCode(...new Uint8Array(data)));
    zip.file(`${file.name}.b64`, b64);
    log.push(`${file.name} → ${b64.length} chars`);
  }

  const blob = await zip.generateAsync({
    type: 'blob'
  });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'batch-base64.zip';
  a.click();

  document.querySelector('#batchResult .result').textContent = log.join('\n');
});

/* ==== 18️⃣ Date‑Time Formatter =============================== */
document.getElementById('btnFormatDateTime')?.addEventListener('click', () => {
  const input = document.getElementById('dtInput').value.trim();
  if (!input) return alert('Enter a date / timestamp');
  let date;
  if (!isNaN(input)) date = new Date(parseInt(input, 10));
  else date = new Date(input);
  if (isNaN(date)) return alert('Invalid date');
  const iso = date.toISOString();
  const locale = date.toLocaleString();
  const utc = date.toUTCString();
  document.querySelector('#dtResult .result')
    .textContent = `ISO: ${iso}\nLocale: ${locale}\nUTC: ${utc}`;
});

/* ==== 19️⃣ MIME‑type Lookup ================================== */
document.getElementById('btnLookupMime')?.addEventListener('click', () => {
  const map = {
    '.pdf': 'application/pdf',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.zip': 'application/zip',
    '.txt': 'text/plain'
  };
  const inp = document.getElementById('mimeInput').value.trim().toLowerCase();
  let out = '';
  if (inp.startsWith('.')) out = map[inp] || 'Unknown MIME type';
  else {
    const entry = Object.entries(map).find(([, v]) => v === inp);
    out = entry ? `Extension(s): ${entry[0]}` : 'Unknown extension';
  }
  document.querySelector('#mimeResult .result').textContent = out;
});

/* ==== 20️⃣ Binary ↔ Hex Converter ============================ */
document.getElementById('btnFileToHex')?.addEventListener('click', () => {
  const file = document.getElementById('hexFile').files[0];
  if (!file) return alert('Select a file');
  const reader = new FileReader();
  reader.onload = e => {
    const arr = new Uint8Array(e.target.result);
    const hex = Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
    document.querySelector('#hexResult .result').textContent = hex;
  };
  reader.readAsArrayBuffer(file);
});

document.getElementById('btnHexToFile')?.addEventListener('click', () => {
  const hex = document.getElementById('hexInput').value.trim().replace(/\s+/g, '');
  if (!hex) return alert('Enter a hex string');
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  const blob = new Blob([bytes]);
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'output.bin';
  a.click();
  document.querySelector('#hexResult .result').textContent = 'Binary file downloaded';
});

/* ==== 21️⃣ Colour Picker & Converter ======================== */
document.getElementById('btnConvertColour')?.addEventListener('click', () => {
  const hex = document.getElementById('colourInput').value;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  const rN = r / 255,
    gN = g / 255,
    bN = b / 255;
  const max = Math.max(rN, gN, bN),
    min = Math.min(rN, gN, bN);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rN:
        h = (gN - bN) / d + (gN < bN ? 6 : 0);
        break;
      case gN:
        h = (bN - rN) / d + 2;
        break;
      case bN:
        h = (rN - gN) / d + 4;
        break;
    }
    h = Math.round(h * 60);
  }

  const result = `HEX: ${hex}
RGB: ${r}, ${g}, ${b}
HSL: ${h}°, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%`;
  document.querySelector('#colourResult .result').textContent = result;
});

/* ==== 22️⃣ Crop & Resize Image (enhanced) ====================== */
document.getElementById('btnCropResize').addEventListener('click', () => {
  /* ---------- 1️⃣ Grab inputs ---------- */
  const file = document.getElementById('cropImgFile').files[0];
  const targetW = parseInt(document.getElementById('cropWidth').value, 10);
  const targetH = parseInt(document.getElementById('cropHeight').value, 10);
  const minW = parseInt(document.getElementById('cropMinW').value, 10);
  const minH = parseInt(document.getElementById('cropMinH').value, 10);
  const maxW = parseInt(document.getElementById('cropMaxW').value, 10);
  const maxH = parseInt(document.getElementById('cropMaxH').value, 10);
  const lockRatio = document.getElementById('cropLockRatio').checked;
  const allowUpscale = document.getElementById('cropAllowUpscale').checked;
  const bgColour = document.getElementById('cropCanvasBg').value;
  const outFormat = document.getElementById('cropOutFormat').value; // "png" | "jpeg"
  const jpegQuality = parseFloat(document.getElementById('cropJpegQuality').value);

  /* ---------- 2️⃣ Basic validation ---------- */
  if (!file) return alert('Select an image first');
  if (!targetW || !targetH) return alert('Enter target width & height');

  // enforce min / max limits if they are set
  if (!isNaN(minW) && targetW < minW) return alert(`Target width must be ≥ ${minW}px`);
  if (!isNaN(minH) && targetH < minH) return alert(`Target height must be ≥ ${minH}px`);
  if (!isNaN(maxW) && targetW > maxW) return alert(`Target width must be ≤ ${maxW}px`);
  if (!isNaN(maxH) && targetH > maxH) return alert(`Target height must be ≤ ${maxH}px`);

  /* ---------- 3️⃣ Read the source image ---------- */
  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.onload = () => {
      /* ---------- 4️⃣ Determine the source rectangle ---------- */
      let srcX = 0,
        srcY = 0,
        srcW = img.width,
        srcH = img.height;

      // ---- aspect‑ratio lock (centre‑crop) ----
      if (lockRatio) {
        const srcRatio = img.width / img.height;
        const targetRatio = targetW / targetH;

        if (srcRatio > targetRatio) {
          // source is wider – cut the sides
          srcW = img.height * targetRatio;
          srcX = (img.width - srcW) / 2;
        } else {
          // source is taller – cut top/bottom
          srcH = img.width / targetRatio;
          srcY = (img.height - srcH) / 2;
        }
      }

      // ---- up‑scale guard (optional) ----
      if (!allowUpscale) {
        // If the source rectangle is smaller than the target, we only
        // centre‑crop (no scaling up).  The canvas will still be the exact
        // target size, but the image will be drawn at its native size.
        if (srcW < targetW || srcH < targetH) {
          // Reduce the target size to the source size – this prevents blurry up‑scale
          // while still honouring the requested aspect‑ratio.
          targetW = srcW;
          targetH = srcH;
        }
      }

      /* ---------- 5️⃣ Create the destination canvas ---------- */
      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');

      // fill background (useful for PNGs with transparency)
      ctx.fillStyle = bgColour;
      ctx.fillRect(0, 0, targetW, targetH);

      // draw the (possibly cropped) source onto the canvas
      ctx.drawImage(
        img,
        srcX, srcY, srcW, srcH, // source rectangle
        0, 0, targetW, targetH // destination rectangle (exact size)
      );

      /* ---------- 6️⃣ Export ------------------------------------------------- */
      const mime = outFormat === 'jpeg' ? 'image/jpeg' : 'image/png';
      const dataUrl = canvas.toDataURL(mime, outFormat === 'jpeg' ? jpegQuality : undefined);

      // show the result in the UI
      document.querySelector('#cropResult .result').textContent = dataUrl;
      document.getElementById('cropPreview').src = dataUrl;

      // automatically trigger a download
      const a = document.createElement('a');
      const ext = outFormat === 'jpeg' ? 'jpg' : 'png';
      a.href = dataUrl;
      a.download = `crop-${targetW}x${targetH}.${ext}`;
      a.click();
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
});

/* ----------------------------------------------------------------------
   23️⃣ Combine Images → PDF (enhanced)
   ---------------------------------------------------------------------- */

/* ---------- 0️⃣ Helpers ------------------------------------------------ */
function pxToMm(px) {
  const DPI = 96; // most browsers assume 96 dpi for the canvas
  return (px / DPI) * 25.4; // 1 inch = 25.4 mm
}

/* ---------- 1️⃣ File‑list handling (thumbnails + drag‑drop) ---------- */
const pdfFileInput = document.getElementById('pdfImgFiles');
const pdfThumbsDiv = document.getElementById('pdfImgList');
let pdfFileArray = []; // ordered list of File objects

pdfFileInput.addEventListener('change', () => {
  const files = Array.from(pdfFileInput.files);
  pdfFileArray = files; // reset order to selection order
  renderThumbnails();
});

/* Render thumbnail strip */
function renderThumbnails() {
  pdfThumbsDiv.innerHTML = '';
  pdfFileArray.forEach((file, idx) => {
    const url = URL.createObjectURL(file);
    const div = document.createElement('div');
    div.draggable = true;
    div.dataset.idx = idx;
    div.style = `
      width:80px;height:80px;background:#f0f0f0;
      border:1px solid var(--border);border-radius:4px;
      overflow:hidden;position:relative;cursor:move;
    `;

    const img = document.createElement('img');
    img.src = url;
    img.style = 'width:100%;height:100%;object-fit:cover';
    div.appendChild(img);

    const del = document.createElement('button');
    del.textContent = '✕';
    del.style = `
      position:absolute;top:2px;right:2px;
      background:rgba(0,0,0,0.5);color:#fff;border:none;
      border-radius:50%;width:18px;height:18px;
      font-size:12px;line-height:1;
    `;
    del.addEventListener('click', (e) => {
      e.stopPropagation();
      pdfFileArray.splice(idx, 1);
      renderThumbnails();
    });
    div.appendChild(del);

    // ----- drag‑and‑drop events -----
    div.addEventListener('dragstart', e => {
      e.dataTransfer.setData('text/plain', idx);
      e.dataTransfer.effectAllowed = 'move';
    });
    div.addEventListener('dragover', e => e.preventDefault());
    div.addEventListener('drop', e => {
      e.preventDefault();
      const fromIdx = Number(e.dataTransfer.getData('text/plain'));
      const toIdx = idx;
      if (fromIdx === toIdx) return;
      const moved = pdfFileArray.splice(fromIdx, 1)[0];
      pdfFileArray.splice(toIdx, 0, moved);
      renderThumbnails();
    });

    pdfThumbsDiv.appendChild(div);
  });
}

/* ---------- 2️⃣ Page‑size & orientation handling ---------------------- */
function getPageDimensions() {
  const size = document.getElementById('pdfPageSize').value;
  let w, h; // mm
  if (size === 'a4') {
    w = 210;
    h = 297;
  } else if (size === 'letter') {
    w = 216;
    h = 279;
  } else { // custom
    w = parseFloat(document.getElementById('pdfCustomWidth').value);
    h = parseFloat(document.getElementById('pdfCustomHeight').value);
    if (isNaN(w) || isNaN(h)) {
      alert('Enter a valid custom page width & height');
      return null;
    }
  }
  // orientation flip
  const portrait = document.getElementById('pdfPortrait').checked;
  if (!portrait) [w, h] = [h, w];
  return {
    w,
    h
  };
}

/* ---------- 3️⃣ Main PDF generation ----------------------------------- */
document.getElementById('btnCombinePdf').addEventListener('click', async () => {
  if (!pdfFileArray.length) return alert('Select at least one image');

  const page = getPageDimensions();
  if (!page) return; // invalid custom size
  const {
    w: pageW,
    h: pageH
  } = page;

  // ----- margins (mm) -----
  const marginTop = parseFloat(document.getElementById('pdfMarginTop').value) || 0;
  const marginRight = parseFloat(document.getElementById('pdfMarginRight').value) || 0;
  const marginBottom = parseFloat(document.getElementById('pdfMarginBottom').value) || 0;
  const marginLeft = parseFloat(document.getElementById('pdfMarginLeft').value) || 0;

  const drawableW = pageW - marginLeft - marginRight;
  const drawableH = pageH - marginTop - marginBottom;

  const fitMode = document.getElementById('pdfFitMode').value; // fit | fill | stretch
  const rotateDeg = Number(document.getElementById('pdfRotate').value);
  const quality = parseFloat(document.getElementById('pdfQuality').value);
  const addPageNumbers = document.getElementById('pdfPageNumbers').checked;
  const headerText = document.getElementById('pdfHeader').value;
  const footerText = document.getElementById('pdfFooter').value;
  const caption = document.getElementById('pdfCaption').value;
  const titleMeta = document.getElementById('pdfTitle').value;
  const authorMeta = document.getElementById('pdfAuthor').value;
  const outFileName = document.getElementById('pdfFileName').value || 'combined.pdf';

  const {
    jsPDF
  } = window.jspdf;
  const doc = new jsPDF({
    unit: 'mm',
    format: [pageW, pageH]
  });

  // set optional metadata
  const meta = {};
  if (titleMeta) meta.title = titleMeta;
  if (authorMeta) meta.author = authorMeta;
  if (Object.keys(meta).length) doc.setProperties(meta);

  for (let i = 0; i < pdfFileArray.length; i++) {
    const file = pdfFileArray[i];
    const dataUrl = await readFileAsDataURL(file);

    // ---------- load image ----------
    const img = new Image();
    await new Promise(res => {
      img.onload = res;
      img.src = dataUrl;
    });

    // ---------- create a temporary canvas that does rotation & scaling ----------
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // determine source width/height after rotation
    const rot = rotateDeg % 360;
    const rad = (rot * Math.PI) / 180;
    const sin = Math.abs(Math.sin(rad));
    const cos = Math.abs(Math.cos(rad));

    const srcW = img.width;
    const srcH = img.height;
    const rotatedW = srcW * cos + srcH * sin;
    const rotatedH = srcW * sin + srcH * cos;

    // set canvas size to the rotated image size
    canvas.width = rotatedW;
    canvas.height = rotatedH;

    // translate to centre & rotate
    ctx.translate(rotatedW / 2, rotatedH / 2);
    ctx.rotate(rad);
    ctx.drawImage(img, -srcW / 2, -srcH / 2);
    // now canvas contains the (optionally rotated) image

    // ---------- scaling to printable area ----------
    let drawW = drawableW,
      drawH = drawableH; // mm
    const imgWmm = pxToMm(rotatedW);
    const imgHmm = pxToMm(rotatedH);

    if (fitMode === 'fit') {
      const scale = Math.min(drawableW / imgWmm, drawableH / imgHmm);
      drawW = imgWmm * scale;
      drawH = imgHmm * scale;
    } else if (fitMode === 'fill') {
      const scale = Math.max(drawableW / imgWmm, drawableH / imgHmm);
      drawW = imgWmm * scale;
      drawH = imgHmm * scale;
    } // else stretch – drawW/drawH already equal to drawable area

    // centre the image inside the drawable rectangle
    const offsetX = marginLeft + (drawableW - drawW) / 2;
    const offsetY = marginTop + (drawableH - drawH) / 2;

    // ---------- export as JPEG/PNG with chosen quality ----------
    const mime = (quality < 1 && document.getElementById('pdfOutFormat')?.value === 'jpeg') ?
      'image/jpeg' : 'image/png';
    const finalDataUrl = canvas.toDataURL(mime, quality);

    // ---------- add a new page (except for the very first image) ----------
    if (i > 0) doc.addPage([pageW, pageH]);

    // ---------- header ----------
    if (headerText) {
      doc.setFontSize(10);
      doc.text(headerText, marginLeft, marginTop / 2);
    }

    // ---------- image ----------
    doc.addImage(finalDataUrl, mime === 'image/jpeg' ? 'JPEG' : 'PNG',
      offsetX, offsetY, drawW, drawH);

    // ---------- caption ----------
    if (caption) {
      doc.setFontSize(9);
      doc.text(caption, marginLeft, offsetY + drawH + 5);
    }

    // ---------- footer ----------
    if (footerText) {
      doc.setFontSize(10);
      doc.text(footerText, marginLeft, pageH - marginBottom / 2);
    }

    // ---------- page number ----------
    if (addPageNumbers) {
      const pageNum = `Page ${i + 1} of ${pdfFileArray.length}`;
      doc.setFontSize(9);
      const txtWidth = doc.getTextWidth(pageNum);
      doc.text(pageNum,
        pageW - marginRight - txtWidth,
        pageH - marginBottom / 2);
    }
  }

  // -----------------------------------------------------------------
  // 4️⃣ Save / show result
  // -----------------------------------------------------------------
  const pdfBlob = doc.output('blob');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(pdfBlob);
  a.download = outFileName;
  a.click();

  document.querySelector('#pdfResult .result')
    .textContent = `PDF generated (${outFileName}) and downloaded`;
});

/* Helper: read a File as Data‑URL (returns a Promise) */
function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = e => resolve(e.target.result);
    r.onerror = e => reject(e);
    r.readAsDataURL(file);
  });
}

/* ----------------------------------------------------------------------
   End of “Combine Images → PDF” block
   ---------------------------------------------------------------------- */

/* -------------------------------------------------------------
   End of script.js – all original tools plus the two new ones
   ------------------------------------------------------------- */