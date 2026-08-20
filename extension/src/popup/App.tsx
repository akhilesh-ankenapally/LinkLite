import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Tabs } from './components/Tabs';
import { ShortenCard } from './components/ShortenCard';
import { RecentLinkCard } from './components/RecentLinkCard';
import { AnalyticsCard } from './components/AnalyticsCard';
import { QRCodeCard } from './components/QRCodeCard';
import { Modal } from './components/Modal';
import { Toast, ToastMessage } from './components/Toast';
import { Input } from './components/Input';
import { Button } from './components/Button';
import { Card } from './components/Card';
import { LoadingSpinner } from './components/LoadingSpinner';
import { useRecentLinks } from './hooks/useRecentLinks';
import { StorageService } from './services/storage';
import { api } from './services/api';
import { ActiveTab, ShortUrlRecord } from './types';
import { Search, Server, Check, ArrowRight, ShieldCheck } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('shorten');
  const [searchTerm, setSearchTerm] = useState('');
  const [qrModalUrl, setQrModalUrl] = useState<string | null>(null);
  const [analyticsUrlId, setAnalyticsUrlId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Settings State
  const [apiUrl, setApiUrl] = useState('https://linklite-production-c01c.up.railway.app');
  const [isTestingServer, setIsTestingServer] = useState(false);
  const [serverStatus, setServerStatus] = useState<'idle' | 'connected' | 'error'>('idle');

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const { links, isLoading: isLinksLoading, deleteLink } = useRecentLinks(searchTerm);

  useEffect(() => {
    async function loadSettings() {
      const settings = await StorageService.getSettings();
      if (settings.apiUrl) {
        setApiUrl(settings.apiUrl);
      }
    }
    loadSettings();
  }, []);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2800);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSaveSettings = async () => {
    const trimmed = apiUrl.trim().replace(/\/+$/, '');
    await StorageService.saveSettings({ apiUrl: trimmed });
    setApiUrl(trimmed);
    showToast('Settings saved successfully', 'success');
    setIsSettingsOpen(false);
  };

  const handleTestConnection = async () => {
    setIsTestingServer(true);
    setServerStatus('idle');
    try {
      // Save current apiUrl temporarily
      await StorageService.saveSettings({ apiUrl: apiUrl.trim() });
      const res = await api.checkHealth();
      if (res.status === 'healthy') {
        setServerStatus('connected');
        showToast('Server connected & database active', 'success');
      } else {
        setServerStatus('error');
        showToast('Server responded with warning', 'error');
      }
    } catch {
      setServerStatus('error');
      showToast('Could not reach backend at this URL', 'error');
    } finally {
      setIsTestingServer(false);
    }
  };

  const handleLinkCreated = (_record: ShortUrlRecord) => {
    // If on shorten tab, keep display, optionally switch or keep user informed
  };

  const handleViewAnalytics = (id: string) => {
    setAnalyticsUrlId(id);
    setActiveTab('analytics');
  };

  return (
    <div className="w-[420px] h-[600px] bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text flex flex-col overflow-hidden relative select-none">
      {/* Header */}
      <Header onOpenSettings={() => setIsSettingsOpen(true)} />

      {/* Tabs Switcher */}
      <Tabs
        activeTab={activeTab}
        onChange={(tab) => {
          setActiveTab(tab);
          if (tab !== 'analytics') {
            setAnalyticsUrlId(null);
          }
        }}
        recentCount={links.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-3.5 overflow-y-auto overflow-x-hidden">
        {/* TAB 1: Shorten */}
        {activeTab === 'shorten' && (
          <ShortenCard
            onOpenQrModal={(url) => setQrModalUrl(url)}
            onLinkCreated={handleLinkCreated}
            showToast={showToast}
          />
        )}

        {/* TAB 2: Recent Links */}
        {activeTab === 'recent' && (
          <div className="flex flex-col gap-3">
            <Input
              placeholder="Search links by URL or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-3.5 h-3.5" />}
            />

            {isLinksLoading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2">
                <LoadingSpinner size="md" />
                <span className="text-xs text-light-muted dark:text-dark-muted">
                  Loading history...
                </span>
              </div>
            ) : links.length === 0 ? (
              <Card variant="outline" padding="lg" className="text-center py-10 flex flex-col items-center gap-2">
                <p className="text-xs font-medium text-light-muted dark:text-dark-muted">
                  {searchTerm ? 'No links matching search' : 'No links shortened yet'}
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setActiveTab('shorten')}
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Create your first link
                </Button>
              </Card>
            ) : (
              <div className="flex flex-col gap-2">
                {links.map((item) => (
                  <RecentLinkCard
                    key={item.id}
                    item={item}
                    onOpenQr={(url) => setQrModalUrl(url)}
                    onViewAnalytics={handleViewAnalytics}
                    onDelete={(id) => {
                      deleteLink(id);
                      showToast('Link removed from history', 'info');
                    }}
                    showToast={showToast}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Analytics */}
        {activeTab === 'analytics' && (
          <div className="flex flex-col gap-3">
            {analyticsUrlId ? (
              <AnalyticsCard
                urlId={analyticsUrlId}
                onBack={() => setAnalyticsUrlId(null)}
              />
            ) : links.length > 0 ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-light-text dark:text-dark-text">
                    Select a Link for Analytics
                  </span>
                  <span className="text-[11px] text-light-muted dark:text-dark-muted">
                    {links.length} total links
                  </span>
                </div>

                <div className="flex flex-col gap-2 max-h-[460px] overflow-y-auto pr-0.5">
                  {links.map((link) => (
                    <button
                      key={link.id}
                      onClick={() => setAnalyticsUrlId(link.id)}
                      className="p-2.5 bg-light-bg dark:bg-dark-card border border-light-border dark:border-dark-border hover:border-light-accent dark:hover:border-dark-accent rounded-xl text-left flex items-center justify-between gap-2 transition-colors"
                    >
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-mono font-semibold text-light-accent dark:text-dark-accent truncate">
                          {link.shortCode}
                        </span>
                        <span className="text-[11px] text-light-muted dark:text-dark-muted truncate max-w-[240px]">
                          {link.originalUrl}
                        </span>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-light-text dark:text-dark-text">
                          {link.clickCount}
                        </span>
                        <span className="text-[10px] text-light-muted dark:text-dark-muted block">
                          clicks
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <Card variant="outline" padding="lg" className="text-center py-10 flex flex-col items-center gap-2">
                <p className="text-xs font-medium text-light-muted dark:text-dark-muted">
                  No links available for analytics
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setActiveTab('shorten')}
                >
                  Shorten a link first
                </Button>
              </Card>
            )}
          </div>
        )}
      </main>

      {/* QR Code Modal */}
      <Modal
        isOpen={Boolean(qrModalUrl)}
        onClose={() => setQrModalUrl(null)}
        title="QR Code & Sharing"
      >
        {qrModalUrl && <QRCodeCard url={qrModalUrl} showToast={showToast} />}
      </Modal>

      {/* Settings Modal */}
      <Modal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        title="LinkLite Configuration"
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-light-text dark:text-dark-text">
              Backend API URL
            </label>
            <Input
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="https://linklite-production.up.railway.app"
              leftIcon={<Server className="w-4 h-4" />}
            />
            <span className="text-[11px] text-light-muted dark:text-dark-muted">
              Configure your local or production backend endpoint.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              fullWidth
              isLoading={isTestingServer}
              onClick={handleTestConnection}
              leftIcon={
                serverStatus === 'connected' ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-light-success dark:text-dark-success" />
                ) : (
                  <Server className="w-3.5 h-3.5" />
                )
              }
            >
              {serverStatus === 'connected' ? 'Connected' : 'Test Endpoint'}
            </Button>

            <Button
              variant="primary"
              size="sm"
              fullWidth
              onClick={handleSaveSettings}
              leftIcon={<Check className="w-3.5 h-3.5" />}
            >
              Save
            </Button>
          </div>
        </div>
      </Modal>

      {/* Global Toast Container */}
      <Toast toasts={toasts} onDismiss={handleDismissToast} />
    </div>
  );
};
