import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prevTask, nextTask } = await req.json();

    const context = [prevTask, nextTask].filter(Boolean).join(", ");

    const prompt = `
당신은 습관 추천을 위한 웰빙 전문가입니다.

🟢 목적:
앞뒤 활동 "${context}" 사이에 할 수 있는 짧고 구체적인 웰빙 습관을 추천해주세요.

🟡 조건:
- 1~5분짜리 짧은 습관
- 한국어 명사형만 사용 (예: 걷기, 숨쉬기, 정리, 스트레칭)
- 항목 수: 3개 이상 5개 이하
- 각 항목은 **10자 이하**
- 설명 ❌, 이모지 ❌, 리스트 기호 ❌, 마크다운 ❌

🔵 출력 형식 (아래 형식만 허용):
JSON 배열 ONLY. 아래 형식과 **동일한 형태로만 출력**하세요:

예:  
["3분 걷기", "2분 숨쉬기", "1분 정리"]
`;


    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{ role: 'system', content: prompt }],
        temperature: 0.4,
      }),
    });

    const data = await openaiRes.json();

    if (!openaiRes.ok) {
      console.error("OpenAI Error:", data);
      return NextResponse.json({ error: 'OpenAI 요청 실패', details: data }, { status: 500 });
    }

    const raw = data.choices?.[0]?.message?.content ?? '';

    let result: string[] = [];

    try {
      result = JSON.parse(raw);
    } catch (e) {
      // fallback: 정규식 기반 추출
      result = raw
        .split(/\r?\n/)
        .map((l: string) => l.trim())
        .filter((l: string) => /^\d+분\s?\S{1,8}$/.test(l));
    }

    return NextResponse.json({ result });
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ error: '서버 에러' }, { status: 500 });
  }
}
