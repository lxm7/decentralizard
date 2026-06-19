import type { Tone } from './tone';
import { toneColor } from './tone';

export interface SparklineProps {
  series: number[];
  tone?: Tone;
  width?: number;
  height?: number;
  /** Render a translucent area fill under the line. */
  area?: boolean;
  className?: string;
  'aria-label'?: string;
}

/**
 * Inline mini area/line chart for trend rows and the Data Snapshot panel.
 * Pure SVG (no chart lib); colors resolve to theme CSS vars via `toneColor`.
 */
export function Sparkline({
  series,
  tone = 'indigo',
  width = 100,
  height = 32,
  area = true,
  className,
  'aria-label': ariaLabel,
}: SparklineProps) {
  if (series.length === 0) return null;

  const max = Math.max(...series);
  const min = Math.min(...series);
  const span = max - min || 1;
  const stepX = width / Math.max(series.length - 1, 1);

  const pts = series.map((v, i) => {
    const x = i * stepX;
    const y = height - ((v - min) / span) * height;
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });

  const areaPath = `M0,${height} L${pts.join(' L')} L${width},${height} Z`;

  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      role="img"
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
    >
      {area ? <path d={areaPath} fill={toneColor(tone, 0.15)} stroke="none" /> : null}
      <polyline
        points={pts.join(' ')}
        fill="none"
        stroke={toneColor(tone)}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
