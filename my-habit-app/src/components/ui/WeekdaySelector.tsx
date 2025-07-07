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
  onNextWeek
}: Props) {
  return (
    <div className="space-y-2 text-center">
      <div className="flex items-center justify-center gap-4 font-bold text-lg">
        <button onClick={onPrevWeek}>{'<'}</button>
        <span>{weekInfo}</span>
        <button onClick={onNextWeek}>{'>'}</button>
      </div>

      <div className="flex justify-center gap-2 text-sm text-gray-600">
        {days.map((day, i) => (
          <div key={day} className="flex flex-col items-center">
            <span className="text-xs">{`07/${7 + i}`}</span>
            <button
              onClick={() => onSelectDay(day)}
              className={`w-8 h-8 rounded-full ${
                selectedDay === day
                  ? 'bg-black text-white'
                  : 'bg-gray-200 text-black'
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
