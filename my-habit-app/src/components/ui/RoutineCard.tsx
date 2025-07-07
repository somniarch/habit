'use client';
import React from 'react';

type RoutineCardProps = {
  routine: any;
  onUpdate: (routine: any) => void;
  onDelete: (id: string) => void;
  onRate: (id: string, rating: number) => void;
  onEdit: (routine: any) => void;
};

export default function RoutineCard({
  routine,
  onUpdate,
  onDelete,
  onRate,
  onEdit
}: RoutineCardProps) {
  return (
    <div className="routine-card">
      {/* 루틴 항목 UI */}
    </div>
  );
}
