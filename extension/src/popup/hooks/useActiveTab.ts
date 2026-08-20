import { useState, useEffect } from 'react';

export interface ActiveTabInfo {
  url: string;
  title: string;
  favIconUrl?: string;
  isLoading: boolean;
}

export function useActiveTab(): ActiveTabInfo {
  const [tabInfo, setTabInfo] = useState<ActiveTabInfo>({
    url: '',
    title: '',
    isLoading: true,
  });

  useEffect(() => {
    async function fetchActiveTab() {
      if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
        try {
          const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
          if (tab && tab.url) {
            // Filter out chrome internal pages like chrome://extensions
            const isValidUrl = /^https?:\/\//i.test(tab.url);
            setTabInfo({
              url: isValidUrl ? tab.url : '',
              title: tab.title || '',
              favIconUrl: tab.favIconUrl,
              isLoading: false,
            });
            return;
          }
        } catch (e) {
          console.warn('Could not query active tab:', e);
        }
      }

      // Development / preview fallback
      setTabInfo({
        url: window.location.href.startsWith('http') ? window.location.href : 'https://example.com/demo-page',
        title: 'Example Demo Page',
        isLoading: false,
      });
    }

    fetchActiveTab();
  }, []);

  return tabInfo;
}
