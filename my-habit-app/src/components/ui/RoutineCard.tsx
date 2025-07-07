'use client';
import React from 'react';

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

type RoutineCardProps = {
  routine: Routine;
  index: number;
  onDelete: (id: string) => void;
  onRate: (id: string, rating: number) => void;

  onSuggestHabit: (index: number) => void;
  aiHabitSuggestions: string[];
  isLoading: boolean;
  isActive: boolean;
  onAddHabit: (index: number, habit: string) => void;
};

export default function RoutineCard({
  routine,
  index,
  onDelete,
  onRate,
  onSuggestHabit,
  aiHabitSuggestions,
  isLoading,
  isActive,
  onAddHabit
}: RoutineCardProps) {
  const displayTask = routine.isHabit
    ? routine.task.replace(/\(\s*습관\s*\)-?/, '')
    : routine.task;

  const bgStyle = routine.isHabit
    ? { backgroundColor: "#e3f2fd", padding: "6px 12px", borderRadius: "9999px" }
    : {};

  return (
    <div className="border rounded p-4 mt-2 space-y-2" style={bgStyle}>
      <div className="flex justify-between items-center">
        <div className="flex flex-col">
          <span className="font-semibold">{routine.start} - {routine.end}</span>
          <span>{displayTask}</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            max={10}
            value={routine.rating}
            onChange={(e) => onRate(routine.id, Number(e.target.value))}
            className="w-16 border px-2 py-1 rounded text-sm"
          />
          <button
            onClick={() => onDelete(routine.id)}
            className="text-red-500 text-sm"
          >
            삭제
          </button>
        </div>
      </div>

      {/* AI 추천 기능 삽입 */}
      <div className="flex justify-between items-center text-sm text-blue-600 mt-1">
        <button onClick={() => onSuggestHabit(index)}>
          + 이 위치에 웰빙 습관 추천받기
        </button>
      </div>

      {isActive && (
        <div className="mt-2 space-y-2">
          {isLoading ? (
            <p className="text-gray-500">AI가 습관을 추천 중입니다...</p>
          ) : aiHabitSuggestions.length === 0 ? (
            <p className="text-gray-400">추천할 습관이 없습니다.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {aiHabitSuggestions.map((habit, i) => (
                <button
                  key={i}
                  onClick={() => onAddHabit(index, habit)}
                  className="bg-gray-200 rounded-full px-3 py-1 text-sm hover:bg-gray-300"
                >
                  {habit}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
