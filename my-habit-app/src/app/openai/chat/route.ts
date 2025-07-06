import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prevTask, nextTask } = await req.json();
    const context = [prevTask, nextTask].filter(Boolean).join(', ');

    const messages = [
      {
        role: 'system',
        content: '당신은 한국어 웰빙 습관 추천 전문가입니다. 응답은 절대 JSON 배열 형태만 허용됩니다. 설명, 이모지, 마크다운, 리스트 절대 금지.',
      },
      {
        role: 'user',
        content: `
앞뒤 활동: ${context}
  
3~5개의 짧은 웰빙 습관을 추천해 주세요.  
조건:
- "3분 스트레칭" 형식 (1~5분 + 8자 이내 명사형)
- JSON 배열로만 출력
`,
      },
    ];

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        temperature: 0.2,
        messages,
        functions: [
          {
            name: 'habit_recommendations',
            description: '추천된 습관 리스트를 받습니다',
            parameters: {
              type: 'object',
              properties: {
                habits: {
                  type: 'array',
                  items: { type: 'string' }
                }
              },
              required: ['habits'],
            }
          }
        ],
        function_call: { name: 'habit_recommendations' },
      }),
    });

    const data = await openaiRes.json();

    if (!openaiRes.ok) {
      console.error('OpenAI 요청 실패', data);
      return NextResponse.json({ error: 'OpenAI 요청 실패' }, { status: 500 });
    }

    const funcCall = data.choices?.[0]?.message?.function_call;
    let habits: string[] = [];

    if (funcCall?.name === 'habit_recommendations') {
      const args = JSON.parse(funcCall.arguments || '{}');
      habits = Array.isArray(args.habits) ? args.habits : [];
    } else {
      console.error('Function call 누락 응답:', data.choices?.[0]?.message?.content);
    }

    // 유효성 검사
    habits = habits.filter(h => /^\d+분\s?\S{1,8}$/.test(h));

    return NextResponse.json({ result: habits });
  } catch (e) {
    console.error('Chat API 오류', e);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
