import React from 'react';
import { Globe, MousePointerClick, Clock, Share2, ArrowLeft } from 'lucide-react';
import { Card } from './Card';
import { LoadingSpinner } from './LoadingSpinner';
import { useUrlAnalytics } from '../hooks/useAnalytics';
import { Button } from './Button';

interface AnalyticsCardProps {
  urlId: string | null;
  onBack?: () => void;
}

export const AnalyticsCard: React.FC<AnalyticsCardProps> = ({ urlId, onBack }) => {
  const { data: analytics, isLoading, error } = useUrlAnalytics(urlId);

  if (isLoading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center gap-2">
        <LoadingSpinner size="lg" />
        <span className="text-xs text-light-muted dark:text-dark-muted">Loading metrics...</span>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="py-8 text-center flex flex-col items-center gap-3">
        <p className="text-xs text-light-muted dark:text-dark-muted">
          Select a link from Recent Links to view live click analytics.
        </p>
        {onBack && (
          <Button variant="secondary" size="sm" onClick={onBack} leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
            Back to Links
          </Button>
        )}
      </div>
    );
  }

  const formattedLastClick = analytics.lastClickAt
    ? new Date(analytics.lastClickAt).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'No clicks yet';

  return (
    <div className="flex flex-col gap-3.5">
      {onBack && (
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="text-xs font-medium text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Recent Links</span>
          </button>
          <span className="text-[11px] font-mono text-light-muted dark:text-dark-muted">
            {analytics.shortCode}
          </span>
        </div>
      )}

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        <Card variant="subtle" padding="sm" className="flex flex-col gap-1">
          <div className="flex items-center gap-1 text-[11px] text-light-muted dark:text-dark-muted font-medium">
            <MousePointerClick className="w-3 h-3 text-light-accent dark:text-dark-accent" />
            <span>Total Clicks</span>
          </div>
          <span className="text-xl font-bold text-light-text dark:text-dark-text tracking-tight">
            {analytics.totalClicks}
          </span>
        </Card>

        <Card variant="subtle" padding="sm" className="flex flex-col gap-1">
          <div className="flex items-center gap-1 text-[11px] text-light-muted dark:text-dark-muted font-medium">
            <Clock className="w-3 h-3 text-light-accent dark:text-dark-accent" />
            <span>Last Click</span>
          </div>
          <span className="text-xs font-semibold text-light-text dark:text-dark-text truncate mt-1">
            {formattedLastClick}
          </span>
        </Card>
      </div>

      {/* Country Distribution */}
      <Card variant="default" padding="sm" className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-light-text dark:text-dark-text flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-light-muted dark:text-dark-muted" />
            <span>Top Locations</span>
          </span>
          <span className="text-[10px] text-light-muted dark:text-dark-muted">
            {analytics.countries.length} countries
          </span>
        </div>

        {analytics.countries.length === 0 ? (
          <p className="text-[11px] text-light-muted dark:text-dark-muted py-1">
            No geo-data recorded yet.
          </p>
        ) : (
          <div className="flex flex-col gap-1.5 max-h-28 overflow-y-auto pr-1">
            {analytics.countries.slice(0, 5).map((item) => (
              <div
                key={item.country}
                className="flex items-center justify-between text-xs py-0.5 px-1.5 rounded bg-light-secondary dark:bg-[#1e293b]/60"
              >
                <span className="font-medium text-light-text dark:text-dark-text">
                  {item.country}
                </span>
                <span className="text-[11px] font-mono text-light-muted dark:text-dark-muted">
                  {item.count} {item.count === 1 ? 'click' : 'clicks'}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Referrer Distribution */}
      <Card variant="default" padding="sm" className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-light-text dark:text-dark-text flex items-center gap-1.5">
            <Share2 className="w-3.5 h-3.5 text-light-muted dark:text-dark-muted" />
            <span>Referrers</span>
          </span>
          <span className="text-[10px] text-light-muted dark:text-dark-muted">
            {analytics.referrers.length} sources
          </span>
        </div>

        {analytics.referrers.length === 0 ? (
          <p className="text-[11px] text-light-muted dark:text-dark-muted py-1">
            No referrer logs yet.
          </p>
        ) : (
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
            {analytics.referrers.map((item) => (
              <div
                key={item.referrer}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-light-secondary dark:bg-[#1e293b] border border-light-border dark:border-dark-border"
              >
                <span className="text-light-text dark:text-dark-text font-medium truncate max-w-[120px]">
                  {item.referrer}
                </span>
                <span className="text-light-muted dark:text-dark-muted font-mono font-bold">
                  ({item.count})
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
