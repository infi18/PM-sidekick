import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { research, brief } = await req.json();

  if (!research || !brief) {
    return NextResponse.json({ error: 'Missing research or brief' }, { status: 400 });
  }

  try {
    // Collect full response — Haiku is fast enough (~5-8s) without streaming
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1800,
      system: 'You are a product manager. Return ONLY raw JSON starting with { and ending with }. No markdown. No backticks. No explanation.',
      messages: [
        // Prime the assistant to start with { by prefilling
        {
          role: 'user',
          content: `Generate JIRA epics and stories for: ${research.product_name} — ${research.one_liner}

Brief: ${brief}
Target users: ${research.target_users?.map((u: {segment: string}) => u.segment).join(', ')}
Market gaps: ${research.market_gaps?.slice(0, 3).join(', ')}

Return JSON with 3 epics, 2 stories each:
{"epics":[{"id":"EPIC-1","title":"...","description":"...","goal":"...","stories":[{"id":"STORY-1-1","title":"...","description":"...","acceptance_criteria":["...","...","..."],"story_points":3,"priority":"High","labels":["..."]}]}]}

story_points: 1,2,3,5,8 only. priority: "High","Medium","Low" only.`
        },
        // Prefill assistant response to force it to start with {
        {
          role: 'assistant',
          content: '{'
        }
      ],
    });

    const raw = response.content[0].type === 'text' ? response.content[0].text : '';

    // The response continues from our prefilled { so prepend it back
    const fullJson = '{' + raw;

    // Find the last valid } to close the JSON
    const lastBrace = fullJson.lastIndexOf('}');
    const jsonStr = fullJson.substring(0, lastBrace + 1);

    const artifacts = JSON.parse(jsonStr);
    return NextResponse.json(artifacts);

  } catch (err: unknown) {
    console.error('Export error:', err);
    const message = err instanceof Error ? err.message : 'Export failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}