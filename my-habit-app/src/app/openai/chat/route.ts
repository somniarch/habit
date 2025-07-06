import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prevTask, nextTask } = await req.json();

    const systemPrompt = `
사용자의 행동 사이에 자연스럽게 이어질 수 있는 웰빙 행동을 **최소 3개, 최대 5개** 추천해주세요.

조건:
1. 각 항목은 반드시 "숫자분 행동명" 형식이어야 합니다. 예: "3분 스트레칭"
2. **설명, 이모지, 마크다운, 콜론(:), 하이픈(-)** 등은 포함하지 마세요.
3. 각 행동명은 **8글자 이하의 구체적인 한국어 명사형**이어야 합니다.
4. 오직 순수 텍스트 목록만 출력해 주세요. 줄마다 하나씩.

이전 행동: ${prevTask ?? "없음"}
다음 행동: ${nextTask ?? "없음"}

예시 출력 (이와 같은 형식으로 3~5개만 반환):
3분 스트레칭  
2분 걷기  
4분 물마시기
`;

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{ role: 'user', content: systemPrompt }],
        temperature: 0.4,
      }),
    });

    const data = await openaiRes.json();

    if (!openaiRes.ok) {
      console.error("OpenAI Error:", data);
      return NextResponse.json({ error: 'OpenAI 요청 실패', details: data }, { status: 500 });
    }

    const raw = data.choices?.[0]?.message?.content ?? '';
    const lines = raw
      .split(/\r?\n/)
      .map((l: string) => l.trim())
      .filter((l: string) => /^\d+분\s?\S{1,8}$/.test(l)); // 정규식으로 형식 검증

    return NextResponse.json({ result: lines });
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ error: '서버 에러' }, { status: 500 });
  }
}
