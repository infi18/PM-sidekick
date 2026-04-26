# 🤖 PM Sidekick

### The AI copilot for every kind of PM — from learning the craft to skipping the grunt work.

> **Built by a PM who got tired of context-switching between 5 tools to do one job.**

[![Python](https://img.shields.io/badge/Python-3.9+-blue)](https://python.org)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org)
[![Claude API](https://img.shields.io/badge/Claude-claude--sonnet--4--6-green)](https://anthropic.com)
[![Status](https://img.shields.io/badge/Status-In%20Development-orange)]()
[![License](https://img.shields.io/badge/License-CC%20BY--NC%204.0-lightgrey)](LICENSE)

> © 2026 Siddhi Naik · All visual artifacts, personas, and discovery work are original.
> Licensed under [CC BY-NC 4.0](LICENSE) — share with attribution, not for commercial use.

---

## The Problem

Product managers spend 60–70% of their time on work that doesn't require their expertise.

Writing stories. Reformatting research. Translating Slack conversations into JIRA tickets. Creating flow diagrams from scratch. Explaining what a PRD is — again.

**Every existing AI PM tool makes this worse, not better:**
- They assume you already know agile methodology
- They're point solutions — research here, diagrams there, stories somewhere else
- They add process overhead without removing actual work
- They're built for experienced PMs — useless if you're still learning

**PM Sidekick does the full chain, in plain English, for any PM.**

---

## How It's Different from Claude Code PM Plugins

The Claude Code PM plugin ecosystem — including Anthropic's official Product Management plugin and community plugins like `pm-skills` — is genuinely powerful. 47+ skills, slash commands like `/write-spec` and `/competitive-brief`, battle-tested PM frameworks baked in.

But there's a real barrier: **you need Claude Code installed, authenticated, and a terminal open to use any of it.** That eliminates the majority of PMs — especially anyone early in their career who's never touched a terminal.

| | Claude Code PM Plugins | PM Sidekick |
|---|---|---|
| **Setup required** | Terminal install + auth + workspace config | Zero — runs in a browser |
| **PM knowledge required** | Yes — invoke `/write-spec` knowing what a spec is | No — describe it in plain English |
| **Who can use it** | Terminal-comfortable PMs | Any PM, zero prior knowledge |
| **Research → diagram → artifact** | Separate commands, manual sequencing | Single flow, one input |
| **Teaching layer** | Methodology-first, framework-heavy | Embedded in output, ambient learning |
| **JIRA export** | Via MCP integration (setup required) | Native, no config |

**PM Sidekick's position:** zero barrier to entry + full chain in one flow. No terminal. No methodology knowledge. No tool-switching. Describe what you're building and get a complete set of artifacts in under 2 minutes.

---

## What It Does

```
Plain English description of your feature or product
        ↓
  Market Research Agent
  → competitive landscape · target user summary · market gaps · PM learning note
        ↓
  Flow Diagram Generator
  → mermaid user journey · decision points · value moment mapping
        ↓
  Artifact Export  (Week 2)
  → JIRA epics · user stories · Notion pages · CSV
        ↓
  Epic & Story Writer  (Week 3)
  → format-flexible stories · learning layer · expert mode toggle
```

No templates. No required fields. No methodology knowledge needed.

---

## Who It's For

| Persona | Their situation | What they need |
|---|---|---|
| 🎓 **The Learner** *(anchor)* | 1–3 yrs PM, learning on the job | Understand + do — explains as it generates |
| 🔥 **The Overloaded** | Solo PM at a startup, 47 tabs open | Zero-setup speed — paste and go |
| ⚙️ **The Pragmatist** | Senior PM, hates writing things down | High-quality output from minimal input |
| 🤖 **The AI-Curious** | Mid-level PM, needs AI credibility | Safe sandbox to experiment and share |

---

## Example Output

> Brief: *"finance advisor for someone new to the stock market in their 20s"*

```mermaid
flowchart TD
    A([Discovers FirstTrade Advisor]) --> B{Has investing experience?}
    B -- No --> C[Takes 2-min Risk Quiz]
    B -- Yes --> D[Gets Personalized Financial Profile]
    C --> D
    D --> E{Ready to connect bank?}
    E -- Not yet --> F[Explores Sample Portfolio]
    E -- Yes --> G[Links Income & Savings]
    F --> G
    subgraph Value Moment
        G --> H[Receives First Recommendation]
        H --> I[Sees Plain-Language Explanation]
        I --> J{Feels confident to invest?}
        J -- Needs more --> K[Reads Why Behind Advice]
        J -- Yes --> L[Makes First Investment]
    end
```

*Generated in under 90 seconds from a one-line brief. No template. No methodology required.*

---

## Visual Artifacts

Built PM-first — discovery, personas, wireframes, and behavioral design before a single line of code.

### Wireframes — 5 Screens
![PM Sidekick Wireframes](docs/wireframes.svg)

### Product Flow Diagram
![PM Sidekick Flow Diagram](docs/flow_diagram.svg)

### User Journey Map — The Learner
![PM Sidekick Journey Map](docs/journey_map.svg)

### Behavioral Map — The 3B Framework
![PM Sidekick Behavioral Map](docs/behavioral_map.svg)

---

## Tech Stack

```
Frontend      Next.js 14 (App Router) + TypeScript + Tailwind CSS
AI            Claude claude-sonnet-4-6 via Anthropic API (server-side — key never exposed)
Diagrams      Mermaid.js rendered client-side
CLI tool      Python 3.9+ (Week 1 working prototype)
Hosting       Vercel (auto-deploy from GitHub, serverless API routes)
```

---

## Build Plan

### ✅ Done — Discovery & CLI prototype
- Market analysis + competitive teardown
- 4 research-backed personas (The Learner as anchor)
- Behavioral map — 3B framework (Irrational Labs)
- Wireframes, flow diagram, journey map
- `pm_sidekick.py` — working CLI: plain-English brief → research JSON + mermaid diagram

### ✅ Week 1 -2 — React web app (In progress)
- Next.js 14 app with full UI — Home → Processing → Results
- Learner mode (includes PM learning note) and Expert mode (raw output only)
- Market research results rendered as cards
- Mermaid diagram rendered inline — no external tools needed
- Copy mermaid source + open in mermaid.live
- API key secured server-side via Next.js API routes
- Deploy to Vercel

### 🔜 Week 3 — Artifact export layer
- Results → JIRA epics, user stories, plain text, or CSV
- Format picker — adapts to your workflow, not the other way around
- No agile knowledge required to get structured output

### 🔜 Week 4 — Epic & story writer
- Plain English → stories in any format (agile, shape-up, free-form)
- Learning layer explains what each artifact means and why — for The Learner
- Expert mode toggle removes all coaching for senior PMs

### 🔜 Week 5 — Live demo
- Deploy to `pmsidekick.vercel.app`
- GitHub Pages docs site

---

## Running Locally

### React web app (recommended)
```bash
git clone https://github.com/infi18/PM-sidekick.git
cd PM-sidekick

npm install
cp .env.example .env.local
# Add your API key to .env.local: ANTHROPIC_API_KEY=your_key_here

npm run dev
# Open http://localhost:3000
```

### CLI prototype (Week 1 original)
```bash
pip3 install -r requirements.txt
echo "ANTHROPIC_API_KEY=your_key_here" > .env
python3 pm_sidekick.py
```

> **No API key?** Get one free at [console.anthropic.com](https://console.anthropic.com)

---

## Design Principles

| Principle | What it means |
|---|---|
| **Plain English first** | No template. Describe it like you'd explain it to a friend. |
| **Full chain, one tool** | Research → diagram → artifact. No tab switching. |
| **Teach while doing** | Every output includes optional context in Learner mode. |
| **Format flexibility** | Adapts to your workflow — JIRA, Notion, CSV, plain text. |
| **Speed over ceremony** | Default is fast and good enough. Refinement is optional. |
| **Expert mode available** | One toggle removes all coaching for experienced PMs. |

---

## Related

**[AI-PM-ToolKit](https://github.com/infi18/AI-PM-ToolKit)** — Other AI tools for PMs: advanced prompting patterns, feedback analysis, and more.

---

## About

Senior PM with a background in software development, 3.5+ years in consumer financial products (credit scores, monitoring, identity risk). Behavioral Design for Finance certification in progress (Irrational Labs).

Building at the intersection of product thinking and AI-native development.

📎 [LinkedIn](https://linkedin.com/in/siddhinaik) · 📧 siddhi.naik18@gmail.com · 🐙 [github.com/infi18](https://github.com/infi18)

---

*© 2026 Siddhi Naik · Built with Claude claude-sonnet-4-6 · Next.js · Anthropic API · CC BY-NC 4.0*