import React from 'react';

export default function RoutineCard({ routine, onUpdate, onDelete, onRate, onEdit }: any) {
  return (
    <div className="routine-card">{/* 루틴 항목 UI */}</div>
  );
}

/* HabitSuggestion.tsx */
import React from 'react';

export default function HabitSuggestion({
  aiHabitSuggestions, habitCandidates,
  habitSuggestionIdx, addHabitBetween,
  aiHabitLoading, onClose
}: any) {
  return (
    <div className="habit-suggestions">{/* 습관 추천 UI */}</div>
  );
}

