import React from 'react';
import Image from 'next/image';

export default function DiaryView({
  topRoutine, diaryLoading, diaryError, diaryImageUrl
}: any) {
  if (!topRoutine) return (
    <div className="text-center py-12">
      <p className="text-gray-500">오늘 완료한 활동이 없어요.</p>
      <p className="text-gray-400 text-sm mt-2">활동을 완료하고 만족도를 평가해보세요!</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {diaryLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-500">AI가 그림을 그리고 있어요...</p>
        </div>
      ) : diaryError ? (
        <div className="text-center py-8">
          <p className="text-red-500">{diaryError}</p>
        </div>
      ) : diaryImageUrl ? (
        <div className="relative">
          <Image
            src={diaryImageUrl}
            alt="오늘의 그림일기"
            width={512}
            height={512}
            className="rounded-xl shadow-xl mx-auto"
            style={{ objectFit: "cover" }}
          />
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1">
            <span className="text-yellow-500 font-bold">★ {topRoutine.rating}</span>
          </div>
        </div>
      ) : null}

      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold">
          {topRoutine.emoji} {topRoutine.task}
        </h3>
        <p className="text-gray-500">오늘의 최고 만족도 활동</p>
      </div>
    </div>
  );
}
