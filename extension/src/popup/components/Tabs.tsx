import React from 'react';
import { motion } from 'framer-motion';
import { Link, Clock, BarChart3 } from 'lucide-react';
import { ActiveTab } from '../types';

interface TabsProps {
  activeTab: ActiveTab;
  onChange: (tab: ActiveTab) => void;
  recentCount?: number;
}

export const Tabs: React.FC<TabsProps> = ({
  activeTab,
  onChange,
  recentCount = 0,
}) => {
  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'shorten', label: 'Shorten', icon: <Link className="w-3.5 h-3.5" /> },
    {
      id: 'recent',
      label: 'Recent',
      icon: <Clock className="w-3.5 h-3.5" />,
      badge: recentCount > 0 ? recentCount : undefined,
    },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="px-3 pt-2 pb-1 bg-light-bg dark:bg-dark-bg border-b border-light-border dark:border-dark-border select-none shrink-0">
      <div className="flex space-x-1 p-0.5 bg-light-secondary dark:bg-dark-card/90 rounded-lg border border-light-border/60 dark:border-dark-border/60">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`relative flex-1 py-1.5 px-2 flex items-center justify-center gap-1.5 text-xs font-medium rounded-md transition-colors ${
                isActive
                  ? 'text-light-text dark:text-dark-text'
                  : 'text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute inset-0 bg-white dark:bg-[#1e293b] rounded-md shadow-sm border border-black/5 dark:border-white/5"
                  transition={{ type: 'spring', duration: 0.22, bounce: 0 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className="text-[10px] px-1.5 py-0.2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full font-semibold">
                    {tab.badge}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
