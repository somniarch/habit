'use client';

import React from 'react';

type TabKey = 'routine' | 'statistics' | 'diary';

type Props = {
  currentTab: TabKey;
  onTabChange: (tab: TabKey) => void;
};

export default function TabSwitcher({ currentTab, onTabChange }: Props) {
  const tabs: { key: TabKey; label: string }[] = [
    { key: 'routine', label: '루틴 및 습관' },
    { key: 'statistics', label: '통계' },
    { key: 'diary', label: '오늘 일기' },
  ];

  return (
    <div className="flex justify-center gap-4 mt-4 mb-6">
      {tabs.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onTabChange(key)}
          className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 shadow-sm ${
            currentTab === key
              ? 'bg-black text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

