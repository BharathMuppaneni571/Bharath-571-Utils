/* -------------------------------------------------------------
   SPA Routing Engine
   ------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  const tools = Array.from(document.querySelectorAll('.tile'));
  const sidebarNav = document.getElementById('sidebar-nav');
  const dashboardGrid = document.getElementById('view-dashboard');

  const iconMap = {
    'tile-base64': 'key',
    'tile-urlencode': 'link',
    'tile-htmlencode': 'code_blocks',
    'tile-strconvert': 'text_fields',
    'tile-timestamp': 'schedule',
    'tile-diff': 'difference',
    'tile-color': 'palette',
    'tile-lorem': 'format_align_left',
    'tile-crop': 'crop',
    'tile-pwdgen': 'password',
    'tile-regex': 'search',
    'tile-jsonview': 'data_object',
    'tile-beautify': 'auto_fix_high',
    'tile-hash': 'tag',
    'tile-csv2json': 'sync_alt',
    'tile-uuid': 'fingerprint',
    'tile-qrgen': 'qr_code_2',
    'tile-qrread': 'document_scanner',
    'tile-exif': 'image_search',
    'tile-filetype': 'description',
    'tile-unit': 'straighten',
    'tile-notepad': 'edit_note',
    'tile-pdf': 'picture_as_pdf',
    'tile-xmljson': 'swap_horiz',
    'tile-jsonpath': 'troubleshoot',
    'tile-handlebar': 'view_stream',
    'tile-restapi': 'api',
    'tile-odata': 'database',
    'tile-jwt': 'vpn_key',
    'tile-curl': 'terminal',
    'tile-cron': 'calendar_month',
    'tile-markdown': 'edit_document',
    'tile-mockdata': 'table',
    'tile-imagegen': 'image_search'
  };

  tools.forEach(tool => {
    const title = tool.querySelector('h2').textContent;
    const toolId = tool.id;
    const iconStr = iconMap[toolId] || 'handyman';

    // Build sidebar link
    const link = document.createElement('a');
    link.href = "#";
    link.className = "nav-item";
    link.dataset.target = toolId;
    link.onclick = (e) => { e.preventDefault(); showTool(toolId); };
    link.innerHTML = `<span class="nav-icon material-symbols-outlined">${iconStr}</span> ${title}`;
    sidebarNav.appendChild(link);

    // Build dashboard card
    const card = document.createElement('div');
    card.className = "dash-card";
    card.onclick = () => showTool(toolId);
    card.innerHTML = `
      <div class="dash-icon material-symbols-outlined">${iconStr}</div>
      <h3>${title}</h3>
      <p>Quickly access the ${title} utility tool.</p>
    `;
    dashboardGrid.appendChild(card);
  });

  // Global Cmd/Ctrl + K Macro
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      const searchInput = document.getElementById('toolSearch');
      if (searchInput) searchInput.focus();
    }
  });

  // CodeMirror Initialization
  window.cmEditors = {};
  if (typeof CodeMirror !== 'undefined') {
    const cmConfig = { theme: 'material-ocean', lineNumbers: true, matchBrackets: true };
    const setupCM = (id, mode) => {
      const el = document.getElementById(id);
      if (el) window.cmEditors[id] = CodeMirror.fromTextArea(el, { ...cmConfig, mode });
    };
    setupCM('xmljsonInput', 'javascript');
    setupCM('jpDataInput', 'javascript');
    setupCM('hbData', 'javascript');
    setupCM('hbTemplate', 'xml');
    setupCM('apiHeaders', 'javascript');
    setupCM('apiBody', 'javascript');
  }

  // Local Storage Hydration (Inputs)
  document.querySelectorAll('input:not([type="file"]), select, textarea').forEach(el => {
    if (el.id && el.id !== 'toolSearch' && !window.cmEditors[el.id]) {
      const saved = localStorage.getItem('toolbox_' + el.id);
      if (saved !== null) {
        if (el.type === 'checkbox') el.checked = saved === 'true';
        else el.value = saved;
      }
      el.addEventListener('input', () => {
        localStorage.setItem('toolbox_' + el.id, el.type === 'checkbox' ? el.checked : el.value);
      });
      el.addEventListener('change', () => {
        localStorage.setItem('toolbox_' + el.id, el.type === 'checkbox' ? el.checked : el.value);
      });
    }
  });

  // Local Storage Hydration (CodeMirror)
  for (const key in window.cmEditors) {
    const saved = localStorage.getItem('toolbox_cm_' + key);
    if (saved) window.cmEditors[key].setValue(saved);
    window.cmEditors[key].on('change', () => {
      localStorage.setItem('toolbox_cm_' + key, window.cmEditors[key].getValue());
    });
  }
});

function getVal(id) {
  if (window.cmEditors && window.cmEditors[id]) return window.cmEditors[id].getValue().trim();
  const el = document.getElementById(id);
  return el ? el.value.trim() : "";
}

window.showDashboard = function(e) {
  if (e) e.preventDefault();
  document.getElementById('view-dashboard').classList.remove('hidden');
  document.getElementById('all-tools').classList.add('hidden');
  document.getElementById('page-title').textContent = "Bharath's tool bar";
  document.getElementById('btnGlobalHistory').classList.add('hidden');
  window.currentToolId = null;
  
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  document.querySelector('.nav-item').classList.add('active'); // Dashboard link is first
};

window.showTool = function(toolId) {
  document.getElementById('view-dashboard').classList.add('hidden');
  document.getElementById('all-tools').classList.remove('hidden');
  
  document.querySelectorAll('.tile').forEach(t => t.classList.add('hidden'));
  const activeTool = document.getElementById(toolId);
  activeTool.classList.remove('hidden');
  window.currentToolId = toolId;
  
  document.getElementById('page-title').textContent = activeTool.querySelector('h2').textContent;
  
  if (toolId !== 'tile-notepad') {
    document.getElementById('btnGlobalHistory').classList.remove('hidden');
  } else {
    document.getElementById('btnGlobalHistory').classList.add('hidden');
  }
  
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.remove('active');
    if (el.dataset.target === toolId) el.classList.add('active');
  });
};

window.toggleSidebar = function() {
  document.getElementById('sidebar').classList.toggle('collapsed');
  document.querySelector('.main-content').classList.toggle('expanded');
};


// Search mode pill active class (JS-driven for broad browser support)
document.querySelectorAll('.search-mode-pill').forEach(pill => {
  pill.addEventListener('click', () => {
    document.querySelectorAll('.search-mode-pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
  });
});
// Set initial active
const defaultPill = document.querySelector('.search-mode-pill input[value="insensitive"]');
if(defaultPill) defaultPill.closest('.search-mode-pill').classList.add('active');
let searchDebounce;
document.getElementById('toolSearch')?.addEventListener('input', (e) => {
  const term = e.target.value;
  const lowerTerm = term.toLowerCase();
  
  // DOM Filtering (Basic Tool Names)
  if (lowerTerm.length > 0 && document.getElementById('view-dashboard').classList.contains('hidden')) {
    window.showDashboard();
  }
  
  document.querySelectorAll('#sidebar-nav .nav-item').forEach(el => {
    if (el.textContent.includes('Dashboard')) return;
    el.style.display = el.textContent.toLowerCase().includes(lowerTerm) ? 'flex' : 'none';
  });

  document.querySelectorAll('.dash-card').forEach(el => {
    el.style.display = el.textContent.toLowerCase().includes(lowerTerm) ? 'flex' : 'none';
  });

  // Global API Search
  const dropdown = document.getElementById('searchDropdown');
  if(!dropdown) return;
  if(!term) {
    dropdown.style.display = 'none';
    return;
  }
  
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(async () => {
    try {
      const modeNode = document.querySelector('input[name="searchMode"]:checked');
      const mode = modeNode ? modeNode.value : 'insensitive';
      
      const res = await fetch(`/api/search?q=${encodeURIComponent(term)}&mode=${mode}`);
      if(!res.ok) throw new Error("Search API failed");
      const results = await res.json();
      
      dropdown.innerHTML = '';
      if(results.length === 0) {
        dropdown.innerHTML = '<div class="search-empty">No saved data matches found.</div>';
      } else {
        results.forEach(r => {
          const item = document.createElement('div');
          item.className = 'search-result-item';
          const isNote = r.type === 'note';
          const icon = isNote ? 'description' : 'history';
          const typeLabel = isNote ? 'Note' : 'History';
          const typeClass = isNote ? 'note' : 'history';
          const meta = isNote
            ? (r.time ? new Date(r.time).toLocaleString() : '')
            : (r.payload ? String(r.payload).replace(/{|}/g, '').substring(0, 80) + '\u2026' : '');
          item.innerHTML = `
            <span class="material-symbols-outlined search-result-icon">${icon}</span>
            <div class="search-result-body">
              <div class="search-result-title">${r.title}</div>
              <div class="search-result-meta">${meta}</div>
            </div>
            <span class="search-result-type ${typeClass}">${typeLabel}</span>
          `;
          if(isNote) {
            item.onclick = () => {
              dropdown.style.display = 'none';
              window.showTool('tile-notepad');
              setTimeout(() => { window.currentNoteId = r.id; if(typeof loadNotesList === 'function') loadNotesList(); }, 100);
            };
          } else {
            item.onclick = () => {
              dropdown.style.display = 'none';
              window.showTool('tile-' + r.title);
              if(r.payload) {
                setTimeout(() => {
                  try { const parsed = typeof r.payload === 'string' ? JSON.parse(r.payload) : r.payload; if(typeof restoreToolState === 'function') restoreToolState('tile-' + r.title, parsed); } catch(e) {}
                }, 100);
              }
            };
          }
          dropdown.appendChild(item);
        });
      }
      dropdown.style.display = 'block';
    } catch(err) {
      console.error(err);
    }
  }, 400); // 400ms debounce
});

// Hide dropdown when clicking outside
document.addEventListener('click', (e) => {
  if(!e.target.closest('.search-container')) {
    const d = document.getElementById('searchDropdown');
    if(d) d.style.display = 'none';
  }
});

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
  let currentY = 20;

  lines.forEach((txt, i) => {
    if (currentY + 50 > 297) { // A4 height limit
      doc.addPage();
      currentY = 20;
    }
    const canvas = document.createElement('canvas');
    new QRCode(canvas, {
      text: txt,
      width: 100,
      height: 100
    });
    const imgData = canvas.toDataURL('image/png');
    doc.addImage(imgData, 'PNG', 15, currentY, 40, 40);
    doc.text(txt, 60, currentY + 15);
    currentY += 50;
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
    let type = 'Unknown';
    for (const sig in signatures) {
      if (hex.startsWith(sig)) {
        type = signatures[sig];
        break;
      }
    }
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
  if (!isNaN(input) && input.length >= 10) date = new Date(parseInt(input, 10)); // Treat as unix timestamp only if >= 10 digits
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
  let targetW = parseInt(document.getElementById('cropWidth').value, 10);
  let targetH = parseInt(document.getElementById('cropHeight').value, 10);
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
document.getElementById('pdfPageSize').addEventListener('change', (e) => {
  document.getElementById('pdfCustomSize').style.display = e.target.value === 'custom' ? 'block' : 'none';
});

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
   End of script.js – all original tools plus the new ones
   ------------------------------------------------------------- */

/* ==== 24️⃣ XML ↔ JSON Bi-directional Converter ======================== */
document.getElementById('btnXmlToJson')?.addEventListener('click', () => {
  const input = getVal('xmljsonInput');
  if (!input) return alert('Paste some XML first');
  try {
    const x2js = new X2JS();
    const jsonObj = x2js.xml_str2json(input);
    if (!jsonObj) throw new Error('Invalid XML structure');
    document.querySelector('#xmljsonResult .result').textContent = JSON.stringify(jsonObj, null, 4);
  } catch (e) {
    document.querySelector('#xmljsonResult .result').textContent = 'Error: ' + e.message;
  }
});

document.getElementById('btnJsonToXml')?.addEventListener('click', () => {
  const input = getVal('xmljsonInput');
  if (!input) return alert('Paste some JSON first');
  try {
    const x2js = new X2JS();
    const jsonObj = JSON.parse(input);
    const xmlStr = x2js.json2xml_str(jsonObj);
    const formatted = typeof html_beautify === 'function' ? html_beautify(xmlStr, { indent_size: 4 }) : xmlStr;
    document.querySelector('#xmljsonResult .result').textContent = formatted;
  } catch (e) {
    document.querySelector('#xmljsonResult .result').textContent = 'Error: ' + e.message;
  }
});

/* ==== 25️⃣ JSONPath / Query Extractor ======================== */
document.getElementById('btnExtractJp')?.addEventListener('click', () => {
  const jsonStr = getVal('jpDataInput');
  const query = getVal('jpQuery');
  if (!jsonStr || !query) return alert('Provide both JSON data and a JSONPath query.');
  try {
    const jsonObj = JSON.parse(jsonStr);
    const result = jsonpath.query(jsonObj, query);
    document.querySelector('#jpResult .result').textContent = JSON.stringify(result, null, 4);
  } catch (e) {
    document.querySelector('#jpResult .result').textContent = 'Error: ' + e.message;
  }
});

/* ==== 26️⃣ Template Binding Tester (Handlebars) ======================== */
document.getElementById('btnBindTemplate')?.addEventListener('click', () => {
  const dataStr = getVal('hbData');
  const tmplStr = getVal('hbTemplate');
  if (!dataStr || !tmplStr) return alert('Provide both JSON data and a template string.');
  try {
    const context = JSON.parse(dataStr);
    const template = Handlebars.compile(tmplStr);
    const html = template(context);
    document.querySelector('#hbResult .result').textContent = html;
  } catch (e) {
    document.querySelector('#hbResult .result').textContent = 'Error: ' + e.message;
  }
});

/* ==== 27️⃣ REST API Client ======================== */
document.getElementById('btnSendApi')?.addEventListener('click', async () => {
  const url = getVal('apiUrl');
  const method = getVal('apiMethod');
  const headersStr = getVal('apiHeaders');
  const bodyStr = getVal('apiBody');

  if (!url) return alert('Please enter a valid URL');
  
  let headers = {};
  if (headersStr) {
    try { headers = JSON.parse(headersStr); }
    catch (e) { return alert('Headers must be valid JSON'); }
  }

  const options = { method, headers };
  if ((method === 'POST' || method === 'PUT' || method === 'PATCH') && bodyStr) {
    options.body = bodyStr;
  }

  const resultContainer = document.querySelector('#apiResult .result');
  const metaContainer = document.getElementById('apiMeta');
  resultContainer.textContent = "Sending Request...";
  metaContainer.textContent = "";

  const start = Date.now();
  try {
    const response = await fetch(url, options);
    const duration = Date.now() - start;
    
    const contentType = response.headers.get("content-type");
    let responseData;
    if (contentType && contentType.indexOf("application/json") !== -1) {
      responseData = await response.json();
      responseData = JSON.stringify(responseData, null, 4);
    } else {
      responseData = await response.text();
    }
    
    metaContainer.textContent = `Status: ${response.status} ${response.statusText} | Time: ${duration}ms`;
    resultContainer.textContent = responseData;
  } catch (e) {
    const duration = Date.now() - start;
    metaContainer.textContent = `Time: ${duration}ms | Fetch Failed (Check CORS)`;
    resultContainer.textContent = 'Error executing request:\n' + e.message;
  }
});

/* ==== 28️⃣ OData Query Builder ======================== */
document.getElementById('btnBuildOdata')?.addEventListener('click', () => {
  let baseUrl = getVal('odataBaseUrl');
  if (!baseUrl) return alert('Please provide a Base API Endpoint');
  
  const pSelect = getVal('odataSelect');
  const pFilter = getVal('odataFilter');
  const pExpand = getVal('odataExpand');
  const pOrderby = getVal('odataOrderby');
  const pTop = getVal('odataTop');
  const pSkip = getVal('odataSkip');

  const params = [];
  if (pSelect) params.push('$select=' + encodeURIComponent(pSelect));
  if (pFilter) params.push('$filter=' + encodeURIComponent(pFilter));
  if (pExpand) params.push('$expand=' + encodeURIComponent(pExpand));
  if (pOrderby) params.push('$orderby=' + encodeURIComponent(pOrderby));
  if (pTop) params.push('$top=' + encodeURIComponent(pTop));
  if (pSkip) params.push('$skip=' + encodeURIComponent(pSkip));

  let finalUrl = baseUrl;
  if (params.length > 0) {
    finalUrl += (baseUrl.includes('?') ? '&' : '?') + params.join('&');
  }

  document.querySelector('#odataResult .result').textContent = finalUrl;
});

/* ==== 29 JWT Token Sandbox ======================== */
document.getElementById('btnDecodeJwt')?.addEventListener('click', () => {
  const token = getVal('jwtInput');
  if (!token) return alert('Paste a JWT token first.');
  try {
    const parts = token.split('.');
    if (parts.length < 2) throw new Error('Not a valid JWT (needs at least 2 parts)');
    const decode = str => {
      const b64 = str.replace(/-/g,'+').replace(/_/g,'/');
      const json = decodeURIComponent(atob(b64).split('').map(c => 
        '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
      return JSON.parse(json);
    };
    document.querySelector('#jwtHeaderResult .result').textContent = JSON.stringify(decode(parts[0]), null, 2);
    document.querySelector('#jwtPayloadResult .result').textContent = JSON.stringify(decode(parts[1]), null, 2);
  } catch(e) {
    document.querySelector('#jwtHeaderResult .result').textContent = 'Error: ' + e.message;
    document.querySelector('#jwtPayloadResult .result').textContent = '';
  }
});

/* ==== 30 cURL to Fetch Converter ======================== */
document.getElementById('btnConvertCurl')?.addEventListener('click', () => {
  const curl = getVal('curlInput');
  if (!curl) return alert('Paste a cURL command first.');
  try {
    let method = 'GET';
    let url = '';
    let headers = {};
    let body = null;

    const methodMatch = curl.match(/-X\s+(\w+)/i);
    if (methodMatch) method = methodMatch[1].toUpperCase();

    const urlMatch = curl.match(/curl\s+(?:-[^\s]+\s+[^\s]+\s+)*['"](https?:\/\/[^'"]+)['"]/)  
                  || curl.match(/curl\s+(?:-[^\s]+\s+[^\s]+\s+)*(https?:\/\/\S+)/);
    if (urlMatch) url = urlMatch[1];

    const headerMatches = [...curl.matchAll(/-H\s+['"]([^'"]+)['"]/gi)];
    headerMatches.forEach(m => {
      const [k, ...v] = m[1].split(':');
      if(k) headers[k.trim()] = v.join(':').trim();
    });

    const bodyMatch = curl.match(/(?:-d|--data|--data-raw)\s+['"]((?:[^'"\\]|\\.)*)['"]/);
    if (bodyMatch) body = bodyMatch[1].replace(/\\'/g, "'").replace(/\\"/g, '"');
    if (!body) {
      const bodyRaw = curl.match(/(?:-d|--data|--data-raw)\s+(\{[^}]+\}|\[[^\]]+\])/i);
      if (bodyRaw) body = bodyRaw[1];
    }

    const headersStr = Object.keys(headers).length ? 
      `  headers: ${JSON.stringify(headers, null, 4).replace(/\n/g, '\n  ')},\n` : '';
    const bodyStr = body ? `  body: ${JSON.stringify(body)},\n` : '';

    const output = `const response = await fetch('${url}', {\n  method: '${method}',\n${headersStr}${bodyStr}});\n\nconst data = await response.json();\nconsole.log(data);`;
    document.querySelector('#curlResult .result').textContent = output;
  } catch(e) {
    document.querySelector('#curlResult .result').textContent = 'Parse Error: ' + e.message;
  }
});

/* ==== 31 Cron Expression Generator ======================== */
function updateCron() {
  const min = getVal('cronMin') || '*';
  const hour = getVal('cronHour') || '*';
  const dom = getVal('cronDom') || '*';
  const month = getVal('cronMonth') || '*';
  const dow = getVal('cronDow') || '*';
  const expr = `${min} ${hour} ${dom} ${month} ${dow}`;
  const compiled = document.getElementById('cronCompiled');
  if (compiled) compiled.value = expr;
  try {
    const text = typeof cronstrue !== 'undefined' ? cronstrue.toString(expr) : expr;
    document.querySelector('#cronResult .result').textContent = text;
  } catch(e) {
    document.querySelector('#cronResult .result').textContent = 'Invalid expression: ' + e.message;
  }
}
['cronMin','cronHour','cronDom','cronMonth','cronDow'].forEach(id => {
  document.getElementById(id)?.addEventListener('input', updateCron);
});

/* ==== 32 Live Markdown Editor ======================== */
function renderMarkdown() {
  const src = window.cmEditors?.mdInput ? window.cmEditors.mdInput.getValue() 
             : (document.getElementById('mdInput')?.value || '');
  const preview = document.querySelector('#mdResult .result');
  if (!preview) return;
  if (typeof marked !== 'undefined') {
    preview.innerHTML = marked.parse(src);
  } else {
    preview.textContent = src;
  }
}
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    if (window.cmEditors?.mdInput) {
      window.cmEditors.mdInput.on('change', renderMarkdown);
    } else {
      document.getElementById('mdInput')?.addEventListener('input', renderMarkdown);
    }
    renderMarkdown();
  }, 500);
});

/* ==== 33 Database Seed Generator ======================== */
const MOCK_GENERATORS = {
  id:        () => Math.floor(Math.random() * 90000) + 10000,
  uuid:      () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
               const r = Math.random()*16|0; return (c==='x'?r:(r&0x3|0x8)).toString(16); }),
  firstName: () => ['Aarav','Priya','Rohan','Meera','Arjun','Divya','Sai','Kavya','Kiran','Anjali'][Math.floor(Math.random()*10)],
  lastName:  () => ['Sharma','Patel','Kumar','Singh','Reddy','Nair','Rao','Iyer','Mehta','Gupta'][Math.floor(Math.random()*10)],
  email:     (row) => `user${row.id || Math.floor(Math.random()*9000+1000)}@example.com`,
  phone:     () => '+91 ' + (Math.floor(Math.random()*9000000000)+1000000000),
  city:      () => ['Mumbai','Delhi','Bangalore','Chennai','Hyderabad','Pune','Kolkata','Ahmedabad'][Math.floor(Math.random()*8)],
  company:   () => ['TechCorp','Innovate Ltd','GlobalSoft','DataSys','CloudBase'][Math.floor(Math.random()*5)],
  salary:    () => Math.floor(Math.random()*90000+30000),
  date:      () => { const d=new Date(Date.now()-Math.random()*3e10); return d.toISOString().split('T')[0]; },
  boolean:   () => Math.random() > 0.5,
  status:    () => ['active','inactive','pending','suspended'][Math.floor(Math.random()*4)]
};

document.getElementById('btnGenerateMock')?.addEventListener('click', () => {
  const table = getVal('mockTable') || 'Users';
  const rows = parseInt(getVal('mockRows')) || 10;
  const fmt = document.getElementById('mockFormat')?.value || 'sql';
  const cols = ['id','firstName','lastName','email','city','company','date','status'];
  
  const data = Array.from({length: rows}, () => {
    const row = {};
    cols.forEach(c => { row[c] = (MOCK_GENERATORS[c] || (() => 'N/A'))(row); });
    return row;
  });

  let output = '';
  if (fmt === 'json') {
    output = JSON.stringify(data, null, 2);
  } else if (fmt === 'csv') {
    output = cols.join(',') + '\n';
    output += data.map(r => cols.map(c => `"${r[c]}"`).join(',')).join('\n');
  } else {
    output = data.map(r => {
      const vals = cols.map(c => typeof r[c]==='string' ? `'${r[c]}'` : r[c]);
      return `INSERT INTO ${table} (${cols.join(', ')}) VALUES (${vals.join(', ')});`;
    }).join('\n');
  }
  document.querySelector('#mockResult .result').textContent = output;
});

/* ==== 34 AI Image Generator ======================== */
document.getElementById('btnGenerateImage')?.addEventListener('click', async () => {
  const prompt = getVal('imgPrompt');
  const source = document.getElementById('imgSource')?.value;
  if (!prompt) return alert('Please enter a prompt first.');

  const placeholder = document.getElementById('imgPlaceholder');
  const statusEl = document.getElementById('imgStatus');
  placeholder.innerHTML = '';
  statusEl.textContent = 'Generating image...';
  statusEl.style.color = 'var(--text-muted)';

  try {
    let imgUrl = '';
    if (source === 'pollinations') {
      // Pollinations.ai - completely free, no API key needed
      const encoded = encodeURIComponent(prompt);
      imgUrl = `https://image.pollinations.ai/prompt/${encoded}?width=512&height=512&nologo=true&t=${Date.now()}`;
    } else if (source === 'dicebear') {
      // DiceBear abstract art - free
      const seed = encodeURIComponent(prompt);
      imgUrl = `https://api.dicebear.com/7.x/shapes/svg?seed=${seed}&size=512&backgroundColor=0f172a`;
    } else if (source === 'robohash') {
      // Robohash - fun AI avatars from any text
      const seed = encodeURIComponent(prompt);
      imgUrl = `https://robohash.org/${seed}?size=512x512&set=set4`;
    } else if (source === 'picsum') {
      // Unsplash via Picsum - beautiful placeholder photos
      imgUrl = `https://picsum.photos/seed/${encodeURIComponent(prompt)}/512/512`;
    }

    const img = document.createElement('img');
    img.style.cssText = 'max-width:100%; border-radius:12px; display:block; margin:0 auto;';
    img.onload = () => { statusEl.textContent = '✓ Image generated successfully!'; statusEl.style.color = 'var(--accent-base)'; };
    img.onerror = () => { statusEl.textContent = '✗ Failed to load image. Try again.'; statusEl.style.color = '#f87171'; };
    img.src = imgUrl;
    img.alt = prompt;
    placeholder.appendChild(img);

    // Add download button
    const dlBtn = document.createElement('a');
    dlBtn.href = imgUrl;
    dlBtn.target = '_blank';
    dlBtn.textContent = '⬇ Open Full Image';
    dlBtn.style.cssText = 'display:block; margin-top:0.8rem; color:var(--accent-base); text-align:center; font-weight:600;';
    placeholder.appendChild(dlBtn);
  } catch(e) {
    statusEl.textContent = 'Error: ' + e.message;
    statusEl.style.color = '#f87171';
  }
});

/* ============================================================================
   Notepad & History D1 API Integration
============================================================================ */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Setup Quick Note FAB
  const btnQuickNote = document.getElementById('btnQuickNote');
  if(btnQuickNote) {
    btnQuickNote.addEventListener('click', () => {
      window.showTool('tile-notepad');
    });
  }

  // 2. Notepad Init
  if (typeof Quill !== 'undefined' && document.getElementById('quillEditor')) {
    window.notepadQuill = new Quill('#quillEditor', {
      theme: 'snow',
      placeholder: 'Start writing your note...',
      modules: {
        toolbar: [
          [{ 'header': [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'list': 'check' }],
          ['link', 'image', 'code-block'],
          ['clean']
        ]
      }
    });

    window.currentNoteId = null;

    // Load initial notes list
    loadNotesList();

    // Auto-save logic (debounced)
    let saveTimeout = null;
    window.notepadQuill.on('text-change', () => {
      if(!window.currentNoteId) return; // if no note is active, don't save
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        saveNote(window.currentNoteId);
      }, 1000);
    });

    document.getElementById('btnNotepadSave').addEventListener('click', () => {
      if(window.currentNoteId) saveNote(window.currentNoteId);
    });

    document.getElementById('btnNotepadDelete').addEventListener('click', () => {
      if(window.currentNoteId) deleteNote(window.currentNoteId);
    });

    document.getElementById('btnNotepadNew').addEventListener('click', () => {
      window.currentNoteId = 'Note_' + Date.now();
      document.getElementById('noteTitle').value = window.currentNoteId;
      window.notepadQuill.root.innerHTML = '';
      document.getElementById('notepadResult').querySelector('.result').textContent = 'Created new note.';
      // We don't save immediately to avoid empty notes
    });

    // Update active note ID on title change
    document.getElementById('noteTitle').addEventListener('input', (e) => {
      window.currentNoteId = e.target.value.trim() || null;
    });
  }

  // 3. Global Tool Action Interceptor (History Save)
  document.getElementById('all-tools')?.addEventListener('click', (e) => {
    // Only intercept action buttons, not copy buttons or notepad toolbar
    if (e.target.tagName !== 'BUTTON' || e.target.classList.contains('copyBtn') || e.target.closest('#tile-notepad') || e.target.closest('.ql-toolbar')) return;
    
    // Some buttons purely navigate or reset, but we intercept most primary actions
    const tile = e.target.closest('.tile');
    if (!tile) return;
    
    // Wait for the action to finish computing
    setTimeout(() => {
      saveToolStateToHistory(tile);
    }, 800);
  });

  // History Drawer Clear
  document.getElementById('btnClearHistory')?.addEventListener('click', async () => {
    if(!window.currentToolId) return;
    try {
      await fetch('/api/history?tool=' + encodeURIComponent(window.currentToolId), { method: 'DELETE' });
      document.getElementById('historyList').innerHTML = '<div style="color:var(--text-muted);">History cleared.</div>';
    } catch(err) {
       console.error("Clear History Error", err);
    }
  });

});

async function loadNotesList() {
  try {
    const res = await fetch('/api/notes');
    if(!res.ok) throw new Error("API error");
    const notes = await res.json();
    const list = document.getElementById('notepadList');
    list.innerHTML = '';
    
    if(notes.length === 0) {
      window.currentNoteId = 'My Note 1';
      document.getElementById('noteTitle').value = window.currentNoteId;
      return list.innerHTML = '<div style="color:var(--text-muted); font-size:0.9rem;">No notes yet.</div>';
    }

    notes.forEach(note => {
      const item = document.createElement('div');
      item.className = 'note-item';
      item.textContent = note.id;
      item.onclick = () => loadNoteData(note);
      list.appendChild(item);
    });

    // Load first if none selected
    if(!window.currentNoteId) {
      loadNoteData(notes[0]);
    }
  } catch(err) {
    document.getElementById('notepadResult').querySelector('.result').textContent = 'Failed to load notes: ' + err.message;
  }
}

function loadNoteData(note) {
  window.currentNoteId = note.id;
  document.getElementById('noteTitle').value = note.id;
  window.notepadQuill.root.innerHTML = note.content;
  document.getElementById('notepadResult').querySelector('.result').textContent = `Loaded '${note.id}'.`;
  
  // Update UI active state
  document.querySelectorAll('.note-item').forEach(el => {
    el.classList.toggle('active', el.textContent === note.id);
  });
}

async function saveNote(id) {
  try {
    const content = window.notepadQuill.root.innerHTML;
    const res = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, content })
    });
    if(!res.ok) throw new Error("API Error");
    document.getElementById('notepadResult').querySelector('.result').textContent = `Saved '${id}' at ` + new Date().toLocaleTimeString();
    loadNotesList(); // Refresh list to catch new items
  } catch(err) {
    document.getElementById('notepadResult').querySelector('.result').textContent = 'Failed to save: ' + err.message;
  }
}

async function deleteNote(id) {
  if(!confirm(`Delete note '${id}'?`)) return;
  try {
    await fetch(`/api/notes/${encodeURIComponent(id)}`, { method: 'DELETE' });
    document.getElementById('notepadResult').querySelector('.result').textContent = 'Note deleted.';
    window.currentNoteId = null;
    window.notepadQuill.root.innerHTML = '';
    document.getElementById('noteTitle').value = '';
    loadNotesList();
  } catch(err) {
    document.getElementById('notepadResult').querySelector('.result').textContent = 'Delete failed: ' + err.message;
  }
}

/* --- History Drawer Implementation --- */

window.toggleHistoryDrawer = function() {
  const drawer = document.getElementById('history-drawer');
  drawer.classList.toggle('hidden-drawer');
};

window.currentHistoryRecords = [];

window.renderHistoryDrawer = function(records, term = '') {
  const list = document.getElementById('historyList');
  list.innerHTML = '';
  
  const filtered = records.filter(rec => {
    if(!term) return true;
    return rec.payload.toLowerCase().includes(term.toLowerCase());
  });

  if(filtered.length === 0) {
    list.innerHTML = '<div style="color:var(--text-muted);">No history matches found.</div>';
    return;
  }

  filtered.forEach(rec => {
    let payload;
    try { payload = JSON.parse(rec.payload); } catch(e) { payload = rec.payload; }
    
    const card = document.createElement('div');
    card.className = 'history-card';
    card.style.marginBottom = '0.5rem';
    
    const time = new Date(rec.created_at).toLocaleString();
    let snippet = JSON.stringify(payload).substring(0, 150) + '...';

    card.innerHTML = `
      <div class="history-card-time">${time}</div>
      <div class="history-card-preview" style="white-space:normal; font-size:0.8rem; line-height:1.4;">${snippet}</div>
    `;
    
    card.onclick = () => {
      restoreToolState(window.currentToolId, payload);
      toggleHistoryDrawer();
    };
    
    list.appendChild(card);
  });
};

window.openHistoryDrawer = async function(toolId) {
  const drawer = document.getElementById('history-drawer');
  drawer.classList.remove('hidden-drawer');
  const list = document.getElementById('historyList');
  list.innerHTML = '<div style="color:var(--text-muted);">Loading history...</div>';
  document.getElementById('historySearch').value = '';

  try {
    const res = await fetch('/api/history?tool=' + encodeURIComponent(toolId));
    if(!res.ok) throw new Error("API Error");
    window.currentHistoryRecords = await res.json();
    window.renderHistoryDrawer(window.currentHistoryRecords, '');
  } catch(err) {
    list.innerHTML = `<div style="color:#f87171;">Failed to load history: ${err.message}</div>`;
  }
};

document.getElementById('historySearch')?.addEventListener('input', (e) => {
  window.renderHistoryDrawer(window.currentHistoryRecords || [], e.target.value);
});

async function saveToolStateToHistory(tile) {
  const inputs = tile.querySelectorAll('input, select, textarea');
  const payload = {};
  
  inputs.forEach(inp => {
    if(!inp.id || inp.type === 'file') return;
    if(window.cmEditors && window.cmEditors[inp.id]) {
      payload[inp.id] = window.cmEditors[inp.id].getValue();
    } else if (inp.type === 'checkbox') {
      payload[inp.id] = inp.checked;
    } else {
      payload[inp.id] = inp.value;
    }
  });

  // Also capture the result text if available
  const resultDiv = tile.querySelector('.output .result');
  if (resultDiv && resultDiv.textContent.trim()) {
    payload['__output_result'] = resultDiv.textContent;
  }

  // Don't save empty payloads
  if(Object.keys(payload).length < 1) return;

  try {
    await fetch('/api/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ toolId: tile.id, payload })
    });
  } catch(err) {
    console.error("Failed to save history", err);
  }
}

function restoreToolState(toolId, payload) {
  const tile = document.getElementById(toolId);
  if(!tile) return;

  for(const [key, val] of Object.entries(payload)) {
    if(key === '__output_result') {
      const res = tile.querySelector('.output .result');
      if(res) res.textContent = val;
      continue;
    }

    if(window.cmEditors && window.cmEditors[key]) {
      window.cmEditors[key].setValue(val);
      continue;
    }

    const el = document.getElementById(key);
    if(el) {
      if(el.type === 'checkbox') el.checked = val;
      else el.value = val;
    }
  }
}