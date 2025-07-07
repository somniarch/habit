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
  onRate: (id: string, rating: number) => void;
  onDelete: (id: string) => void;
};

export default function RoutineCard({
  routine,
  onRate,
  onDelete
}: RoutineCardProps) {
  return (
    <div className="border rounded p-4 mt-2 space-y-2">
      <div className="flex justify-between items-center">
        <div className="flex flex-col">
          <span className="font-semibold">{routine.start} - {routine.end}</span>
          <span>{routine.task}</span>
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
    </div>
  );
}

