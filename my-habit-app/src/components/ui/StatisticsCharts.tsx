'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

type CompletionData = { name: string; value: number };
type HabitTypeData = { name: string; value: number };
type WeeklyTrendData = { name: string; completionRate: number; satisfaction: number };

type Props = {
  completionData: CompletionData[];
  habitTypeData: HabitTypeData[];
  weeklyTrend: WeeklyTrendData[];
  downloadCSV: () => void;
  COLORS: string[];
};

export default function StatisticsCharts({
  completionData,
  habitTypeData,
  weeklyTrend,
  downloadCSV,
  COLORS,
}: Props) {
  return (
    <div className="space-y-8">
      {/* 완료율 차트 */}
      <div>
        <h3 className="text-lg font-semibold mb-2">요일별 완료율 (%)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={completionData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill={COLORS[0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 습관 유형 파이 차트 */}
      <div>
        <h3 className="text-lg font-semibold mb-2">습관 유형 비율</h3>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={habitTypeData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {habitTypeData.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* 주간 트렌드 바 차트 */}
      <div>
        <h3 className="text-lg font-semibold mb-2">주간 루틴 트렌드</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={weeklyTrend}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="completionRate" fill={COLORS[1]} />
            <Bar dataKey="satisfaction" fill={COLORS[2]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* CSV 다운로드 버튼 */}
      <div className="text-right">
        <button
          onClick={downloadCSV}
          className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm hover:bg-blue-700"
        >
          CSV 다운로드
        </button>
      </div>
    </div>
  );
}
