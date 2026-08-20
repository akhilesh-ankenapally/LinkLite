# LinkLite — Chrome Web Store Publishing Guide

This guide details the exact steps required to package, test, and submit LinkLite to the Google Chrome Web Store.

---

## 1. Preparing the Production Extension Package

### Step 1: Build the Extension
From the `c:\LinkLite\extension` directory, run:
```bash
npm run build
```
This will compile all TypeScript code, bundle React components, generate Tailwind CSS styles, and output a clean `dist/` folder containing:
```
dist/
├── manifest.json
├── background.js
├── content.js
├── icons/
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
├── src/popup/
│   └── index.html
└── assets/
    ├── popup-[hash].js
    └── globals-[hash].css
```

### Step 2: Create the Distribution ZIP
Compress the contents of `dist/` (not the `dist` folder itself, but its root contents) into `linklite-v1.0.0.zip`.

---

## 2. Chrome Web Store Submission Checklist

### Step 1: Chrome Developer Dashboard Account
1. Visit the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole).
2. Pay the one-time $5 registration fee if setting up a new developer account.

### Step 2: Upload Package
1. Click **Add new item**.
2. Drag and drop `linklite-v1.0.0.zip`.

### Step 3: Store Listing Assets

| Asset Type | Specifications | Purpose |
|---|---|---|
| **Store Icon** | 128x128 PNG (32-bit with alpha) | Appears on store cards |
| **Small Promo Tile** | 440x280 PNG or JPEG | Store category browsing |
| **Marquee Promo Tile** | 1400x560 PNG or JPEG | Featured banners |
| **Screenshots** | 1280x800 or 640x400 PNG (At least 1 required, max 5) | Feature demonstration |

### Step 4: Privacy & Single Purpose Disclosure
Google requires clear declarations for Manifest V3 permissions:

- **Single Purpose Description**:
  > *"LinkLite allows users to instantly shorten URLs, generate QR codes, and view click analytics for the current active tab."*
- **Permissions Justification**:
  - `activeTab`: Used strictly to detect the URL of the active webpage when the user clicks the extension popup.
  - `storage`: Used to cache recent shortened links and user preferences locally.
  - `clipboardWrite`: Used to automatically copy the generated short URL or QR code image upon user request.
  - `tabs`: Used to query tab title and URL during active user interaction.
- **Host Permissions (`http://*/*`, `https://*/*`)**:
  > *"Required to communicate with the LinkLite SaaS backend API to generate short links and retrieve analytics."*
- **Privacy Policy**: Host a privacy policy (e.g. at `https://linklite.app/privacy`) stating that LinkLite does not collect or sell personal browsing history.
