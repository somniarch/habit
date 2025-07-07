/* pages/index.tsx */
'use client';

import React, { useState, useMemo } from 'react';
import AuthForm from '../src/components/ui/AuthForm';
import HabitSuggestion from '../src/components/ui/HabitSuggestion';
import StatisticsCharts from '../src/components/ui/StatisticsCharts';
import DiaryView from '../src/components/ui/DiaryView';

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState('');
  const [userPw, setUserPw] = useState('');
  const [loginError, setLoginError] = useState('');
  const [adminModeActive, setAdminModeActive] = useState(false);

  const [newUserId, setNewUserId] = useState('');
  const [newUserPw, setNewUserPw] = useState('');
  const [userAddError, setUserAddError] = useState('');

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
        topRoutine={null}
        diaryImageUrl={null}
        diaryLoading={false}
        diaryError={null}
      />
      <HabitSuggestion
        aiHabitSuggestions={[]}
        habitCandidates={['2분 걷기', '1분 물마시기']}
        habitSuggestionIdx={null}
        addHabitBetween={() => {}}
        aiHabitLoading={false}
        onClose={() => {}}
      />
    </div>
  );
}
