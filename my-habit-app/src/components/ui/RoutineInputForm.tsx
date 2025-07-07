'use client';

import React, { useState } from 'react';

type Props = {
  onAddRoutine: (start: string, end: string, task: string) => void;
};

export default function RoutineInputForm({ onAddRoutine }: Props) {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [task, setTask] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!start || !end || !task.trim()) return;
    onAddRoutine(start, end, task.trim());
    setStart('');
    setEnd('');
    setTask('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 p-4 bg-white rounded-lg shadow-sm">
      <div className="flex gap-2">
        <input
          type="time"
          value={start}
          onChange={e => setStart(e.target.value)}
          className="w-full p-2 border rounded text-sm"
          required
        />
        <input
          type="time"
          value={end}
          onChange={e => setEnd(e.target.value)}
          className="w-full p-2 border rounded text-sm"
          required
        />
      </div>
      <input
        type="text"
        placeholder="루틴 또는 습관 내용 입력"
        value={task}
        onChange={e => setTask(e.target.value)}
        className="w-full p-2 border rounded text-sm"
        required
      />
      <button
        type="submit"
        className="self-end px-4 py-2 text-white bg-black rounded text-sm"
      >
        추가
      </button>
    </form>
  );
}
