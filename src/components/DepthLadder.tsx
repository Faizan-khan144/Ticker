import { formatPrice, type Depth } from '../lib/binance'

interface DepthLadderProps {
  depth: Depth | null
  loading?: boolean
}

const formatAmount = (value: number) => {
  if (value >= 1000) return new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(value)
  if (value >= 1) return value.toFixed(3)
  return value.toFixed(5)
}

export default function DepthLadder({ depth, loading = false }: DepthLadderProps) {
  if (!depth || (depth.bids.length === 0 && depth.asks.length === 0)) {
    return (
      <div className="panel p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="mono-label">order book</span>
          <span className="font-mono text-[9px] text-faint">top 12</span>
        </div>
        <div className="grid gap-1.5">
          {Array.from({ length: 12 }).map((_, index) => (
            <div key={index} className={`skeleton h-4 w-full ${loading ? '' : 'opacity-40'}`} />
          ))}
        </div>
      </div>
    )
  }

  const maxTotal = Math.max(
    depth.bids[depth.bids.length - 1]?.total ?? 1,
    depth.asks[depth.asks.length - 1]?.total ?? 1,
  )
  const bestBid = depth.bids[0]?.price ?? 0
  const bestAsk = depth.asks[0]?.price ?? 0
  const spread = bestAsk - bestBid
  const spreadPct = bestAsk > 0 ? (spread / bestAsk) * 100 : 0
  const asks = depth.asks.slice().reverse()

  return (
    <div className="panel p-4">
      <div className="flex items-center justify-between">
        <span className="mono-label">order book</span>
        <span className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.12em] text-mint">
          <span className="live-dot" /> streaming
        </span>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-1 font-mono text-[9px] uppercase tracking-[0.1em] text-faint">
        <span>price</span>
        <span className="text-center">amount</span>
        <span className="text-right">total</span>
      </div>

      <div className="mt-1.5 space-y-[2px]">
        {asks.map((level) => (
          <div key={`ask-${level.price}`} className="relative grid grid-cols-3 gap-1 rounded-sm px-1 py-[2.5px] font-mono text-[10.5px]">
            <span
              className="absolute inset-y-0 right-0 rounded-sm bg-rose/10"
              style={{ width: `${(level.total / maxTotal) * 100}%` }}
            />
            <span className="relative text-rose">{formatPrice(level.price)}</span>
            <span className="relative text-center text-muted">{formatAmount(level.quantity)}</span>
            <span className="relative text-right text-faint">{formatAmount(level.total)}</span>
          </div>
        ))}
      </div>

      <div className="my-1.5 flex items-center justify-between border-y border-line px-1 py-1.5 font-mono text-[10px]">
        <span className="uppercase tracking-[0.1em] text-faint">spread</span>
        <span className="text-ink">{formatPrice(spread)}</span>
        <span className="text-faint">{spreadPct.toFixed(3)}%</span>
      </div>

      <div className="space-y-[2px]">
        {depth.bids.map((level) => (
          <div key={`bid-${level.price}`} className="relative grid grid-cols-3 gap-1 rounded-sm px-1 py-[2.5px] font-mono text-[10.5px]">
            <span
              className="absolute inset-y-0 right-0 rounded-sm bg-mint/10"
              style={{ width: `${(level.total / maxTotal) * 100}%` }}
            />
            <span className="relative text-mint">{formatPrice(level.price)}</span>
            <span className="relative text-center text-muted">{formatAmount(level.quantity)}</span>
            <span className="relative text-right text-faint">{formatAmount(level.total)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
