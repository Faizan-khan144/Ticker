import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useMarket } from '../store/market'
import { formatPct, formatPrice } from '../lib/binance'

export default function TickerTape() {
  const tickers = useMarket((state) => state.tickers)
  const status = useMarket((state) => state.status)
  const order = useRef<string[]>([])

  if (order.current.length === 0 && Object.keys(tickers).length > 0) {
    order.current = Object.values(tickers)
      .slice()
      .sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct))
      .slice(0, 18)
      .map((ticker) => ticker.base)
  }

  const items = order.current.map((symbol) => tickers[symbol]).filter(Boolean)

  return (
    <div className="relative z-20 border-b border-line bg-white">
      <div className="tape-mask overflow-hidden">
        {items.length === 0 ? (
          <div className="flex h-9 items-center gap-6 px-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="skeleton h-2.5 w-24" />
            ))}
          </div>
        ) : (
          <div className="tape-track py-2">
            {[0, 1].map((copy) => (
              <div key={copy} className="flex shrink-0 items-center" aria-hidden={copy === 1}>
                {items.map((ticker) => {
                  const up = ticker.changePct >= 0
                  return (
                    <Link
                      key={`${copy}-${ticker.base}`}
                      to={`/coin/${ticker.base}`}
                      className="group flex shrink-0 items-center gap-2 border-r border-line px-4 font-mono text-[10.5px]"
                    >
                      <span className="font-semibold tracking-wide text-ink">{ticker.base}</span>
                      <span className="num text-muted">{formatPrice(ticker.last)}</span>
                      <span className={`num ${up ? 'text-mint' : 'text-rose'}`}>{formatPct(ticker.changePct)}</span>
                    </Link>
                  )
                })}
              </div>
            ))}
          </div>
        )}
      </div>
      <span
        className={`absolute right-4 top-1/2 hidden -translate-y-1/2 items-center gap-1.5 rounded-full border border-line bg-white px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.12em] sm:flex ${
          status === 'live' ? 'text-mint' : 'text-faint'
        }`}
      >
        <span className={`live-dot ${status === 'live' ? '' : 'is-off'}`} />
        {status === 'live' ? 'live' : status === 'loading' ? 'sync' : 'paused'}
      </span>
    </div>
  )
}
