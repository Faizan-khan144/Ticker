import { useEffect, useRef, useState } from 'react'
import { formatCandleTime, formatPct, formatPrice, type Candle, type Interval } from '../lib/binance'

interface CandleChartProps {
  candles: Candle[]
  interval: Interval
  loading?: boolean
}

export default function CandleChart({ candles, interval, loading = false }: CandleChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(860)
  const [hover, setHover] = useState<number | null>(null)

  useEffect(() => {
    const element = containerRef.current
    if (!element) return
    const observer = new ResizeObserver((entries) => {
      const next = entries[0]?.contentRect.width ?? 860
      setWidth(Math.max(300, Math.round(next)))
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const height = 384
  const axisHeight = 22
  const volumeHeight = 56
  const volumeGap = 12
  const rightPad = 54
  const topPad = 12
  const volumeBottom = height - axisHeight
  const volumeTop = volumeBottom - volumeHeight
  const priceBottom = volumeTop - volumeGap
  const innerWidth = Math.max(120, width - rightPad)
  const count = candles.length
  const step = count > 0 ? innerWidth / count : innerWidth
  const bodyWidth = Math.max(1.5, Math.min(11, step * 0.6))

  const lows = count > 0 ? Math.min(...candles.map((candle) => candle.low)) : 0
  const highs = count > 0 ? Math.max(...candles.map((candle) => candle.high)) : 1
  const span = highs - lows || highs * 0.01 || 1
  const lo = lows - span * 0.07
  const hi = highs + span * 0.07
  const priceY = (price: number) => topPad + (1 - (price - lo) / (hi - lo)) * (priceBottom - topPad)

  const maxVolume = count > 0 ? Math.max(...candles.map((candle) => candle.volume)) : 1
  const volumeY = (volume: number) => volumeTop + (1 - volume / (maxVolume || 1)) * (volumeBottom - volumeTop - 4)

  const ticks = [0.08, 0.34, 0.6, 0.86].map((fraction) => {
    const value = lo + (hi - lo) * (1 - fraction)
    return { value, y: topPad + fraction * (priceBottom - topPad) }
  })

  const timeTicks = count > 4 ? [0, Math.floor(count / 4), Math.floor(count / 2), Math.floor((count * 3) / 4), count - 1] : []

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (count === 0) return
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const index = Math.min(count - 1, Math.max(0, Math.floor(x / step)))
    setHover(index)
  }

  const hovered = hover !== null && candles[hover] ? candles[hover] : null
  const hoverX = hover !== null ? step * (hover + 0.5) : 0
  const hoverChange = hovered ? ((hovered.close - hovered.open) / (hovered.open || 1)) * 100 : 0
  const tooltipLeft = Math.min(Math.max(8, hoverX - 84), Math.max(8, width - 176))

  if (loading && count === 0) {
    return (
      <div className="panel h-[384px] w-full p-4">
        <div className="skeleton h-full w-full" />
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden rounded-xl border border-line bg-panel/60"
      onPointerMove={onPointerMove}
      onPointerLeave={() => setHover(null)}
    >
      <svg width={width} height={height} className="block touch-none select-none" role="img" aria-label="Price candlestick chart">
        <defs>
          <linearGradient id="volume-up" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-mint)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--color-mint)" stopOpacity="0.04" />
          </linearGradient>
          <linearGradient id="volume-down" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-rose)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--color-rose)" stopOpacity="0.04" />
          </linearGradient>
        </defs>

        {ticks.map((tick) => (
          <g key={tick.y}>
            <line
              x1="0"
              x2={innerWidth}
              y1={tick.y}
              y2={tick.y}
              stroke="var(--color-line)"
              strokeDasharray="2 5"
              strokeWidth="0.7"
              opacity="0.7"
            />
            <text x={innerWidth + 7} y={tick.y + 3.5} fill="var(--color-faint)" fontSize="9.5" fontFamily="JetBrains Mono, monospace">
              {formatPrice(tick.value)}
            </text>
          </g>
        ))}

        {candles.map((candle, index) => {
          const x = step * (index + 0.5)
          const up = candle.close >= candle.open
          const color = up ? 'var(--color-mint)' : 'var(--color-rose)'
          const openY = priceY(candle.open)
          const closeY = priceY(candle.close)
          const bodyY = Math.min(openY, closeY)
          const bodyHeight = Math.max(1, Math.abs(closeY - openY))
          const volumeTopY = volumeY(candle.volume)
          return (
            <g key={candle.time}>
              <line x1={x} x2={x} y1={priceY(candle.high)} y2={priceY(candle.low)} stroke={color} strokeWidth="1" opacity="0.8" />
              <rect x={x - bodyWidth / 2} y={bodyY} width={bodyWidth} height={bodyHeight} fill={color} rx="0.5" />
              <rect
                x={x - bodyWidth / 2}
                y={volumeTopY}
                width={bodyWidth}
                height={Math.max(1, volumeBottom - volumeTopY - 2)}
                fill={up ? 'url(#volume-up)' : 'url(#volume-down)'}
                rx="0.5"
              />
            </g>
          )
        })}

        {hovered && (
          <g pointerEvents="none">
            <line x1={hoverX} x2={hoverX} y1={topPad} y2={volumeBottom} stroke="var(--color-muted)" strokeDasharray="3 4" strokeWidth="0.8" opacity="0.55" />
            <line x1="0" x2={innerWidth} y1={priceY(hovered.close)} y2={priceY(hovered.close)} stroke="var(--color-muted)" strokeDasharray="3 4" strokeWidth="0.8" opacity="0.55" />
            <circle cx={hoverX} cy={priceY(hovered.close)} r="3" fill="var(--color-bg)" stroke={hovered.close >= hovered.open ? 'var(--color-mint)' : 'var(--color-rose)'} strokeWidth="1.5" />
          </g>
        )}

        {timeTicks.map((index) => {
          const candle = candles[index]
          if (!candle) return null
          const x = Math.min(innerWidth - 20, Math.max(20, step * (index + 0.5)))
          return (
            <text
              key={candle.time}
              x={x}
              y={height - 6}
              textAnchor="middle"
              fill="var(--color-faint)"
              fontSize="9"
              fontFamily="JetBrains Mono, monospace"
            >
              {formatCandleTime(candle.time, interval)}
            </text>
          )
        })}
      </svg>

      {hovered && (
        <div
          className="pointer-events-none absolute top-2.5 z-10 w-[168px] rounded-lg border border-line2 bg-bg/95 p-2.5 font-mono text-[10px] shadow-xl backdrop-blur"
          style={{ left: tooltipLeft }}
        >
          <div className="mb-1.5 flex items-center justify-between border-b border-line pb-1.5 text-[9px] uppercase tracking-[0.1em] text-faint">
            <span>{formatCandleTime(hovered.time, interval)}</span>
            <span className={hoverChange >= 0 ? 'text-mint' : 'text-rose'}>{formatPct(hoverChange)}</span>
          </div>
          {[
            ['O', hovered.open],
            ['H', hovered.high],
            ['L', hovered.low],
            ['C', hovered.close],
          ].map(([label, value]) => (
            <div key={label as string} className="flex items-center justify-between py-[1px]">
              <span className="text-faint">{label as string}</span>
              <span className="text-ink">{formatPrice(value as number)}</span>
            </div>
          ))}
          <div className="mt-1 flex items-center justify-between border-t border-line pt-1.5">
            <span className="text-faint">VOL</span>
            <span className="text-muted">{new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(hovered.volume)}</span>
          </div>
        </div>
      )}
    </div>
  )
}
