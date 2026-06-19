'use client';

import { useEffect, useRef } from 'react';

/** A drifting topology node: ring + glowing dot, each with its own motion. */
interface TopoNode {
  /** Base position as a percentage of the backdrop (0–100). */
  baseX: number;
  baseY: number;
  /** Drift amplitude in percentage units. */
  ampX: number;
  ampY: number;
  /** Seconds for one full cycle. */
  period: number;
  /** Phase offset in radians so nodes don't move in lockstep. */
  phase: number;
  /** Use cos on Y for an elliptical/orbital path instead of a straight sway. */
  orbital?: boolean;
  /** Tailwind classes for the ring + dot. */
  ring: string;
  dot: string;
}

const NODES: TopoNode[] = [
  // Four anchor nodes.
  {
    baseX: 25,
    baseY: 28,
    ampX: 5,
    ampY: 1.5,
    period: 4,
    phase: 0,
    ring: 'h-[150px] w-[150px] border-accent-indigo/20',
    dot: 'h-3 w-3 bg-accent-indigo shadow-[0_0_15px_oklch(var(--accent-indigo)/0.8)]',
  },
  {
    baseX: 66,
    baseY: 52,
    ampX: 1.5,
    ampY: 6,
    period: 5.5,
    phase: 1.2,
    ring: 'h-[100px] w-[100px] border-brand-teal/20',
    dot: 'h-2 w-2 bg-brand-teal shadow-[0_0_15px_oklch(var(--brand-teal)/0.8)]',
  },
  {
    baseX: 75,
    baseY: 34,
    ampX: 4,
    ampY: 4,
    period: 6.5,
    phase: 2.4,
    orbital: true,
    ring: 'h-[80px] w-[80px] border-brand-magenta/20',
    dot: 'h-2.5 w-2.5 bg-brand-magenta shadow-[0_0_15px_oklch(var(--brand-magenta)/0.8)]',
  },
  {
    baseX: 33,
    baseY: 66,
    ampX: 5,
    ampY: 5,
    period: 3.5,
    phase: 3.6,
    orbital: true,
    ring: 'h-[60px] w-[60px] border-accent-indigo/20',
    dot: 'h-2 w-2 bg-accent-indigo shadow-[0_0_15px_oklch(var(--accent-indigo)/0.8)]',
  },
  // Ten smaller satellites, mixed sizes and colours.
  {
    baseX: 12,
    baseY: 15,
    ampX: 6,
    ampY: 3,
    period: 5,
    phase: 0.5,
    ring: 'h-[40px] w-[40px] border-brand-magenta/20',
    dot: 'h-1.5 w-1.5 bg-brand-magenta shadow-[0_0_10px_oklch(var(--brand-magenta)/0.8)]',
  },
  {
    baseX: 45,
    baseY: 18,
    ampX: 3,
    ampY: 5,
    period: 6,
    phase: 1.7,
    orbital: true,
    ring: 'h-[36px] w-[36px] border-brand-teal/20',
    dot: 'h-1.5 w-1.5 bg-brand-teal shadow-[0_0_10px_oklch(var(--brand-teal)/0.8)]',
  },
  {
    baseX: 88,
    baseY: 22,
    ampX: 4,
    ampY: 4,
    period: 4.5,
    phase: 2.9,
    ring: 'h-[32px] w-[32px] border-accent-indigo/20',
    dot: 'h-1.5 w-1.5 bg-accent-indigo shadow-[0_0_10px_oklch(var(--accent-indigo)/0.8)]',
  },
  {
    baseX: 55,
    baseY: 78,
    ampX: 5,
    ampY: 3,
    period: 7,
    phase: 0.9,
    orbital: true,
    ring: 'h-[28px] w-[28px] border-brand-magenta/20',
    dot: 'h-1 w-1 bg-brand-magenta shadow-[0_0_8px_oklch(var(--brand-magenta)/0.8)]',
  },
  {
    baseX: 18,
    baseY: 52,
    ampX: 4,
    ampY: 6,
    period: 5.8,
    phase: 3.1,
    ring: 'h-[24px] w-[24px] border-brand-teal/20',
    dot: 'h-1 w-1 bg-brand-teal shadow-[0_0_8px_oklch(var(--brand-teal)/0.8)]',
  },
  {
    baseX: 92,
    baseY: 62,
    ampX: 3,
    ampY: 5,
    period: 4.2,
    phase: 1.4,
    orbital: true,
    ring: 'h-[20px] w-[20px] border-accent-indigo/20',
    dot: 'h-1 w-1 bg-accent-indigo shadow-[0_0_8px_oklch(var(--accent-indigo)/0.8)]',
  },
  {
    baseX: 40,
    baseY: 44,
    ampX: 6,
    ampY: 6,
    period: 6.8,
    phase: 2.2,
    ring: 'h-[18px] w-[18px] border-brand-magenta/20',
    dot: 'h-1 w-1 bg-brand-magenta shadow-[0_0_8px_oklch(var(--brand-magenta)/0.8)]',
  },
  {
    baseX: 72,
    baseY: 70,
    ampX: 4,
    ampY: 3,
    period: 3.8,
    phase: 0.3,
    orbital: true,
    ring: 'h-[16px] w-[16px] border-brand-teal/20',
    dot: 'h-1 w-1 bg-brand-teal shadow-[0_0_8px_oklch(var(--brand-teal)/0.8)]',
  },
  {
    baseX: 8,
    baseY: 80,
    ampX: 5,
    ampY: 4,
    period: 5.3,
    phase: 2.6,
    ring: 'h-[14px] w-[14px] border-accent-indigo/20',
    dot: 'h-1 w-1 bg-accent-indigo shadow-[0_0_8px_oklch(var(--accent-indigo)/0.8)]',
  },
  {
    baseX: 60,
    baseY: 10,
    ampX: 3,
    ampY: 5,
    period: 4.7,
    phase: 1.0,
    orbital: true,
    ring: 'h-[12px] w-[12px] border-brand-magenta/20',
    dot: 'h-1 w-1 bg-brand-magenta shadow-[0_0_8px_oklch(var(--brand-magenta)/0.8)]',
  },
];

// Darker neutral lines, three shades of grey.
const GREY_DARK = 'oklch(0.32 0 0 / 0.55)';
const GREY_MID = 'oklch(0.45 0 0 / 0.5)';
const GREY_LIGHT = 'oklch(0.58 0 0 / 0.45)';

/** Connections between node indices, with stroke colour. Lines follow their dots. */
const EDGES: { a: number; b: number; stroke: string }[] = [
  { a: 0, b: 1, stroke: GREY_DARK },
  { a: 1, b: 2, stroke: GREY_MID },
  { a: 2, b: 3, stroke: GREY_LIGHT },
  { a: 3, b: 0, stroke: GREY_MID },
  { a: 0, b: 4, stroke: GREY_LIGHT },
  { a: 4, b: 5, stroke: GREY_DARK },
  { a: 5, b: 13, stroke: GREY_MID },
  { a: 13, b: 6, stroke: GREY_LIGHT },
  { a: 6, b: 2, stroke: GREY_DARK },
  { a: 1, b: 7, stroke: GREY_MID },
  { a: 7, b: 9, stroke: GREY_LIGHT },
  { a: 9, b: 11, stroke: GREY_DARK },
  { a: 11, b: 3, stroke: GREY_MID },
  { a: 8, b: 0, stroke: GREY_LIGHT },
  { a: 8, b: 12, stroke: GREY_DARK },
  { a: 10, b: 1, stroke: GREY_MID },
  { a: 10, b: 8, stroke: GREY_LIGHT },
  { a: 5, b: 10, stroke: GREY_DARK },
];

function position(node: TopoNode, t: number) {
  const angle = (2 * Math.PI * t) / node.period + node.phase;
  return {
    x: node.baseX + node.ampX * Math.sin(angle),
    y: node.baseY + node.ampY * (node.orbital ? Math.cos(angle) : Math.sin(angle)),
  };
}

/**
 * Animated topology backdrop. Both the ring/dot nodes and the connecting lines
 * are positioned in the same percentage space and updated together each frame,
 * so the lines track the dots exactly. Respects prefers-reduced-motion.
 */
export function TopologyBackdrop() {
  const rings = useRef<(HTMLDivElement | null)[]>([]);
  const lines = useRef<(SVGLineElement | null)[]>([]);

  useEffect(() => {
    const place = (t: number) => {
      const pts = NODES.map((n) => position(n, t));
      pts.forEach((p, i) => {
        const el = rings.current[i];
        if (el) {
          el.style.left = `${p.x}%`;
          el.style.top = `${p.y}%`;
        }
      });
      EDGES.forEach((e, i) => {
        const ln = lines.current[i];
        if (ln) {
          ln.setAttribute('x1', String(pts[e.a].x));
          ln.setAttribute('y1', String(pts[e.a].y));
          ln.setAttribute('x2', String(pts[e.b].x));
          ln.setAttribute('y2', String(pts[e.b].y));
        }
      });
    };

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      place(0);
      return;
    }

    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      place((now - start) / 1000);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="kandinsky-bg absolute inset-0">
      {NODES.map((n, i) => (
        <div
          key={i}
          ref={(el) => {
            rings.current[i] = el;
          }}
          className={`absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border ${n.ring}`}
          style={{ left: `${n.baseX}%`, top: `${n.baseY}%` }}
        >
          <span className={`rounded-full ${n.dot}`} />
        </div>
      ))}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden
      >
        {EDGES.map((e, i) => (
          <line
            key={i}
            ref={(el) => {
              lines.current[i] = el;
            }}
            x1={NODES[e.a].baseX}
            y1={NODES[e.a].baseY}
            x2={NODES[e.b].baseX}
            y2={NODES[e.b].baseY}
            stroke={e.stroke}
            strokeWidth={0.15}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
    </div>
  );
}
