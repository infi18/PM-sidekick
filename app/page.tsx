'use client';

import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';

const MermaidDiagram = dynamic(() => import('../components/MermaidDiagram'), {
  ssr: false,
  loading: () => <div className="h-48 bg-slate-50 rounded-xl animate-pulse" />,
});

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
  "Credit coaching tool for young adults who don't understand credit scores",
];

// ── Loading steps ─────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: 'Market research agent', sub: 'Competitive landscape · Target users · Market gaps' },
  { id: 2, label: 'Flow diagram generator', sub: 'User journey · Decision points · Value moments' },
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Animate steps while loading
  // Restore previous session from localStorage on mount
  useEffect(() => {
    const savedResearch = localStorage.getItem('pm_sidekick_research');
    const savedDiagram  = localStorage.getItem('pm_sidekick_diagram');
    const savedBrief    = localStorage.getItem('pm_sidekick_brief');
    const savedMode     = localStorage.getItem('pm_sidekick_mode') as Mode | null;
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
      setActiveTab('research');
      // Store for export page + session restore
      localStorage.setItem('pm_sidekick_research', JSON.stringify(data.research));
      localStorage.setItem('pm_sidekick_diagram', data.diagram);
      localStorage.setItem('pm_sidekick_brief', brief);
      localStorage.setItem('pm_sidekick_mode', mode);
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
        <div className="max-w-5xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
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

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 md:px-6 py-10 md:py-20">
        <div className="max-w-2xl w-full text-center mb-10 animate-fade-up">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 text-xs font-medium px-3 py-1.5 rounded-full mb-6 border border-indigo-100">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse-slow" />
            Week 1 — Research + Flow Diagram
          </div>
          <h1 className="font-display text-5xl text-slate-900 leading-tight mb-4">
            Describe what you're building.
          </h1>
          <p className="text-slate-500 text-lg leading-relaxed">
            PM Sidekick turns a plain-English brief into competitive research
            and a user flow diagram — in under 2 minutes.
            No templates. No methodology required.
          </p>
        </div>

        {/* Mode toggle */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg mb-6 animate-fade-up animate-delay-100">
          {(['learner', 'expert'] as Mode[]).map(m => (
            <button key={m} onClick={() => setMode(m)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                mode === m
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}>
              {m === 'learner' ? '🎓 Learner mode' : '⚡ Expert mode'}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="w-full max-w-2xl animate-fade-up animate-delay-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-50 transition-all">
            <textarea
              ref={textareaRef}
              value={brief}
              onChange={e => setBrief(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) generate(); }}
              placeholder="e.g. A credit coaching tool for young adults who don't understand how credit scores work..."
              rows={4}
              className="w-full px-5 pt-4 pb-2 text-slate-800 placeholder-slate-400 resize-none outline-none text-[15px] leading-relaxed bg-transparent"
            />
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
              <span className="text-xs text-slate-400">⌘ + Enter to generate</span>
              <button onClick={generate} disabled={brief.trim().length < 10}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium px-5 py-2 rounded-lg transition-all active:scale-95">
                Generate artifacts →
              </button>
            </div>
          </div>

          {error && (
            <p className="mt-3 text-sm text-red-500 text-center">{error}</p>
          )}

          {/* Examples */}
          <div className="mt-6">
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-3 text-center">Try an example</p>
            <div className="flex flex-col gap-2">
              {EXAMPLES.map((ex, i) => (
                <button key={i} onClick={() => setBrief(ex)}
                  className="text-left text-sm text-slate-600 bg-white hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 hover:border-indigo-200 px-4 py-3 rounded-xl transition-all">
                  {ex}
                </button>
              ))}
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
          <div className="flex items-center gap-3">
            <button onClick={reset}
              className="text-sm text-slate-500 hover:text-slate-900 border border-slate-200 hover:border-slate-300 px-3 py-1.5 rounded-lg transition-all">
              ← New brief
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto w-full px-4 md:px-6 py-6 flex-1">
        {/* Brief recap */}
        <div className="mb-6 animate-fade-up">
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Your brief</p>
          <p className="text-slate-700 italic">"{brief}"</p>
        </div>

        {/* Product name + one-liner */}
        {research && (
          <div className="mb-8 animate-fade-up animate-delay-100">
            <h2 className="font-display text-3xl text-slate-900 mb-1">{research.product_name}</h2>
            <p className="text-slate-500 text-lg">{research.one_liner}</p>
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
            </div>

            {/* Differentiation */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 shadow-sm md:col-span-2">
              <h3 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">Differentiation</h3>
              <p className="text-slate-700 leading-relaxed">{research.differentiation}</p>
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-700 mb-1">Ready to export?</p>
              <p className="text-xs text-slate-400">Generate JIRA epics and user stories from your research</p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <a href="/export"
                className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2.5 rounded-xl transition-all">
                Generate JIRA artifacts →
              </a>
              <button disabled
                className="text-xs text-slate-400 border border-slate-200 px-4 py-2.5 rounded-xl cursor-not-allowed opacity-50">
                Notion export — coming soon
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