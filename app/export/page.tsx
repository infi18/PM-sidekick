'use client';

import { useState, useEffect, useRef } from 'react';

interface Story {
  id: string;
  title: string;
  description: string;
  acceptance_criteria: string[];
  story_points: number;
  priority: 'High' | 'Medium' | 'Low';
  labels: string[];
}

interface Epic {
  id: string;
  title: string;
  description: string;
  goal: string;
  stories: Story[];
}

interface Artifacts {
  epics: Epic[];
}

const PRIORITY_STYLES: Record<string, string> = {
  High:   'bg-red-50 text-red-600 border-red-100',
  Medium: 'bg-amber-50 text-amber-600 border-amber-100',
  Low:    'bg-slate-50 text-slate-500 border-slate-200',
};

export default function ExportPage() {
  const [artifacts, setArtifacts] = useState<Artifacts | null>(null);
  const [loading, setLoading]     = useState(true);
  const [streaming, setStreaming]  = useState(false);
  const [progress, setProgress]   = useState(0);
  const [error, setError]         = useState('');
  const [copied, setCopied]       = useState<string | null>(null);
  const [expanded, setExpanded]   = useState<Record<string, boolean>>({});
  const bufferRef = useRef('');

  useEffect(() => {
    const raw   = sessionStorage.getItem('pm_sidekick_research');
    const brief = sessionStorage.getItem('pm_sidekick_brief');

    if (!raw || !brief) {
      setError('No research found. Please go back and generate research first.');
      setLoading(false);
      return;
    }

    generateArtifacts(JSON.parse(raw), brief);
  }, []);

  async function generateArtifacts(research: object, brief: string) {
    setStreaming(true);
    setProgress(30);

    try {
      const res = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ research, brief }),
      });

      setProgress(80);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Export failed');

      setProgress(100);
      setArtifacts(data);

      if (data.epics?.length > 0) {
        const exp: Record<string, boolean> = {};
        data.epics.forEach((e: Epic) => { exp[e.id] = true; });
        setExpanded(exp);
      }

    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
      setStreaming(false);
    }
  }

  function tryParse(text: string) {
    // Try to parse partial JSON — works once we have at least one complete epic
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return;
    try {
      const parsed = JSON.parse(match[0]);
      if (parsed.epics?.length > 0) {
        setArtifacts(parsed);
        if (Object.keys(expanded).length === 0) {
          const exp: Record<string, boolean> = {};
          parsed.epics.forEach((e: Epic) => { exp[e.id] = true; });
          setExpanded(exp);
        }
      }
    } catch { /* incomplete JSON — keep buffering */ }
  }

  function copyText(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  function copyStory(story: Story) {
    const text = `**${story.title}**\n\n${story.description}\n\n**Acceptance Criteria:**\n${
      story.acceptance_criteria.map((c, i) => `${i + 1}. ${c}`).join('\n')
    }\n\nPoints: ${story.story_points} | Priority: ${story.priority}`;
    copyText(text, story.id);
  }

  function copyAllJSON() {
    copyText(JSON.stringify(artifacts, null, 2), 'all');
  }

  function toggleEpic(id: string) {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  }

  const totalStories = artifacts?.epics.reduce((acc, e) => acc + e.stories.length, 0) ?? 0;
  const totalPoints  = artifacts?.epics.reduce((acc, e) =>
    acc + e.stories.reduce((s, st) => s + st.story_points, 0), 0) ?? 0;

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      {/* Nav */}
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="font-display text-xl text-slate-900">
            PM<span className="text-indigo-600">Sidekick</span>
          </span>
          <div className="flex items-center gap-3">
            <button onClick={() => window.history.back()}
              className="text-sm text-slate-500 hover:text-slate-900 border border-slate-200 hover:border-slate-300 px-3 py-1.5 rounded-lg transition-all">
              ← Back to research
            </button>
            {artifacts && (
              <button onClick={copyAllJSON}
                className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-lg transition-all font-medium">
                {copied === 'all' ? '✓ Copied' : 'Copy all JSON'}
              </button>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto w-full px-6 py-8 flex-1">

        {/* Header */}
        <div className="mb-6 animate-fade-up">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs font-semibold text-indigo-500 uppercase tracking-wider bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
              Week 2 — JIRA Export
            </span>
          </div>
          <h1 className="font-display text-3xl text-slate-900 mb-1">JIRA Artifacts</h1>
          <p className="text-slate-500">Generated from your research. Copy individual stories or export all as JSON.</p>
        </div>

        {/* Streaming progress bar */}
        {streaming && (
          <div className="mb-6 animate-fade-up">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-500 flex items-center gap-2">
                <span className="flex gap-1">
                  {[0,1,2].map(d => (
                    <span key={d} className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce"
                      style={{ animationDelay: `${d * 150}ms` }} />
                  ))}
                </span>
                Generating epics and stories...
              </span>
              <span className="text-xs text-slate-400">{progress}%</span>
            </div>
            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
            <p className="text-red-600 mb-3">{error}</p>
            <button onClick={() => window.history.back()}
              className="text-sm text-slate-600 underline">
              Go back to generate research first
            </button>
          </div>
        )}

        {/* Stats strip — shows as soon as first epic arrives */}
        {artifacts && (
          <>
            <div className="grid grid-cols-3 gap-4 mb-6 animate-fade-up">
              {[
                { label: 'Epics',         value: artifacts.epics.length,  color: 'text-indigo-600', bg: 'bg-indigo-50'  },
                { label: 'User stories',  value: totalStories,             color: 'text-teal-600',   bg: 'bg-teal-50'    },
                { label: 'Total points',  value: totalPoints,              color: 'text-slate-700',  bg: 'bg-slate-100'  },
              ].map(stat => (
                <div key={stat.label} className={`${stat.bg} rounded-2xl p-4 text-center border border-slate-200 transition-all`}>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Epics */}
            <div className="space-y-4">
              {artifacts.epics.map((epic) => (
                <div key={epic.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fade-up">
                  {/* Epic header */}
                  <button onClick={() => toggleEpic(epic.id)}
                    className="w-full text-left px-6 py-5 flex items-start justify-between gap-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start gap-3">
                      <span className="shrink-0 mt-0.5 text-xs font-bold text-indigo-500 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded font-mono">
                        {epic.id}
                      </span>
                      <div>
                        <p className="font-semibold text-slate-900 text-base">{epic.title}</p>
                        <p className="text-sm text-slate-500 mt-0.5">{epic.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-slate-400">{epic.stories.length} stories</span>
                      <span className={`text-slate-400 transition-transform ${expanded[epic.id] ? 'rotate-180' : ''}`}>▾</span>
                    </div>
                  </button>

                  {expanded[epic.id] && (
                    <div className="px-6 pb-4 border-t border-slate-100">
                      <div className="bg-indigo-50 rounded-xl px-4 py-3 mt-3 mb-4">
                        <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wider mb-1">Epic goal</p>
                        <p className="text-sm text-slate-700">{epic.goal}</p>
                      </div>

                      <div className="space-y-3">
                        {epic.stories.map((story) => (
                          <div key={story.id} className="border border-slate-200 rounded-xl overflow-hidden">
                            <div className="flex items-start justify-between gap-3 px-4 py-3 bg-slate-50">
                              <div className="flex items-start gap-2">
                                <span className="shrink-0 text-xs text-slate-400 font-mono mt-0.5">{story.id}</span>
                                <p className="font-medium text-sm text-slate-800">{story.title}</p>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className={`text-xs border px-2 py-0.5 rounded-full font-medium ${PRIORITY_STYLES[story.priority] ?? PRIORITY_STYLES.Medium}`}>
                                  {story.priority}
                                </span>
                                <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                                  {story.story_points}pt
                                </span>
                                <button onClick={() => copyStory(story)}
                                  className="text-xs text-indigo-500 hover:text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-lg transition-all">
                                  {copied === story.id ? '✓' : 'Copy'}
                                </button>
                              </div>
                            </div>

                            <div className="px-4 py-3">
                              <p className="text-sm text-slate-600 mb-3">{story.description}</p>
                              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Acceptance criteria</p>
                              <ul className="space-y-1.5">
                                {story.acceptance_criteria.map((ac, i) => (
                                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                                    <span className="shrink-0 mt-0.5 w-4 h-4 rounded border border-slate-300 bg-white flex items-center justify-center text-[10px] text-slate-400 font-mono">
                                      {i + 1}
                                    </span>
                                    {ac}
                                  </li>
                                ))}
                              </ul>
                              {story.labels?.length > 0 && (
                                <div className="flex gap-1.5 mt-3 flex-wrap">
                                  {story.labels.map((label, i) => (
                                    <span key={i} className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                                      {label}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Export strip */}
            <div className="mt-8 pt-6 border-t border-slate-200">
              <p className="text-sm font-medium text-slate-700 mb-1">Export options</p>
              <p className="text-xs text-slate-400 mb-4">CSV and Notion export coming in Week 3</p>
              <div className="flex gap-3 flex-wrap">
                <button onClick={copyAllJSON}
                  className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl transition-all font-medium">
                  {copied === 'all' ? '✓ Copied!' : 'Copy all as JSON'}
                </button>
                <button disabled className="text-sm text-slate-400 border border-slate-200 px-5 py-2.5 rounded-xl cursor-not-allowed opacity-50">
                  Download CSV
                </button>
                <button disabled className="text-sm text-slate-400 border border-slate-200 px-5 py-2.5 rounded-xl cursor-not-allowed opacity-50">
                  Export to Notion
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <footer className="border-t border-slate-200 py-4 text-center text-xs text-slate-400">
        © 2026 Siddhi Naik · PM Sidekick · CC BY-NC 4.0 ·{' '}
        <a href="https://github.com/infi18/PM-sidekick" className="hover:text-slate-600 underline" target="_blank" rel="noreferrer">
          github.com/infi18/PM-sidekick
        </a>
      </footer>
    </main>
  );
}