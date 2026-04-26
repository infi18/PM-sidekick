# PM Sidekick 🤖

**Try it:** [pm-sidekick-ten.vercel.app](https://pm-sidekick-ten.vercel.app)

[![Live Demo](https://img.shields.io/badge/Live%20Demo-pm--sidekick--ten.vercel.app-6366F1)](https://pm-sidekick-ten.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org)
[![Claude API](https://img.shields.io/badge/Claude-claude--sonnet--4--6-green)](https://anthropic.com)
[![License](https://img.shields.io/badge/License-CC%20BY--NC%204.0-lightgrey)](LICENSE)

> © 2026 Siddhi Naik · Licensed under [CC BY-NC 4.0](LICENSE) — please don't repackage this commercially.

---

## What is this

I built PM Sidekick because I kept running into the same problem at work: every AI tool for PMs assumes you already know exactly what you're doing. You still have to know which template to open, what a story point means, how to structure an epic. The AI just fills in the blanks faster.

That's not actually useful for a PM who's still learning. And it's not that useful for a senior PM who just wants to describe what they're building in plain English and get something their team can act on.

So I built a tool that starts with a blank text box and one question: **what are you building?**

You describe it like you'd explain it to a colleague. PM Sidekick handles the research, the diagram, and the artifacts.

---

## What it does right now

Type a plain-English description of what you're building. You get back:

1. **Market research** — who's in the space, what their gaps are, who your users are, what makes your idea different. Plus a PM learning note that explains what this market data actually means (you can turn this off if you don't need it).

2. **A user flow diagram** — a Mermaid diagram of the user journey, rendered inline. You can copy the source and paste it into GitHub or Notion and it renders automatically.

3. **JIRA epics and stories** — structured artifacts with acceptance criteria, story points, and priority. Copy individual stories or export everything as JSON.

---

## Who it's for

Honestly, two kinds of people:

**PMs who are still learning** — the ones who Google "what's the difference between an epic and a story" before every sprint. PM Sidekick explains PM concepts as it generates output, so you're learning while getting actual work done. Not watching a tutorial. Actually shipping.

**PMs who just want to move faster** — the ones who already know all of this but hate writing it down. Give it a sentence, get back a full set of artifacts. There's an expert mode that removes all the explanations if you don't need them.

---

## The tech

```
Frontend    Next.js 14 + TypeScript + Tailwind CSS
AI          Claude claude-sonnet-4-6 via Anthropic API
Diagrams    Mermaid.js rendered client-side
Hosting     Vercel (auto-deploys on git push)
```

The Claude API calls happen server-side via Next.js API routes, so the API key never touches the browser. There's also a Python CLI version (`pm_sidekick.py`) from Week 1 if you want to run it without the web app.

---

## Run it locally

```bash
git clone https://github.com/infi18/PM-sidekick.git
cd PM-sidekick

npm install

# Create a .env.local file with your Anthropic API key
# Get one free at console.anthropic.com
echo "ANTHROPIC_API_KEY=your_key_here" > .env.local

npm run dev
# Open http://localhost:3000
```

---

## What's been built

The discovery process happened before a line of code was written — personas, behavioral design framework, wireframes, competitive analysis. All of it is in the `/docs` folder.

- [x] Full PM discovery — market analysis, 4 personas, behavioral map (Irrational Labs 3B framework)
- [x] Wireframes — 5 screens, flow diagram, journey map
- [x] Python CLI prototype (working, tested)
- [x] Next.js web app with research + flow diagram
- [ ] JIRA artifact export screen
- [ ] Epic & story writer with format flexibility (Notion, CSV)
- [ ] Polish, custom domain, shareable session links

---

## Visual artifacts

All of these render natively on GitHub.

### Wireframes
![Wireframes](docs/wireframes.svg)

### Flow diagram
![Flow diagram](docs/flow_diagram.svg)

### User journey map
![Journey map](docs/journey_map.svg)

### Behavioral map — 3B framework
![Behavioral map](docs/behavioral_map.svg)

---

## A note on the code

This is a portfolio item I'm building as a side project. It's not production-hardened. There are things I'd do differently with more time — better error handling, proper auth, persistent sessions. But the PM thinking behind it is real: I ran a full discovery process, validated the personas, and applied behavioral design principles from a certification I'm finishing.

The code is the evidence. The thinking is the work.

---

## Related

**[AI-PM-ToolKit](https://github.com/infi18/AI-PM-ToolKit)** — where I've been building other AI tools for PM workflows: advanced prompting patterns, feedback analysis, structured output experiments.

---

Built by **Siddhi Naik** — PM at TransUnion Interactive, 3.5 years in consumer fintech, background in software development.

[LinkedIn](https://linkedin.com/in/siddhinaik) · [GitHub](https://github.com/infi18) · siddhi.naik18@gmail.com