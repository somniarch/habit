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
    if (!start || !end || !task.trim()) return;

    onAdd({
      id: Date.now().toString(),
      day: selectedDay,
      start,
      end,
      task,
      done: false,
      rating: 0,
    });

    // 입력 초기화
    setStart('');
    setEnd('');
    setTask('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-4 rounded-xl shadow-md space-y-3"
    >
      <div className="flex gap-3">
        <input
          type="time"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          required
          className="w-full p-2 border rounded text-sm"
        />
        <input
          type="time"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          required
          className="w-full p-2 border rounded text-sm"
        />
      </div>

      <input
        type="text"
        value={task}
        onChange={(e) => setTask(e.target.value)}
        placeholder="오늘 할 루틴을 입력하세요"
        required
        className="w-full p-2 border rounded text-sm"
      />

      <button
        type="submit"
        className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition"
      >
        추가하기
      </button>
    </form>
  );
}
