const API_BASE_URL = 'https://bharath-571-utils.muppanenibharath571.workers.dev';
const AUTH_TOKEN_KEY = 'bharath_utils_auth_token';

// Universal storage wrapper (Chrome Extension + Web)
export const Storage = {
  async get(key: string): Promise<string | null> {
    try {
      // @ts-ignore
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        return new Promise((resolve) => {
          // @ts-ignore
          chrome.storage.local.get([key], (result) => {
            const val = result[key] || localStorage.getItem(key) || null;
            console.log(`Storage Get [${key}]:`, val ? 'Found' : 'Null');
            resolve(val);
          });
        });
      }
    } catch (e) {
      console.error('Storage Get Error:', e);
    }
    return localStorage.getItem(key) || null;
  },

  async set(key: string, value: string): Promise<void> {
    try {
      localStorage.setItem(key, value);
      // @ts-ignore
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        // @ts-ignore
        await chrome.storage.local.set({ [key]: value });
        console.log(`Storage Set [${key}] saved to Chrome Storage`);
      }
    } catch (e) {
      console.error('Storage Set Error:', e);
    }
  },

  async remove(key: string): Promise<void> {
    try {
      localStorage.removeItem(key);
      // @ts-ignore
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        // @ts-ignore
        await chrome.storage.local.remove([key]);
      }
    } catch (e) {
      console.error('Storage Remove Error:', e);
    }
  }
};

export const getAuthToken = () => Storage.get(AUTH_TOKEN_KEY);

export async function authenticatedFetch(url: string, options: RequestInit = {}) {
  const token = await getAuthToken();
  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  const absoluteUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
  
  try {
    console.log(`Nexus Fetch: ${absoluteUrl}`);
    const response = await fetch(absoluteUrl, { ...options, headers });
    
    if (response.status === 401 && token) {
      window.dispatchEvent(new Event('nexus-unauthorized'));
    }
    
    return response;
  } catch (err: any) {
    console.error('Nexus Fetch Error:', err.message || err);
    // Alert the user in extension if network fails
    if (window.location.protocol === 'chrome-extension:') {
       console.log('Ensure host_permissions are set and worker is reachable.');
    }
    throw err;
  }
}
