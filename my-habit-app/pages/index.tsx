'use client';

import React, { useState, useEffect, useMemo } from 'react';
import RoutineCard from '@/components/ui/RoutineCard';
import StatisticsCharts from '@/components/ui/StatisticsCharts';
import DiaryView from '@/components/ui/DiaryView';
import WeekdaySelector from '@/components/ui/WeekdaySelector';
import TabSwitcher from '@/components/ui/TabSwitcher';
import RoutineInputForm from '@/components/ui/RoutineInputForm';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 타입 정의
type Routine = {
  id: string;
  day: string;
  start: string;
  end: string;
  task: string;
  done: boolean;
  rating: number;
  isHabit?: boolean;
  description?: string;
};

export default function HomePage() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [suggestions, setSuggestions] = useState<Record<string, string[]>>({});
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string>('월');
  const [activeTab, setActiveTab] = useState<'routine' | 'stats' | 'diary'>('routine');
  const [diaryImageUrl] = useState<string | null>(null);
  const [diaryLoading] = useState<boolean>(false);
  const [diaryError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoutines = async () => {
      const { data, error } = await supabase
        .from('my-habit-app')
        .select('*')
        .order('created_at', { ascending: true });

      if (error || !data) {
        console.error('루틴 불러오기 오류:', error?.message);
        return;
      }

      const mapped: Routine[] = data.map((r: any) => ({
        id: r.id.toString(),
        day: r.day,
        start: r.start,
        end: r.end,
        task: r.task,
        done: r.done,
        rating: r.rating ?? 0,
        isHabit: r.is_habit,
        description: r.description,
      }));
      setRoutines(mapped);
    };

    fetchRoutines();
  }, []);

  const handleDelete = (id: string) => {
    setRoutines((prev) => prev.filter((r) => r.id !== id));
  };

  const handleRate = (id: string, rating: number) => {
    setRoutines((prev) =>
      prev.map((r) => (r.id === id ? { ...r, rating } : r))
    );
  };

  const handleSuggestHabit = async (id: string) => {
    const routine = routines.find((r) => r.id === id);
    const nextIndex = routines.findIndex((r) => r.id === id) + 1;
    const next = routines[nextIndex];

    setLoadingStates((prev) => ({ ...prev, [id]: true }));
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
      setSuggestions((prev) => ({ ...prev, [id]: result[0] }));
    } catch (error) {
      console.error('습관 추천 오류:', error);
    } finally {
      setLoadingStates((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleAddHabit = (id: string, habit: string) => {
    const index = routines.findIndex((r) => r.id === id);
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

  const handleAddRoutine = (routine: Routine) => {
    setRoutines((prev) => [...prev, routine]);
  };

  const downloadCSV = () => {
    const headers = ['날짜', '시작', '종료', '활동', '만족도'];
    const rows = routines.map((r) => [
      r.day,
      r.start,
      r.end,
      r.task,
      r.rating.toString(),
    ]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], {
      type: 'text/csv;charset=utf-8;',
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `habit_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  const completionData = useMemo(() => {
    const grouped: Record<string, { total: number; done: number }> = {};
    routines.forEach((r) => {
      if (!grouped[r.day]) grouped[r.day] = { total: 0, done: 0 };
      grouped[r.day].total += 1;
      if (r.done) grouped[r.day].done += 1;
    });

    return Object.entries(grouped).map(([day, val]) => ({
      name: day,
      value: Math.round((val.done / val.total) * 100),
    }));
  }, [routines]);

  const habitTypeData = useMemo(() => {
    const result = {
      운동: 0,
      '정신 건강': 0,
      공부: 0,
      업무: 0,
      기타: 0,
    };

    routines.forEach((r) => {
      if (!r.isHabit) return;
      const t = r.task;
      if (t.includes('운동') || t.includes('스트레칭') || t.includes('산책') || t.includes('요가')) {
        result.운동++;
      } else if (t.includes('명상') || t.includes('호흡') || t.includes('휴식') || t.includes('감정일기')) {
        result['정신 건강']++;
      } else if (t.includes('공부') || t.includes('학습') || t.includes('독서') || t.includes('코딩')) {
        result.공부++;
      } else if (t.includes('업무') || t.includes('회의') || t.includes('보고서')) {
        result.업무++;
      } else {
        result.기타++;
      }
    });

    return Object.entries(result).map(([name, value]) => ({ name, value }));
  }, [routines]);

  const weeklyTrend = useMemo(() => {
    const weeks: Record<string, { count: number; done: number; totalRating: number }> = {
      'Week 1': { count: 0, done: 0, totalRating: 0 },
    };

    routines.forEach((r) => {
      const week = 'Week 1';
      weeks[week].count += 1;
      if (r.done) weeks[week].done += 1;
      weeks[week].totalRating += r.rating;
    });

    return Object.entries(weeks).map(([name, v]) => ({
      name,
      완료율: v.count ? Math.round((v.done / v.count) * 100) : 0,
      만족도: v.count ? parseFloat((v.totalRating / v.count).toFixed(1)) : 0,
    }));
  }, [routines]);

  const topRoutine = routines
    .filter((r) => r.day === selectedDay && r.done)
    .sort((a, b) => b.rating - a.rating)[0] || null;

  return (
    <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <WeekdaySelector selectedDay={selectedDay} onChange={setSelectedDay} />
      <TabSwitcher activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === 'routine' && (
        <>
          <RoutineInputForm selectedDay={selectedDay} onAdd={handleAddRoutine} />
          {routines.map((routine) => (
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
        </>
      )}

      {activeTab === 'stats' && (
        <StatisticsCharts
          completionData={completionData}
          habitTypeData={habitTypeData}
          weeklyTrend={weeklyTrend}
          downloadCSV={downloadCSV}
          COLORS={['#6366f1', '#ec4899', '#facc15']}
        />
      )}

      {activeTab === 'diary' && (
        <DiaryView
          topRoutine={topRoutine}
          diaryLoading={diaryLoading}
          diaryError={diaryError}
          diaryImageUrl={diaryImageUrl}
          selectedDay={selectedDay}
        />
      )}
    </main>
  );
}
