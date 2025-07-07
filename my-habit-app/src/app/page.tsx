'use client';

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell
} from "recharts";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";

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
  notificationTime?: string;
};

const habitCandidates = ["2분 스트레칭", "3분 걷기", "1분 명상", "2분 숨쉬기", "3분 독서"];
const fullDays = ["월", "화", "수", "목", "금", "토", "일"];
const dayLetters = fullDays.map(d => d[0]);

const habitEmojis: Record<string, string> = {
  숨: "🌬️",
  걷: "🚶",
  스트레칭: "🧘",
  물: "💧",
  명상: "🧘‍♂️",
  운동: "💪",
  독서: "📖",
  휴식: "😌",
  요가: "🧘‍♀️",
  춤: "💃",
  음악: "🎵",
  글쓰기: "✍️",
};

// 더 구체적인 프롬프트 생성을 위한 매핑
const activityPromptMap: Record<string, string> = {
  스트레칭: "사무실이나 집에서 간단한 스트레칭 동작을 하는 장면. 팔을 위로 뻗거나 목을 돌리는 모습.",
  걷기: "공원이나 거리를 가볍게 산책하는 모습. 나무와 하늘이 보이는 평화로운 풍경.",
  명상: "조용한 공간에서 눈을 감고 명상하는 모습. 촛불이나 향이 있는 평화로운 분위기.",
  숨쉬기: "창가에서 깊게 숨을 들이마시는 모습. 신선한 공기와 햇살이 느껴지는 장면.",
  독서: "아늑한 공간에서 책을 읽는 모습. 따뜻한 조명과 편안한 의자.",
  운동: "간단한 홈트레이닝을 하는 모습. 요가매트 위에서 운동하는 장면.",
  물: "깨끗한 물을 마시는 상쾌한 모습. 투명한 유리컵과 시원한 물.",
  요가: "요가 자세를 취하는 평화로운 모습. 요가매트와 조용한 공간.",
};

const COLORS = ['#4F46E5', '#7C3AED', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'];

function Toast({ message, emoji, onClose }: { message: string; emoji: string; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onClose(), 2500);
    return () => clearTimeout(timer);
  }, [onClose]);
  
  return (
    <div className="fixed bottom-8 right-8 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 z-50 animate-slide-up">
      <span className="text-2xl">{emoji}</span>
      <span className="font-medium">{message}</span>
    </div>
  );
}

function formatWeekLabel(date: Date, weekNum: number) {
  const yy = String(date.getFullYear()).slice(2);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yy}.${mm}.${dd} · W${weekNum}`;
}

function formatMonthDay(date: Date, dayIndex: number) {
  const firstDayOfWeek = new Date(date);
  firstDayOfWeek.setDate(date.getDate() - date.getDay() + dayIndex + 1);
  const mm = String(firstDayOfWeek.getMonth() + 1).padStart(2, "0");
  const dd = String(firstDayOfWeek.getDate()).padStart(2, "0");
  return `${mm}/${dd}`;
}

// 고도화된 그림일기 프롬프트
function getDiaryPrompt(routine: Routine) {
  const activityKey = Object.keys(activityPromptMap).find(key => routine.task.includes(key));
  const basePrompt = activityKey ? activityPromptMap[activityKey] : "일상의 한 장면";
  
  return (
    `수채화 스타일의 따뜻하고 부드러운 일러스트레이션. ` +
    `${basePrompt} ` +
    `파스텔톤의 색감과 부드러운 빛. 평화롭고 긍정적인 분위기. ` +
    `미니멀하고 깔끔한 구성으로 주요 행동에 집중.`
  );
}

export default function Page() {
  const [userId, setUserId] = useState("");
  const [userPw, setUserPw] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [toast, setToast] = useState<{ message: string; emoji: string } | null>(null);
  const [loginError, setLoginError] = useState("");
  const [adminModeActive, setAdminModeActive] = useState(false);

  const adminId = "3333";
  const adminPw = "8888";
  const storedUsersKey = "registeredUsers";
  const routinesKey = `routines_${userId}`;

  const [currentDate, setCurrentDate] = useState(new Date());
  const [weekNum, setWeekNum] = useState(1);
  const [selectedDay, setSelectedDay] = useState(fullDays[0]);
  const [selectedTab, setSelectedTab] = useState<"routine-habit" | "tracker" | "today-diary">("routine-habit");

  const [routines, setRoutines] = useState<Routine[]>([]);
  const [newRoutine, setNewRoutine] = useState({ start: "08:00", end: "09:00", task: "" });
  const [habitSuggestionIdx, setHabitSuggestionIdx] = useState<number | null>(null);
  const [editingRoutineId, setEditingRoutineId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState("");

  const [aiHabitSuggestions, setAiHabitSuggestions] = useState<string[]>([]);
  const [aiHabitLoading, setAiHabitLoading] = useState(false);

  const [diaryImageUrl, setDiaryImageUrl] = useState<string | null>(null);
  const [diaryLoading, setDiaryLoading] = useState(false);
  const [diaryError, setDiaryError] = useState<string | null>(null);

  const [newUserId, setNewUserId] = useState("");
  const [newUserPw, setNewUserPw] = useState("");
  const [userAddError, setUserAddError] = useState("");

  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [notificationEnabled, setNotificationEnabled] = useState(false);

  // localStorage 관련 함수들
  const getRegisteredUsers = (): { id: string; pw: string }[] => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem(storedUsersKey) || "[]");
    } catch {
      return [];
    }
  };

  const saveRegisteredUsers = (users: { id: string; pw: string }[]) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(storedUsersKey, JSON.stringify(users));
  };

  // 로그인/로그아웃 처리
  const handleLogin = () => {
    if (!userId.trim() || !userPw.trim()) {
      setLoginError("아이디와 비밀번호를 모두 입력해주세요.");
      return;
    }

    if (adminModeActive) {
      if (userId === adminId && userPw === adminPw) {
        setIsLoggedIn(true);
        setIsAdmin(true);
        setLoginError("");
        setToast({ emoji: "🎉", message: "관리자 로그인 성공!" });
      } else {
        setLoginError("관리자 계정이 아닙니다.");
        setToast({ emoji: "⚠️", message: "관리자 로그인 실패" });
      }
      return;
    }

    const users = getRegisteredUsers();
    const found = users.find((u) => u.id === userId && u.pw === userPw);
    if (found) {
      setIsLoggedIn(true);
      setIsAdmin(false);
      setLoginError("");
      setToast({ emoji: "✨", message: "로그인 성공!" });
    } else {
      setLoginError("등록된 사용자 ID 또는 비밀번호가 올바르지 않습니다.");
      setToast({ emoji: "⚠️", message: "로그인 실패" });
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserId("");
    setUserPw("");
    setIsAdmin(false);
    setAdminModeActive(false);
    setToast({ emoji: "👋", message: "로그아웃 되었습니다." });
  };

  const handleAddUser = () => {
    if (!newUserId.trim() || !newUserPw.trim()) {
      setUserAddError("아이디와 비밀번호를 모두 입력해주세요.");
      return;
    }

    const users = getRegisteredUsers();
    if (users.find((u) => u.id === newUserId)) {
      setUserAddError("이미 존재하는 아이디입니다.");
      return;
    }

    const updated = [...users, { id: newUserId, pw: newUserPw }];
    saveRegisteredUsers(updated);
    setUserAddError("");
    setNewUserId("");
    setNewUserPw("");
    setToast({ emoji: "✅", message: `사용자 ${newUserId} 등록 완료!` });
  };

  // 루틴 데이터 저장/불러오기
  useEffect(() => {
    if (typeof window !== "undefined" && userId) {
      const saved = localStorage.getItem(routinesKey);
      setRoutines(saved ? JSON.parse(saved) : []);
    }
  }, [userId, routinesKey]);

  useEffect(() => {
    if (userId) localStorage.setItem(routinesKey, JSON.stringify(routines));
  }, [routines, routinesKey, userId]);

  // 드래그 앤 드롭 처리
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = [...routines];
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);
    setRoutines(items);
  };

  // 루틴 삭제
  const handleRoutineDelete = (id: string) => {
    if (window.confirm("삭제하시겠습니까?")) {
      setRoutines(prev => prev.filter(r => r.id !== id));
      setToast({ emoji: "🗑️", message: "삭제되었습니다." });
    }
  };

  // 루틴 편집
  const handleRoutineEdit = (id: string, newTask: string) => {
    setRoutines(prev => prev.map(r => 
      r.id === id ? { ...r, task: newTask } : r
    ));
    setEditingRoutineId(null);
    setToast({ emoji: "✏️", message: "수정되었습니다." });
  };

  // 만족도 평가
  const handleRatingChange = (id: string, rating: number) => {
    setRoutines(prev => prev.map(r => 
      r.id === id ? { ...r, rating } : r
    ));
  };

  // AI 습관 추천 (개선된 프롬프트)
  async function fetchHabitSuggestions(prevTask: string | null, nextTask: string | null): Promise<string[]> {
    const context = [prevTask, nextTask].filter(Boolean).join(", ");
    if (!context) return habitCandidates;

    try {
      setAiHabitLoading(true);
      const prompt = `
        현재 활동: ${context}
        
        위 활동 사이에 할 수 있는 5분 이내 습관을 5개 추천해주세요.
        
        규칙:
        1. 반드시 "N분 동작" 형식 (예: 3분 스트레칭, 2분 걷기)
        2. N은 1-5 사이의 숫자
        3. 동작은 구체적인 행동 동사 (스트레칭, 걷기, 마시기, 숨쉬기 등)
        4. 추상적 표현 금지 (마음, 생각, 행복 등)
        5. 각 항목은 10자 이내
        6. 한 줄에 하나씩만
        
        예시:
        2분 스트레칭
        3분 걷기
        1분 명상
      `;

      const res = await fetch("/openai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) return habitCandidates;

      const data = await res.json();
      const suggestions = data.result
        .split('\n')
        .filter((line: string) => /^\d분\s+\S+/.test(line.trim()))
        .slice(0, 5)
        .map((line: string) => line.trim());

      return suggestions.length > 0 ? suggestions : habitCandidates;
    } catch {
      return habitCandidates;
    } finally {
      setAiHabitLoading(false);
    }
  }

  const handleFetchHabitSuggestions = async (idx: number) => {
    const dayRoutines = routines.filter(r => r.day === selectedDay);
    const prevTask = idx > 0 ? dayRoutines[idx - 1]?.task : null;
    const nextTask = idx < dayRoutines.length ? dayRoutines[idx]?.task : null;

    const suggestions = await fetchHabitSuggestions(prevTask, nextTask);
    setAiHabitSuggestions(suggestions);
    setHabitSuggestionIdx(idx);
  };

  const addHabitBetween = (idx: number, habit: string) => {
    const emoji = Object.entries(habitEmojis).find(([key]) => 
      habit.includes(key)
    )?.[1] || "✨";

    const newHabit: Routine = {
      id: Date.now().toString(),
      day: selectedDay,
      start: "",
      end: "",
      task: habit,
      done: false,
      rating: 0,
      isHabit: true,
      emoji,
    };

    const dayRoutines = routines.filter(r => r.day === selectedDay);
    const otherRoutines = routines.filter(r => r.day !== selectedDay);
    dayRoutines.splice(idx, 0, newHabit);
    
    setRoutines([...otherRoutines, ...dayRoutines]);
    setHabitSuggestionIdx(null);
    setToast({ emoji, message: `${habit} 추가!` });
  };

  // 통계 데이터 계산
  const completionData = fullDays.map(day => {
    const dayRoutines = routines.filter(r => r.day === day);
    const total = dayRoutines.length;
    const done = dayRoutines.filter(r => r.done).length;
    return { name: day, value: total ? Math.round((done / total) * 100) : 0 };
  });

  const habitTypeData = useMemo(() => {
    const habits = routines.filter(r => r.isHabit);
    const types: Record<string, number> = {};
    
    habits.forEach(h => {
      const type = h.task.split(' ').pop() || '기타';
      types[type] = (types[type] || 0) + 1;
    });

    return Object.entries(types).map(([name, value]) => ({ name, value }));
  }, [routines]);

  const weeklyTrend = useMemo(() => {
    const weeks = [];
    for (let i = 3; i >= 0; i--) {
      const weekRoutines = routines.filter(r => r.done);
      const avg = weekRoutines.length ? 
        Math.round(weekRoutines.reduce((acc, r) => acc + r.rating, 0) / weekRoutines.length) : 0;
      weeks.push({ name: `${i+1}주 전`, 완료율: Math.random() * 30 + 70, 만족도: avg || Math.random() * 3 + 7 });
    }
    return weeks;
  }, [routines]);

  const attendanceData = useMemo(() => {
    const data: { date: string; count: number }[] = [];
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 3);
    
    for (let i = 0; i < 90; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dateStr = date.toISOString().slice(0, 10);
      const dayIdx = date.getDay() === 0 ? 6 : date.getDay() - 1;
      const dayName = fullDays[dayIdx];
      const count = routines.filter(r => r.day === dayName && r.done).length;
      data.push({ date: dateStr, count: Math.min(count, 5) });
    }
    return data;
  }, [routines]);

  // 오늘의 최고 루틴
  const topRoutine = useMemo(() => {
    const today = new Date().getDay();
    const todayName = fullDays[today === 0 ? 6 : today - 1];
    const todayRoutines = routines.filter(r => r.day === todayName && r.done && r.rating > 0);
    return todayRoutines.sort((a, b) => b.rating - a.rating)[0];
  }, [routines]);

  // 그림일기 생성
  useEffect(() => {
    if (!topRoutine) {
      setDiaryImageUrl(null);
      return;
    }

    const generateDiary = async () => {
      setDiaryLoading(true);
      setDiaryError(null);
      
      try {
        const prompt = getDiaryPrompt(topRoutine);
        const res = await fetch("/openai/image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
        });
        
        const data = await res.json();
        if (data.image_url) {
          setDiaryImageUrl(data.image_url);
        } else {
          setDiaryError("그림 생성에 실패했습니다.");
        }
      } catch {
        setDiaryError("그림일기를 생성할 수 없습니다.");
      } finally {
        setDiaryLoading(false);
      }
    };

    generateDiary();
  }, [topRoutine]);

  // CSV 다운로드
  const downloadCSV = () => {
    const headers = ["날짜", "요일", "활동", "완료여부", "만족도", "습관여부"];
    const rows = routines.map(r => [
      new Date().toISOString().slice(0, 10),
      r.day,
      r.task,
      r.done ? "O" : "X",
      r.rating.toString(),
      r.isHabit ? "O" : "X"
    ]);

    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `habit_tracker_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {toast && <Toast emoji={toast.emoji} message={toast.message} onClose={() => setToast(null)} />}

        {!isLoggedIn ? (
          <div className="max-w-md mx-auto mt-20">
            <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
              <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Habit Tracker
              </h2>
              
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="아이디"
                  value={userId}
                  onChange={e => setUserId(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition"
                />
                <input
                  type="password"
                  placeholder="비밀번호"
                  value={userPw}
                  onChange={e => setUserPw(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition"
                />
                
                {loginError && (
                  <p className="text-red-500 text-sm text-center">{loginError}</p>
                )}

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={adminModeActive}
                      onChange={e => setAdminModeActive(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                    관리자 모드
                  </label>
                </div>

                <button
                  onClick={handleLogin}
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-[1.02] transition"
                >
                  로그인
                </button>
              </div>

              {adminModeActive && (
                <div className="mt-6 p-4 bg-gray-50 rounded-xl space-y-4">
                  <h3 className="font-semibold text-gray-700">사용자 등록</h3>
                  <input
                    type="text"
                    placeholder="새 사용자 아이디"
                    value={newUserId}
                    onChange={e => setNewUserId(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                  <input
                    type="password"
                    placeholder="새 사용자 비밀번호"
                    value={newUserPw}
                    onChange={e => setNewUserPw(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                  {userAddError && <p className="text-red-500 text-sm">{userAddError}</p>}
                  <button
                    onClick={handleAddUser}
                    className="w-full py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
                  >
                    사용자 등록
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* 헤더 */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  My Habit Tracker
                </h1>
                <div className="flex items-center gap-4">
                  <span className="text-gray-600">안녕하세요, {userId}님</span>
                  <button
                    onClick={handleLogout}
                    className="text-red-500 hover:text-red-700 font-medium transition"
                  >
                    로그아웃
                  </button>
                </div>
              </div>

              {/* 주차 선택 */}
              <div className="flex justify-center items-center gap-4 mt-6">
                <button 
                  onClick={() => setWeekNum(w => Math.max(1, w - 1))} 
                  className="p-2 hover:bg-gray-100 rounded-full transition"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span className="font-semibold text-lg">{formatWeekLabel(currentDate, weekNum)}</span>
                <button 
                  onClick={() => setWeekNum(w => w + 1)} 
                  className="p-2 hover:bg-gray-100 rounded-full transition"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* 요일 선택 */}
              <div className="flex justify-center gap-2 mt-4">
                {dayLetters.map((letter, idx) => (
                  <div key={idx} className="flex flex-col items-center">
                    <span className="text-xs text-gray-500 mb-1">{formatMonthDay(currentDate, idx)}</span>
                    <button
                      onClick={() => setSelectedDay(fullDays[idx])}
                      className={`w-10 h-10 rounded-full font-semibold transition ${
                        selectedDay === fullDays[idx]
                          ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                          : "bg-gray-200 hover:bg-gray-300"
                      }`}
                    >
                      {letter}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 탭 네비게이션 */}
            <div className="bg-white rounded-2xl shadow-lg p-2 flex gap-2">
              <button
                onClick={() => setSelectedTab("routine-habit")}
                className={`flex-1 py-3 px-6 rounded-xl font-semibold transition ${
                  selectedTab === "routine-habit"
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                    : "hover:bg-gray-100"
                }`}
              >
                루틴 & 습관
              </button>
              <button
                onClick={() => setSelectedTab("tracker")}
                className={`flex-1 py-3 px-6 rounded-xl font-semibold transition ${
                  selectedTab === "tracker"
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                    : "hover:bg-gray-100"
                }`}
              >
                통계
              </button>
              <button
                onClick={() => setSelectedTab("today-diary")}
                className={`flex-1 py-3 px-6 rounded-xl font-semibold transition ${
                  selectedTab === "today-diary"
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                    : "hover:bg-gray-100"
                }`}
              >
                오늘 일기
              </button>
            </div>

            {/* 루틴 & 습관 탭 */}
            {selectedTab === "routine-habit" && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                {/* 새 루틴 추가 */}
                <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                  <h3 className="font-semibold text-gray-700 mb-3">새 루틴 추가</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <input
                      type="time"
                      value={newRoutine.start}
                      onChange={(e) => setNewRoutine(prev => ({ ...prev, start: e.target.value }))}
                      className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                    />
                    <input
                      type="time"
                      value={newRoutine.end}
                      onChange={(e) => setNewRoutine(prev => ({ ...prev, end: e.target.value }))}
                      className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="할 일"
                      value={newRoutine.task}
                      onChange={(e) => setNewRoutine(prev => ({ ...prev, task: e.target.value }))}
                      className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={() => {
                      if (!newRoutine.task.trim()) return;
                      const newR: Routine = {
                        id: Date.now().toString(),
                        day: selectedDay,
                        done: false,
                        rating: 0,
                        ...newRoutine
                      };
                      setRoutines(prev => [...prev, newR]);
                      setNewRoutine({ start: "08:00", end: "09:00", task: "" });
                      setToast({ emoji: "✅", message: "루틴이 추가되었습니다!" });
                    }}
                    className="mt-3 w-full py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition"
                  >
                    추가하기
                  </button>
                </div>

                {/* 루틴 목록 */}
                <DragDropContext onDragEnd={onDragEnd}>
                  <Droppable droppableId="routines">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                        {routines
                          .filter(r => r.day === selectedDay)
                          .map((routine, index) => (
                            <Draggable key={routine.id} draggableId={routine.id} index={index}>
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`group ${
                                    routine.isHabit 
                                      ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200' 
                                      : 'bg-gray-50 border-gray-200'
                                  } border-2 rounded-xl p-4 transition hover:shadow-md`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 flex-1">
                                      {/* 드래그 핸들 */}
                                      <div className="text-gray-400 cursor-move">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                                        </svg>
                                      </div>

                                      {/* 체크박스 */}
                                      <input
                                        type="checkbox"
                                        checked={routine.done}
                                        onChange={(e) => {
                                          e.stopPropagation();
                                          setRoutines(prev => prev.map(r => 
                                            r.id === routine.id ? { ...r, done: !r.done } : r
                                          ));
                                        }}
                                        className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                                      />

                                      {/* 시간 */}
                                      {!routine.isHabit && (
                                        <span className="text-sm text-gray-500 font-medium">
                                          {routine.start} - {routine.end}
                                        </span>
                                      )}

                                      {/* 이모지 */}
                                      {routine.emoji && <span className="text-xl">{routine.emoji}</span>}

                                      {/* 할 일 */}
                                      {editingRoutineId === routine.id ? (
                                        <input
                                          type="text"
                                          value={editingTask}
                                          onChange={(e) => setEditingTask(e.target.value)}
                                          onBlur={() => handleRoutineEdit(routine.id, editingTask)}
                                          onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                              handleRoutineEdit(routine.id, editingTask);
                                            }
                                          }}
                                          className="flex-1 px-2 py-1 border rounded"
                                          autoFocus
                                        />
                                      ) : (
                                        <span 
                                          className="flex-1 font-medium cursor-pointer"
                                          onClick={() => {
                                            setEditingRoutineId(routine.id);
                                            setEditingTask(routine.task);
                                          }}
                                        >
                                          {routine.task}
                                        </span>
                                      )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                      {/* 만족도 평가 */}
                                      {routine.done && (
                                        <div className="flex items-center gap-1">
                                          {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                              key={star}
                                              onClick={() => handleRatingChange(routine.id, star)}
                                              className={`text-lg transition ${
                                                star <= routine.rating 
                                                  ? 'text-yellow-400' 
                                                  : 'text-gray-300 hover:text-yellow-300'
                                              }`}
                                            >
                                              ★
                                            </button>
                                          ))}
                                        </div>
                                      )}

                                      {/* 삭제 버튼 */}
                                      <button
                                        onClick={() => handleRoutineDelete(routine.id)}
                                        className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition"
                                      >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                      </button>
                                    </div>
                                  </div>

                                  {/* 습관 추가 버튼 */}
                                  {!routine.isHabit && (
                                    <button
                                      onClick={() => handleFetchHabitSuggestions(index + 1)}
                                      className="mt-3 w-full py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-lg text-sm font-medium hover:from-purple-200 hover:to-pink-200 transition"
                                    >
                                      + 습관 추가
                                    </button>
                                  )}
                                </div>
                              )}
                            </Draggable>
                          ))}
                        {provided.placeholder}

                        {/* 습관 추천 팝업 */}
                        {habitSuggestionIdx !== null && (
                          <div className="p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl">
                            <div className="flex justify-between items-center mb-3">
                              <h4 className="font-semibold text-purple-700">추천 습관</h4>
                              <button
                                onClick={() => {
                                  setHabitSuggestionIdx(null);
                                  setAiHabitSuggestions([]);
                                }}
                                className="text-gray-500 hover:text-gray-700"
                              >
                                ✕
                              </button>
                            </div>
                            {aiHabitLoading ? (
                              <p className="text-center text-gray-500">AI가 습관을 추천하는 중...</p>
                            ) : (
                              <div className="grid grid-cols-2 gap-2">
                                {(aiHabitSuggestions.length > 0 ? aiHabitSuggestions : habitCandidates).map((habit, i) => (
                                  <button
                                    key={i}
                                    onClick={() => addHabitBetween(habitSuggestionIdx, habit)}
                                    className="py-2 px-3 bg-white rounded-lg text-sm font-medium hover:shadow-md transition"
                                  >
                                    {habit}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>

                {/* 알림 설정 */}
                <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                  <button
                    onClick={() => setShowNotificationSettings(!showNotificationSettings)}
                    className="flex items-center gap-2 text-gray-700 font-medium"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    알림 설정
                  </button>
                  
                  {showNotificationSettings && (
                    <div className="mt-3 space-y-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={notificationEnabled}
                          onChange={(e) => setNotificationEnabled(e.target.checked)}
                          className="w-4 h-4 text-indigo-600 rounded"
                        />
                        <span className="text-sm">루틴 시작 시간에 알림 받기</span>
                      </label>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 통계 탭 */}
            {selectedTab === "tracker" && (
              <div className="space-y-6">
                {/* 히트맵 캘린더 */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">출석률 캘린더</h3>
                  <div className="overflow-x-auto">
                    <CalendarHeatmap
                      startDate={new Date(new Date().setMonth(new Date().getMonth() - 3))}
                      endDate={new Date()}
                      values={attendanceData}
                      classForValue={(value) => {
                        if (!value || value.count === 0) return 'heat-0';
                        if (value.count === 1) return 'heat-1';
                        if (value.count === 2) return 'heat-2';
                        if (value.count === 3) return 'heat-3';
                        if (value.count === 4) return 'heat-4';
                        return 'heat-5';
                      }}
                      showWeekdayLabels
                      gutterSize={2}
                    />
                  </div>
                </div>

                {/* 통계 차트들 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 요일별 완료율 */}
                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">요일별 완료율</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={completionData}>
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px'
                          }}
                        />
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
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
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

                {/* 다운로드 버튼 */}
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
            )}

            {/* 오늘 일기 탭 */}
            {selectedTab === "today-diary" && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">
                  오늘의 그림일기
                </h2>

                {topRoutine ? (
                  <div className="space-y-6">
                    {diaryLoading ? (
                      <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
                        <p className="mt-4 text-gray-500">AI가 그림을 그리고 있어요...</p>
                      </div>
                    ) : diaryError ? (
                      <div className="text-center py-8">
                        <p className="text-red-500">{diaryError}</p>
                      </div>
                    ) : diaryImageUrl ? (
                      <div className="relative">
                        <Image
                          src={diaryImageUrl}
                          alt="오늘의 그림일기"
                          width={512}
                          height={512}
                          className="rounded-xl shadow-xl mx-auto"
                          style={{ objectFit: "cover" }}
                        />
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1">
                          <span className="text-yellow-500 font-bold">★ {topRoutine.rating}</span>
                        </div>
                      </div>
                    ) : null}

                    <div className="text-center space-y-2">
                      <h3 className="text-xl font-semibold">
                        {topRoutine.emoji} {topRoutine.task}
                      </h3>
                      <p className="text-gray-500">
                        오늘의 최고 만족도 활동
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-indigo-600">
                          {routines.filter(r => r.done).length}
                        </p>
                        <p className="text-sm text-gray-500">완료한 활동</p>
                      </div>
                      <div className="text-center">
                        <p className="text-3xl font-bold text-purple-600">
                          {Math.round(routines.filter(r => r.done).reduce((acc, r) => acc + r.rating, 0) / routines.filter(r => r.done).length) || 0}
                        </p>
                        <p className="text-sm text-gray-500">평균 만족도</p>
                      </div>
                      <div className="text-center">
                        <p className="text-3xl font-bold text-pink-600">
                          {routines.filter(r => r.done && r.isHabit).length}
                        </p>
                        <p className="text-sm text-gray-500">완료한 습관</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                      <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <p className="text-gray-500">오늘 완료한 활동이 없어요.</p>
                    <p className="text-gray-400 text-sm mt-2">활동을 완료하고 만족도를 평가해보세요!</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <style jsx global>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }

        /* 히트맵 스타일 개선 */
        .heat-0 { fill: #f3f4f6; }
        .heat-1 { fill: #ddd6fe; }
        .heat-2 { fill: #c4b5fd; }
        .heat-3 { fill: #a78bfa; }
        .heat-4 { fill: #8b5cf6; }
        .heat-5 { fill: #7c3aed; }

        .react-calendar-heatmap rect:hover {
          stroke: #6366f1;
          stroke-width: 2;
        }

        .react-calendar-heatmap-month-label {
          font-size: 12px;
          fill: #6b7280;
        }

        .react-calendar-heatmap-weekday-label {
          font-size: 11px;
          fill: #6b7280;
        }
      `}</style>
    </div>
  );
}
