/**
 * LinkLite Background Service Worker (Manifest V3)
 */

chrome.runtime.onInstalled.addListener(() => {
  console.log('[LinkLite] Extension installed successfully.');

  // Create context menu for quick link shortening
  if (chrome.contextMenus) {
    chrome.contextMenus.create({
      id: 'linklite-shorten-link',
      title: 'Shorten link with LinkLite',
      contexts: ['link', 'page'],
    });
  }
});

// Handle context menu clicks
if (chrome.contextMenus) {
  chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === 'linklite-shorten-link') {
      const targetUrl = info.linkUrl || info.pageUrl || tab?.url;
      if (targetUrl) {
        // Open popup or notify
        console.log('[LinkLite] Request to shorten:', targetUrl);
      }
    }
  });
}

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'GET_ACTIVE_TAB_URL') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0 && tabs[0].url) {
        sendResponse({ url: tabs[0].url, title: tabs[0].title || '' });
      } else {
        sendResponse({ url: '', title: '' });
      }
    });
    return true; // Keep message channel open for async response
  }

  if (message.type === 'PING') {
    sendResponse({ status: 'pong', timestamp: Date.now() });
  }
});
