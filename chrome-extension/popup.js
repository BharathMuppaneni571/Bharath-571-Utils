// ------------- CONFIGURATION -------------
// REPLACE THIS URL with your production Cloudflare Worker URL
const API_BASE_URL = 'https://bharath-571-utils.sony.workers.dev'; 

const AUTH_TOKEN_KEY = 'bharath_utils_auth_token';
const AUTH_USER_KEY = 'bharath_utils_username';

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

// ------------- AUTH LOGIC -------------
async function checkAuth() {
  const data = await chrome.storage.local.get([AUTH_TOKEN_KEY]);
  if (data[AUTH_TOKEN_KEY]) {
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
  } else if (view === 'register') {
    registerView.classList.remove('hidden');
  } else {
    toolsView.classList.remove('hidden');
    logoutBtn.classList.remove('hidden');
  }
}

function renderTools(filter = '') {
  toolListEl.innerHTML = '';
  const filtered = TOOLS.filter(t => t.name.toLowerCase().includes(filter.toLowerCase()));
  
  filtered.forEach(tool => {
    const div = document.createElement('div');
    div.className = 'tool-item';
    div.innerHTML = `
      <span class="material-symbols-outlined tool-icon">${tool.icon}</span>
      <span class="tool-name">${tool.name}</span>
    `;
    div.onclick = () => {
      chrome.tabs.create({ url: `index.html#${tool.id}` });
    };
    toolListEl.appendChild(div);
  });
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
logoutBtn.addEventListener('click', handleLogout);
toolSearchInput.addEventListener('input', (e) => renderTools(e.target.value));

// Init
checkAuth();
