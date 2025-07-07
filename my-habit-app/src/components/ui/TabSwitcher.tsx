'use client';

import React from 'react';

type TabKey = 'routine-habit' | 'tracker' | 'today-diary';

type Props = {
  currentTab: TabKey;
  onTabChange: (tab: TabKey) => void;
};

export default function TabSwitcher({ currentTab, onTabChange }: Props) {
  const tabs: { key: TabKey; label: string }[] = [
    { key: 'routine-habit', label: '루틴 및 습관' },
    { key: 'tracker', label: '통계' },
    { key: 'today-diary', label: '오늘 일기' },
  ];

  return (
    <div className="flex justify-center gap-4 mt-4">
      {tabs.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onTabChange(key)}
          className={`rounded-full px-5 py-2 font-semibold transition ${
            currentTab === key ? 'bg-black text-white' : 'bg-gray-300 text-black'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

