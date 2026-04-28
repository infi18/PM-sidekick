import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function buildTemplate(epicCount: number): string {
  const epics = Array.from({ length: epicCount }, (_, i) => {
    const n = i + 1;
    return `{"id":"EPIC-${n}","title":"string","description":"string","goal":"string","stories":[{"id":"STORY-${n}-1","title":"string","description":"string","acceptance_criteria":["string","string","string"],"story_points":3,"priority":"High","labels":["string"]},{"id":"STORY-${n}-2","title":"string","description":"string","acceptance_criteria":["string","string","string"],"story_points":2,"priority":"Medium","labels":["string"]}]}`;
  });
  return `{"epics":[${epics.join(',')}]}`;
}

export async function POST(req: NextRequest) {
  const { research, brief, epicCount = 3 } = await req.json();

  if (!research || !brief) {
    return NextResponse.json({ error: 'Missing research or brief' }, { status: 400 });
  }

  const template = buildTemplate(Number(epicCount));

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2000,
      system: 'You are a product manager. Return ONLY raw JSON starting with { and ending with }. No markdown. No backticks. No explanation. Always complete the full JSON.',
      messages: [
        {
          role: 'user',
          content: `Generate JIRA epics and stories for: ${research.product_name} — ${research.one_liner}

Brief: ${brief}
Target users: ${research.target_users?.map((u: {segment: string}) => u.segment).join(', ')}
Market gaps: ${research.market_gaps?.slice(0, 3).join(', ')}

Return COMPLETE JSON with EXACTLY ${epicCount} epics (no more, no less), 2 stories each:
${template}

story_points: 1,2,3,5,8 only. priority: "High","Medium","Low" only. Return exactly ${epicCount} epics.`
        },
        {
          role: 'assistant',
          content: '{'
        }
      ],
    });

    const raw = response.content[0].type === 'text' ? response.content[0].text : '';
    if (!raw || raw.trim().length === 0) throw new Error('Empty response from model');

    const fullJson = '{' + raw;
    const lastBrace = fullJson.lastIndexOf('}');
    if (lastBrace === -1) throw new Error('No closing brace found in response');

    const artifacts = JSON.parse(fullJson.substring(0, lastBrace + 1));
    if (!artifacts.epics || !Array.isArray(artifacts.epics)) throw new Error('Invalid artifacts structure');

    // Trim to requested count in case model adds extras
    artifacts.epics = artifacts.epics.slice(0, Number(epicCount));

    return NextResponse.json(artifacts);

  } catch (err: unknown) {
    console.error('Export error:', err);
    const message = err instanceof Error ? err.message : 'Export failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}