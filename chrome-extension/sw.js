const CACHE_NAME = 'toolbox-cache-v4';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './logo.png',
  './logo.png'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // Network first falling back to cache
  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

/* ====================================================
   🖱️ CONTEXT MENUS – Right-click Utilities
   ==================================================== */
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "nexus-main",
    title: "Nexus-571 Utilities",
    contexts: ["all"]
  });

  chrome.contextMenus.create({
    id: "tile-b64text",
    parentId: "nexus-main",
    title: "Base64 Encode/Decode",
    contexts: ["selection"]
  });

  chrome.contextMenus.create({
    id: "tile-url",
    parentId: "nexus-main",
    title: "URL Encode/Decode",
    contexts: ["selection"]
  });

  chrome.contextMenus.create({
    id: "tile-notepad",
    parentId: "nexus-main",
    title: "Quick Save to Notepad",
    contexts: ["selection"]
  });
  
  chrome.contextMenus.create({
    id: "open-dashboard",
    parentId: "nexus-main",
    title: "Open Full Dashboard",
    contexts: ["all"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  const DASHBOARD_URL = "https://bharath-571-utils.muppanenibharath571.workers.dev/";
  
  if (info.menuItemId === "open-dashboard") {
    chrome.tabs.create({ url: DASHBOARD_URL });
  } else if (info.selectionText) {
    // Open specific tool with selection as hash/query
    const toolUrl = `${DASHBOARD_URL}#${info.menuItemId}`;
    // We'll store the selection in session storage or similar if we want the tool to auto-load it
    // For now, let's just open the tool. 
    // Optimization: we could use chrome.storage.local to pass the "q" param.
    chrome.storage.local.set({ contextSelection: info.selectionText }, () => {
      chrome.tabs.create({ url: toolUrl });
    });
  }
});
