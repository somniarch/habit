'use client';

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";

type Routine = {
  day: string;
  start: string;
  end: string;
  task: string;
  done: boolean;
  rating: number;
  isHabit?: boolean;
};

const habitCandidates = ["깊은 숨 2분", "물 한잔", "짧은 산책", "스트레칭"];
const fullDays = ["월", "화", "수", "목", "금", "토", "일"];
const dayLetters = fullDays.map(d => d[0]);

const habitEmojis: Record<string, string> = {
  숨: "💨",
  산책: "🚶‍♂️",
  스트레칭: "🤸‍♀️",
  물: "💧",
  명상: "🧘‍♂️",
  운동: "🏃‍♂️",
  독서: "📚",
  휴식: "😌",
};

function cleanAndDescribeHabits(rawLines: string[]): { habit: string; description: string }[] {
  return rawLines
    .map(line => {
      // ** 제거 및 (습관)- 등 불필요 문자 제거
      let habit = line.replace(/\*\*/g, "").trim();
      habit = habit.replace(/^(\d+분?|[0-9]+[가-힣]+)?\s*\(?습관\)?-?\s*/, "").trim();

      if (habit.length > 30) habit = habit.slice(0, 27) + "...";

      const description = "집중과 건강에 도움이 되는 습관";

      let emoji = "🎯";
      for (const key in habitEmojis) {
        if (habit.includes(key)) {
          emoji = habitEmojis[key];
          break;
        }
      }
      return { habit, description: `${emoji} ${description}` };
    })
    .filter(({ habit }) => habit.length > 0);
}

function Toast({ message, emoji, onClose }: { message: string; emoji: string; onClose: () => void }) {
  React.useEffect(() => {
    const timer = setTimeout(() => onClose(), 2500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-8 right-8 bg-black text-white px-4 py-2 rounded shadow-lg flex items-center gap-2 z-50">
      <span>{emoji}</span>
      <span>{message}</span>
    </div>
  );
}

function formatWeekLabel(date: Date, weekNum: number) {
  const yy = String(date.getFullYear()).slice(2);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yy}.${mm}.${dd}.W${weekNum}`;
}

function formatDiaryDate(day: string, baseDate: Date, dayIndex: number) {
  const firstDayOfWeek = new Date(baseDate);
  firstDayOfWeek.setDate(baseDate.getDate() - baseDate.getDay() + dayIndex + 1);
  const yy = String(firstDayOfWeek.getFullYear()).slice(2);
  const mm = String(firstDayOfWeek.getMonth() + 1).padStart(2, "0");
  const dd = String(firstDayOfWeek.getDate()).padStart(2, "0");
  return `${yy}.${mm}.${dd}(${day})`;
}

function formatMonthDay(date: Date, dayIndex: number) {
  const firstDayOfWeek = new Date(date);
  firstDayOfWeek.setDate(date.getDate() - date.getDay() + dayIndex + 1);
  const mm = String(firstDayOfWeek.getMonth() + 1).padStart(2, "0");
  const dd = String(firstDayOfWeek.getDate()).padStart(2, "0");
  return `${mm}/${dd}`;
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
  const diaryLogsKey = `todayDiaryLogs_${userId}`;

  const [currentDate, setCurrentDate] = useState(new Date());
  const [weekNum, setWeekNum] = useState(1);
  const [selectedDay, setSelectedDay] = useState(fullDays[0]);
  const [selectedTab, setSelectedTab] = useState<"routine-habit" | "tracker" | "today-diary">("routine-habit");

  const [routines, setRoutines] = useState<Routine[]>(() => {
    if (typeof window === "undefined" || !userId) return [];
    const saved = localStorage.getItem(routinesKey);
    return saved ? JSON.parse(saved) : [];
  });

  const [newRoutine, setNewRoutine] = useState({ start: "08:00", end: "09:00", task: "" });
  const [habitSuggestionIdx, setHabitSuggestionIdx] = useState<number | null>(null);
  const [todayDiaryLogs, setTodayDiaryLogs] = useState<Record<string, string[]>>(() => {
    if (typeof window === "undefined" || !userId) return {};
    const saved = localStorage.getItem(diaryLogsKey);
    return saved ? JSON.parse(saved) : {};
  });

  const [aiHabitSuggestions, setAiHabitSuggestions] = useState<string[]>([]);
  const [aiHabitLoading, setAiHabitLoading] = useState(false);
  const [aiHabitError, setAiHabitError] = useState<string | null>(null);

  // 유저 목록 가져오기
  const getRegisteredUsers = (): { id: string; pw: string }[] => {
    if (typeof window === "undefined") return [];
    const json = localStorage.getItem(storedUsersKey);
    if (!json) return [];
    try {
      return JSON.parse(json);
    } catch {
      return [];
    }
  };

  // 유저 목록 저장
  const saveRegisteredUsers = (users: { id: string; pw: string }[]) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(storedUsersKey, JSON.stringify(users));
  };

  // 사용자 로그인 처리
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
        setToast({ emoji: "✅", message: "관리자 로그인 성공!" });
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
      setToast({ emoji: "✅", message: "로그인 성공!" });
    } else {
      setLoginError("등록된 사용자 ID 또는 비밀번호가 올바르지 않습니다.");
      setToast({ emoji: "⚠️", message: "로그인 실패" });
    }
  };

  // 로그아웃 처리
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserId("");
    setUserPw("");
    setIsAdmin(false);
    setAdminModeActive(false);
    setToast({ emoji: "👋", message: "로그아웃 되었습니다." });
  };

  // 사용자 등록 처리 (관리자 전용)
  const [newUserId, setNewUserId] = useState("");
  const [newUserPw, setNewUserPw] = useState("");
  const [userAddError, setUserAddError] = useState("");

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

  useEffect(() => {
    if (userId) localStorage.setItem(routinesKey, JSON.stringify(routines));
  }, [routines, routinesKey, userId]);

  useEffect(() => {
    if (userId) localStorage.setItem(diaryLogsKey, JSON.stringify(todayDiaryLogs));
  }, [todayDiaryLogs, diaryLogsKey, userId]);

  // 드래그앤드롭 완료시 순서 변경 처리
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(routines);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);
    setRoutines(items);
    if (userId) localStorage.setItem(routinesKey, JSON.stringify(items));
  };

  // 삭제 확인 모달 처리 (루틴 및 습관 아이템 클릭시)
  const handleRoutineDeleteConfirm = (idx: number) => {
    if (window.confirm("삭제하시겠습니까?")) {
      const copy = [...routines];
      copy.splice(idx, 1);
      setRoutines(copy);
      if (userId) localStorage.setItem(routinesKey, JSON.stringify(copy));
      setToast({ emoji: "🗑️", message: "루틴이 삭제되었습니다." });
    }
  };

  // GPT 습관 추천 요청 및 정제
  async function fetchHabitSuggestions(prevTask: string | null, nextTask: string | null): Promise<string[]> {
    const context = [prevTask, nextTask].filter(Boolean).join(", ");
    if (!context) return habitCandidates.slice(0, 3);

    try {
      setAiHabitLoading(true);
      setAiHabitError(null);
      const prompt = `사용자의 이전 행동과 다음 행동: ${context}\n이 행동들 사이에 자연스럽게 연결할 수 있는 3개 이상의 5분 이내에 할 수 있는 웰빙 습관을 명사형으로 추천해 주세요. 각 습관은 30자 이내로 간결하며, 구체적인 행동과 시간(몇 분, 몇 회)을 포함하고, 친절한 설명도 포함하세요. 예시: '💨 2분 깊은 숨쉬기 - 긴장 완화 및 집중력 향상'`;

      const res = await fetch("/openai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();

      if (!res.ok) {
        setAiHabitError("AI 추천 불가");
        return habitCandidates.slice(0, 3);
      }

      // 정제 후 반환
      const lines = data.result
        .split(/\r?\n/)
        .filter((line: string) => line.trim() !== "")
        .map((line: string) => line.replace(/^[\d\.\-\)\s]+/, "").trim());
      const cleaned = cleanAndDescribeHabits(lines);
      return cleaned.map(({ habit, description }) => `${habit} - ${description}`);
    } catch {
      setAiHabitError("추천 중 오류 발생");
      return habitCandidates.slice(0, 3);
    } finally {
      setAiHabitLoading(false);
    }
  }

  const handleFetchHabitSuggestions = async (idx: number) => {
    if (!isLoggedIn) {
      alert("로그인 후 이용해주세요.");
      return;
    }
    const prevTask = idx > 0 ? routines[idx - 1].task : null;
    const nextTask = idx < routines.length - 1 ? routines[idx + 1].task : null;

    const suggestions = await fetchHabitSuggestions(prevTask, nextTask);
    setAiHabitSuggestions(suggestions);
    setHabitSuggestionIdx(idx);
  };

  // 추가 습관 삽입 (앞 '(습관)-' 제거 + 스타일 적용)
  const addHabitBetween = (idx: number, habit: string) => {
    if (!isLoggedIn) return alert("로그인 후 이용해주세요.");
    const cleanedHabit = habit.replace(/\(\s*습관\s*\)-?/, "").trim();
    const habitRoutine: Routine = {
      day: selectedDay,
      start: "",
      end: "",
      task: cleanedHabit,
      done: false,
      rating: 0,
      isHabit: true,
    };
    const copy = [...routines];
    copy.splice(idx + 1, 0, habitRoutine);
    setRoutines(copy);
    setHabitSuggestionIdx(null);
  };

  // 통계용 데이터 계산 (완료율, 만족도 등)
  const filteredRoutines = routines.filter(() => true);

  const completionData = fullDays.map(day => {
    const filteredDay = filteredRoutines.filter(r => r.day === day);
    const total = filteredDay.length;
    const done = filteredDay.filter(r => r.done).length;
    return { name: day, Completion: total ? Math.round((done / total) * 100) : 0 };
  });

  const satisfactionData = fullDays.map(day => {
    const filteredDay = filteredRoutines.filter(r => r.day === day && r.done);
    const avg = filteredDay.length ? Math.round(filteredDay.reduce((acc, cur) => acc + cur.rating, 0) / filteredDay.length) : 0;
    return { name: day, Satisfaction: avg };
  });

  // 출석률 계산 (최근 3개월 날짜별 완료 갯수 기반)
  const attendanceData = React.useMemo(() => {
    const data: { date: string; count: number }[] = [];
    const startDate = new Date(currentDate);
    startDate.setMonth(startDate.getMonth() - 3);
    for (let i = 0; i < 90; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dateStr = date.toISOString().slice(0, 10);
      const dayChar = fullDays[date.getDay() === 0 ? 6 : date.getDay() - 1];
      const doneCount = routines.filter(r => r.day === dayChar && r.done).length;
      data.push({ date: dateStr, count: doneCount });
    }
    return data;
  }, [routines, currentDate]);

  // CSV 다운로드 (루틴 + 출석률 포함)
  function downloadCSV() {
    if (routines.length === 0) {
      alert("내보낼 데이터가 없습니다.");
      return;
    }

    const headers = ["UserID", "Day", "Date", "Task", "Done", "Rating", "IsHabit"];
    const rows = routines.map(({ day, task, done, rating, isHabit }) => {
      const dateStr = formatDiaryDate(day, currentDate, fullDays.indexOf(day));
      return [
        userId,
        day,
        dateStr,
        `"${task.replace(/"/g, '""')}"`,
        done ? "Yes" : "No",
        rating.toString(),
        isHabit ? "Yes" : "No",
      ];
    });

    const attendanceHeaders = ["Date", "AttendanceCount"];
    const attendanceRows = attendanceData.map(({ date, count }) => [date, count.toString()]);

    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.join(",")),
      "",
      attendanceHeaders.join(","),
      ...attendanceRows.map(r => r.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "habit_tracking_with_stats.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6 font-sans relative min-h-screen pb-8">
      {toast && <Toast emoji={toast.emoji} message={toast.message} onClose={() => setToast(null)} />}

      {!isLoggedIn ? (
        <div className="max-w-sm mx-auto p-6 mt-20 border rounded shadow space-y-4 font-sans">
          <h2 className="text-xl font-semibold text-center">로그인 해주세요</h2>
          <input
            type="text"
            placeholder="아이디"
            value={userId}
            onChange={e => setUserId(e.target.value)}
            className="border rounded px-3 py-2 w-full"
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={userPw}
            onChange={e => setUserPw(e.target.value)}
            className="border rounded px-3 py-2 w-full"
          />
          <div className="flex justify-between items-center mt-1">
            <button
              onClick={() => {
                setAdminModeActive(!adminModeActive);
                setLoginError("");
                setUserId("");
                setUserPw("");
                setUserAddError("");
              }}
              className="text-sm text-blue-600 hover:underline"
            >
              {adminModeActive ? "일반 로그인 모드로 전환" : "관리자 모드"}
            </button>
            <button
              onClick={handleLogin}
              className="bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700 transition"
            >
              로그인
            </button>
          </div>
          {loginError && <p className="text-red-600">{loginError}</p>}
          {adminModeActive && (
            <div className="mt-4 border rounded p-4 bg-gray-50">
              <h3 className="font-semibold mb-2">사용자 등록 (관리자 전용)</h3>
              <input
                type="text"
                placeholder="새 사용자 아이디"
                value={newUserId}
                onChange={e => setNewUserId(e.target.value)}
                className="border rounded px-3 py-2 w-full mb-2"
              />
              <input
                type="password"
                placeholder="새 사용자 비밀번호"
                value={newUserPw}
                onChange={e => setNewUserPw(e.target.value)}
                className="border rounded px-3 py-2 w-full mb-2"
              />
              {userAddError && <p className="text-red-600 mb-2">{userAddError}</p>}
              <button
                onClick={handleAddUser}
                className="bg-green-600 text-white px-4 py-2 rounded font-semibold hover:bg-green-700 transition"
              >
                사용자 등록
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="flex justify-end gap-2">
            <span className="text-sm text-gray-600">안녕하세요, {userId}님</span>
            <button
              onClick={handleLogout}
              className="text-red-600 underline text-sm hover:text-red-800 transition"
            >
              로그아웃
            </button>
          </div>

          {isAdmin && (
            <button className="mb-4 px-4 py-2 bg-red-600 text-white rounded font-semibold">
              관리자 모드
            </button>
          )}

          <div className="flex justify-center items-center gap-4">
            <button aria-label="Previous Week" onClick={() => setWeekNum(w => Math.max(1, w - 1))} className="px-3 py-1 text-lg font-bold">
              &lt;
            </button>
            <span className="font-semibold text-lg">{formatWeekLabel(currentDate, weekNum)}</span>
            <button aria-label="Next Week" onClick={() => setWeekNum(w => w + 1)} className="px-3 py-1 text-lg font-bold">
              &gt;
            </button>
          </div>

          <div className="flex justify-center gap-3 mt-2">
            {dayLetters.map((letter, idx) => (
              <div key={letter + idx} className="flex flex-col items-center">
                <span className="text-xs text-gray-500">{formatMonthDay(currentDate, idx)}</span>
                <button
                  onClick={() => setSelectedDay(fullDays[idx])}
                  className={`rounded-full w-8 h-8 flex items-center justify-center font-semibold ${
                    selectedDay === fullDays[idx] ? "bg-black text-white" : "bg-gray-300 text-black"
                  }`}
                  aria-label={fullDays[idx]}
                >
                  {letter}
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-4 mt-4">
            <button
              onClick={() => setSelectedTab("routine-habit")}
              className={`rounded-full px-5 py-2 font-semibold transition ${
                selectedTab === "routine-habit" ? "bg-black text-white" : "bg-gray-300 text-black"
              }`}
            >
              루틴 및 습관
            </button>
            <button
              onClick={() => setSelectedTab("tracker")}
              className={`rounded-full px-5 py-2 font-semibold transition ${
                selectedTab === "tracker" ? "bg-black text-white" : "bg-gray-300 text-black"
              }`}
            >
              통계
            </button>
            <button
              onClick={() => setSelectedTab("today-diary")}
              className={`rounded-full px-5 py-2 font-semibold transition ${
                selectedTab === "today-diary" ? "bg-black text-white" : "bg-gray-300 text-black"
              }`}
            >
              오늘 일기
            </button>
          </div>

          {selectedTab === "routine-habit" && (
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="routines">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="mt-4">
                    {/* 새 루틴 추가 폼 */}
                    <div className="flex flex-col gap-2 mt-4">
                      <input
                        type="time"
                        step={3600}
                        value={newRoutine.start}
                        onChange={(e) => setNewRoutine(prev => ({ ...prev, start: e.target.value }))}
                        className="border rounded px-2 py-1"
                      />
                      <input
                        type="time"
                        step={3600}
                        value={newRoutine.end}
                        onChange={(e) => setNewRoutine(prev => ({ ...prev, end: e.target.value }))}
                        className="border rounded px-2 py-1"
                      />
                      <input
                        type="text"
                        placeholder="루틴 또는 습관 추가"
                        value={newRoutine.task}
                        onChange={(e) => setNewRoutine(prev => ({ ...prev, task: e.target.value }))}
                        className="border rounded px-2 py-1"
                      />
                      <button
                        onClick={() => {
                          if (!isLoggedIn) return alert("로그인 후 이용해주세요.");
                          if (!newRoutine.task.trim()) return;
                          setRoutines(prev => [...prev, { day: selectedDay, done: false, rating: 0, ...newRoutine }]);
                          setNewRoutine({ start: "08:00", end: "09:00", task: "" });
                        }}
                        className="rounded-full bg-black text-white py-2 mt-2 w-full font-semibold hover:bg-gray-800 transition"
                      >
                        추가
                      </button>
                    </div>

                    {/* 루틴 리스트 */}
                    {routines
                      .filter(r => r.day === selectedDay)
                      .map((routine, idx) => {
                        const displayTask = routine.isHabit
                          ? routine.task.replace(/\(\s*습관\s*\)-?/, "")
                          : routine.task;

                        const backgroundStyle = routine.isHabit
                          ? { backgroundColor: "#e9ecef", padding: "6px 12px", borderRadius: "9999px" }
                          : {};

                        return (
                          <Draggable key={`${routine.task}-${idx}`} draggableId={`${routine.task}-${idx}`} index={idx}>
                            {(provided) => (
                              <div
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                ref={provided.innerRef}
                                className="border rounded p-4 flex justify-between items-center mt-2 cursor-pointer"
                                style={provided.draggableProps.style}
                                onClick={(e) => {
                                  // 체크박스 클릭 방지
                                  if ((e.target as HTMLElement).tagName !== "INPUT") {
                                    handleRoutineDeleteConfirm(idx);
                                  }
                                }}
                              >
                                <div style={backgroundStyle} className="flex items-center gap-2 font-semibold">
                                  <span>[{routine.start} - {routine.end}]</span>
                                  <span>{displayTask}</span>
                                </div>
                                <input
                                  type="checkbox"
                                  checked={routine.done}
                                  onChange={(e) => {
                                    if (!isLoggedIn) return alert("로그인 후 이용해주세요.");
                                    const copy = [...routines];
                                    copy[idx].done = !copy[idx].done;
                                    setRoutines(copy);
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                    {provided.placeholder}

                    {/* 습관 추천 영역 */}
                    {habitSuggestionIdx !== null && (
                      <div className="p-3 bg-blue-50 rounded space-y-2 relative mt-4">
                        <button
                          onClick={() => {
                            setHabitSuggestionIdx(null);
                            setAiHabitSuggestions([]);
                            setAiHabitError(null);
                          }}
                          className="absolute top-1 right-1 px-2 py-0.5 rounded hover:bg-gray-300"
                          aria-label="습관 추천 닫기"
                        >
                          ✕
                        </button>
                        {aiHabitLoading ? (
                          <p>추천 생성 중...</p>
                        ) : aiHabitError ? (
                          <p className="text-red-600">{aiHabitError}</p>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {(aiHabitSuggestions.length > 0 ? aiHabitSuggestions : habitCandidates.slice(0, 3)).map((habit, i) => (
                              <button
                                key={i}
                                onClick={() => {
                                  addHabitBetween(habitSuggestionIdx, habit);
                                  setHabitSuggestionIdx(null);
                                  setAiHabitSuggestions([]);
                                  setAiHabitError(null);
                                }}
                                className="rounded-full bg-gray-300 px-3 py-1 hover:bg-gray-400"
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
          )}

          {selectedTab === "tracker" && (
            <div className="mt-4 space-y-6">
              <h2 className="font-semibold text-center">습관 통계</h2>

              {/* 출석률 캘린더 그래프 */}
              <div className="mb-6">
                <h3 className="font-semibold mb-2 cursor-pointer" onClick={() => {/* TODO: 기간 필터 변경 */}}>
                  출석률 캘린더 (최근 3개월)
                </h3>
                <CalendarHeatmap
                  startDate={new Date(new Date().setMonth(new Date().getMonth() - 3))}
                  endDate={new Date()}
                  values={attendanceData}
                  classForValue={(value) => {
                    if (!value || value.count === 0) return 'color-empty';
                    if (value.count >= 1) return 'color-scale-4';
                    if (value.count >= 0.5) return 'color-scale-2';
                    return 'color-scale-1';
                  }}
                  showWeekdayLabels
                />
              </div>

              {/* 완료율 및 만족도 그래프 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2 cursor-pointer" onClick={() => {/* TODO: 기간 필터 변경 */}}>
                    완료율 (%)
                  </h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={completionData}>
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Bar dataKey="Completion" fill="#0f172a" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 cursor-pointer" onClick={() => {/* TODO: 기간 필터 변경 */}}>
                    평균 만족도
                  </h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={satisfactionData}>
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 10]} />
                      <Tooltip />
                      <Bar dataKey="Satisfaction" fill="#0f172a" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="text-center mt-4">
                <button
                  onClick={downloadCSV}
                  className="rounded-full bg-black text-white px-6 py-2 font-semibold hover:bg-gray-800 transition"
                >
                  CSV 다운로드
                </button>
              </div>
            </div>
          )}

          {selectedTab === "today-diary" && (
            <div className="mt-4 space-y-6 max-h-[480px] overflow-y-auto border rounded p-4 bg-gray-50 pb-8">
              <h2 className="text-center font-semibold text-xl mb-4">오늘 일기</h2>
              {/* 오늘 일기 렌더링 부분 (생략 가능) */}
            </div>
          )}
        </>
      )}
    </div>
  );
}
