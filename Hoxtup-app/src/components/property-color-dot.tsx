'use client'

import { cn } from '@/lib/utils'

const PROPERTY_COLORS = [
  'bg-prop-1',
  'bg-prop-2',
  'bg-prop-3',
  'bg-prop-4',
  'bg-prop-5',
]

function hslRotationColor(index: number): string {
  const hue = ((index - 5) * 47 + 200) % 360
  return `hsl(${hue}, 55%, 50%)`
}

interface PropertyColorDotProps {
  colorIndex: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'size-1.5',
  md: 'size-2.5',
  lg: 'size-4',
} as const

export function PropertyColorDot({ colorIndex, size = 'md', className }: PropertyColorDotProps) {
  const isPreset = colorIndex >= 0 && colorIndex < PROPERTY_COLORS.length

  if (isPreset) {
    return (
      <span
        className={cn(
          'inline-block rounded-full shrink-0',
          sizeClasses[size],
          PROPERTY_COLORS[colorIndex],
          className,
        )}
        aria-hidden="true"
      />
    )
  }

  return (
    <span
      className={cn('inline-block rounded-full shrink-0', sizeClasses[size], className)}
      style={{ backgroundColor: hslRotationColor(colorIndex) }}
      aria-hidden="true"
    />
  )
}
