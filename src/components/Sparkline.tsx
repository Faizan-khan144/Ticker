interface SparklineProps {
  data: number[]
  up: boolean
  width?: number
  height?: number
}

export default function Sparkline({ data, up, width = 112, height = 34 }: SparklineProps) {
  const color = up ? 'var(--color-mint)' : 'var(--color-rose)'

  if (data.length < 2) {
    return (
      <svg width={width} height={height} className="overflow-visible" aria-hidden="true">
        <line
          x1="1"
          x2={width - 1}
          y1={height / 2}
          y2={height / 2}
          stroke="var(--color-line2)"
          strokeDasharray="3 4"
          strokeWidth="1"
        />
      </svg>
    )
  }

  const min = Math.min(...data)
  const max = Math.max(...data)
  const span = max - min || 1
  const pad = 3
  const usableWidth = width - pad * 2
  const usableHeight = height - pad * 2

  const points = data.map((value, index) => {
    const x = pad + (index / (data.length - 1)) * usableWidth
    const y = pad + (1 - (value - min) / span) * usableHeight
    return [x, y] as const
  })

  const line = points.map(([x, y], index) => `${index === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const last = points[points.length - 1]

  return (
    <svg width={width} height={height} aria-hidden="true" className="overflow-visible">
      <path d={line} fill="none" stroke={color} strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={last[0]} cy={last[1]} r="1.8" fill={color} />
    </svg>
  )
}
