import React from 'react';
import { Copy, ExternalLink, QrCode, Trash2, Check, BarChart2 } from 'lucide-react';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard';
import { ShortUrlRecord } from '../types';

interface RecentLinkCardProps {
  item: ShortUrlRecord;
  onOpenQr: (url: string) => void;
  onViewAnalytics: (id: string) => void;
  onDelete: (id: string) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const RecentLinkCard: React.FC<RecentLinkCardProps> = ({
  item,
  onOpenQr,
  onViewAnalytics,
  onDelete,
  showToast,
}) => {
  const { copied, copy } = useCopyToClipboard();

  const handleCopy = () => {
    copy(item.shortUrl);
    showToast('Copied to clipboard!', 'success');
  };

  const formattedDate = new Date(item.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="p-3 bg-light-bg dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl flex flex-col gap-2 hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-mono font-semibold text-light-accent dark:text-dark-accent truncate select-all">
              {item.shortUrl}
            </span>
            <span className="text-[10px] px-1.5 py-0.2 bg-gray-100 dark:bg-gray-800 text-light-muted dark:text-dark-muted rounded font-mono">
              {item.shortCode}
            </span>
          </div>

          <span className="text-[11px] text-light-muted dark:text-dark-muted truncate max-w-[240px] mt-0.5">
            {item.originalUrl}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={handleCopy}
            title="Copy Short URL"
            className={`p-1.5 rounded-md text-xs transition-colors ${
              copied
                ? 'bg-light-success dark:bg-dark-success text-white'
                : 'text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => onOpenQr(item.shortUrl)}
            title="View QR Code"
            className="p-1.5 rounded-md text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <QrCode className="w-3.5 h-3.5" />
          </button>

          <a
            href={item.shortUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Open Link in New Tab"
            className="p-1.5 rounded-md text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={() => onDelete(item.id)}
            title="Delete Link"
            className="p-1.5 rounded-md text-light-muted dark:text-dark-muted hover:text-light-danger dark:hover:text-dark-danger hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-light-border/60 dark:border-dark-border/60 text-[11px] text-light-muted dark:text-dark-muted">
        <span className="flex items-center gap-1">
          <span>Created: {formattedDate}</span>
        </span>

        <button
          onClick={() => onViewAnalytics(item.id)}
          className="flex items-center gap-1 font-medium text-light-accent dark:text-dark-accent hover:underline"
        >
          <BarChart2 className="w-3 h-3" />
          <span>{item.clickCount} {item.clickCount === 1 ? 'click' : 'clicks'}</span>
        </button>
      </div>
    </div>
  );
};
