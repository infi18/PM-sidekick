import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function buildTemplate(epicCount: number): string {
  const epics = Array.from({ length: epicCount }, (_, i) => {
    const n = i + 1;
    return `{"id":"EPIC-${n}","title":"string","description":"string","goal":"string","stories":[{"id":"STORY-${n}-1","title":"string","description":"string","acceptance_criteria":["string","string"],"story_points":3,"priority":"High","labels":["string"]},{"id":"STORY-${n}-2","title":"string","description":"string","acceptance_criteria":["string","string"],"story_points":2,"priority":"Medium","labels":["string"]}]}`;
  });
  return `{"epics":[${epics.join(',')}]}`;
}

export async function POST(req: NextRequest) {
  const { research, brief, epicCount = 3 } = await req.json();
  const count = Math.min(Number(epicCount), 5); // cap at 5

  if (!research || !brief) {
    return NextResponse.json({ error: 'Missing research or brief' }, { status: 400 });
  }

  // Scale tokens with epic count — 4-5 epics need more room
  const maxTokens = count <= 2 ? 1800 : count === 3 ? 2400 : count === 4 ? 3200 : 4000;

  try {
    const response = await client.messages.create({
      model: count <= 3 ? 'claude-haiku-4-5-20251001' : 'claude-sonnet-4-6',
      max_tokens: maxTokens,
      system: 'You are a product manager. Return ONLY raw JSON. No markdown. No backticks. No explanation. Complete the full JSON without truncating.',
      messages: [
        {
          role: 'user',
          content: `Generate JIRA epics and stories for: ${research.product_name} — ${research.one_liner}

Brief: ${brief}
Target users: ${research.target_users?.map((u: {segment: string}) => u.segment).join(', ')}
Market gaps: ${research.market_gaps?.slice(0, 3).join(', ')}

Return EXACTLY ${count} epics, 2 stories each. Use this structure:
${buildTemplate(count)}

story_points: 1,2,3,5,8 only. priority: "High","Medium","Low" only.`
        },
        ...(count <= 3 ? [{ role: 'assistant' as const, content: '{' }] : [])
      ],
    });

    const raw = response.content[0].type === 'text' ? response.content[0].text : '';
    if (!raw || raw.trim().length === 0) throw new Error('Empty response from model');

    const fullJson = count <= 3 ? '{' + raw : raw;
    const lastBrace = fullJson.lastIndexOf('}');
    if (lastBrace === -1) throw new Error('No closing brace in response');

    const artifacts = JSON.parse(fullJson.substring(0, lastBrace + 1));
    if (!artifacts.epics || !Array.isArray(artifacts.epics)) throw new Error('Invalid structure');

    // Trim to requested count as safety net
    artifacts.epics = artifacts.epics.slice(0, count);

    return NextResponse.json(artifacts);

  } catch (err: unknown) {
    console.error('Export error:', err);
    const message = err instanceof Error ? err.message : 'Export failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}