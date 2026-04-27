'use client';

import { useEffect, useRef, useState } from 'react';

interface MermaidProps {
  chart: string;
}

export default function MermaidDiagram({ chart }: MermaidProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function render() {
      if (!ref.current || !chart) return;
      try {
        const mermaid = (await import('mermaid')).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: 'base',
          themeVariables: {
            primaryColor: '#EEF2FF',
            primaryTextColor: '#1E293B',
            primaryBorderColor: '#6366F1',
            lineColor: '#94A3B8',
            secondaryColor: '#F0FDFA',
            tertiaryColor: '#F8FAFC',
            background: '#FFFFFF',
            mainBkg: '#EEF2FF',
            nodeBorder: '#6366F1',
            clusterBkg: '#F0FDFA',
            titleColor: '#1E293B',
            edgeLabelBackground: '#F8FAFC',
            fontSize: '13px',
          },
          flowchart: { curve: 'basis', padding: 20 },
        });

        const id = `mermaid-${Date.now()}`;
        const { svg } = await mermaid.render(id, chart);
        if (!cancelled && ref.current) {
          ref.current.innerHTML = svg;
        }
      } catch (e) {
        console.error('Mermaid render error:', e);
        if (!cancelled) setError(true);
      }
    }

    render();
    return () => { cancelled = true; };
  }, [chart]);

  if (error) {
    return (
      <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
        <pre className="font-mono text-xs text-slate-500 whitespace-pre-wrap overflow-auto">
          {chart}
        </pre>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className="w-full overflow-x-auto flex justify-center [&>svg]:max-w-full [&>svg]:h-auto [&>svg]:min-w-0"
    />
  );
}