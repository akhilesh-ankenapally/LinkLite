import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link2, Copy, Check, QrCode, ArrowRight, Sparkles, RefreshCw } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import { Card } from './Card';
import { useActiveTab } from '../hooks/useActiveTab';
import { useShorten } from '../hooks/useShorten';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard';
import { ShortUrlRecord } from '../types';

interface ShortenCardProps {
  onOpenQrModal: (shortUrl: string) => void;
  onLinkCreated: (link: ShortUrlRecord) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const ShortenCard: React.FC<ShortenCardProps> = ({
  onOpenQrModal,
  onLinkCreated,
  showToast,
}) => {
  const activeTab = useActiveTab();
  const [url, setUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<ShortUrlRecord | null>(null);

  const { copied, copy } = useCopyToClipboard();

  // Populate detected active tab URL
  useEffect(() => {
    if (activeTab.url && !url) {
      setUrl(activeTab.url);
    }
  }, [activeTab.url]);

  const shortenMutation = useShorten((result) => {
    setLastGenerated(result);
    onLinkCreated(result);
    // Auto copy to clipboard
    copy(result.shortUrl);
    showToast('Short link generated & copied to clipboard!', 'success');
  });

  const handleShorten = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!url.trim()) {
      showToast('Please enter a valid URL', 'error');
      return;
    }

    shortenMutation.mutate(
      { url: url.trim(), customAlias: customAlias.trim() || undefined },
      {
        onError: (err) => {
          showToast(err.message || 'Failed to shorten URL', 'error');
        },
      }
    );
  };

  const handleUseCurrentTab = () => {
    if (activeTab.url) {
      setUrl(activeTab.url);
      showToast('Current tab URL applied', 'info');
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Shortening Form Container */}
      <Card variant="default" padding="md" className="flex flex-col gap-3">
        <form onSubmit={handleShorten} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-light-text dark:text-dark-text flex items-center gap-1.5">
                <span>Target URL</span>
              </label>

              {activeTab.url && activeTab.url !== url && (
                <button
                  type="button"
                  onClick={handleUseCurrentTab}
                  className="text-[11px] font-medium text-light-accent dark:text-dark-accent hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Use active tab</span>
                </button>
              )}
            </div>

            <Input
              placeholder="https://example.com/very-long-link..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              leftIcon={<Link2 className="w-4 h-4" />}
              disabled={shortenMutation.isPending}
            />
          </div>

          {/* Optional Custom Alias Toggle */}
          <div className="flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-[11px] text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text transition-colors flex items-center gap-1"
            >
              <span>{showAdvanced ? 'Hide alias options' : '+ Custom alias (optional)'}</span>
            </button>
          </div>

          {showAdvanced && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.18 }}
              className="overflow-hidden"
            >
              <Input
                label="Custom Short Code (3-32 characters)"
                placeholder="my-link"
                value={customAlias}
                onChange={(e) => setCustomAlias(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
                maxLength={32}
                disabled={shortenMutation.isPending}
              />
            </motion.div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="md"
            fullWidth
            isLoading={shortenMutation.isPending}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Shorten Link
          </Button>
        </form>
      </Card>

      {/* Generated Result Display */}
      <AnimatePresence>
        {lastGenerated && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <Card
              variant="subtle"
              padding="md"
              className="border-light-accent/30 dark:border-dark-accent/40 bg-blue-50/40 dark:bg-blue-950/20"
            >
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-light-accent dark:text-dark-accent uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Your Short Link</span>
                  </span>
                  <span className="text-[11px] text-light-muted dark:text-dark-muted">
                    Code: <strong className="font-mono">{lastGenerated.shortCode}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2 p-2 bg-light-bg dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg">
                  <span className="text-xs font-mono font-medium text-light-text dark:text-dark-text truncate flex-1 select-all">
                    {lastGenerated.shortUrl}
                  </span>

                  <button
                    onClick={() => {
                      copy(lastGenerated.shortUrl);
                      showToast('Copied to clipboard!', 'success');
                    }}
                    aria-label="Copy short link"
                    className={`px-2.5 py-1 text-xs font-medium rounded-md flex items-center gap-1 transition-colors ${
                      copied
                        ? 'bg-light-success dark:bg-dark-success text-white'
                        : 'bg-light-accent dark:bg-dark-accent text-white hover:opacity-90'
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px]">
                  <span className="text-light-muted dark:text-dark-muted truncate max-w-[220px]">
                    To: {lastGenerated.originalUrl}
                  </span>

                  <button
                    onClick={() => onOpenQrModal(lastGenerated.shortUrl)}
                    className="text-light-accent dark:text-dark-accent font-medium hover:underline flex items-center gap-1 shrink-0"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>View QR Code</span>
                  </button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
