import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prevTask, nextTask } = await req.json();

    const context = [prevTask, nextTask].filter(Boolean).join(", ");

    const prompt = `
앞뒤 활동: ${context}

당신은 웰빙 전문가입니다.  
다음 조건을 **정확히 지켜서** "습관 추천"을 최소 3개, 최대 5개 출력해 주세요.

### 출력 조건
- 각 항목은 아래 형식으로만:
  "3분 스트레칭"
  "2분 걷기"
- 앞 숫자는 1~5분 사이
- 행동은 구체적이고 한국어 명사형 (예: 스트레칭, 숨쉬기, 걷기, 정리 등)
- 총 3~5개
- 길이는 **10자 이내**
- 설명 ❌ 금지
- 마크다운 ❌ 금지
- 이모지 ❌ 금지
- 리스트 기호 ❌ 금지
- **JSON 배열로만 출력**
  예: ["3분 스트레칭", "2분 걷기", "1분 호흡"]
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
