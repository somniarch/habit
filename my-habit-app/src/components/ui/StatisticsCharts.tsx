// src/components/ui/StatisticsCharts.tsx

'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

type SatisfactionData = {
  name: string; // 전체, 루틴, 습관
  달성도: number; // 0 ~ 100 (%)
  만족도: number; // 0 ~ 5
};

type Props = {
  data: SatisfactionData[];
};

export default function StatisticsCharts({ data }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* 달성도 (%) */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-4">달성도 (%)</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data}>
            <XAxis dataKey="name" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Bar
              dataKey="달성도"
              fill="#0f0f0f"
              radius={[4, 4, 0, 0]}
              barSize={36}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 만족도 (5점 만점) */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-4">만족도 (5점)</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data}>
            <XAxis dataKey="name" />
            <YAxis domain={[0, 5]} />
            <Tooltip />
            <Bar
              dataKey="만족도"
              fill="#0f0f0f"
              radius={[4, 4, 0, 0]}
              barSize={36}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
