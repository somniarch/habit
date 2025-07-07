// src/components/ui/DiaryView.tsx

'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { getImagePrompt } from '@/utils/getImagePrompt';

type Routine = {
  task: string;
  rating: number;
  emoji?: string;
};

type DiaryViewProps = {
  topRoutine: Routine | null;
  completedTasks: string[]; // ✅ 오늘 완료한 루틴+습관
  selectedDay: string;
};

export default function DiaryView({
  topRoutine,
  completedTasks,
  selectedDay,
}: DiaryViewProps) {
  const [diaryImageUrl, setDiaryImageUrl] = useState<string | null>(null);
  const [diaryText, setDiaryText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!topRoutine || completedTasks.length < 5) return;

    const fetchImageAndDiary = async () => {
      setLoading(true);

      try {
        // ✅ 프롬프트 생성
        const imagePrompt = getImagePrompt(topRoutine.task, topRoutine.emoji);

        // ✅ 이미지 생성 요청
        const imageRes = await fetch('/openai/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: imagePrompt }),
        });
        const imageData = await imageRes.json();
        setDiaryImageUrl(imageData.imageUrl);

        // ✅ 응원 메시지 생성 요청
        const diaryRes = await fetch('/openai/generate-diary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tasks: completedTasks }),
        });
        const diaryData = await diaryRes.json();
        setDiaryText(diaryData.message);
      } catch (err) {
        console.error('일기 생성 실패:', err);
        setDiaryText('일기 생성을 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchImageAndDiary();
  }, [topRoutine, completedTasks]);

  if (completedTasks.length < 5) {
    return (
      <div className="text-center py-10 text-gray-500">
        오늘은 일기 생성을 위해 5개 이상의 루틴 또는 습관을 완료해 주세요.
      </div>
    );
  }

  return (
    <div className="space-y-6 text-center">
      {loading ? (
        <p className="text-gray-500">일기와 그림을 생성 중입니다...</p>
      ) : (
        <>
          {diaryImageUrl && (
            <Image
              src={diaryImageUrl}
              alt="그림일기"
              width={300}
              height={300}
              className="mx-auto rounded-xl"
            />
          )}
          {topRoutine && (
            <p className="text-lg mt-2">
              {topRoutine.task} {topRoutine.emoji || ''}
            </p>
          )}
          <p className="text-sm text-gray-500">
            {selectedDay}요일 만족도: {topRoutine?.rating}/5
          </p>
          {diaryText && (
            <p className="whitespace-pre-line mt-4 text-base text-gray-700 font-medium">
              {diaryText}
            </p>
          )}
        </>
      )}
    </div>
  );
}
