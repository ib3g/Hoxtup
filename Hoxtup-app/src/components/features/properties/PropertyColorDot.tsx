const PROPERTY_COLORS = [
  '#4A90D9', '#E67E22', '#27AE60', '#8E44AD',
  '#E74C3C', '#F39C12', '#1ABC9C', '#34495E',
] as const

type DotSize = 'inline' | 'card' | 'selector'

const SIZES: Record<DotSize, number> = { inline: 6, card: 10, selector: 16 }

interface PropertyColorDotProps {
  colorIndex: number
  size?: DotSize
  className?: string
}

export function PropertyColorDot({ colorIndex, size = 'card', className = '' }: PropertyColorDotProps) {
  const color = PROPERTY_COLORS[colorIndex % PROPERTY_COLORS.length]
  const px = SIZES[size]

  return (
    <span
      className={`inline-block shrink-0 rounded-full ${className}`}
      style={{ width: px, height: px, backgroundColor: color }}
      aria-hidden="true"
    />
  )
}

export { PROPERTY_COLORS }
