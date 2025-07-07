'use client';

import React, { useEffect, useState } from 'react';
import RoutineCard from '@/components/RoutineCard';
import StatisticsCharts from '@/components/StatisticsCharts';
import DiaryView from '@/components/DiaryView';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Routine = {
  id: string;
  day: string;
  start: string;
  end: string;
  task: string;
  done: boolean;
  rating: number;
  isHabit?: boolean;
  emoji?: string;
};

export default function HomePage() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [suggestions, setSuggestions] = useState<Record<string, string[]>>({});
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState('월');
  const [diaryImageUrl, setDiaryImageUrl] = useState<string | null>(null);
  const [diaryLoading, setDiaryLoading] = useState(false);
  const [diaryError, setDiaryError] = useState<string | null>(null);

  // 통계용 임시 데이터
  const completionData = [
    { name: '월', value: 80 },
    { name: '화', value: 60 },
    { name: '수', value: 90 },
    { name: '목', value: 70 },
    { name: '금', value: 85 },
  ];
  const habitTypeData = [
    { name: '신체', value: 5 },
    { name: '정신', value: 3 },
    { name: '기타', value: 2 },
  ];
  const weeklyTrend = [
    { name: 'Week 1', 완료율: 75, 만족도: 4.2 },
    { name: 'Week 2', 완료율: 82, 만족도: 4.6 },
  ];
  const COLORS = ['#6366f1', '#ec4899', '#facc15'];

  useEffect(() => {
    setRoutines([
      {
        id: '1',
        day: '월',
        start: '08:00',
        end: '09:00',
        task: '명상',
        done: false,
        rating: 5,
      },
      {
        id: '2',
        day: '월',
        start: '09:00',
        end: '10:00',
        task: '(습관) 스트레칭',
        done: true,
        rating: 7,
        isHabit: true,
      },
    ]);
  }, []);

  const handleDelete = (id: string) => {
    setRoutines(prev => prev.filter(r => r.id !== id));
  };

  const handleRate = (id: string, rating: number) => {
    setRoutines(prev =>
      prev.map(r => (r.id === id ? { ...r, rating } : r))
    );
  };

  const handleSuggestHabit = async (id: string) => {
    const routine = routines.find(r => r.id === id);
    const nextIndex = routines.findIndex(r => r.id === id) + 1;
    const next = routines[nextIndex];

    setLoadingStates(prev => ({ ...prev, [id]: true }));
    setActiveCardId(id);

    try {
      const res = await fetch('/api/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pairs: [{ prevTask: routine?.task, nextTask: next?.task }],
        }),
      });

      const { result } = await res.json();
      setSuggestions(prev => ({ ...prev, [id]: result[0] }));
    } catch (error) {
      console.error('습관 추천 오류:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleAddHabit = (id: string, habit: string) => {
    const index = routines.findIndex(r => r.id === id);
    const newHabit: Routine = {
      id: Date.now().toString(),
      day: routines[index].day,
      start: routines[index].end,
      end: '다음 시간',
      task: habit,
      done: false,
      rating: 0,
      isHabit: true,
    };
    const updated = [...routines];
    updated.splice(index + 1, 0, newHabit);
    setRoutines(updated);
  };

  const downloadCSV = () => {
    const headers = ['날짜', '시작', '종료', '활동', '만족도'];
    const rows = routines.map(r => [
      r.day, r.start, r.end, r.task, r.rating.toString()
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob(["\ufeff" + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `habit_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  const topRoutine = routines
    .filter(r => r.day === selectedDay && r.done)
    .sort((a, b) => b.rating - a.rating)[0] || null;

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold">나의 웰빙 루틴</h1>
      {routines.map(routine => (
        <RoutineCard
          key={routine.id}
          routine={routine}
          onDelete={handleDelete}
          onRate={handleRate}
          onSuggestHabit={handleSuggestHabit}
          aiHabitSuggestions={suggestions[routine.id] ?? []}
          isLoading={loadingStates[routine.id] ?? false}
          isActive={activeCardId === routine.id}
          onAddHabit={handleAddHabit}
        />
      ))}

      <StatisticsCharts
        completionData={completionData}
        habitTypeData={habitTypeData}
        weeklyTrend={weeklyTrend}
        downloadCSV={downloadCSV}
        COLORS={COLORS}
      />

      <h2 className="text-xl font-semibold mt-10">{selectedDay}요일 그림일기</h2>
      <DiaryView
        topRoutine={topRoutine}
        diaryLoading={diaryLoading}
        diaryError={diaryError}
        diaryImageUrl={diaryImageUrl}
        selectedDay={selectedDay}
      />
    </main>
  );
}
