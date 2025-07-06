import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prevTask, nextTask } = await req.json();

    // ✅ 1. 프롬프트 구성
    const context = [prevTask, nextTask].filter(Boolean).join(', ');
    const prompt = `
앞뒤 활동: ${context}

당신은 웰빙 전문가입니다.
다음 조건을 반드시 지켜서 3~5개의 습관을 JSON 배열로 출력하세요:

- 형식: "3분 스트레칭"
- 숫자: 1~5분
- 행동: 명사형 한국어 (10자 이내)
- 설명 ❌, 이모지 ❌, 리스트 기호 ❌
- JSON 배열만 출력: ["2분 걷기", "1분 숨쉬기", "3분 정리"]
`;

    // ✅ 2. 로그 찍기
    console.log("💡 프롬프트 확인:", prompt);
    console.log("🔑 OpenAI 키 존재 여부:", !!process.env.OPENAI_API_KEY);

    // ✅ 3. OpenAI 요청
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
      }),
    });

    const data = await openaiRes.json();

    if (!openaiRes.ok) {
      console.error("❌ OpenAI 요청 실패:", data);
      return NextResponse.json({ error: 'OpenAI 요청 실패', details: data }, { status: 500 });
    }

    // ✅ 4. JSON 배열만 추출
    const raw = data.choices?.[0]?.message?.content ?? '';
    console.log("🧾 응답 원본:", raw);

    let habits: string[] = [];
    try {
      const jsonMatch = raw.match(/\[.*?\]/s); // JSON 배열 추출
      if (jsonMatch) {
        habits = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.warn("⚠️ JSON 파싱 실패", e);
    }

    return NextResponse.json({ result: habits });
  } catch (error) {
    console.error("💥 Chat API 오류:", error);
    return NextResponse.json({ error: '서버 에러' }, { status: 500 });
  }
}
