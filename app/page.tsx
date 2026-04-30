'use client';

import React from 'react';
import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';

const MermaidDiagram = dynamic(() => import('../components/MermaidDiagram'), {
  ssr: false,
  loading: () => <div className="h-48 bg-slate-50 rounded-xl animate-pulse" />,
});


// ── Learner note component ────────────────────────────────────────
function LearnNote({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="mt-2">
      <button onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 text-xs font-medium text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-2.5 py-1 rounded-lg transition-all mt-3">
        <span className="text-[11px]">{open ? '▲' : '💡'}</span>
        {open ? 'Hide explanation' : 'What does this mean?'}
      </button>
      {open && (
        <div className="mt-2 bg-teal-50 border border-teal-100 rounded-xl px-4 py-3 animate-fade-up">
          <p className="text-xs font-semibold text-teal-700 mb-1">{title}</p>
          <p className="text-xs text-slate-600 leading-relaxed">{children}</p>
        </div>
      )}
    </div>
  );
}

// ── Types ──────────────────────────────────────────────────────────
interface TargetUser {
  segment: string;
  pain: string;
  current_solution: string;
}
interface Competitor {
  name: string;
  what_they_do: string;
  their_gap: string;
}
interface Research {
  product_name: string;
  one_liner: string;
  target_users: TargetUser[];
  competitors: Competitor[];
  market_gaps: string[];
  differentiation: string;
  risks: string[];
  learning_note: string;
}

type Mode = 'learner' | 'expert';
type Stage = 'home' | 'loading' | 'results';

const EXAMPLES = [
  "Finance advisor for someone new to the stock market in their 20s",
  "A Slack bot that triages customer support tickets automatically",
  "A job search tool for recent grads who don't know where to start",
];


const PREVIEWS = [
  {
    brief: "Finance advisor for someone new to the stock market in their 20s",
    product: "FirstTrade Advisor",
    oneliner: "AI-powered financial coaching for first-time investors",
    competitors: [
      { name: "Robinhood", gap: "No education layer" },
      { name: "Acorns", gap: "Passive only, no coaching" },
    ],
    gaps: ["No plain-language investing guidance", "Fear of loss never addressed"],
    note: "This market has high awareness but low trust. Lead with safety — not returns.",
    diagram: [
      "flowchart TD",
      "  A([User feels lost about investing])",
      "  A --> B{Has experience?}",
      "  B -- No --> C[Takes risk quiz]",
      "  B -- Yes --> D[Gets profile]",
      "  C --> D --> E{Ready to invest?}",
      "    subgraph Value Moment",
      "      E -- Yes --> F[First recommendation]",
      "      F --> G[Plain-language explanation]",
      "    end",
    ],
    epics: [
      { id: "EPIC-1", title: "Onboarding & Risk Profiling", stories: [
        { id: "S-1-1", title: "Risk quiz flow", priority: "High", points: 3 },
        { id: "S-1-2", title: "Plain-language profile summary", priority: "Medium", points: 2 },
      ]},
      { id: "EPIC-2", title: "First Recommendation", stories: [
        { id: "S-2-1", title: "Personalized suggestion engine", priority: "High", points: 5 },
        { id: "S-2-2", title: "Why-behind-advice explainer", priority: "High", points: 3 },
      ]},
    ],
  },
  {
    brief: "A Slack bot that triages customer support tickets automatically",
    product: "TriageBot",
    oneliner: "AI that classifies and routes support tickets in real time",
    competitors: [
      { name: "Zendesk AI", gap: "Expensive, complex setup" },
      { name: "Intercom", gap: "Chat-first, weak ticket routing" },
    ],
    gaps: ["No zero-config triage for small teams", "Manual routing kills response time"],
    note: "Small support teams spend 40% of time routing, not resolving. That's the real pain.",
    diagram: [
      "flowchart TD",
      "  A([Ticket arrives in Slack])",
      "  A --> B[AI classifies intent]",
      "  B --> C{Confidence > 80%?}",
      "  C -- Yes --> D[Auto-routes to agent]",
      "  C -- No --> E[Flags for review]",
      "  D --> F[Agent notified]",
      "    subgraph Resolution",
      "      F --> G[Agent resolves]",
      "      G --> H[Ticket closed]",
      "    end",
    ],
    epics: [
      { id: "EPIC-1", title: "Ticket Classification", stories: [
        { id: "S-1-1", title: "Intent detection model", priority: "High", points: 5 },
        { id: "S-1-2", title: "Confidence threshold config", priority: "Medium", points: 2 },
      ]},
      { id: "EPIC-2", title: "Slack Integration", stories: [
        { id: "S-2-1", title: "Slack app install + auth", priority: "High", points: 3 },
        { id: "S-2-2", title: "Agent notification format", priority: "Low", points: 1 },
      ]},
    ],
  },
  {
    brief: "A job search tool for recent grads who don't know where to start",
    product: "LaunchPad",
    oneliner: "Guided job search for first-time candidates with no network",
    competitors: [
      { name: "LinkedIn", gap: "Overwhelming, assumes network" },
      { name: "Indeed", gap: "No guidance, just listings" },
    ],
    gaps: ["No step-by-step job search playbook", "Entry-level candidates invisible"],
    note: "The job search problem for grads is confidence, not listings. They need a roadmap.",
    diagram: [
      "flowchart TD",
      "  A([Grad feels lost about job search])",
      "  A --> B[Completes skills assessment]",
      "  B --> C[Gets personalized roadmap]",
      "  C --> D{Has target role?}",
      "  D -- No --> E[Role explorer]",
      "  D -- Yes --> F[Resume builder]",
      "    subgraph Application Loop",
      "      F --> G[Apply to matches]",
      "      G --> H[Track applications]",
      "    end",
    ],
    epics: [
      { id: "EPIC-1", title: "Skills Assessment", stories: [
        { id: "S-1-1", title: "Skills quiz + scoring", priority: "High", points: 3 },
        { id: "S-1-2", title: "Personalized roadmap output", priority: "High", points: 5 },
      ]},
      { id: "EPIC-2", title: "Job Matching", stories: [
        { id: "S-2-1", title: "Role recommendation engine", priority: "High", points: 5 },
        { id: "S-2-2", title: "Application tracker", priority: "Medium", points: 2 },
      ]},
    ],
  },
];

// ── Loading steps ─────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: 'Market research agent', sub: 'Scanning competitors · Finding target users · Identifying gaps' },
  { id: 2, label: 'Flow diagram generator', sub: 'Mapping user journey · Adding decision points · Marking value moments' },
];

export default function Home() {
  const [brief, setBrief] = useState('');
  const [mode, setMode] = useState<Mode>('learner');
  const [stage, setStage] = useState<Stage>('home');
  const [step, setStep] = useState(0);
  const [research, setResearch] = useState<Research | null>(null);
  const [diagram, setDiagram] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'research' | 'diagram'>('research');
  const [copied, setCopied] = useState(false);
  const [epicCount, setEpicCount] = useState(3);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [previewTab, setPreviewTab] = useState<'research' | 'diagram' | 'jira'>('research');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Animate steps while loading
  // Clear any stale errors on mount + restore brief from URL
  useEffect(() => {
    setError('');
    const params = new URLSearchParams(window.location.search);
    const urlBrief = params.get('brief');
    if (urlBrief) {
      setBrief(decodeURIComponent(urlBrief));
      // Clean URL without reload
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // Update page title per stage
  useEffect(() => {
    if (stage === 'home') document.title = 'PM Sidekick — Describe what you\'re building';
    if (stage === 'loading') document.title = 'Generating... — PM Sidekick';
    if (stage === 'results') document.title = `${research?.product_name ?? 'Results'} — PM Sidekick`;
  }, [stage, research]);

  // No auto-cycling — preview is click-driven only

  // Restore previous session from localStorage on mount
  useEffect(() => {
    const savedResearch = localStorage.getItem('pm_sidekick_research');
    const savedDiagram  = localStorage.getItem('pm_sidekick_diagram');
    const savedBrief    = localStorage.getItem('pm_sidekick_brief');
    const savedMode     = localStorage.getItem('pm_sidekick_mode') as Mode | null;
      const savedEpicCount = localStorage.getItem('pm_sidekick_epic_count');
      if (savedEpicCount) setEpicCount(Number(savedEpicCount));
    if (savedResearch && savedDiagram && savedBrief) {
      try {
        setResearch(JSON.parse(savedResearch));
        setDiagram(savedDiagram);
        setBrief(savedBrief);
        if (savedMode) setMode(savedMode);
        setStage('results');
      } catch { /* corrupt data — start fresh */ }
    }
  }, []);

  useEffect(() => {
    if (stage !== 'loading') return;
    setStep(0);
    const t1 = setTimeout(() => setStep(1), 800);
    const t2 = setTimeout(() => setStep(2), 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [stage]);

  // Save mode to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('pm_sidekick_mode', mode);
  }, [mode]);

  async function generate() {
    if (brief.trim().length < 10) return;
    setError('');
    setStage('loading');
    setResearch(null);
    setDiagram('');

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brief, mode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');
      setResearch(data.research);
      setDiagram(data.diagram);
      setStage('results');
      setActiveTab(mode === 'expert' ? 'diagram' : 'research');
      // Store for export page + session restore
      localStorage.setItem('pm_sidekick_research', JSON.stringify(data.research));
      localStorage.setItem('pm_sidekick_diagram', data.diagram);
      localStorage.setItem('pm_sidekick_brief', brief);
      localStorage.setItem('pm_sidekick_mode', mode);
      localStorage.setItem('pm_sidekick_epic_count', String(epicCount));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
      setStage('home');
    }
  }

  function copyDiagram() {
    navigator.clipboard.writeText(diagram);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function reset() {
    // Clear saved session
    localStorage.removeItem('pm_sidekick_research');
    localStorage.removeItem('pm_sidekick_diagram');
    localStorage.removeItem('pm_sidekick_brief');
    localStorage.removeItem('pm_sidekick_mode');
    setStage('home');
    setBrief('');
    setResearch(null);
    setDiagram('');
    setTimeout(() => textareaRef.current?.focus(), 100);
  }

  // ── HOME ──────────────────────────────────────────────────────────
  if (stage === 'home') return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      {/* Nav */}
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
          <span className="font-display text-xl text-slate-900">
            PM<span className="text-indigo-600">Sidekick</span>
          </span>
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <a href="https://github.com/infi18/PM-sidekick" target="_blank" rel="noreferrer"
               className="hover:text-slate-900 transition-colors">GitHub</a>
            <span>·</span>
            <span>Built by Siddhi Naik</span>
          </div>
        </div>
      </nav>

      <div className="flex-1 flex flex-col items-center px-4 md:px-6 py-10 md:py-16">

        {/* Centered hero */}
        <div className="w-full max-w-2xl text-center mb-8 animate-fade-up">
          <div className="flex items-center justify-center gap-3 mb-5 flex-wrap">
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 text-xs font-medium px-3 py-1.5 rounded-full border border-indigo-100">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse-slow" />
              Research · Flow diagram · JIRA artifacts
            </div>
            <a href="#faq" className="text-xs text-slate-400 hover:text-slate-600 transition-colors underline underline-offset-2">
              Built by Siddhi Naik →
            </a>
          </div>
          <h1 className="font-display text-4xl md:text-5xl text-slate-900 leading-tight mb-4">
            Describe what you{`'`}re building.
          </h1>
          <p className="text-slate-500 text-base leading-relaxed mb-6">
            Plain-English brief in. Research, flow diagram, and JIRA artifacts out.
          </p>

        </div>

        {/* Input + Preview — desktop side by side, mobile input first */}
        <div className="w-full max-w-6xl animate-fade-up animate-delay-100">
          <div className="flex flex-col lg:grid lg:grid-cols-[65%_33%] gap-4 items-start">

            {/* Input — always first in DOM so it shows on top on mobile */}
            <div className="flex flex-col">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-50 transition-all flex flex-col h-full">
                {/* Mode toggle inside input card top */}
                <div className="flex items-center justify-between bg-slate-50 px-4 py-2.5 border-b border-slate-100">
                  <div className="flex items-center gap-1">
                    {(['learner', 'expert'] as Mode[]).map(m => (
                      <button key={m} onClick={() => setMode(m)}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                          mode === m ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'
                        }`}>
                        {m === 'learner' ? '🎓 Learner' : '⚡ Expert'}
                      </button>
                    ))}
                  </div>
                  <span className="text-xs text-slate-400 italic">
                    {mode === 'learner' ? 'Explains PM concepts inline' : 'Raw output, risks first'}
                  </span>
                </div>
                <textarea
                  ref={textareaRef}
                  value={brief}
                  onChange={e => setBrief(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) generate(); }}
                  placeholder="e.g. Finance advisor for someone new to the stock market in their 20s..."
                  rows={4}
                  className="w-full px-5 pt-4 pb-2 text-slate-800 placeholder-slate-400 resize-none outline-none text-[15px] leading-relaxed bg-transparent flex-1"
                />
                <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
                  {/* Fix 6: hint when button is disabled */}
                  {brief.trim().length > 0 && brief.trim().length < 10
                    ? <span className="text-xs text-amber-500">Keep going — a bit more detail</span>
                    : <span className="text-xs text-slate-400 hidden sm:block">⌘ + Enter to generate</span>
                  }
                  <button onClick={generate} disabled={brief.trim().length < 10}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium px-5 py-2 rounded-lg transition-all active:scale-95 ml-auto">
                    Generate artifacts →
                  </button>
                </div>
              </div>
              {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

              {/* Fix 1: Example chips — compact, left-aligned, natural width */}
              <div className="mt-4">
                <div className="flex flex-col gap-1.5">
                  {EXAMPLES.map((ex, i) => (
                    <button key={i}
                      onClick={() => {
                        setBrief(ex);
                        setPreviewIndex(i);
                        setPreviewTab('research');
                      }}
                      className={`text-left text-sm px-4 py-2.5 rounded-xl border transition-all flex items-center gap-2 ${
                        previewIndex === i && brief === ex
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-300'
                          : 'text-slate-600 bg-white hover:bg-indigo-50 hover:text-indigo-700 border-slate-200 hover:border-indigo-200'
                      }`}>
                      {/* Fix 4: visual active indicator */}
                      <span className={`shrink-0 w-1.5 h-1.5 rounded-full transition-all ${
                        previewIndex === i && brief === ex ? 'bg-indigo-500' : 'bg-slate-200'
                      }`}/>
                      {ex}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Preview panel — hidden on mobile, right on desktop */}
            <div className="hidden lg:flex flex-col">

              <div
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col flex-1"
              >
                {/* Preview header — matches input card top bar height */}
                <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900 truncate">{PREVIEWS[previewIndex].product}</p>
                    <p className="text-xs text-slate-400">{PREVIEWS[previewIndex].oneliner}</p>
                  </div>
                  {/* Fix 7: dot nav also updates input */}
                  <div className="flex gap-1 shrink-0">
                    {PREVIEWS.map((_, i) => (
                      <button key={i}
                        onClick={() => {
                          setPreviewIndex(i);
                          setBrief(EXAMPLES[i]);
                          setPreviewTab('research');
                        }}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          i === previewIndex ? 'bg-indigo-500 w-4' : 'bg-slate-200 w-1.5 hover:bg-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-100">
                  {(['research', 'diagram', 'jira'] as const).map(t => (
                    <button key={t}
                      onClick={() => setPreviewTab(t)}
                      className={`flex-1 py-2 text-xs font-medium transition-colors ${
                        previewTab === t
                          ? 'text-indigo-600 border-b-2 border-indigo-500'
                          : 'text-slate-400 hover:text-slate-600'
                      }`}>
                      {t === 'research' ? 'Research' : t === 'diagram' ? 'Diagram' : 'JIRA'}
                    </button>
                  ))}
                </div>

                {/* Research tab */}
                {previewTab === 'research' && (
                  <div className="px-4 py-3 space-y-3 flex-1 overflow-y-auto">
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Competitors</p>
                      {PREVIEWS[previewIndex].competitors.map((c, i) => (
                        <div key={i} className="mb-1.5">
                          <p className="text-xs font-semibold text-slate-800">{c.name}</p>
                          <p className="text-xs text-teal-600">↳ {c.gap}</p>
                        </div>
                      ))}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Market gaps</p>
                      {PREVIEWS[previewIndex].gaps.map((g, i) => (
                        <div key={i} className="flex items-start gap-1.5 mb-1">
                          <span className="mt-0.5 shrink-0 w-3.5 h-3.5 rounded-full bg-amber-100 text-amber-600 text-[8px] flex items-center justify-center font-bold">{i+1}</span>
                          <p className="text-xs text-slate-600">{g}</p>
                        </div>
                      ))}
                    </div>
                    <div className="bg-teal-50 rounded-xl px-3 py-2 border border-teal-100">
                      <p className="text-xs font-semibold text-teal-600 mb-0.5">PM learning note</p>
                      <p className="text-xs text-slate-600">{PREVIEWS[previewIndex].note}</p>
                    </div>
                  </div>
                )}

                {/* Diagram tab — clean static SVG */}
                {previewTab === 'diagram' && (
                  <div className="px-3 py-3 flex-1 flex flex-col items-center justify-center" style={{minHeight:'200px'}}>
                    <svg width="180" height="200" viewBox="0 0 180 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="30" y="4" width="120" height="28" rx="14" fill="#EEF2FF" stroke="#C7D2FE" strokeWidth="1"/>
                      <text x="90" y="22" textAnchor="middle" fontSize="10" fill="#4F46E5" fontFamily="system-ui">User enters brief</text>
                      <line x1="90" y1="32" x2="90" y2="48" stroke="#CBD5E1" strokeWidth="1.5"/>
                      <polygon points="90,52 85,46 95,46" fill="#CBD5E1"/>
                      <polygon points="90,68 60,52 120,52" fill="#FEF9C3" stroke="#FDE047" strokeWidth="1"/>
                      <text x="90" y="64" textAnchor="middle" fontSize="9" fill="#854D0E" fontFamily="system-ui">Clear enough?</text>
                      <line x1="120" y1="60" x2="150" y2="60" stroke="#CBD5E1" strokeWidth="1" strokeDasharray="3,2"/>
                      <text x="135" y="55" textAnchor="middle" fontSize="8" fill="#94A3B8" fontFamily="system-ui">No</text>
                      <rect x="130" y="64" width="46" height="20" rx="4" fill="#FFF7ED" stroke="#FED7AA" strokeWidth="1"/>
                      <text x="153" y="77" textAnchor="middle" fontSize="8" fill="#C2410C" fontFamily="system-ui">Refine →</text>
                      <line x1="90" y1="68" x2="90" y2="84" stroke="#CBD5E1" strokeWidth="1.5"/>
                      <polygon points="90,88 85,82 95,82" fill="#CBD5E1"/>
                      <text x="60" y="76" textAnchor="middle" fontSize="8" fill="#94A3B8" fontFamily="system-ui">Yes</text>
                      <rect x="20" y="88" width="140" height="28" rx="6" fill="#ECFDF5" stroke="#A7F3D0" strokeWidth="1"/>
                      <text x="90" y="106" textAnchor="middle" fontSize="10" fill="#065F46" fontFamily="system-ui">Market research agent</text>
                      <line x1="90" y1="116" x2="90" y2="132" stroke="#CBD5E1" strokeWidth="1.5"/>
                      <polygon points="90,136 85,130 95,130" fill="#CBD5E1"/>
                      <rect x="20" y="136" width="140" height="28" rx="6" fill="#EEF2FF" stroke="#C7D2FE" strokeWidth="1"/>
                      <text x="90" y="154" textAnchor="middle" fontSize="10" fill="#3730A3" fontFamily="system-ui">Flow diagram generated</text>
                      <line x1="90" y1="164" x2="90" y2="180" stroke="#CBD5E1" strokeWidth="1.5"/>
                      <polygon points="90,184 85,178 95,178" fill="#CBD5E1"/>
                      <rect x="20" y="184" width="140" height="14" rx="7" fill="#4F46E5" stroke="none"/>
                      <text x="90" y="194" textAnchor="middle" fontSize="9" fill="white" fontFamily="system-ui" fontWeight="500">JIRA artifacts ready</text>
                    </svg>
                    <p className="text-xs text-slate-400 text-center mt-1">Full interactive diagram after generating</p>
                  </div>
                )}

                {/* JIRA tab */}
                {previewTab === 'jira' && (
                  <div className="px-3 py-3 space-y-2 flex-1 overflow-y-auto">
                    {PREVIEWS[previewIndex].epics.map((epic, i) => (
                      <div key={i} className="border border-slate-200 rounded-xl overflow-hidden">
                        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50">
                          <span className="text-xs font-bold text-indigo-500 font-mono">{epic.id}</span>
                          <span className="text-xs font-semibold text-slate-800 truncate">{epic.title}</span>
                        </div>
                        <div className="px-3 py-2 space-y-1">
                          {epic.stories.map((s, j) => (
                            <div key={j} className="flex items-center gap-2">
                              <span className="text-xs text-slate-400 font-mono shrink-0">{s.id}</span>
                              <span className="text-xs text-slate-600 flex-1 truncate">{s.title}</span>
                              <span className={`text-xs px-1.5 py-0.5 rounded font-medium shrink-0 ${
                                s.priority === 'High' ? 'bg-red-50 text-red-500' :
                                s.priority === 'Medium' ? 'bg-amber-50 text-amber-500' :
                                'bg-slate-100 text-slate-400'}`}>{s.priority}</span>
                              <span className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded shrink-0">{s.points}pt</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div id="faq" className="mt-16 md:mt-20 max-w-6xl w-full mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px bg-slate-200"/>
            <span className="text-xs text-slate-400 uppercase tracking-widest font-medium">PM Sidekick</span>
            <div className="flex-1 h-px bg-slate-200"/>
          </div>
          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px bg-slate-200"/>
            <span className="text-xs text-slate-400 uppercase tracking-widest font-medium">PM Sidekick</span>
            <div className="flex-1 h-px bg-slate-200"/>
          </div>
            <h2 className="font-display text-2xl text-slate-900 mb-6 text-center">Frequently asked questions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { q: "Do I need to know agile to use this?", a: "No. You describe what you're building in plain English — PM Sidekick figures out the structure. No methodology knowledge required." },
                { q: "What's the difference between Learner and Expert mode?", a: "Learner mode includes a PM learning note explaining what the research means and why it matters. Expert mode gives you raw output with no explanation." },
                { q: "How is this different from Claude Code PM plugins?", a: "Claude Code plugins require terminal installation and PM methodology knowledge. PM Sidekick runs in a browser with zero setup — describe it, get artifacts." },
                { q: "Can I use this for any type of product?", a: "Yes — consumer apps, B2B tools, internal tools, marketplaces. As long as you can describe what you're building in a sentence, PM Sidekick can work with it." },
                { q: "Is my data stored anywhere?", a: "Your last session is saved locally in your browser so you can return to it. Nothing is sent to any server except the Claude API to generate results." },
                { q: "How accurate is the research?", a: "PM Sidekick uses Claude to synthesize competitive context. Treat it as a strong starting point — verify with your own primary research before shipping." },
              ].map((faq, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                  <p className="font-semibold text-sm text-slate-900 mb-2">{faq.q}</p>
                  <p className="text-sm text-slate-500 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-4 text-center text-xs text-slate-400 mt-8">
        © 2026 Siddhi Naik · PM Sidekick · CC BY-NC 4.0 ·{' '}
        <a href="https://github.com/infi18/PM-sidekick" className="hover:text-slate-600 underline" target="_blank" rel="noreferrer">
          github.com/infi18/PM-sidekick
        </a>
      </footer>
    </main>
  );

    // ── LOADING ───────────────────────────────────────────────────────
  if (stage === 'loading') return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-6">
      <div className="max-w-md w-full">
        <div className="mb-8 text-center">
          <span className="font-display text-2xl text-slate-900">
            PM<span className="text-indigo-600">Sidekick</span>
          </span>
        </div>

        <div className="bg-slate-100 rounded-xl px-4 py-3 mb-8">
          <p className="text-xs text-slate-500 mb-1">Your brief</p>
          <p className="text-sm text-slate-700 font-medium line-clamp-2 italic">"{brief}"</p>
        </div>

        <div className="space-y-4">
          {STEPS.map((s, i) => {
            const active = step === i;
            const done = step > i;
            return (
              <div key={s.id} className={`bg-white rounded-2xl border p-5 transition-all duration-500 ${
                active ? 'border-indigo-300 shadow-md shadow-indigo-100' :
                done ? 'border-teal-200' : 'border-slate-200 opacity-50'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    done ? 'bg-teal-500 text-white' :
                    active ? 'bg-indigo-600 text-white' :
                    'bg-slate-200 text-slate-400'
                  }`}>
                    {done ? '✓' : s.id}
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium text-sm ${active || done ? 'text-slate-900' : 'text-slate-400'}`}>
                      {s.label}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">{s.sub}</p>
                  </div>
                  {active && (
                    <div className="flex gap-1">
                      {[0,1,2].map(d => (
                        <span key={d} className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce"
                          style={{ animationDelay: `${d * 150}ms` }} />
                      ))}
                    </div>
                  )}
                </div>
                {active && (
                  <div className="mt-3 h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full animate-pulse" style={{ width: '60%' }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs text-slate-400 mt-8">
          {mode === 'learner' ? '💡 Learner mode — includes PM learning note' : '⚡ Expert mode — raw output only'}
        </p>
      </div>
    </main>
  );

  // ── RESULTS ───────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      {/* Nav */}
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 md:px-6 min-h-14 flex items-center justify-between flex-wrap gap-2 py-2">
          <button onClick={reset} className="font-display text-xl text-slate-900 hover:text-indigo-600 transition-colors">
            PM<span className="text-indigo-600">Sidekick</span>
          </button>
          <a href="https://github.com/infi18/PM-sidekick" target="_blank" rel="noreferrer"
            className="text-xs text-slate-400 hover:text-slate-600 transition-colors hidden sm:block">
            github.com/infi18/PM-sidekick ↗
          </a>
          <div className="flex items-center gap-3">
            {mode === 'expert' && (
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full">
                ⚡ Expert mode
              </span>
            )}
            {mode === 'learner' && (
              <span className="text-xs font-semibold text-teal-600 bg-teal-50 border border-teal-100 px-2.5 py-1 rounded-full">
                🎓 Learner mode
              </span>
            )}
            <button onClick={reset}
              className="text-sm text-slate-500 hover:text-slate-900 border border-slate-200 hover:border-slate-300 px-3 py-1.5 rounded-lg transition-all">
              ← New brief
            </button>
            <button onClick={() => {
                setStage('home');
                setTimeout(() => textareaRef.current?.focus(), 100);
              }}
              className="text-sm text-indigo-600 hover:text-indigo-800 border border-indigo-200 hover:border-indigo-300 px-3 py-1.5 rounded-lg transition-all">
              ✏️ Refine brief
            </button>
            <button onClick={() => {
                const url = `${window.location.origin}?brief=${encodeURIComponent(brief)}`;
                navigator.clipboard.writeText(url);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="text-sm text-slate-500 hover:text-slate-900 border border-slate-200 hover:border-slate-300 px-3 py-1.5 rounded-lg transition-all">
              {copied ? '✓ Link copied' : '🔗 Share'}
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto w-full px-4 md:px-6 py-6 flex-1">
        {/* Brief recap */}
        <div className={`mb-6 animate-fade-up rounded-xl px-4 py-3 flex items-start justify-between gap-4 ${
          mode === 'expert'
            ? 'bg-slate-900 border border-slate-800'
            : 'bg-white border border-slate-200 shadow-sm'
        }`}>
          <div className="flex-1 min-w-0">
            <p className={`text-xs uppercase tracking-wider mb-1 ${mode === 'expert' ? 'text-slate-500' : 'text-slate-400'}`}>Brief</p>
            <p className={`text-sm italic ${mode === 'expert' ? 'text-slate-300' : 'text-slate-700'}`}>"{brief}"</p>
          </div>
          {/* Brief quality signal */}
          <div className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full border ${
            brief.length > 60
              ? 'bg-green-50 text-green-600 border-green-200'
              : brief.length > 30
              ? 'bg-amber-50 text-amber-600 border-amber-100'
              : 'bg-red-50 text-red-500 border-red-100'
          }`}>
            {brief.length > 60 ? '✓ Specific' : brief.length > 30 ? '~ Could be more specific' : '↑ Too vague'}
          </div>
        </div>

        {/* Product name + one-liner */}
        {research && (
          <div className="mb-8 animate-fade-up animate-delay-100">
            <h2 className={`font-display text-3xl mb-1 ${mode === 'expert' ? 'text-slate-900' : 'text-slate-900'}`}>{research.product_name}</h2>
            <p className="text-slate-500 text-base">{research.one_liner}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit mb-6 animate-fade-up animate-delay-200">
          {(['research', 'diagram'] as const).map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}>
              {t === 'research' ? '📊 Research' : '🗺️ Flow diagram'}
            </button>
          ))}
        </div>

        {/* Research tab */}
        {activeTab === 'research' && research && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-up">
            {/* Expert mode — risks at top */}
            {mode === 'expert' && research.risks && research.risks.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm col-span-full">
                <h3 className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-3">
                  ⚠️ Risks — read these first
                </h3>
                <div className="flex flex-col sm:flex-row gap-4">
                  {research.risks.map((r: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 flex-1">
                      <span className="mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-red-400" />
                      <p className="text-sm text-slate-300">{r}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Target users */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Target users</h3>
              <div className="space-y-3">
                {research.target_users?.map((u, i) => (
                  <div key={i} className="pl-3 border-l-2 border-indigo-200">
                    <p className="font-semibold text-sm text-slate-800">{u.segment}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{u.pain}</p>
                    <p className="text-xs text-slate-400 mt-0.5">Today: {u.current_solution}</p>
                  </div>
                ))}
              </div>
              {mode === 'learner' && (
                <LearnNote title="Why target users matter">
                  Before building anything, you need to know exactly who you're solving for. A target user isn't a demographic — it's a person with a specific pain, in a specific situation, who currently has no great solution. The more specific your user, the more focused your product decisions become. Vague users lead to bloated products.
                </LearnNote>
              )}
            </div>

            {/* Competitors */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Competitors</h3>
              <div className="space-y-3">
                {research.competitors?.map((c, i) => (
                  <div key={i} className="pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                    <p className="font-semibold text-sm text-slate-800">{c.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5 mb-1">{c.what_they_do}</p>
                    <p className="text-xs text-teal-600 font-medium">↳ {c.their_gap}</p>
                  </div>
                ))}
              </div>
              {mode === 'learner' && (
                <LearnNote title="Why we study competitors">
                  Competitor analysis isn't about copying — it's about finding where the market has left users underserved. Every gap in a competitor's offering is a potential reason for your product to exist. The "their gap" column is the most important: it tells you what users are tolerating, not choosing.
                </LearnNote>
              )}
            </div>

            {/* Market gaps */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Market gaps</h3>
              <div className="space-y-2">
                {research.market_gaps?.map((g, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="mt-0.5 shrink-0 w-4 h-4 rounded-full bg-amber-100 text-amber-600 text-[10px] flex items-center justify-center font-bold">
                      {i + 1}
                    </span>
                    <p className="text-sm text-slate-600">{g}</p>
                  </div>
                ))}
              </div>
              {mode === 'learner' && (
                <LearnNote title="What is a market gap?">
                  A market gap is a problem that exists but isn't being solved well by any current product. Finding a gap isn't enough — you need to validate that users care enough about it to switch. Ask yourself: would someone pay to fix this, or just wish it were different?
                </LearnNote>
              )}
            </div>

            {/* Differentiation */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 shadow-sm md:col-span-2">
              <h3 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">Differentiation</h3>
              <p className="text-slate-700 leading-relaxed">{research.differentiation}</p>
              {mode === 'learner' && (
                <LearnNote title="What is differentiation?">
                  Your differentiation is your answer to "why would someone choose you over everything else?" It should be specific enough that a user can repeat it back to a friend. If it sounds like "we do X but better," it's not differentiated enough — better is a feature, not a position.
                </LearnNote>
              )}
            </div>

            {/* Risks */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Risks to watch</h3>
              <div className="space-y-2">
                {research.risks?.map((r, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="mt-1 shrink-0 w-1.5 h-1.5 rounded-full bg-red-300" />
                    <p className="text-sm text-slate-600">{r}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Learning note — only in learner mode */}
            {mode === 'learner' && research.learning_note && (
              <div className="bg-teal-50 border border-teal-100 rounded-2xl p-5 shadow-sm md:col-span-3">
                <h3 className="text-xs font-semibold text-teal-600 uppercase tracking-wider mb-2">
                  💡 PM learning note
                </h3>
                <p className="text-slate-700 leading-relaxed">{research.learning_note}</p>
              </div>
            )}
          </div>
        )}

        {/* Diagram tab */}
        {activeTab === 'diagram' && (
          <div className="animate-fade-up">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 flex-wrap gap-2">
                <span className="text-sm font-medium text-slate-700">User flow diagram</span>
                <div className="flex gap-2">
                  <button onClick={copyDiagram}
                    className="text-xs text-slate-500 hover:text-slate-800 border border-slate-200 hover:border-slate-300 px-3 py-1.5 rounded-lg transition-all">
                    {copied ? '✓ Copied' : 'Copy mermaid'}
                  </button>
                  <a href={`https://mermaid.live/edit#pako:${encodeURIComponent(diagram)}`}
                    target="_blank" rel="noreferrer"
                    className="text-xs text-indigo-600 hover:text-indigo-800 border border-indigo-200 hover:border-indigo-300 px-3 py-1.5 rounded-lg transition-all">
                    Open in mermaid.live ↗
                  </a>
                </div>
              </div>
              <div className="p-6">
                <MermaidDiagram chart={diagram} />
              </div>
            </div>

            {/* Learner note for diagram */}
            {mode === 'learner' && (
              <div className="mt-4 bg-teal-50 border border-teal-100 rounded-2xl px-5 py-4">
                <p className="text-xs font-semibold text-teal-700 mb-1">What is a user flow diagram?</p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  A flow diagram maps the path a user takes through your product — from entry to value. Every diamond shape is a decision point where users might drop off. Good PMs design for the "No" paths first: what happens when a user isn't ready, isn't sure, or doesn't understand? That's where most products fail.
                </p>
              </div>
            )}

            {/* Raw mermaid code */}
            <details className="mt-4 bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <summary className="px-5 py-3 text-sm text-slate-500 cursor-pointer hover:text-slate-700 select-none">
                View mermaid source
              </summary>
              <pre className="px-5 pb-5 font-mono text-xs text-slate-500 whitespace-pre-wrap overflow-auto">
                {diagram}
              </pre>
            </details>
          </div>
        )}

        {/* Export strip */}
        <div className="mt-8 pt-6 border-t border-slate-200 animate-fade-up animate-delay-300">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-700 mb-1">Ready to export?</p>
              <p className="text-xs text-slate-400 mb-3">Generate JIRA epics and user stories from your research</p>
              {/* Fix 8: Epic count selector */}
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-xs text-slate-500">Epics to generate:</p>
                {[2, 3, 4, 5].map(n => (
                  <button key={n}
                    onClick={() => { localStorage.setItem('pm_sidekick_epic_count', String(n)); setEpicCount(n); }}
                    className={`w-8 h-8 rounded-lg text-xs font-semibold border transition-all ${
                      epicCount === n
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                    }`}>
                    {n}
                  </button>
                ))}
                {mode === 'learner' && (
                  <span className="text-xs text-teal-600 ml-1">3 is a good starting point for an MVP</span>
                )}
                {mode === 'expert' && epicCount > 3 && (
                  <span className="text-xs text-amber-600 ml-1">⚠️ Quality degrades above 3 — use 2-3 for best output</span>
                )}
              </div>
            </div>
            <div className="flex gap-3 flex-wrap">
              <a href="/export"
                className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2.5 rounded-xl transition-all flex items-center gap-2">
                Generate {epicCount} epics →
                <span className="text-xs opacity-70">~15s</span>
              </a>
              <button disabled
                className="text-xs text-slate-400 border border-slate-200 px-4 py-2.5 rounded-xl cursor-not-allowed opacity-50">
                Notion — coming soon
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-4 text-center text-xs text-slate-400">
        © 2026 Siddhi Naik · PM Sidekick · CC BY-NC 4.0 ·{' '}
        <a href="https://github.com/infi18/PM-sidekick" className="hover:text-slate-600 underline" target="_blank" rel="noreferrer">
          github.com/infi18/PM-sidekick
        </a>
      </footer>
    </main>
  );
}