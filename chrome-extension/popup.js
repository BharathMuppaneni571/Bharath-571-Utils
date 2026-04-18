// REPLACE THIS URL with your production Cloudflare Worker URL
const API_BASE_URL = 'https://bharath-571-utils.muppanenibharath571.workers.dev'; 

const AUTH_TOKEN_KEY = 'bharath_utils_auth_token';
const AUTH_USER_KEY = 'bharath_utils_username';

// 🛡️ Robust Auth Utility for Popup (Handles Sync with Chrome Storage)
async function getAuthToken() {
  const data = await chrome.storage.local.get([AUTH_TOKEN_KEY]);
  return data[AUTH_TOKEN_KEY];
}

async function authenticatedFetch(url, options = {}) {
  const token = await getAuthToken();
  const headers = options.headers || {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  const absoluteUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
  const response = await fetch(absoluteUrl, { ...options, headers });
  return response;
}

// 🌐 Unified Search Engine for Cloud Data
async function searchCloudData(query) {
  if (!query || query.length < 2) return [];
  try {
    const res = await authenticatedFetch(`/api/search?q=${encodeURIComponent(query)}&mode=insensitive`);
    if (res.ok) return await res.json();
  } catch (err) { console.warn("Cloud Search Error:", err); }
  return [];
}

// ------------- TOOL DEFINITIONS -------------
const TOOLS = [
  { id: 'tile-notepad', name: 'Notepad & Scratchpad', icon: 'edit_note' },
  { id: 'tile-url', name: 'URL Encode / Decode', icon: 'link' },
  { id: 'tile-b64text', name: 'Base64 Text', icon: 'key' },
  { id: 'tile-b64file', name: 'Base64 File', icon: 'attach_file' },
  { id: 'tile-image', name: 'Image ↔ Base64', icon: 'image' },
  { id: 'tile-formatter', name: 'Code Formatter', icon: 'auto_fix_high' },
  { id: 'tile-img2pdf', name: 'Images to PDF', icon: 'picture_as_pdf' },
  { id: 'tile-qr', name: 'QR Code Gen/Scan', icon: 'qr_code_2' },
  { id: 'tile-hash', name: 'Hash Calculator', icon: 'tag' },
  { id: 'tile-minify', name: 'Code Minifier', icon: 'compress' },
  { id: 'tile-pwd', name: 'Password Generator', icon: 'password' },
  { id: 'tile-csvjson', name: 'CSV ↔ JSON', icon: 'sync_alt' },
  { id: 'tile-urlshort', name: 'URL Shortener', icon: 'short_text' },
  { id: 'tile-imgopt', name: 'Image Optimizer', icon: 'photo_size_select_large' },
  { id: 'tile-detect', name: 'File Type Detector', icon: 'description' },
  { id: 'tile-entity', name: 'Unicode ↔ HTML', icon: 'terminal' },
  { id: 'tile-datetime', name: 'Date-Time Formatter', icon: 'schedule' },
  { id: 'tile-mime', name: 'MIME-type Lookup', icon: 'category' },
  { id: 'tile-hex', name: 'Binary ↔ Hex', icon: 'hex' },
  { id: 'tile-colour', name: 'Colour Picker', icon: 'palette' },
  { id: 'tile-strconvert', name: 'Text Case Converter', icon: 'text_fields' },
  { id: 'tile-cropresize', name: 'Crop & Resize', icon: 'crop' },
  { id: 'tile-xmljson', name: 'XML ↔ JSON', icon: 'swap_horiz' },
  { id: 'tile-jsonpath', name: 'JSONPath Extractor', icon: 'troubleshoot' },
  { id: 'tile-handlebar', name: 'Handlebars Tester', icon: 'view_stream' },
  { id: 'tile-restapi', name: 'REST API Client', icon: 'api' },
  { id: 'tile-odata', name: 'OData Query Builder', icon: 'database' },
  { id: 'tile-jwt', name: 'JWT Token Sandbox', icon: 'vpn_key' },
  { id: 'tile-curl', name: 'cURL Converter', icon: 'code' },
  { id: 'tile-cron', name: 'Cron Generator', icon: 'calendar_month' },
  { id: 'tile-markdown', name: 'Markdown Editor', icon: 'edit_document' },
  { id: 'tile-mockdata', name: 'DB Seed Generator', icon: 'table_view' },
  { id: 'tile-imagegen', name: 'AI Image Generator', icon: 'image_search' }
];

// ------------- DOM ELEMENTS -------------
const authView = document.getElementById('auth-view');
const registerView = document.getElementById('register-view');
const toolsView = document.getElementById('tools-view');
const toolListEl = document.getElementById('tool-list');
const toolSearchInput = document.getElementById('tool-search');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const registerToggleBtn = document.getElementById('register-toggle-btn');
const loginToggleBtn = document.getElementById('login-toggle-btn');
const logoutBtn = document.getElementById('logout-btn');
const statusEl = document.getElementById('status-message');
const backBtn = document.getElementById('back-btn');
const headerTitle = document.getElementById('header-title');
const runnerView = document.getElementById('runner-view');
const runnerContent = document.getElementById('runner-content');
const historyPanel = document.getElementById('history-panel');
const historyItemsEl = document.getElementById('history-items');

let currentToolId = null;

// List of tools enabled for In-Popup execution
const INLINE_TOOLS = ['tile-notepad', 'tile-url', 'tile-pwd', 'tile-b64text', 'tile-strconvert'];

// ------------- AUTH LOGIC -------------
async function checkAuth() {
  const data = await chrome.storage.local.get([AUTH_TOKEN_KEY]);
  let token = data[AUTH_TOKEN_KEY];

  // If no local token, try syncing from Website Cookie
  if (!token) {
    try {
      const cookie = await chrome.cookies.get({
        url: 'https://bharath-571-utils.muppanenibharath571.workers.dev',
        name: 'bharath_utils_auth_token'
      });
      if (cookie && cookie.value) {
        token = cookie.value;
        // Save to local storage for future use
        await chrome.storage.local.set({ [AUTH_TOKEN_KEY]: token });
        // Optionally fetch username if needed, or just proceed
      }
    } catch (e) {
      console.log('Cookie sync failed or not permitted:', e);
    }
  }

  if (token) {
    showView('tools');
    renderTools();
  } else {
    showView('auth');
  }
}

async function handleAuth(type) {
  const user = document.getElementById(type === 'login' ? 'username' : 'reg-username').value;
  const pass = document.getElementById(type === 'login' ? 'password' : 'reg-password').value;

  if (type === 'register') {
    const confirm = document.getElementById('reg-confirm').value;
    if (pass !== confirm) return showToast('Passwords do not match');
  }

  if (!user || !pass) return showToast('Enter username and password');

  const endpoint = type === 'login' ? '/api/auth/login' : '/api/auth/register';

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: user, password: pass })
    });
    
    const data = await res.json();
    if (res.ok) {
      await chrome.storage.local.set({
        [AUTH_TOKEN_KEY]: data.token,
        [AUTH_USER_KEY]: data.username
      });

      // Explicitly sync to Website Cookie for bi-directional SSO
      try {
        await chrome.cookies.set({
          url: 'https://bharath-571-utils.muppanenibharath571.workers.dev',
          name: 'bharath_utils_auth_token',
          value: data.token,
          path: '/',
          httpOnly: true,
          secure: true,
          sameSite: 'lax',
          expirationDate: (Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60)
        });
      } catch (e) { console.log('Manual cookie sync failed:', e); }

      showToast(type === 'login' ? 'Logged in successfully!' : 'Account created successfully!');
      checkAuth();
    } else {
      showToast(data.error || 'Authentication failed');
    }
  } catch (err) {
    showToast('Connection error. Check API URL.');
    console.error(err);
  }
}

async function handleLogout() {
  await chrome.storage.local.remove([AUTH_TOKEN_KEY, AUTH_USER_KEY]);
  try {
    await chrome.cookies.remove({
      url: 'https://bharath-571-utils.muppanenibharath571.workers.dev',
      name: 'bharath_utils_auth_token'
    });
  } catch (e) { console.log('Cookie clear failed:', e); }
  checkAuth();
}

// ------------- UI LOGIC -------------
function showView(view) {
  authView.classList.add('hidden');
  registerView.classList.add('hidden');
  toolsView.classList.add('hidden');
  logoutBtn.classList.add('hidden');

  if (view === 'auth') {
    authView.classList.remove('hidden');
    headerTitle.textContent = 'BH571 quick units';
    backBtn.classList.add('hidden');
  } else if (view === 'register') {
    registerView.classList.remove('hidden');
    headerTitle.textContent = 'Join BH571';
    backBtn.classList.remove('hidden');
  } else if (view === 'runner') {
    runnerView.classList.remove('hidden');
    backBtn.classList.remove('hidden');
  } else {
    toolsView.classList.remove('hidden');
    logoutBtn.classList.remove('hidden');
    headerTitle.textContent = 'BH571 quick units';
    backBtn.classList.add('hidden');
  }
}

async function renderTools(filter = '', cloudData = []) {
  toolListEl.innerHTML = '';
  
  // 1. Filter Local Tools
  const localFiltered = TOOLS.filter(t => t.name.toLowerCase().includes(filter.toLowerCase()));
  
  // 2. Combine results (Local first, then Cloud)
  const allResults = [
    ...localFiltered.map(t => ({ id: t.id, name: t.name, icon: t.icon, type: 'tool' })),
    ...cloudData.map(c => ({ id: c.id, name: c.title || c.type, icon: 'cloud', type: c.type, payload: c.payload }))
  ];

  if (allResults.length === 0 && filter) {
    toolListEl.innerHTML = '<p class="status-info">No tools or saved data found.</p>';
    return;
  }

  allResults.forEach(item => {
    const div = document.createElement('div');
    div.className = `tool-item ${item.type !== 'tool' ? 'cloud-item' : ''}`;
    
    let iconName = item.icon;
    if (item.type === 'note') iconName = 'description';
    else if (item.type === 'history') iconName = 'history';

    div.innerHTML = `
      <span class="material-symbols-outlined tool-icon">${iconName}</span>
      <div class="tool-info">
        <span class="tool-name">${item.name}</span>
        ${item.type !== 'tool' ? `<span class="tool-type-tag">${item.type}</span>` : ''}
      </div>
    `;

    div.onclick = () => {
      if (item.type === 'tool') {
        if (INLINE_TOOLS.includes(item.id)) runToolInline(item);
        else chrome.tabs.create({ url: `https://bharath-571-utils.muppanenibharath571.workers.dev/` });
      } else if (item.type === 'note') {
        runToolInline(TOOLS.find(t => t.id === 'tile-notepad'));
        setTimeout(() => { 
          // Inject Note logic will handle loading by currentNoteId
          window.currentNoteId = item.id;
        }, 50);
      } else if (item.type === 'history' && item.payload) {
          // Open the specific tool on the website for history restoration
          chrome.tabs.create({ url: `https://bharath-571-utils.muppanenibharath571.workers.dev/` });
      }
    };
    toolListEl.appendChild(div);
  });
}

async function runToolInline(tool) {
  currentToolId = tool.id;
  showView('runner');
  headerTitle.textContent = tool.name;
  historyPanel.classList.add('hidden'); // Close history on tool change
  runnerContent.innerHTML = '<p class="loading">Loading tool...</p>';
  
  switch(tool.id) {
    case 'tile-url': initUrlTool(); break;
    case 'tile-pwd': initPwdTool(); break;
    case 'tile-b64text': initBase64Tool(); break;
    case 'tile-strconvert': initCaseTool(); break;
    case 'tile-notepad': initNotepadTool(); break;
    default: runnerContent.innerHTML = '<p>Tool UI under development...</p>';
  }
}

// ------------- TOOL IMPLEMENTATIONS -------------

function initUrlTool() {
  runnerContent.innerHTML = `
    <div class="runner-field">
      <label class="runner-label">Input Text</label>
      <textarea id="url-input" class="runner-textarea" placeholder="Paste text here..."></textarea>
    </div>
    <div class="runner-actions">
      <button id="btn-encode" class="primary-btn btn-small">Encode</button>
      <button id="btn-decode" class="secondary-btn btn-small">Decode</button>
    </div>
    <div class="runner-field">
      <label class="runner-label">Result</label>
      <div id="url-result" class="runner-result">Result will appear here...</div>
    </div>
  `;
  const input = document.getElementById('url-input');
  const res = document.getElementById('url-result');
  document.getElementById('btn-encode').onclick = () => {
    res.textContent = encodeURIComponent(input.value);
    showToast('Encoded!');
  };
  document.getElementById('btn-decode').onclick = () => {
    try { res.textContent = decodeURIComponent(input.value); showToast('Decoded!'); }
    catch(e) { res.textContent = 'Error: Invalid sequence'; }
  };
}

function initPwdTool() {
  runnerContent.innerHTML = `
    <div class="runner-field">
      <label class="runner-label">Length</label>
      <input type="number" id="pwd-len" value="16" min="4" max="64" style="width:60px; background:var(--card-bg); border:1px solid var(--border); color:white; padding:4px; border-radius:4px;">
    </div>
    <button id="btn-gen-pwd" class="primary-btn">Generate Password</button>
    <div class="runner-field">
      <label class="runner-label">Generated Password</label>
      <div id="pwd-result" class="runner-result">Click generate...</div>
    </div>
  `;
  const lenEl = document.getElementById('pwd-len');
  const res = document.getElementById('pwd-result');
  document.getElementById('btn-gen-pwd').onclick = () => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
    let retVal = "";
    for (let i = 0; i < parseInt(lenEl.value); ++i) {
      retVal += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    res.textContent = retVal;
    showToast('Password Generated!');
  };
}

async function initNotepadTool() {
  runnerContent.innerHTML = `
    <div class="runner-field">
      <label class="runner-label">Cloud Notepad (Autosave)</label>
      <textarea id="note-area" class="runner-textarea notepad-area" placeholder="Start typing..."></textarea>
    </div>
    <div id="note-status" style="font-size:0.7rem; color:var(--accent); margin-top:-0.5rem;">Syncing...</div>
  `;
  
  const area = document.getElementById('note-area');
  const status = document.getElementById('note-status');

  // Fetch note (specific ID if requested via search, otherwise latest)
  try {
    const url = window.currentNoteId ? `/api/notes/${window.currentNoteId}` : `/api/notes`;
    const response = await authenticatedFetch(url);
    const data = await response.json();
    
    // API returns array for list, object for single. Handle both.
    const note = Array.isArray(data) ? data[0] : data;
    
    if (note && note.content !== undefined) {
      area.value = note.content;
      window.currentNoteId = note.id; 
      status.textContent = 'Synced with Cloud';
    } else {
      status.textContent = 'New Note';
    }
  } catch(e) { status.textContent = 'Offline Mode'; }

  // Autosave logic
  let timeout;
  area.oninput = () => {
    status.textContent = 'Saving...';
    clearTimeout(timeout);
    timeout = setTimeout(async () => {
      try {
        await authenticatedFetch(`/api/notes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            id: window.currentNoteId || 'ExtensionNote', 
            content: area.value, 
            tags: 'extension' 
          })
        });
        status.textContent = 'Saved to Cloud';
      } catch(e) { status.textContent = 'Save Failed (offline)'; }
    }, 1000);
  };
}

function initBase64Tool() {
  runnerContent.innerHTML = `
    <textarea id="b64-input" class="runner-textarea" placeholder="Input..."></textarea>
    <div class="runner-actions">
      <button id="btn-b64-enc" class="primary-btn btn-small">Encode</button>
      <button id="btn-b64-dec" class="secondary-btn btn-small">Decode</button>
    </div>
    <div id="b64-res" class="runner-result">Result...</div>
  `;
  const inp = document.getElementById('b64-input');
  const res = document.getElementById('b64-res');
  document.getElementById('btn-b64-enc').onclick = () => { res.textContent = btoa(inp.value); };
  document.getElementById('btn-b64-dec').onclick = () => { try { res.textContent = atob(inp.value); } catch(e){ res.textContent='Invalid Base64';} };
}

function initCaseTool() {
  runnerContent.innerHTML = `
    <textarea id="case-input" class="runner-textarea" placeholder="Text..."></textarea>
    <div class="runner-actions" style="flex-wrap:wrap;">
      <button id="btn-upper" class="secondary-btn btn-small">UPPER</button>
      <button id="btn-lower" class="secondary-btn btn-small">lower</button>
    </div>
    <div id="case-res" class="runner-result">...</div>
  `;
  const inp = document.getElementById('case-input');
  const res = document.getElementById('case-res');
  document.getElementById('btn-upper').onclick = () => { res.textContent = inp.value.toUpperCase(); saveResult(res.textContent); };
  document.getElementById('btn-lower').onclick = () => { res.textContent = inp.value.toLowerCase(); saveResult(res.textContent); };
}

// ------------- UTILITIES -------------

async function saveResult(val) {
  if (!val || val === '...' || val.includes('Error')) return;
  const key = `hist_${currentToolId}`;
  const data = await chrome.storage.local.get([key]);
  let list = data[key] || [];
  
  // Add new, remove duplicates, keep last 5
  list = [val, ...list.filter(x => x !== val)].slice(0, 5);
  await chrome.storage.local.set({ [key]: list });
}

async function toggleHistory() {
  if (!currentToolId) return;
  if (!historyPanel.classList.contains('hidden')) {
    historyPanel.classList.add('hidden');
    return;
  }
  
  const key = `hist_${currentToolId}`;
  const data = await chrome.storage.local.get([key]);
  const list = data[key] || [];
  
  historyItemsEl.innerHTML = list.length ? '' : '<p style="font-size:0.7rem; padding:0.5rem; color:var(--text-muted);">No recent results</p>';
  list.forEach(item => {
    const div = document.createElement('div');
    div.className = 'history-item';
    div.textContent = item;
    div.onclick = () => {
      // Find the result area of the active tool and paste it
      const resArea = runnerContent.querySelector('.runner-result') || runnerContent.querySelector('textarea');
      if (resArea) {
        if (resArea.tagName === 'TEXTAREA') resArea.value = item;
        else resArea.textContent = item;
        showToast('Restored from history');
      }
    };
    historyItemsEl.appendChild(div);
  });
  
  historyPanel.classList.remove('hidden');
}

async function copyResult() {
  const resArea = runnerContent.querySelector('.runner-result') || runnerContent.querySelector('textarea');
  if (!resArea) return;
  const text = (resArea.tagName === 'TEXTAREA' ? resArea.value : resArea.textContent);
  if (!text || text === '...') return;
  
  try {
    await navigator.clipboard.writeText(text);
    showToast('Copied to clipboard!');
  } catch (e) {
    showToast('Copy failed');
  }
}

async function clearHistory() {
  if (!currentToolId) return;
  await chrome.storage.local.remove([`hist_${currentToolId}`]);
  historyPanel.classList.add('hidden');
  showToast('History cleared');
}

function showToast(msg) {
  statusEl.textContent = msg;
  statusEl.classList.remove('hidden');
  setTimeout(() => statusEl.classList.add('hidden'), 3000);
}

// ------------- EVENT LISTENERS -------------
loginBtn.addEventListener('click', () => handleAuth('login'));
registerBtn.addEventListener('click', () => handleAuth('register'));
registerToggleBtn.addEventListener('click', () => showView('register'));
loginToggleBtn.addEventListener('click', () => showView('auth'));
backBtn.addEventListener('click', () => {
  currentToolId = null;
  showView('tools');
});
logoutBtn.addEventListener('click', handleLogout);
let searchTimeout = null;
toolSearchInput.addEventListener('input', (e) => {
  const term = e.target.value.trim();
  
  // Instant local filtering
  renderTools(term);

  // Debounced cloud search
  clearTimeout(searchTimeout);
  if (term.length >= 2) {
    searchTimeout = setTimeout(async () => {
      const cloudData = await searchCloudData(term);
      renderTools(term, cloudData);
    }, 400);
  }
});

document.getElementById('btn-copy-result').onclick = copyResult;
document.getElementById('btn-show-history').onclick = toggleHistory;
document.getElementById('btn-clear-history').onclick = clearHistory;

// Update tool implementions to call saveResult
const originalInitUrl = initUrlTool;
initUrlTool = () => {
  originalInitUrl();
  const res = document.getElementById('url-result');
  const oldEnc = document.getElementById('btn-encode').onclick;
  const oldDec = document.getElementById('btn-decode').onclick;
  document.getElementById('btn-encode').onclick = () => { oldEnc(); saveResult(res.textContent); };
  document.getElementById('btn-decode').onclick = () => { oldDec(); saveResult(res.textContent); };
};

const originalInitPwd = initPwdTool;
initPwdTool = () => {
  originalInitPwd();
  const res = document.getElementById('pwd-result');
  const oldGen = document.getElementById('btn-gen-pwd').onclick;
  document.getElementById('btn-gen-pwd').onclick = () => { oldGen(); saveResult(res.textContent); };
};

const originalInitB64 = initBase64Tool;
initBase64Tool = () => {
  originalInitB64();
  const res = document.getElementById('b64-res');
  const oldEnc = document.getElementById('btn-b64-enc').onclick;
  const oldDec = document.getElementById('btn-b64-dec').onclick;
  document.getElementById('btn-b64-enc').onclick = () => { oldEnc(); saveResult(res.textContent); };
  document.getElementById('btn-b64-dec').onclick = () => { oldDec(); saveResult(res.textContent); };
};

// Init
checkAuth();
