const CATEGORY_COLOR_MAP: Record<string, string> = {
  'Tech blog': 'var(--brand-magenta)',
  AI: 'var(--brand-teal)',
  'Mental Health': 'var(--brand-violet)',
  Crypto: 'var(--brand-coral)',
  Mycology: 'var(--success)',
  Philosophy: 'var(--brand-violet)',
  Space: 'var(--brand-magenta)',
}

const BRAND_COLORS = [
  'var(--brand-violet)',
  'var(--brand-magenta)',
  'var(--brand-teal)',
  'var(--brand-coral)',
]

const getPillColour = (title: string) => {
  if (CATEGORY_COLOR_MAP[title]) return CATEGORY_COLOR_MAP[title]
  // Deterministic "random" color based on string length/chars
  const index = title.length % BRAND_COLORS.length
  return BRAND_COLORS[index]
}

export { getPillColour }
