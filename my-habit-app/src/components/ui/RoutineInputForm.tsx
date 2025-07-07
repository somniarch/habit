// src/components/ui/RoutineInputForm.tsx

'use client';

import React, { useState } from 'react';

type Props = {
  selectedDay: string;
  onAdd: (routine: {
    id: string;
    day: string;
    start: string;
    end: string;
    task: string;
    done: boolean;
    rating: number;
  }) => void;
};

export default function RoutineInputForm({ selectedDay, onAdd }: Props) {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [task, setTask] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      id: Date.now().toString(),
      day: selectedDay,
      start,
      end,
      task,
      done: false,
      rating: 0,
    });

    // 초기화
    setStart('');
    setEnd('');
    setTask('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2 bg-white p-4 rounded-xl shadow">
      <div className="flex gap-2">
        <input
          type="time"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          className="flex-1 p-2 border rounded"
          required
        />
        <input
          type="time"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          className="flex-1 p-2 border rounded"
          required
        />
      </div>
      <input
        type="text"
        value={task}
        onChange={(e) => setTask(e.target.value)}
        placeholder="루틴 입력"
        className="w-full p-2 border rounded"
        required
      />
      <button
        type="submit"
        className="w-full bg-black text-white py-2 rounded hover:opacity-90"
      >
        추가하기
      </button>
    </form>
  );
}
