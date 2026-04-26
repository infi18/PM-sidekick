import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const EXPORT_SYSTEM = `You are a senior product manager who writes excellent JIRA tickets.
Your job is to take a product research summary and generate well-structured JIRA epics and user stories.
Return ONLY valid JSON — no markdown fences, no preamble, no explanation.
Stories should be plain English first — not just "As a user I want" templates.
Each story should explain the WHY not just the WHAT.`;

export async function POST(req: NextRequest) {
  try {
    const { research, brief } = await req.json();

    if (!research || !brief) {
      return NextResponse.json({ error: 'Missing research or brief' }, { status: 400 });
    }

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 3000,
      system: EXPORT_SYSTEM,
      messages: [{
        role: 'user',
        content: `Generate JIRA epics and user stories for this product.

Product brief: ${brief}

Product name: ${research.product_name}
One liner: ${research.one_liner}
Target users: ${JSON.stringify(research.target_users)}
Market gaps: ${JSON.stringify(research.market_gaps)}
Differentiation: ${research.differentiation}

Return a JSON object with this exact structure:
{
  "epics": [
    {
      "id": "EPIC-1",
      "title": "string — short epic title",
      "description": "string — what this epic covers and why it matters",
      "goal": "string — the outcome we're trying to achieve",
      "stories": [
        {
          "id": "STORY-1-1",
          "title": "string — short story title",
          "description": "string — plain English description of what needs to be built and why",
          "acceptance_criteria": ["string", "string", "string"],
          "story_points": 3,
          "priority": "High | Medium | Low",
          "labels": ["string"]
        }
      ]
    }
  ]
}

Generate 3-4 epics with 2-4 stories each.
Epics should cover: Core user flow, Onboarding, Research/Discovery, and Export/Output.
Make acceptance criteria specific and testable.
Story points should be 1, 2, 3, 5, or 8 (Fibonacci).`
      }],
    });

    const raw = response.content[0].type === 'text' ? response.content[0].text : '';
    const cleaned = raw.replace(/^```(?:json)?\s*/m, '').replace(/\s*```$/m, '').trim();

    try {
      const artifacts = JSON.parse(cleaned);
      return NextResponse.json(artifacts);
    } catch {
      return NextResponse.json({ error: 'Failed to parse artifacts', raw }, { status: 500 });
    }

  } catch (err: unknown) {
    console.error('Export error:', err);
    const message = err instanceof Error ? err.message : 'Export failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}