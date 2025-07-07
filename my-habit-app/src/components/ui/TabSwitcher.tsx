'use client';

import React from 'react';

type Props = {
  currentTab: 'routine' | 'statistics' | 'diary';
  onTabChange: (tab: 'routine' | 'statistics' | 'diary') => void;
};

export default function TabSwitcher({ currentTab, onTabChange }: Props) {
  const tabs: { label: string; key: 'routine' | 'statistics' | 'diary' }[] = [
    { label: '루틴 및 습관', key: 'routine' },
    { label: '통계', key: 'statistics' },
    { label: '오늘 일기', key: 'diary' },
  ];

  return (
    <div className="flex justify-center gap-3 my-4">
      {tabs.map(({ label, key }) => (
        <button
          key={key}
          onClick={() => onTabChange(key)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition ${
            currentTab === key
              ? 'bg-black text-white'
              : 'bg-gray-200 text-gray-800'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
