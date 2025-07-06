// src/app/openai/chat/route.ts

import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      }),
    });

    const data = await openaiRes.json();

    if (!openaiRes.ok) {
      console.error("OpenAI Error:", data);
      return NextResponse.json({ error: 'OpenAI 요청 실패', details: data }, { status: 500 });
    }

    const result = data.choices?.[0]?.message?.content ?? '';

    return NextResponse.json({ result });
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ error: '서버 에러' }, { status: 500 });
  }
}
