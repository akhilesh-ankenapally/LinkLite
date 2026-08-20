/**
 * LinkLite Content Script
 * Runs in the context of web pages to assist with URL detection and contextual actions.
 */

(() => {
  // Listen for requests from extension popup or background worker
  chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    if (request.type === 'GET_PAGE_DETAILS') {
      sendResponse({
        url: window.location.href,
        title: document.title,
      });
    }
  });
})();
