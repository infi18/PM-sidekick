import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const RESEARCH_SYSTEM = `You are a senior product strategist and market researcher.
Your job is to take a plain-English product brief and return a structured JSON analysis.
Be specific, opinionated, and concise. Avoid generic filler.
Return ONLY valid JSON — no markdown fences, no preamble, no explanation outside the JSON object.`;

const DIAGRAM_SYSTEM = `You are a product designer who specializes in user journey mapping.
Return ONLY the raw mermaid flowchart code starting with 'flowchart TD'.
No markdown fences, no explanation, nothing else.`;

export async function POST(req: NextRequest) {
  try {
    const { brief, mode } = await req.json();

    if (!brief || brief.trim().length < 10) {
      return NextResponse.json({ error: 'Brief too short' }, { status: 400 });
    }

    // Run research and diagram in parallel
    const [researchRes, diagramRes] = await Promise.all([
      client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 2000,
        system: RESEARCH_SYSTEM,
        messages: [{
          role: 'user',
          content: `Analyze this product brief and return a JSON object with this exact structure:

{
  "product_name": "string — infer a short working name",
  "one_liner": "string — what it does in one sentence",
  "target_users": [
    { "segment": "string", "pain": "string", "current_solution": "string" }
  ],
  "competitors": [
    { "name": "string", "what_they_do": "string", "their_gap": "string" }
  ],
  "market_gaps": ["string", "string", "string"],
  "differentiation": "string — what makes this meaningfully different",
  "risks": ["string", "string"],
  "learning_note": "string — one insight a PM learning this space should know"
}

Product brief: ${brief}`
        }],
      }),
      client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 800,
        system: DIAGRAM_SYSTEM,
        messages: [{
          role: 'user',
          content: `Create a mermaid flowchart TD showing the core user journey for: ${brief}

Rules:
- Use flowchart TD
- Show discovery through first value moment
- Include decision points (diamond shapes) where users might drop off
- Keep node labels under 6 words
- 8-12 nodes total
- Use one subgraph for the value moment

Return only the mermaid code starting with 'flowchart TD'`
        }],
      }),
    ]);

    // Parse research JSON
    let research;
    const rawText = researchRes.content[0].type === 'text' ? researchRes.content[0].text : '';
    const cleaned = rawText.replace(/^```(?:json)?\s*/m, '').replace(/\s*```$/m, '').trim();
    try {
      research = JSON.parse(cleaned);
    } catch {
      research = { raw: rawText };
    }

    // Extract diagram
    let diagram = diagramRes.content[0].type === 'text' ? diagramRes.content[0].text : '';
    diagram = diagram.replace(/^```(?:mermaid)?\s*/m, '').replace(/\s*```$/m, '').trim();

    return NextResponse.json({ research, diagram });

  } catch (err: unknown) {
    console.error('Generate error:', err);
    const message = err instanceof Error ? err.message : 'Generation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}