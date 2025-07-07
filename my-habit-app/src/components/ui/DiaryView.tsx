'use client';
import React from 'react';
import Image from 'next/image';

type Routine = {
  task: string;
  rating: number;
  emoji?: string;
};

type DiaryViewProps = {
  topRoutine: Routine | null;
  diaryLoading: boolean;
  diaryError: string | null;
  diaryImageUrl: string | null;
  selectedDay: string; // 예: '월', '화', ...
};

export default function DiaryView({
  topRoutine,
  diaryLoading,
  diaryError,
  diaryImageUrl,
  selectedDay
}: DiaryViewProps) {
  if (!topRoutine) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{selectedDay}요일에 완료한 활동이 없어요.</p>
        <p className="text-gray-400 text-sm mt-2">활동을 완료하고 만족도를 평가해보세요!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {diaryLoading ? (
        <div className="text-center py-12">
          <div className="inline-block
