/**
 * Shared semantic tones for the Nexus design system (validity / sentiment / node class).
 * Backed by the CSS custom properties defined in globals.css so colors track the theme.
 */
export type Tone = 'indigo' | 'success' | 'error' | 'warning' | 'teal' | 'magenta' | 'muted';

/** CSS custom-property name backing each tone (for inline SVG stroke/fill where Tailwind can't reach). */
export const toneVar: Record<Tone, string> = {
  indigo: '--accent-indigo',
  success: '--success',
  error: '--error',
  warning: '--warning',
  teal: '--brand-teal',
  magenta: '--brand-magenta',
  muted: '--muted-foreground',
};

/** Resolve a tone to an `oklch(...)` color string, optionally with alpha. */
export const toneColor = (tone: Tone, alpha = 1): string =>
  alpha === 1 ? `oklch(var(${toneVar[tone]}))` : `oklch(var(${toneVar[tone]}) / ${alpha})`;
