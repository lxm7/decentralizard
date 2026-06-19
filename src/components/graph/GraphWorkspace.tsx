'use client';

import { useMemo, useState } from 'react';
import { Cpu, Network, Search } from 'lucide-react';

import { Button } from '@/base/button';
import { Slider } from '@/base/slider';
import { StatusChip, type Tone } from '@/components/nexus';
import { cn } from '@/utilities/ui';
import { RelationalGraphCanvas } from './RelationalGraphCanvas';
import type { GraphData, GraphNode, NodeClass } from './types';

const classTone: Record<NodeClass, Tone> = {
  primary: 'indigo',
  synthesized: 'teal',
  commercial: 'magenta',
};
const classLabel: Record<NodeClass, string> = {
  primary: 'Primary Research',
  synthesized: 'Synthesized Theory',
  commercial: 'Commercial Application',
};
const dotClass: Record<NodeClass, string> = {
  primary: 'bg-accent-indigo node-glow',
  synthesized: 'bg-brand-teal node-glow-cyan',
  commercial: 'bg-brand-magenta node-glow-magenta',
};

export function GraphWorkspace({ data }: { data: GraphData }) {
  const [selectedId, setSelectedId] = useState(data.coreId);
  const [query, setQuery] = useState('');

  const connections = useMemo(() => {
    const m = new Map<string, number>();
    for (const e of data.edges) {
      m.set(e.source, (m.get(e.source) ?? 0) + 1);
      m.set(e.target, (m.get(e.target) ?? 0) + 1);
    }
    return m;
  }, [data]);

  const selected =
    data.nodes.find((n) => n.id === selectedId) ?? data.nodes.find((n) => n.id === data.coreId)!;

  const groups = useMemo(() => {
    const order: NodeClass[] = ['primary', 'commercial', 'synthesized'];
    const byCls = new Map<NodeClass, GraphNode[]>();
    for (const n of data.nodes) {
      const arr = byCls.get(n.cls) ?? [];
      arr.push(n);
      byCls.set(n.cls, arr);
    }
    const q = query.toLowerCase();
    return order
      .filter((c) => byCls.has(c))
      .map((cls) => ({
        cls,
        nodes: (byCls.get(cls) ?? []).filter(
          (n) => n.address.toLowerCase().includes(q) || n.label.toLowerCase().includes(q)
        ),
      }));
  }, [data, query]);

  return (
    <div className="relative flex h-[calc(100vh-4rem)] w-full overflow-hidden">
      <div className="relative flex-1">
        <RelationalGraphCanvas data={data} selectedId={selectedId} onSelect={setSelectedId} />

        <aside className="glass neo-glass absolute left-0 top-0 m-md flex max-h-[calc(100%-2rem)] w-80 flex-col gap-lg overflow-y-auto p-md">
          <div className="border-border/30 flex items-center justify-between border-b pb-sm">
            <h2 className="font-display text-xl font-semibold text-foreground">
              Quantum Substrate
            </h2>
            <Network className="h-5 w-5 text-accent-indigo" aria-hidden />
          </div>

          <div className="border-border/50 rounded-lg border bg-card p-sm shadow-sm">
            <div className="mb-xs flex items-center gap-sm">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-indigo text-white">
                <Cpu className="h-4 w-4" aria-hidden />
              </span>
              <div>
                <p className="font-body text-[11px] uppercase tracking-wide text-muted-foreground">
                  Core Node
                </p>
                <p className="font-mono text-[13px] font-bold text-foreground">
                  {selected.address}
                </p>
              </div>
            </div>
            <div className="mt-sm grid grid-cols-2 gap-sm">
              <div>
                <p className="font-body text-[11px] uppercase tracking-wide text-muted-foreground">
                  Connections
                </p>
                <p className="font-body text-base font-semibold text-foreground">
                  {connections.get(selected.id) ?? 0}
                </p>
              </div>
              <div>
                <p className="font-body text-[11px] uppercase tracking-wide text-muted-foreground">
                  Influence
                </p>
                <p className="font-body text-base font-semibold text-accent-indigo">
                  {selected.influence.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          <TopologicalFilters />

          <div className="mt-auto space-y-sm">
            <p className="font-body text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Node Classification
            </p>
            {(Object.keys(classLabel) as NodeClass[]).map((c) => (
              <div key={c} className="flex items-center gap-sm">
                <span className={cn('h-3 w-3 rounded-full', dotClass[c])} />
                <span className="font-body text-sm text-foreground">{classLabel[c]}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>

      <aside className="flex w-[360px] shrink-0 flex-col border-l border-border bg-card">
        <div className="bg-muted/40 border-b border-border p-md">
          <h3 className="mb-sm font-display text-xl font-semibold text-foreground">
            Node Directory
          </h3>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search entities…"
              aria-label="Search entities"
              className="focus:ring-accent-indigo/10 w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 font-body text-sm outline-none transition-colors focus:border-accent-indigo focus:ring-2"
            />
          </div>
        </div>

        <div className="flex-1 space-y-md overflow-y-auto p-sm">
          {groups.map((g) => (
            <div key={g.cls}>
              <div className="mb-xs flex items-center justify-between px-2">
                <span className="font-body text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {classLabel[g.cls]}
                </span>
                <span className="font-mono text-[10px] text-accent-indigo">
                  {g.nodes.length} Nodes
                </span>
              </div>
              <div className="space-y-xs">
                {g.nodes.map((n) => {
                  const active = n.id === selectedId;
                  return (
                    <button
                      key={n.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setSelectedId(n.id)}
                      className={cn(
                        'relative w-full overflow-hidden rounded-lg border bg-background p-sm text-left transition-colors',
                        active
                          ? 'border-accent-indigo'
                          : 'border-border/40 hover:border-accent-indigo/50'
                      )}
                    >
                      {active ? (
                        <span className="absolute left-0 top-0 h-full w-1 bg-accent-indigo" />
                      ) : null}
                      <div className="flex items-start justify-between gap-sm pl-1">
                        <div>
                          <p className="font-mono text-[13px] font-medium text-foreground">
                            {n.address}
                          </p>
                          <p className="mt-0.5 font-body text-sm text-muted-foreground">
                            {n.label}
                          </p>
                        </div>
                        <StatusChip tone={classTone[n.cls]}>{n.influence.toFixed(1)}%</StatusChip>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-muted/40 border-t border-border p-md">
          <Button className="w-full bg-accent-indigo text-white hover:bg-accent-indigo-strong">
            Generate Insights
          </Button>
        </div>
      </aside>
    </div>
  );
}

function TopologicalFilters() {
  const [sentiment, setSentiment] = useState(70);
  const [depth, setDepth] = useState(3);
  return (
    <div className="space-y-sm">
      <p className="font-body text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        Topological Filters
      </p>
      <div>
        <div className="mb-xs flex items-center justify-between font-body text-sm text-foreground">
          <span>Sentiment Bias</span>
          <span className="font-mono text-[11px] text-accent-indigo">
            {(sentiment / 100).toFixed(1)} – 1.0
          </span>
        </div>
        <Slider
          value={[sentiment]}
          max={100}
          step={1}
          onValueChange={(v) => setSentiment(v[0] ?? 0)}
        />
      </div>
      <div>
        <div className="mb-xs flex items-center justify-between font-body text-sm text-foreground">
          <span>Citation Depth</span>
          <span className="font-mono text-[11px] text-accent-indigo">Lvl {depth}</span>
        </div>
        <Slider
          value={[depth]}
          min={1}
          max={5}
          step={1}
          onValueChange={(v) => setDepth(v[0] ?? 1)}
        />
      </div>
    </div>
  );
}
