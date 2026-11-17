import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import ChangeBadge from '../components/ChangeBadge'
import CoinAvatar from '../components/CoinAvatar'
import Reveal from '../components/Reveal'
import { formatCompact, formatPrice } from '../lib/binance'
import { coinMeta } from '../lib/coins'
import { useMarket } from '../store/market'

type HeatFilter = 'all' | 'gainers' | 'losers'

export default function Heatmap() {
  const tickers = useMarket((state) => state.tickers)
  const status = useMarket((state) => state.status)
  const [filter, setFilter] = useState<HeatFilter>('all')

  useEffect(() => {
    document.title = 'Heatmap · Ticker'
  }, [])

  const list = useMemo(() => {
    const all = Object.values(tickers)
    const filtered =
      filter === 'gainers'
        ? all.filter((ticker) => ticker.changePct > 0)
        : filter === 'losers'
          ? all.filter((ticker) => ticker.changePct < 0)
          : all
    return filtered.slice().sort((a, b) => b.quoteVolume - a.quoteVolume)
  }, [tickers, filter])

  const loading = status === 'loading' && Object.keys(tickers).length === 0

  return (
    <div className="wrap py-9 sm:py-12">
      <Reveal className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <div className="chip !border-mint/25 !text-mint">
            <span className="live-dot" /> market map
          </div>
          <h1 className="mt-4 font-display text-[2.5rem] font-bold leading-[0.94] tracking-[-0.05em] sm:text-[3.6rem]">
            <span className="hero-line block">One screen.</span>
            <span className="hero-line block text-muted" style={{ animationDelay: '120ms' }}>Every move.</span>
          </h1>
          <p className="mt-4 max-w-xl text-[13.5px] leading-relaxed text-muted">
            Each tile is a pair. Size tracks 24h dollar volume, colour tracks the day's move. Hover a tile for the
            numbers, click to open its desk.
          </p>
        </div>

        <div className="flex flex-col items-start gap-2 sm:items-end">
          <div className="flex items-center gap-1 rounded-lg border border-line bg-panel/60 p-1">
            {(['all', 'gainers', 'losers'] as HeatFilter[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={`rounded-md px-3 py-1.5 font-mono text-[9.5px] uppercase tracking-[0.1em] transition-colors ${
                  filter === key ? 'bg-mint/15 text-mint' : 'text-faint hover:text-ink'
                }`}
              >
                {key}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.1em] text-faint">
            <span>-8%</span>
            <span className="h-2 w-28 rounded-full bg-gradient-to-r from-rose/80 via-panel2 to-mint/80" />
            <span>+8%</span>
          </div>
        </div>
      </Reveal>

      {loading ? (
        <div className="mt-8 grid auto-rows-[88px] grid-cols-2 gap-1.5 sm:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 24 }).map((_, index) => (
            <div
              key={index}
              className={`skeleton ${index === 0 ? 'col-span-2 row-span-2' : index < 4 ? 'col-span-2' : ''}`}
            />
          ))}
        </div>
      ) : (
        <div className="mt-8 grid auto-rows-[86px] grid-cols-2 gap-1.5 sm:grid-cols-4 lg:grid-cols-6 [grid-auto-flow:dense]">
          {list.map((ticker, index) => {
            const meta = coinMeta(ticker.base)
            const up = ticker.changePct >= 0
            const intensity = Math.min(0.22, 0.04 + Math.abs(ticker.changePct) / 55)
            const tone = up
              ? `rgba(14, 122, 79, ${intensity.toFixed(3)})`
              : `rgba(225, 29, 46, ${intensity.toFixed(3)})`
            const dark = index === 0
            const span =
              index === 0
                ? 'col-span-2 row-span-2'
                : index < 3
                  ? 'col-span-2'
                  : index < 9
                    ? 'row-span-2'
                    : ''
            return (
              <Link
                key={ticker.base}
                to={`/coin/${ticker.base}`}
                className={`card-tilt group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-2.5 transition-all duration-200 hover:z-10 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-22px_rgba(0,0,0,0.4)] ${span} ${
                  dark ? 'border-ink bg-ink text-white' : 'border-line text-ink'
                }`}
                style={dark ? undefined : { background: tone }}
              >
                <div className="flex items-start justify-between gap-1">
                  <div className="flex min-w-0 items-center gap-1.5">
                    <CoinAvatar symbol={ticker.base} size={index === 0 ? 28 : 22} />
                    <div className="min-w-0">
                      <div className={`truncate font-mono font-semibold tracking-wide ${index === 0 ? 'text-[15px]' : 'text-[11px]'}`}>
                        {ticker.base}
                      </div>
                      {index === 0 && <div className="truncate text-[10px] text-white/50">{meta.name}</div>}
                    </div>
                  </div>
                  <ArrowUpRight className={`h-3 w-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-100 ${dark ? 'text-white/40' : 'text-faint'}`} />
                </div>

                <div className="flex items-end justify-between gap-1">
                  <div className="min-w-0">
                    <div className={`num truncate font-medium ${index === 0 ? 'text-[17px] text-white' : 'text-[11.5px] text-ink'}`}>
                      {formatPrice(ticker.last)}
                    </div>
                    {index === 0 && (
                      <div className="font-mono text-[9.5px] uppercase tracking-[0.08em] text-white/40">
                        vol ${formatCompact(ticker.quoteVolume)}
                      </div>
                    )}
                  </div>
                  <span
                    className={`num shrink-0 font-medium ${index === 0 ? 'text-[14px]' : 'text-[10.5px]'} ${
                      dark ? (up ? 'text-[#6fd8ab]' : 'text-[#ff9a8a]') : up ? 'text-mint' : 'text-rose'
                    }`}
                  >
                    {ticker.changePct >= 0 ? '+' : ''}
                    {ticker.changePct.toFixed(1)}%
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {list.length === 0 && !loading && (
        <div className="mt-10 flex flex-col items-center gap-3 rounded-xl border border-line bg-panel/40 py-16 text-center">
          <p className="font-display text-lg font-semibold">No pairs in this slice</p>
          <p className="text-[12.5px] text-muted">Switch the filter back to all to see the full map.</p>
          <button type="button" onClick={() => setFilter('all')} className="btn btn-ghost">
            Show all pairs
          </button>
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
        <span className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-faint">
          {list.length} pairs · size = 24h quote volume
        </span>
        <div className="flex items-center gap-2">
          {list.slice(0, 3).map((ticker) => (
            <ChangeBadge key={ticker.base} value={ticker.changePct} compact />
          ))}
          <Link to="/" className="btn btn-ghost !py-1.5 !text-[11px]">
            Market table
          </Link>
        </div>
      </div>
    </div>
  )
}
