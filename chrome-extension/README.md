# BH571 Quick Units — Chrome Extension

**BH571 Quick Units** is a high-performance, professional utility dashboard packed into a Google Chrome extension. It provides instant access to over 30+ developer and productivity tools directly from your browser toolbar.

---

## 🚀 Getting Started

### 1. Installation (Manual/Developer Mode)
Since this extension is optimized for your private backend, you can install it manually:
1. Open Chrome and navigate to `chrome://extensions`.
2. Enable **Developer mode** using the toggle in the top-right corner.
3. Click the **Load unpacked** button.
4. Select the `chrome-extension` folder from your local project directory.
5. The **BH571 Quick Units** icon will now appear in your extensions list. Pin it for quick access!

### 2. Configuration
The extension is pre-configured to communicate with your Cloudflare Worker backend.
- **Backend URL**: `https://bharath-571-utils.muppanenibharath571.workers.dev`
- **Session Sync**: Logging into the extension popup automatically logs you into the main dashboard tab.

---

## 🛠 Features

- **Popup Authentication**: Secure login/register flow directly in the extension menu.
- **Global Search**: Instantly find any tool (Notepad, JSONPath, JWT Sandbox, etc.) by name.
- **Deep Linking**: Clicking a tool in the popup opens the full dashboard in a new tab, scrolled exactly to that tool.
- **Persistent State**: Your theme settings, pinned tools, and recent history are synced across the extension using `chrome.storage`.
- **Premium UI**: Dark-mode glassmorphic design featuring Material Symbols and smooth animations.

---

## 📦 Publishing to the Chrome Web Store

To upload this extension to the official store:
1. **Compress**: Select all files inside the `chrome-extension` folder and compress them into a `.zip` file.
2. **Developer Dashboard**: Log in to the [Chrome Web Store Developer Console](https://chrome.google.com/webstore/devconsole).
3. **Upload**: Click "New Item" and upload your `.zip` package.
4. **Icons**: ensure you provide the required promotional tiles and a 128x128 PNG icon for the store listing.

---

## ⚖️ Legal & Licensing

This extension is built entirely using **Open Source** and **Permissive** libraries. There are no proprietary or licensed software requirements for the frontend.

| Library | License | Primary Use |
| :--- | :--- | :--- |
| **Material Symbols** | Apache 2.0 | Iconography |
| **CodeMirror** | MIT | Syntax Highlighted Editors |
| **Quill** | BSD 3-Clause | Rich Text Notepad |
| **js-beautify** | MIT | Code Formatting |
| **Handlebars.js** | MIT | Template Binding |
| **Marked.js** | MIT | Markdown Rendering |
| **jsPDF / jszip** | MIT | Document & Archive Gen |
| **x2js / PapaParse** | MIT/Apache 2.0 | Data Conversion (XML/CSV) |

**Trademarks & Copyright:**
- **Themes**: This extension includes visual themes titled "Naruto", "Pokémon", and "Rick & Morty". These are for personal/thematic customization. 
- **Publishing Note**: If you plan to publish this extension to the **Global Chrome Web Store for public use**, you should consider renaming these themes to more generic terms (e.g., "Ninja Mode", "Monster Mode") to avoid potential trademark disputes with the respective rights holders.

**Notes on External APIs:**
- **Pollinations.ai / Robohash / Picsum**: These are free, public APIs used for image generation and placeholders.
- **User Assets**: All branding (logos/photos) provided by the user are assumed to be owned by the user.

---

## 📂 Project Structure

- `manifest.json`: Extension configuration (Manifest V3).
- `popup.html/.css/.js`: The extension's entrance menu logic.
- `index.html`: The main dashboard (SPA).
- `script.js`: The core engine (migrated to `chrome.storage.local`).
- `style.css`: Premium design system tokens.
