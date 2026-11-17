import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, Star, Trash2 } from 'lucide-react'
import ChangeBadge from '../components/ChangeBadge'
import CoinAvatar from '../components/CoinAvatar'
import PriceCell from '../components/PriceCell'
import Reveal from '../components/Reveal'
import Sparkline from '../components/Sparkline'
import { useSparklines } from '../hooks/useSparklines'
import { formatCompact } from '../lib/binance'
import { coinMeta } from '../lib/coins'
import { useMarket } from '../store/market'
import { useWatchlist } from '../store/watchlist'

const SUGGESTIONS = ['BTC', 'ETH', 'SOL', 'DOGE', 'LINK', 'AVAX']

export default function Watchlist() {
  const symbols = useWatchlist((state) => state.symbols)
  const toggle = useWatchlist((state) => state.toggle)
  const clear = useWatchlist((state) => state.clear)
  const tickers = useMarket((state) => state.tickers)
  const sparks = useSparklines(symbols)

  useEffect(() => {
    document.title = 'Watchlist · Ticker'
  }, [])

  const rows = useMemo(
    () => symbols.map((symbol) => tickers[symbol]).filter((ticker) => ticker !== undefined),
    [symbols, tickers],
  )

  const totals = useMemo(() => {
    if (rows.length === 0) return null
    const best = rows.slice().sort((a, b) => b.changePct - a.changePct)[0]
    const worst = rows.slice().sort((a, b) => a.changePct - b.changePct)[0]
    const volume = rows.reduce((sum, ticker) => sum + ticker.quoteVolume, 0)
    return { best, worst, volume }
  }, [rows])

  return (
    <div className="wrap py-9 sm:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="chip">
            <Star className="h-3 w-3 fill-current text-amber" /> local shelf
          </div>
          <h1 className="mt-4 font-display text-[2.5rem] font-bold leading-[0.94] tracking-[-0.05em] sm:text-[3.4rem]">
            Your watchlist.
          </h1>
          <p className="mt-3 max-w-lg text-[13.5px] leading-relaxed text-muted">
            Starred pairs, saved in this browser. No sign-in, no sync — just the tape you care about.
          </p>
        </div>
        {symbols.length > 0 && (
          <button type="button" onClick={clear} className="btn btn-ghost">
            <Trash2 className="h-3.5 w-3.5" /> Clear all
          </button>
        )}
      </div>

      {rows.length === 0 ? (
        <Reveal className="mt-8">
          <div className="panel flex flex-col items-center px-6 py-16 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl border border-line bg-panel2 text-amber">
            <Star className="h-6 w-6" />
          </span>
          <h2 className="mt-5 font-display text-xl font-bold tracking-tight">Nothing on the shelf yet</h2>
          <p className="mt-2 max-w-sm text-[13px] leading-relaxed text-muted">
            Tap the star beside any pair in the market table, or start with one of these:
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {SUGGESTIONS.map((symbol) => (
              <button
                key={symbol}
                type="button"
                onClick={() => toggle(symbol)}
                className="inline-flex items-center gap-2 rounded-full border border-line bg-panel2/60 py-1.5 pl-1.5 pr-3 transition-colors hover:border-amber/40"
              >
                <CoinAvatar symbol={symbol} size={24} />
                <span className="font-mono text-[10.5px] font-semibold">{symbol}</span>
                <Star className="h-3 w-3 text-faint" />
              </button>
            ))}
          </div>
          <Link to="/" className="btn btn-mint mt-7">
            Browse markets <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          </div>
        </Reveal>
      ) : (
        <>
          <Reveal className="mt-7 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { label: 'Tracking', value: String(rows.length), hint: 'pairs' },
              { label: 'Combined volume', value: `$${formatCompact(totals?.volume ?? 0)}`, hint: '24h quote' },
              {
                label: 'Top mover',
                value: totals?.best ? `${totals.best.changePct >= 0 ? '+' : ''}${totals.best.changePct.toFixed(2)}%` : '—',
                hint: totals?.best?.base ?? '',
              },
              {
                label: 'Weakest',
                value: totals?.worst ? `${totals.worst.changePct.toFixed(2)}%` : '—',
                hint: totals?.worst?.base ?? '',
              },
            ].map((stat) => (
              <div key={stat.label} className="panel px-4 py-3.5">
                <div className="mono-label">{stat.label}</div>
                <div className="stat-value mt-1.5 text-[1.15rem] font-semibold">{stat.value}</div>
                <div className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-faint">{stat.hint}</div>
              </div>
            ))}
          </Reveal>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {rows.map((ticker, index) => {
              const meta = coinMeta(ticker.base)
              return (
                <Reveal key={ticker.base} delay={Math.min(index * 60, 360)}>
                  <div className="panel group relative h-full overflow-hidden p-4 transition-all hover:-translate-y-0.5 hover:border-line2 hover:shadow-[0_24px_50px_-34px_rgba(0,0,0,0.35)]">
                  <Link to={`/coin/${ticker.base}`} className="absolute inset-0" aria-label={`Open ${ticker.base}`} />
                  <div className="relative flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <CoinAvatar symbol={ticker.base} size={36} />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[14px] font-semibold">{ticker.base}</span>
                          <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-faint">/ usdt</span>
                        </div>
                        <div className="text-[10.5px] text-muted">{meta.name}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggle(ticker.base)}
                      className="relative z-10 grid h-7 w-7 place-items-center rounded-md text-amber transition-colors hover:bg-amber/10"
                      aria-label={`Remove ${ticker.base}`}
                    >
                      <Star className="h-3.5 w-3.5 fill-current" />
                    </button>
                  </div>

                  <div className="relative mt-3 flex items-end justify-between gap-2">
                    <div>
                      <PriceCell value={ticker.last} className="text-[1.15rem] font-semibold" />
                      <div className="mt-1.5">
                        <ChangeBadge value={ticker.changePct} compact />
                      </div>
                    </div>
                    <Sparkline data={sparks[ticker.base] ?? []} up={ticker.changePct >= 0} width={104} height={34} />
                  </div>

                  <div className="relative mt-3 grid grid-cols-3 gap-2 border-t border-line pt-2.5 font-mono text-[9.5px]">
                    <div>
                      <div className="uppercase tracking-[0.08em] text-faint">high</div>
                      <div className="mt-0.5 text-muted">{new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(ticker.high)}</div>
                    </div>
                    <div>
                      <div className="uppercase tracking-[0.08em] text-faint">low</div>
                      <div className="mt-0.5 text-muted">{new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(ticker.low)}</div>
                    </div>
                    <div>
                      <div className="uppercase tracking-[0.08em] text-faint">vol</div>
                      <div className="mt-0.5 text-muted">${formatCompact(ticker.quoteVolume)}</div>
                    </div>
                  </div>

                  <ArrowUpRight className="absolute bottom-3 right-3 h-3.5 w-3.5 text-faint opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                </Reveal>
              )
            })}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <span className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-faint">stored locally · no account</span>
            <Link to="/" className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.12em] text-faint hover:text-mint">
              add more <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
