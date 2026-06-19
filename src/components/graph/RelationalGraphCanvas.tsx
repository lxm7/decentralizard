'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Focus, ZoomIn, ZoomOut } from 'lucide-react';

import { toneColor, type Tone } from '@/components/nexus';
import { cn } from '@/utilities/ui';
import type { GraphData, NodeClass } from './types';

const W = 800;
const H = 600;

const classTone: Record<NodeClass, Tone> = {
  primary: 'indigo',
  synthesized: 'teal',
  commercial: 'magenta',
};

type SimNode = d3.SimulationNodeDatum & {
  id: string;
  cls: NodeClass;
  influence: number;
  r: number;
};
type SimLink = d3.SimulationLinkDatum<SimNode> & { weight: number; dashed?: boolean };

interface PositionedNode {
  id: string;
  cls: NodeClass;
  r: number;
  x: number;
  y: number;
}
interface PositionedEdge {
  source: string;
  target: string;
  weight: number;
  dashed?: boolean;
}

/** Run the force layout once (static) and return settled positions. */
function computeLayout(data: GraphData): { nodes: PositionedNode[]; edges: PositionedEdge[] } {
  const simNodes: SimNode[] = data.nodes.map((n) => ({
    id: n.id,
    cls: n.cls,
    influence: n.influence,
    r: 8 + (n.influence / 100) * 22,
  }));
  const simLinks: SimLink[] = data.edges.map((e) => ({
    source: e.source,
    target: e.target,
    weight: e.weight,
    dashed: e.dashed,
  }));

  const sim = d3
    .forceSimulation<SimNode>(simNodes)
    .force('charge', d3.forceManyBody<SimNode>().strength(-280))
    .force(
      'link',
      d3
        .forceLink<SimNode, SimLink>(simLinks)
        .id((d) => d.id)
        .distance(90)
        .strength(0.4)
    )
    .force('center', d3.forceCenter(W / 2, H / 2))
    .force(
      'collide',
      d3.forceCollide<SimNode>().radius((d) => d.r + 8)
    )
    .stop();

  for (let i = 0; i < 320; i++) sim.tick();

  const nodes: PositionedNode[] = simNodes.map((n) => ({
    id: n.id,
    cls: n.cls,
    r: n.r,
    x: n.x ?? W / 2,
    y: n.y ?? H / 2,
  }));
  const edges: PositionedEdge[] = simLinks.map((l) => ({
    source: typeof l.source === 'object' ? (l.source as SimNode).id : String(l.source),
    target: typeof l.target === 'object' ? (l.target as SimNode).id : String(l.target),
    weight: l.weight,
    dashed: l.dashed,
  }));
  return { nodes, edges };
}

interface CanvasProps {
  data: GraphData;
  selectedId?: string;
  onSelect: (id: string) => void;
}

export function RelationalGraphCanvas({ data, selectedId, onSelect }: CanvasProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const gRef = useRef<SVGGElement | null>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const [zoomPct, setZoomPct] = useState(100);

  const { nodes, edges } = useMemo(() => computeLayout(data), [data]);
  const nodeById = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);

  useEffect(() => {
    if (!svgRef.current || !gRef.current) return;
    const svg = d3.select(svgRef.current);
    const g = d3.select(gRef.current);
    const behavior = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.25, 4])
      .on('zoom', (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
        g.attr('transform', event.transform.toString());
        setZoomPct(Math.round(event.transform.k * 100));
      });
    zoomRef.current = behavior;
    svg.call(behavior);
    return () => {
      svg.on('.zoom', null);
    };
  }, []);

  const zoomBy = (factor: number) => {
    if (!svgRef.current || !zoomRef.current) return;
    zoomRef.current.scaleBy(d3.select(svgRef.current).transition().duration(200), factor);
  };
  const recenter = () => {
    if (!svgRef.current || !zoomRef.current) return;
    zoomRef.current.transform(
      d3.select(svgRef.current).transition().duration(300),
      d3.zoomIdentity
    );
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-background">
      <svg
        ref={svgRef}
        className="h-full w-full cursor-grab active:cursor-grabbing"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Relational graph canvas"
      >
        <g ref={gRef}>
          {edges.map((e, i) => {
            const a = nodeById.get(e.source);
            const b = nodeById.get(e.target);
            if (!a || !b) return null;
            return (
              <line
                key={i}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={toneColor('indigo', 0.3)}
                strokeWidth={e.weight}
                strokeDasharray={e.dashed ? '4 4' : undefined}
              />
            );
          })}
          {nodes.map((n) => {
            const tone = classTone[n.cls];
            const selected = n.id === selectedId || n.id === data.coreId;
            return (
              <circle
                key={n.id}
                cx={n.x}
                cy={n.y}
                r={n.r}
                className="cursor-pointer transition-[stroke-width]"
                fill={toneColor(tone, 0.12)}
                stroke={toneColor(tone)}
                strokeWidth={selected ? 3 : 1.5}
                style={
                  selected ? { filter: `drop-shadow(0 0 8px ${toneColor(tone, 0.6)})` } : undefined
                }
                onClick={() => onSelect(n.id)}
              />
            );
          })}
        </g>
      </svg>

      <div className="border-border/40 bg-card/90 absolute bottom-md left-1/2 flex -translate-x-1/2 items-center gap-xs rounded-full border p-xs backdrop-blur-md">
        <ControlBtn label="Zoom out" onClick={() => zoomBy(0.8)}>
          <ZoomOut className="h-4 w-4" aria-hidden />
        </ControlBtn>
        <span className="px-2 font-mono text-[13px] text-foreground">{zoomPct}%</span>
        <ControlBtn label="Zoom in" onClick={() => zoomBy(1.25)}>
          <ZoomIn className="h-4 w-4" aria-hidden />
        </ControlBtn>
        <span className="bg-border/60 mx-1 h-6 w-px" />
        <ControlBtn label="Recenter" onClick={recenter}>
          <Focus className="h-4 w-4" aria-hidden />
        </ControlBtn>
      </div>
    </div>
  );
}

function ControlBtn({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
      )}
    >
      {children}
    </button>
  );
}
