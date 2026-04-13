"""
pm_sidekick.py
==============
PM Sidekick — Week 1: Market Research Agent + Flow Diagram Generator

Give it a plain-English description of what you're building.
Get back:
  1. Competitive landscape
  2. Target user summary + market gaps
  3. Mermaid flow diagram of the user journey

No templates. No methodology knowledge required.
"""

import os
import json
import re
from anthropic import Anthropic
from dotenv import load_dotenv

load_dotenv()
client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

MODEL = "claude-sonnet-4-6"

# ── Prompts ──────────────────────────────────────────────────────

RESEARCH_SYSTEM = """You are a senior product strategist and market researcher.
Your job is to take a plain-English product brief and return a structured JSON analysis.
Be specific, opinionated, and concise. Avoid generic filler.
Return ONLY valid JSON — no markdown, no preamble, no explanation."""

RESEARCH_PROMPT = """Analyze this product brief and return a JSON object with this exact structure:

{{
  "product_name": "string — infer a short working name",
  "one_liner": "string — what it does in one sentence",
  "target_users": [
    {{
      "segment": "string — who they are",
      "pain": "string — their specific problem",
      "current_solution": "string — what they use today"
    }}
  ],
  "competitors": [
    {{
      "name": "string",
      "what_they_do": "string",
      "their_gap": "string — what they don't do well"
    }}
  ],
  "market_gaps": ["string", "string", "string"],
  "differentiation": "string — what makes this meaningfully different",
  "risks": ["string", "string"],
  "learning_note": "string — one thing a PM learning this space should understand about this market"
}}

Product brief:
{brief}"""

DIAGRAM_SYSTEM = """You are a product designer who specializes in user journey mapping.
Your job is to create a mermaid flowchart diagram of a user journey based on a product brief.
Return ONLY the raw mermaid diagram code — no markdown fences, no explanation, nothing else."""

DIAGRAM_PROMPT = """Create a mermaid flowchart diagram for the core user journey of this product.

Rules:
- Use flowchart TD (top-down)
- Show the user's journey from discovery through first value moment
- Include decision points (diamond shapes) where users might drop off
- Keep node labels short and clear — max 6 words per node
- Include 8-12 nodes total
- Use subgraphs to group related steps if helpful

Product brief: {brief}
Research context: {context}

Return only the mermaid code, starting with 'flowchart TD'"""


# ── Core functions ────────────────────────────────────────────────

def run_research(brief: str) -> dict:
    """Run market research agent on a plain-English brief."""
    print("\n🔍 Running market research agent...")

    response = client.messages.create(
        model=MODEL,
        max_tokens=2000,
        system=RESEARCH_SYSTEM,
        messages=[{"role": "user", "content": RESEARCH_PROMPT.format(brief=brief)}]
    )

    raw = response.content[0].text.strip()

    # Strip markdown fences if model adds them anyway
    raw = re.sub(r'^```(?:json)?\s*', '', raw)
    raw = re.sub(r'\s*```$', '', raw)

    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        print("  ⚠️  JSON parse failed — returning raw text")
        return {"raw": raw}


def run_diagram(brief: str, research: dict) -> str:
    """Generate a mermaid flow diagram from brief + research context."""
    print("\n🗺️  Generating flow diagram...")

    context = f"""
Target users: {', '.join([u['segment'] for u in research.get('target_users', [])])}
Differentiation: {research.get('differentiation', '')}
Key gaps: {', '.join(research.get('market_gaps', []))}
""".strip()

    response = client.messages.create(
        model=MODEL,
        max_tokens=1000,
        system=DIAGRAM_SYSTEM,
        messages=[{"role": "user", "content": DIAGRAM_PROMPT.format(
            brief=brief, context=context
        )}]
    )

    diagram = response.content[0].text.strip()

    # Clean up if model wraps in fences
    diagram = re.sub(r'^```(?:mermaid)?\s*', '', diagram)
    diagram = re.sub(r'\s*```$', '', diagram)

    return diagram


def display_research(data: dict):
    """Pretty-print the research output."""
    if "raw" in data:
        print(data["raw"])
        return

    print(f"\n{'='*60}")
    print(f"  📊 MARKET RESEARCH RESULTS")
    print(f"{'='*60}")

    print(f"\n  Product: {data.get('product_name', 'N/A')}")
    print(f"  What it is: {data.get('one_liner', 'N/A')}")

    print(f"\n  ── Target Users ──")
    for u in data.get('target_users', []):
        print(f"  • {u['segment']}")
        print(f"    Pain: {u['pain']}")
        print(f"    Today: {u['current_solution']}")

    print(f"\n  ── Competitors ──")
    for c in data.get('competitors', []):
        print(f"  • {c['name']} — {c['what_they_do']}")
        print(f"    Gap: {c['their_gap']}")

    print(f"\n  ── Market Gaps ──")
    for g in data.get('market_gaps', []):
        print(f"  • {g}")

    print(f"\n  ── Our Differentiation ──")
    print(f"  {data.get('differentiation', 'N/A')}")

    print(f"\n  ── Risks ──")
    for r in data.get('risks', []):
        print(f"  ⚠️  {r}")

    print(f"\n  ── 💡 PM Learning Note ──")
    print(f"  {data.get('learning_note', 'N/A')}")


def display_diagram(diagram: str):
    """Print the mermaid diagram with instructions."""
    print(f"\n{'='*60}")
    print(f"  🗺️  USER FLOW DIAGRAM (Mermaid)")
    print(f"{'='*60}")
    print(f"\n  Paste this into https://mermaid.live to visualize:\n")
    print(diagram)
    print(f"\n  Or add to any GitHub markdown file with:")
    print(f"  ```mermaid")
    print(f"  [paste diagram here]")
    print(f"  ```")


def save_outputs(brief: str, research: dict, diagram: str):
    """Save results to files for use in Week 2."""
    os.makedirs("outputs", exist_ok=True)

    # Save research as JSON
    with open("outputs/research.json", "w") as f:
        json.dump({"brief": brief, "research": research}, f, indent=2)

    # Save diagram as .md
    with open("outputs/flow_diagram.md", "w") as f:
        f.write(f"# User Flow Diagram\n\n")
        f.write(f"Generated from brief: *{brief[:100]}...*\n\n")
        f.write(f"```mermaid\n{diagram}\n```\n")

    print(f"\n  ✅ Saved to outputs/research.json and outputs/flow_diagram.md")


# ── Main ──────────────────────────────────────────────────────────

def main():
    print("""
╔══════════════════════════════════════════════════════════╗
║  🤖 PM SIDEKICK — Week 1                                ║
║  Market Research Agent + Flow Diagram Generator         ║
║  No templates. No methodology. Just describe it.        ║
╚══════════════════════════════════════════════════════════╝
""")

    # Get brief from user
    print("Describe what you're building in plain English.")
    print("(Be as specific or vague as you like — PM Sidekick figures out the rest)\n")

    lines = []
    print("Your brief (press Enter twice when done):")
    while True:
        line = input()
        if line == "" and lines and lines[-1] == "":
            break
        lines.append(line)

    brief = "\n".join(lines).strip()

    if not brief:
        print("No brief provided. Exiting.")
        return

    print(f"\n  Brief received ({len(brief)} chars). Processing...\n")

    # Run research
    research = run_research(brief)
    display_research(research)

    # Run diagram
    diagram = run_diagram(brief, research)
    display_diagram(diagram)

    # Save outputs
    save_outputs(brief, research, diagram)

    print(f"""
{'='*60}
  ✅ Week 1 complete.

  Next steps:
  • View your diagram at https://mermaid.live
  • research.json feeds directly into Week 2 (JIRA export)
  • flow_diagram.md is ready to commit to GitHub

  Coming in Week 2: JIRA epics + story writer
{'='*60}
""")


if __name__ == "__main__":
    main()
