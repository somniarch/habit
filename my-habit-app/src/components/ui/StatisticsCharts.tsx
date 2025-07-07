import React from 'react';
import { BarChart, PieChart, LineChart } from 'recharts';

export default function StatisticsCharts({
  completionData, habitTypeData, weeklyTrend,
  downloadCSV
}: any) {
  return (
    <div className="stats-charts">{/* 통계 시각화 */}</div>
  );
}
