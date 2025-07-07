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

type Props = {
  routine: Routine;
  onDelete: (id: string) => void;
  onRate: (id: string, rating: number) => void;
  onSuggestHabit: (id: string) => void;
  aiHabitSuggestions: string[];
  isLoading: boolean;
  isActive: boolean;
  onAddHabit: (id: string, habit: string) => void;
};

export default function RoutineCard({
  routine,
  onDelete,
  onRate,
  onSuggestHabit,
  aiHabitSuggestions,
  isLoading,
  isActive,
  onAddHabit,
}: Props) {
  if (!routine) return null;

  const displayTask = routine.isHabit
    ? routine.task?.replace(/\(\s*습관\s*\)-?/, '')
    : routine.task;

  return (
    <div className="bg-white p-4 rounded-xl shadow space-y-3">
      <div className="flex justify-between items-center">
        <div className="text-sm font-medium">
          <span className="font-bold text-base">
            [{routine.start} - {routine.end}]
          </span>{' '}
          {displayTask} {routine.done && '✔'}
        </div>
        <input
          type="checkbox"
          checked={routine.done}
          readOnly
          className="w-5 h-5 accent-blue-500"
        />
      </div>

      <div className="flex flex-wrap gap-1">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
          <button
            key={num}
            onClick={() => onRate(routine.id, num)}
            className={`w-8 h-8 rounded text-sm font-medium ${
              routine.rating === num
                ? 'bg-black text-white'
                : 'bg-gray-200 text-black'
            }`}
          >
            {num}
          </button>
        ))}
      </div>

      <div>
        <button
          onClick={() => onSuggestHabit(routine.id)}
          className="bg-gray-200 rounded-full px-4 py-1 text-sm hover:bg-gray-300"
        >
          + 습관 추천
        </button>
      </div>

      {isActive && (
        <div>
          {isLoading ? (
            <p className="text-gray-400 text-sm">AI가 습관을 추천 중입니다...</p>
          ) : aiHabitSuggestions.length === 0 ? (
            <p className="text-gray-400 text-sm">추천할 습관이 없습니다.</p>
          ) : (
            <div className="flex flex-wrap gap-2 mt-2">
              {aiHabitSuggestions.map((habit, i) => (
                <button
                  key={i}
                  onClick={() => onAddHabit(routine.id, habit)}
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
