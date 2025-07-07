'use client';

import React, { useState, useMemo, useEffect } from 'react';
import AuthForm from '../src/components/ui/AuthForm';
import StatisticsCharts from '../src/components/ui/StatisticsCharts';
import RoutineCard from '../src/components/ui/RoutineCard';
import HabitSuggestion from '../src/components/ui/HabitSuggestion';
import DiaryView from '../src/components/ui/DiaryView';

type Routine = {
  id: string;
  day: string;
  start: string;
  end: string;
  task: string;
  done: boolean;
  rating: number;
  isHabit?: boolean;
};

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState('');
  const [userPw, setUserPw] = useState('');
  const [loginError, setLoginError] = useState('');
  const [adminModeActive, setAdminModeActive] = useState(false);

  const [newUserId, setNewUserId] = useState('');
  const [newUserPw, setNewUserPw] = useState('');
  const [userAddError, setUserAddError] = useState('');

  const [topRoutine, setTopRoutine] = useState<Routine | null>(null);
  const [diaryImageUrl, setDiaryImageUrl] = useState<string | null>(null);
  const [diaryLoading, setDiaryLoading] = useState(false);
  const [diaryError, setDiaryError] = useState<string | null>(null);

  const [aiHabitSuggestions, setAiHabitSuggestions] = useState<string[]>([]);
  const [aiHabitLoading, setAiHabitLoading] = useState(false);
  const [suggestTargetId, setSuggestTargetId] = useState<string | null>(null);

  const [routines, setRoutines] = useState<Routine[]>([
    {
      id: '1',
      day: '월',
      start: '09:00',
      end: '10:00',
      task: '스트레칭',
      done: true,
      rating: 4,
      isHabit: true
    },
    {
      id: '2',
      day: '월',
      start: '10:30',
      end: '11:30',
      task: '러닝',
      done: false,
      rating: 0,
    }
  ]);

  const selectedDay = '월';

  const completionData = useMemo(() => [{ name: '월', value: 80 }, { name: '화', value: 90 }], []);
  const habitTypeData = useMemo(() => [{ name: '스트레칭', value: 5 }, { name: '걷기', value: 3 }], []);
  const weeklyTrend = useMemo(() => [{ name: '1주 전', 완료율: 85, 만족도: 4 }], []);
  const COLORS = ['#4F46E5', '#7C3AED', '#EC4899'];

  const downloadCSV = () => {
    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURI('날짜,활동\n2024-01-01,스트레칭');
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', 'habit_data.csv');
    link.click();
  };

  const handleLogin = () => {
    if (!userId.trim() || !userPw.trim()) {
      setLoginError('아이디와 비밀번호를 입력해주세요.');
      return;
    }
    if (userId === 'test' && userPw === '1234') {
      setIsLoggedIn(true);
      setLoginError('');
    } else {
      setLoginError('로그인 실패');
    }
  };

  const handleAddUser = () => {
    if (!newUserId.trim() || !newUserPw.trim()) {
      setUserAddError('아이디와 비밀번호를 입력해주세요.');
      return;
    }
    setNewUserId('');
    setNewUserPw('');
    setUserAddError('');
  };

  const handleRoutineDeleteConfirm = (id: string) => {
    setRoutines(routines.filter((r) => r.id !== id));
  };

  const handleFetchHabitSuggestions = async (targetId: string) => {
    const idx = routines.findIndex((r) => r.id === targetId);
    if (idx === -1) return;

    const prev = routines[idx]?.task || '';
    const next = routines[idx + 1]?.task || '';

    setAiHabitLoading(true);
    setSuggestTargetId(targetId);

    try {
      const res = await fetch('/openai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prevTask: prev, nextTask: next }),
      });

      const data = await res.json();
      setAiHabitSuggestions(data.result || []);
    } catch (e) {
      console.error('습관 추천 실패:', e);
      setAiHabitSuggestions([]);
    } finally {
      setAiHabitLoading(false);
    }
  };

  const addHabitBetween = (id: string, habit: string) => {
    const idx = routines.findIndex((r) => r.id === id);
    if (idx === -1) return;
    const updated = [...routines];
    updated.splice(idx + 1, 0, {
      id: Date.now().toString(),
      day: selectedDay,
      start: '10:00',
      end: '10:05',
      task: habit,
      done: false,
      rating: 0,
      isHabit: true,
    });
    setRoutines(updated);
  };

  const handleRateChange = (id: string, rating: number) => {
    const updated = [...routines];
    const targetIdx = updated.findIndex((r) => r.id === id);
    if (targetIdx !== -1) {
      updated[targetIdx].rating = rating;
      setRoutines(updated);
    }
  };

  useEffect(() => {
    setDiaryLoading(true);
    setTimeout(() => {
      setTopRoutine(routines[0]);
      setDiaryImageUrl('/demo-diary.png');
      setDiaryError(null);
      setDiaryLoading(false);
    }, 800);
  }, [routines]);

  if (!isLoggedIn) {
    return (
      <AuthForm
        userId={userId} userPw={userPw}
        setUserId={setUserId} setUserPw={setUserPw}
        loginError={loginError} adminModeActive={adminModeActive}
        setAdminModeActive={setAdminModeActive} handleLogin={handleLogin}
        newUserId={newUserId} newUserPw={newUserPw}
        setNewUserId={setNewUserId} setNewUserPw={setNewUserPw}
        userAddError={userAddError} handleAddUser={handleAddUser}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 space-y-6">
      <h1 className="text-2xl font-bold">Welcome, {userId}</h1>

      <StatisticsCharts
        completionData={completionData}
        habitTypeData={habitTypeData}
        weeklyTrend={weeklyTrend}
        downloadCSV={downloadCSV}
        COLORS={COLORS}
      />

      <DiaryView
        topRoutine={topRoutine}
        diaryImageUrl={diaryImageUrl}
        diaryLoading={diaryLoading}
        diaryError={diaryError}
        selectedDay={selectedDay}
      />

      {routines.map((routine) => (
        <RoutineCard
          key={routine.id}
          routine={routine}
          onDelete={handleRoutineDeleteConfirm}
          onRate={handleRateChange}
          onSuggestHabit={handleFetchHabitSuggestions}
          isActive={suggestTargetId === routine.id}
          aiHabitSuggestions={suggestTargetId === routine.id ? aiHabitSuggestions : []}
          isLoading={aiHabitLoading && suggestTargetId === routine.id}
          onAddHabit={addHabitBetween}
        />
      ))}

      <HabitSuggestion
        aiHabitSuggestions={aiHabitSuggestions}
        habitCandidates={['2분 걷기', '1분 물마시기']}
        habitSuggestionIdx={suggestTargetId}
        addHabitBetween={addHabitBetween}
        aiHabitLoading={aiHabitLoading}
        onClose={() => setSuggestTargetId(null)}
      />
    </div>
  );
}
