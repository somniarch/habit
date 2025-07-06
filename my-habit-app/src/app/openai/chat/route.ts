import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prevTask, nextTask } = await req.json();
    const context = [prevTask, nextTask].filter(Boolean).join(', ');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-1106-preview', // 반드시 tools를 지원하는 turbo 모델
        temperature: 0.2,
        messages: [
          {
            role: 'system',
            content: '당신은 웰빙 습관을 JSON 배열로만 추천하는 도우미입니다. 설명을 절대 포함하지 마세요.',
          },
          {
            role: 'user',
            content: `앞뒤 활동: ${context} — 사이에 자연스럽게 실천할 수 있는 3~5개의 간단한 웰빙 습관을 추천해주세요.`,
          },
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'habit_recommendations',
              description: '3~5개의 웰빙 습관을 1~5분 사이로 추천합니다. 각 항목은 10자 이내여야 합니다.',
              parameters: {
                type: 'object',
                properties: {
                  habits: {
                    type: 'array',
                    items: {
                      type: 'string',
                      pattern: '^\\d+분\\s?\\S{1,8}$',
                    },
                  },
                },
                required: ['habits'],
              },
            },
          },
        ],
        tool_choice: { type: 'function', function: { name: 'habit_recommendations' } },
      }),
    });

    const data = await response.json();
    const args = data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;

    const parsed = args ? JSON.parse(args) : {};
    const habits = parsed.habits ?? [];

    return NextResponse.json({ result: habits });
  } catch (error) {
    console.error('habit API error:', error);
    return NextResponse.json({ error: 'server error' }, { status: 500 });
  }
}
