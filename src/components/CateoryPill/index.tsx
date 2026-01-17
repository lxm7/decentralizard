import React from 'react'
import { cn } from '@/utilities/ui'
import { getPillColour } from '@/utilities/getPillColour'

type PillVariant = 'default' | 'cyan'

interface CategoryPillProps {
  title: string
  onClick?: (title: string) => void
  isSelected?: boolean
  className?: string
  variant?: PillVariant
}

export const CategoryPill = ({
  title,
  onClick,
  isSelected,
  className,
  variant = 'default',
}: CategoryPillProps) => {
  const color = getPillColour(title)

  // Base Styles
  const baseStyles = cn(
    'inline-flex items-center justify-center rounded-full transition-all duration-200',
    'font-medium uppercase tracking-wide whitespace-nowrap',
    className,
  )

  // Cyan variant uses fixed cyan colors
  if (variant === 'cyan') {
    return (
      <span
        className={cn(
          baseStyles,
          'rounded bg-cyan-500/20 px-2 py-1 text-xs text-cyan-400',
        )}
      >
        {title}
      </span>
    )
  }

  // Style logic: if selected or is a static badge, use full color.
  // If it's a button but not selected, use a subtle/muted version.
  const dynamicStyles =
    isSelected || !onClick
      ? {
          backgroundColor: `oklch(${color})`,
          color: 'oklch(var(--neutral-white))',
          boxShadow: '0 4px 12px -4px oklch(var(--neutral-black) / 0.3)',
        }
      : {
          backgroundColor: 'oklch(var(--neutral-850))',
          color: 'oklch(var(--neutral-300))',
        }

  if (onClick) {
    return (
      <button
        onClick={() => onClick(title)}
        style={dynamicStyles}
        className={cn(
          baseStyles,
          'px-4 py-2 text-sm hover:scale-105 active:scale-95',
          !isSelected && 'hover:bg-neutral-800',
        )}
      >
        {title}
      </button>
    )
  }

  return (
    <span
      style={dynamicStyles}
      className={cn(baseStyles, 'px-3 py-1 text-[10px] backdrop-blur-sm')}
    >
      {title}
    </span>
  )
}
