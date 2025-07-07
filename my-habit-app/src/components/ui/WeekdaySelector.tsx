'use client';

import React from 'react';

type Props = {
  selectedDay: string;
  onSelectDay: (day: string) => void;
  weekInfo: string;
  onPrevWeek: () => void;
  onNextWeek: () => void;
};

const days = ['월', '화', '수', '목', '금', '토', '일'];

export default function WeekdaySelector({
  selectedDay,
  onSelectDay,
  weekInfo,
  onPrevWeek,
  onNextWeek,
}: Props) {
  return (
    <div className="space-y-3 text-center">
      {/* 상단 주차 이동 */}
      <div className="flex items-center justify-center gap-4 font-medium text-sm text-gray-600">
        <button onClick={onPrevWeek} className="text-lg">{'<'}</button>
        <span className="text-sm tracking-tight">{weekInfo}</span>
        <button onClick={onNextWeek} className="text-lg">{'>'}</button>
      </div>

      {/* 요일 선택 */}
      <div className="flex justify-center gap-3">
        {days.map((day, i) => (
          <div key={day} className="flex flex-col items-center text-sm text-gray-500">
            <span className="text-xs">{`07/${7 + i}`}</span>
            <button
              onClick={() => onSelectDay(day)}
              className={`w-8 h-8 rounded-full transition-all duration-200 font-medium ${
                selectedDay === day
                  ? 'bg-black text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {day}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
