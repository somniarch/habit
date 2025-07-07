'use client';

import React from 'react';

type TabType = 'routine' | 'stats' | 'diary';

type Props = {
  activeTab: TabType;
  setActiveTab: React.Dispatch<React.SetStateAction<TabType>>;
};

export default function TabSwitcher({ activeTab, setActiveTab }: Props) {
  const tabs: { label: string; value: TabType }[] = [
    { label: '루틴 및 습관', value: 'routine' },
    { label: '통계', value: 'stats' },
    { label: '오늘 일기', value: 'diary' },
  ];

  return (
    <div className="flex justify-around text-sm font-medium rounded-full bg-gray-100 p-1">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => setActiveTab(tab.value)}
          className={`px-4 py-2 rounded-full ${
            activeTab === tab.value ? 'bg-black text-white' : 'text-gray-600'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
