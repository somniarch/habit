import React from 'react';
import Image from 'next/image';

export default function DiaryView({
  topRoutine, diaryLoading, diaryError, diaryImageUrl
}: any) {
  return (
    <div className="diary-view">{/* 그림일기 표시 */}</div>
  );
}
