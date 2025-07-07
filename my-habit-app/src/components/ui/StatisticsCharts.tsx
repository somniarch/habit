'use client';
import React from 'react';
import {
  BarChart, PieChart, LineChart,
  XAxis, YAxis, Tooltip, Bar, Pie, Line, Cell, ResponsiveContainer
} from 'recharts';

// 📌 데이터 타입 정의
type CompletionData = { name: string; value: number };
type HabitTypeData = { name: string; value: number };
type WeeklyTrendData = { name: string; 완료율: number; 만족도: number };

type StatisticsChartsProps = {
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
  COLORS
}: StatisticsChartsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 요일별 완료율 */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">요일별 완료율</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={completionData}>
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="value" fill="url(#colorGradient)" radius={[8, 8, 0, 0]} />
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 습관 유형 분포 */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">습관 유형 분포</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={habitTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry: { name: string; percent?: number }) =>
                  typeof entry.percent === 'number'
                    ? `${entry.name} ${(entry.percent * 100).toFixed(0)}%`
                    : entry.name
                }
                outerRadius={80}
                dataKey="value"
              >
                {habitTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* 주간 트렌드 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:col-span-2">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">주간 트렌드</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={weeklyTrend}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="완료율"
                stroke="#6366f1"
                strokeWidth={3}
                dot={{ fill: '#6366f1', r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="만족도"
                stroke="#ec4899"
                strokeWidth={3}
                dot={{ fill: '#ec4899', r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CSV 다운로드 */}
      <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
        <button
          onClick={downloadCSV}
          className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:shadow-lg transition"
        >
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
            CSV 다운로드
          </span>
        </button>
      </div>
    </div>
  );
}
