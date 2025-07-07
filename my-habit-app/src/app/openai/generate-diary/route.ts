// src/app/openai/generate-diary/route.ts

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: NextRequest) {
  const { tasks } = await request.json();

  if (!tasks || !Array.isArray(tasks) || tasks.length < 5) {
    return NextResponse.json({ error: "5개 이상의 완료된 작업이 필요합니다." }, { status: 400 });
  }

  const prompt = `
다음은 사용자의 오늘 달성한 습관 및 일과 목록입니다:
${tasks.join(", ")}

이 내용을 바탕으로 따뜻하고 긍정적인 응원의 메시지와 함께 3줄로 요약된 일기를 작성해 주세요.
※ 예시는 다음과 같습니다:
"오늘은 스트레칭과 물 마시기를 실천했어요.
바쁜 하루 속에서도 나를 돌본 순간들이 참 고마워요.
내일도 잘할 수 있을 거라는 믿음이 생겨요."
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  const message = completion.choices?.[0]?.message?.content?.trim();

  return NextResponse.json({ message });
}
