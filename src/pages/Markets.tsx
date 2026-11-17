import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  ChevronDown,
  Filter,
  LayoutGrid,
  Layers,
  Search,
  Sparkles,
  Star,
  Terminal,
  TrendingUp,
  Zap,
} from 'lucide-react'
import ChangeBadge from '../components/ChangeBadge'
import CoinAvatar from '../components/CoinAvatar'
import PriceCell from '../components/PriceCell'
import Reveal from '../components/Reveal'
import Sparkline from '../components/Sparkline'
import { useSparklines } from '../hooks/useSparklines'
import { formatCompact, formatPrice } from '../lib/binance'
import { useMarket } from '../store/market'
import { useWatchlist } from '../store/watchlist'

type FilterKey = 'all' | 'gainers' | 'losers' | 'watchlist'
type SortKey = 'volume' | 'gainers' | 'losers' | 'price' | 'name'

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'gainers', label: 'Gainers' },
  { key: 'losers', label: 'Losers' },
  { key: 'watchlist', label: 'Watchlist' },
]

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'volume', label: '24h volume' },
  { key: 'gainers', label: 'Biggest gain' },
  { key: 'losers', label: 'Biggest drop' },
  { key: 'price', label: 'Price' },
  { key: 'name', label: 'Name' },
]

function Starburst({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <path d="M12 1.5v21M1.5 12h21M4.5 4.5l15 15M19.5 4.5l-15 15" strokeLinecap="round" />
      <path d="M12 5v2.4M12 16.6V19M5 12h2.4M16.6 12H19" strokeLinecap="round" />
    </svg>
  )
}

export default function Markets() {
  const tickers = useMarket((state) => state.tickers)
  const status = useMarket((state) => state.status)
  const updatedAt = useMarket((state) => state.updatedAt)
  const error = useMarket((state) => state.error)
  const load = useMarket((state) => state.load)
  const watched = useWatchlist((state) => state.symbols)
  const toggle = useWatchlist((state) => state.toggle)

  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<FilterKey>('all')
  const [sort, setSort] = useState<SortKey>('volume')
  const [tilt, setTilt] = useState({ x: 0, y: 0 })

  useEffect(() => {
    document.title = 'Ticker — the spot desk'
  }, [])

  const list = useMemo(() => Object.values(tickers), [tickers])
  const sparkSymbols = useMemo(() => list.map((ticker) => ticker.base), [list])
  const sparks = useSparklines(sparkSymbols)
  const heroSparks = useSparklines(['BTC', 'ETH', 'SOL'])

  const totals = useMemo(() => {
    const volume = list.reduce((sum, ticker) => sum + ticker.quoteVolume, 0)
    const gainers = list.filter((ticker) => ticker.changePct > 0).length
    const losers = list.filter((ticker) => ticker.changePct < 0).length
    const ranked = list.slice().sort((a, b) => b.changePct - a.changePct)
    return {
      volume,
      gainers,
      losers,
      best: ranked[0],
      worst: ranked[ranked.length - 1],
      breadth: list.length > 0 ? (gainers / list.length) * 100 : 0,
    }
  }, [list])

  const sorted = useMemo(() => {
    const needle = query.trim().toLowerCase()
    const filtered = list.filter((ticker) => {
      if (needle && !`${ticker.base} ${ticker.base}usdt`.toLowerCase().includes(needle)) return false
      if (filter === 'gainers') return ticker.changePct > 0
      if (filter === 'losers') return ticker.changePct < 0
      if (filter === 'watchlist') return watched.includes(ticker.base)
      return true
    })
    return filtered.sort((a, b) => {
      if (sort === 'gainers') return b.changePct - a.changePct
      if (sort === 'losers') return a.changePct - b.changePct
      if (sort === 'price') return b.last - a.last
      if (sort === 'name') return a.base.localeCompare(b.base)
      return b.quoteVolume - a.quoteVolume
    })
  }, [list, query, filter, sort, watched])

  const volumeRank = useMemo(() => {
    const ranked = list.slice().sort((a, b) => b.quoteVolume - a.quoteVolume)
    return new Map(ranked.map((ticker, index) => [ticker.base, index + 1]))
  }, [list])

  const loading = status === 'loading' && list.length === 0
  const chart = heroSparks.BTC ?? []
  const chartMin = chart.length ? Math.min(...chart) : 0
  const chartMax = chart.length ? Math.max(...chart) : 1
  const movers = sorted.slice(0, 4)

  return (
    <div className="pb-12">
      <section className="wrap pt-12 sm:pt-20">
        <div className="flex flex-col items-center">
          <Reveal className="flex w-full flex-col items-center text-center">
            <div className="chip fade-up">
              <span className="live-dot" /> Live · {list.length || 49} USDT pairs
            </div>
            <h1 className="mt-7 font-display text-[3rem] font-bold leading-[0.9] tracking-[-0.055em] sm:text-[5.1rem] xl:text-[6rem]">
              <span className="hero-line block">The market,</span>
              <span className="hero-line relative mt-0 block" style={{ animationDelay: '140ms' }}>
                <span className="relative inline-block">
                  in motion.
                  <svg className="wave-under" viewBox="0 0 300 12" preserveAspectRatio="none" aria-hidden="true">
                    <path pathLength="1" d="M2 8 Q 26 2 50 7 T 98 7 T 146 7 T 194 7 T 242 7 T 298 6" />
                  </svg>
                </span>
              </span>
            </h1>
            <p className="fade-up mt-7 max-w-[34rem] text-[16px] leading-[1.6] text-muted sm:text-[17px]" style={{ animationDelay: '260ms' }}>
              Every major, streamed straight from Binance over WebSocket. Candles, order books and a live heatmap in
              one quiet desk.
            </p>
            <div className="fade-up mt-8 flex flex-wrap items-center justify-center gap-5" style={{ animationDelay: '340ms' }}>
              <a href="#markets" className="btn btn-mint !px-5 !py-3">
                Explore markets <ArrowRight className="h-3.5 w-3.5" />
              </a>
              <Link to="/watchlist" className="group inline-flex items-center gap-1.5 text-[13.5px] font-semibold">
                Build a watchlist
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
            <p className="fade-up mt-4 font-mono text-[9.5px] uppercase tracking-[0.12em] text-faint" style={{ animationDelay: '420ms' }}>
              Public Binance data · no account · no keys
            </p>

            <div className="fade-up mt-12 grid w-full max-w-2xl grid-cols-3 gap-6 sm:grid-cols-5" style={{ animationDelay: '500ms' }}>
              {[
                { label: 'Traders', hint: 'watch the tape', icon: Activity },
                { label: 'Analysts', hint: 'read the depth', icon: TrendingUp },
                { label: 'Watchers', hint: 'save a list', icon: Star },
                { label: 'Builders', hint: 'public data', icon: Terminal },
                { label: 'Night owls', hint: 'always awake', icon: Zap },
              ].map((role) => (
                <div key={role.label} className="flex flex-col items-center gap-2">
                  <span className="grid h-11 w-11 place-items-center rounded-full border border-line bg-panel2 text-ink transition-transform duration-300 hover:-translate-y-1">
                    <role.icon className="h-4 w-4" />
                  </span>
                  <div className="text-[12.5px] font-semibold leading-tight">{role.label}</div>
                  <div className="text-[10.5px] leading-tight text-faint">{role.hint}</div>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={140} className="relative mt-14 w-full max-w-5xl">
            <Starburst className="star-spin absolute -left-8 -top-8 hidden h-8 w-8 text-ink/50 sm:block" />
            <Starburst className="scroll-spin absolute -right-6 bottom-16 hidden h-5 w-5 text-ink/35 sm:block" />

            <div
              className="relative transition-transform duration-300 ease-out will-change-transform"
              style={{ transform: `perspective(1400px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}
              onMouseMove={(event) => {
                const rect = event.currentTarget.getBoundingClientRect()
                const px = (event.clientX - rect.left) / rect.width - 0.5
                const py = (event.clientY - rect.top) / rect.height - 0.5
                setTilt({ x: py * -6, y: px * 8 })
              }}
              onMouseLeave={() => setTilt({ x: 0, y: 0 })}
            >
              <div className="float-window relative overflow-hidden rounded-[22px] border border-black/10 bg-[#0a0a0a] text-white shadow-[0_60px_130px_-48px_rgba(0,0,0,0.7)]">
              <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                <span className="mx-auto rounded-full bg-white/[0.07] px-3 py-1 font-mono text-[9px] tracking-wide text-white/45">
                  ticker.app / spot
                </span>
                <span className="flex shrink-0 items-center gap-1.5 font-mono text-[8px] uppercase tracking-[0.08em] text-[#6fd8ab]">
                  <span className="live-dot" /> live
                </span>
              </div>

              <div className="flex min-h-[430px]">
                <aside className="hidden w-[188px] shrink-0 flex-col border-r border-white/10 p-4 sm:flex">
                  <div className="flex items-center gap-2 px-1">
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-white font-display text-[13px] font-bold text-ink">t</span>
                    <span className="font-display text-[13px] font-bold tracking-tight text-white">Ticker.</span>
                  </div>
                  <div className="mt-6 space-y-0.5">
                    {[
                      { label: 'Overview', icon: Activity },
                      { label: 'Markets', icon: Layers },
                      { label: 'Heatmap', icon: LayoutGrid },
                      { label: 'Watchlist', icon: Bookmark },
                    ].map((item, index) => (
                      <div
                        key={item.label}
                        className={`flex items-center gap-2 rounded-md px-2 py-2 font-mono text-[9px] uppercase tracking-[0.06em] ${
                          index === 0 ? 'bg-white/[0.09] text-white' : 'text-white/35'
                        }`}
                      >
                        <item.icon className="h-3.5 w-3.5" />
                        {item.label}
                      </div>
                    ))}
                  </div>
                  <div className="mt-auto rounded-lg border border-white/10 p-2.5">
                    <div className="font-mono text-[7.5px] uppercase tracking-[0.14em] text-white/30">socket</div>
                    <div className="mt-1 flex items-center gap-1.5 font-mono text-[8px] uppercase tracking-[0.08em] text-[#6fd8ab]">
                      <span className="live-dot" /> batched 700ms
                    </div>
                  </div>
                </aside>

                <div className="min-w-0 flex-1 p-4 sm:p-5">
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: '24h volume', value: loading ? '—' : `$${formatCompact(totals.volume)}`, hint: 'all pairs' },
                      { label: 'Gainers', value: String(totals.gainers), hint: 'green now' },
                      { label: 'Losers', value: String(totals.losers), hint: 'red now' },
                    ].map((stat) => (
                      <div key={stat.label} className="rounded-xl border border-white/10 p-3">
                        <div className="font-mono text-[8px] uppercase tracking-[0.14em] text-white/40">{stat.label}</div>
                        <div className="stat-value mt-1.5 text-[1.35rem] font-medium leading-none text-white">{stat.value}</div>
                        <div className="mt-1 font-mono text-[7.5px] uppercase tracking-[0.1em] text-white/25">{stat.hint}</div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-2 grid gap-2 lg:grid-cols-[1.4fr_1fr]">
                    <div className="rounded-xl border border-white/10 p-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-mono text-[8px] uppercase tracking-[0.14em] text-white/35">BTC / USDT</div>
                          <div className="stat-value mt-1 text-[15px] text-white">{formatPrice(tickers.BTC?.last ?? 0)}</div>
                        </div>
                        <span className={`rounded-full px-2 py-0.5 font-mono text-[8px] ${(tickers.BTC?.changePct ?? 0) >= 0 ? 'bg-[#6fd8ab]/15 text-[#6fd8ab]' : 'bg-[#ff9a8a]/15 text-[#ff9a8a]'}`}>
                          {tickers.BTC ? `${tickers.BTC.changePct >= 0 ? '+' : ''}${tickers.BTC.changePct.toFixed(2)}%` : '—'}
                        </span>
                      </div>
                      <div className="mt-3 flex h-[112px] items-end gap-[3px]">
                        {(chart.length ? chart : Array.from({ length: 32 }, (_, index) => index)).slice(-40).map((value, index) => {
                          const pct = chartMax === chartMin ? 50 : ((value - chartMin) / (chartMax - chartMin)) * 100
                          const up = index % 7 !== 3
                          return (
                            <span
                              key={index}
                              className={`min-w-0 flex-1 rounded-sm ${up ? 'bg-white/20' : 'bg-white/10'}`}
                              style={{ height: `${Math.max(8, pct)}%` }}
                            />
                          )
                        })}
                      </div>
                      <div className="mt-2 flex justify-between font-mono text-[7.5px] uppercase tracking-[0.1em] text-white/25">
                        <span>5m bars</span>
                        <span>live · {updatedAt ? new Date(updatedAt).toLocaleTimeString('en-US', { hour12: false }) : '--:--:--'}</span>
                      </div>
                    </div>

                    <div className="rounded-xl border border-white/10 p-3">
                      <div className="font-mono text-[8px] uppercase tracking-[0.14em] text-white/35">Top movers</div>
                      <div className="mt-2 space-y-1">
                        {movers.map((ticker) => (
                          <Link
                            key={ticker.base}
                            to={`/coin/${ticker.base}`}
                            className="flex items-center gap-2 rounded-lg px-1.5 py-1.5 transition-colors hover:bg-white/[0.05]"
                          >
                            <CoinAvatar symbol={ticker.base} size={20} />
                            <span className="min-w-0 flex-1 font-mono text-[9px] font-semibold text-white">{ticker.base}</span>
                            <span className="stat-value text-[9px] text-white/80">{formatPrice(ticker.last)}</span>
                            <span className={`w-11 text-right font-mono text-[8.5px] ${ticker.changePct >= 0 ? 'text-[#6fd8ab]' : 'text-[#ff9a8a]'}`}>
                              {ticker.changePct >= 0 ? '+' : ''}
                              {ticker.changePct.toFixed(2)}%
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between rounded-xl border border-white/10 px-3 py-2 font-mono text-[8px] uppercase tracking-[0.12em] text-white/30">
                    <span>public spot api · no keys</span>
                    <span>{totals.breadth.toFixed(0)}% breadth</span>
                  </div>
                </div>
              </div>
            </div>
            </div>
            <p className="mt-4 text-center font-mono text-[9px] uppercase tracking-[0.14em] text-faint">
              Live Binance data, no refresh
            </p>
          </Reveal>
        </div>

        <Reveal delay={80}>
          <div className="mt-14 grid grid-cols-2 gap-y-7 border-y border-line py-7 sm:grid-cols-4 sm:divide-x sm:divide-line">
            {[
              { icon: Layers, label: 'Pairs tracked', value: String(list.length || 49), hint: 'USDT spot', tone: 'text-ink' },
              {
                icon: TrendingUp,
                label: 'Best 24h',
                value: totals.best ? `${totals.best.changePct >= 0 ? '+' : ''}${totals.best.changePct.toFixed(2)}%` : '—',
                hint: totals.best?.base ?? 'loading',
                tone: 'text-mint',
              },
              {
                icon: ArrowDownRight,
                label: 'Worst 24h',
                value: totals.worst ? `${totals.worst.changePct.toFixed(2)}%` : '—',
                hint: totals.worst?.base ?? 'loading',
                tone: 'text-rose',
              },
              { icon: Star, label: 'Your watchlist', value: String(watched.length), hint: watched.length ? 'tracking' : 'empty', tone: 'text-ink' },
            ].map((stat) => (
              <div key={stat.label} className="px-0 sm:px-6 sm:first:pl-0 sm:last:pr-0">
                <div className="flex items-center gap-2 text-faint">
                  <stat.icon className="h-3.5 w-3.5" />
                  <span className="mono-label">{stat.label}</span>
                </div>
                <div className={`stat-value mt-2 text-[1.35rem] font-medium ${stat.tone}`}>{stat.value}</div>
                <div className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-faint">{stat.hint}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <section id="markets" className="wrap mt-12 scroll-mt-24">
        <Reveal>
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <div className="mono-label">live tape</div>
              <h2 className="mt-2 font-display text-[1.9rem] font-bold tracking-[-0.045em] sm:text-[2.3rem]">Markets</h2>
            </div>
            <span className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-faint">
              {sorted.length} / {list.length || 49} pairs
            </span>
          </div>
        </Reveal>

        <div className="sticky top-16 z-30 -mx-5 border-y border-line bg-white/95 px-5 py-3 backdrop-blur-xl sm:-mx-8 sm:px-8">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative min-w-[190px] flex-1 sm:max-w-[280px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-faint" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search BTC, ETH, SOL…"
                className="input !py-2 !pl-9 !text-[12px]"
                aria-label="Search assets"
              />
            </div>

            <div className="flex items-center gap-1 rounded-full border border-line bg-panel2/60 p-1">
              {FILTERS.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setFilter(item.key)}
                  className={`rounded-full px-3 py-1.5 font-mono text-[9.5px] uppercase tracking-[0.08em] transition-colors ${
                    filter === item.key ? 'bg-ink text-white' : 'text-muted hover:text-ink'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="relative">
              <Filter className="pointer-events-none absolute left-3 top-1/2 h-3 w-3 -translate-y-1/2 text-faint" />
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value as SortKey)}
                className="cursor-pointer appearance-none rounded-full border border-line bg-white py-2 pl-8 pr-7 font-mono text-[9.5px] uppercase tracking-[0.08em] text-muted outline-none"
                aria-label="Sort markets"
              >
                {SORTS.map((item) => (
                  <option key={item.key} value={item.key} className="bg-white">
                    {item.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-faint" />
            </div>
          </div>
        </div>

        <div className="panel mt-4 overflow-hidden !rounded-2xl">
          <div className="hidden grid-cols-[28px_minmax(0,2fr)_minmax(0,1fr)_88px_110px_112px_24px] gap-2 border-b border-line bg-panel2/40 px-5 py-2.5 font-mono text-[9px] uppercase tracking-[0.12em] text-faint md:grid">
            <span />
            <span>asset</span>
            <span className="text-right">price</span>
            <span className="text-right">24h</span>
            <span className="text-right">volume</span>
            <span className="text-right">last 24h</span>
            <span />
          </div>

          {error && (
            <div className="flex flex-col items-center gap-3 px-4 py-14 text-center">
              <p className="text-[13px] text-rose">{error}</p>
              <button type="button" onClick={() => void load()} className="btn btn-ghost">
                Retry feed
              </button>
            </div>
          )}

          {!error && loading && (
            <div>
              {Array.from({ length: 9 }).map((_, index) => (
                <div
                  key={index}
                  className="grid grid-cols-[28px_minmax(0,1.6fr)_minmax(0,1fr)_80px] items-center gap-2 border-b border-line/60 px-5 py-3.5 md:grid-cols-[28px_minmax(0,2fr)_minmax(0,1fr)_88px_110px_112px_24px]"
                >
                  <div className="skeleton h-3.5 w-3.5" />
                  <div className="flex items-center gap-2.5">
                    <div className="skeleton h-7 w-7 rounded-full" />
                    <div className="skeleton h-3.5 w-24" />
                  </div>
                  <div className="skeleton ml-auto h-3.5 w-20" />
                  <div className="skeleton ml-auto h-4 w-14" />
                  <div className="skeleton ml-auto hidden h-3.5 w-16 md:block" />
                  <div className="skeleton ml-auto hidden h-6 w-24 md:block" />
                  <span className="hidden md:block" />
                </div>
              ))}
            </div>
          )}

          {!error && !loading && sorted.length === 0 && (
            <div className="flex flex-col items-center gap-3 px-4 py-16 text-center">
              <Sparkles className="h-5 w-5 text-faint" />
              <p className="font-display text-lg font-semibold">
                {filter === 'watchlist' ? 'Your watchlist is empty' : 'Nothing matches that filter'}
              </p>
              <p className="max-w-sm text-[12.5px] text-muted">
                {filter === 'watchlist'
                  ? 'Star a few pairs from the table and they will live here, saved in your browser.'
                  : 'Try a different search or reset the filters.'}
              </p>
              <button
                type="button"
                onClick={() => {
                  setFilter('all')
                  setQuery('')
                }}
                className="btn btn-ghost mt-1"
              >
                Reset filters
              </button>
            </div>
          )}

          {!error &&
            !loading &&
            sorted.map((ticker) => {
              const isWatched = watched.includes(ticker.base)
              return (
                <div
                  key={ticker.base}
                  className="row-in relative grid grid-cols-[28px_minmax(0,1.6fr)_minmax(0,1fr)_80px_20px] items-center gap-2 border-b border-line/60 px-5 py-3 transition-colors last:border-b-0 hover:bg-panel2/50 md:grid-cols-[28px_minmax(0,2fr)_minmax(0,1fr)_88px_110px_112px_20px]"
                >
                  <Link to={`/coin/${ticker.base}`} className="absolute inset-0" aria-label={`Open ${ticker.base}`} />
                  <button
                    type="button"
                    onClick={() => toggle(ticker.base)}
                    className={`relative z-10 grid h-6 w-6 place-items-center rounded-full transition-colors ${
                      isWatched ? 'text-amber' : 'text-faint hover:text-amber'
                    }`}
                    aria-label={isWatched ? `Remove ${ticker.base} from watchlist` : `Add ${ticker.base} to watchlist`}
                  >
                    <Star className={`h-3.5 w-3.5 ${isWatched ? 'fill-current' : ''}`} />
                  </button>

                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="hidden w-4 shrink-0 font-mono text-[10px] text-faint sm:block">
                      {volumeRank.get(ticker.base)}
                    </span>
                    <CoinAvatar symbol={ticker.base} size={30} />
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] font-semibold leading-tight">{ticker.base}</span>
                      <span className="block truncate font-mono text-[9.5px] uppercase tracking-[0.08em] text-faint">
                        {ticker.base} / usdt
                      </span>
                    </span>
                  </div>

                  <PriceCell value={ticker.last} className="w-fit justify-self-end text-right text-[12.5px]" />

                  <div className="flex justify-end">
                    <ChangeBadge value={ticker.changePct} compact />
                  </div>

                  <div className="hidden text-right font-mono text-[11px] text-muted md:block">
                    ${formatCompact(ticker.quoteVolume)}
                  </div>

                  <div className="hidden justify-end md:flex">
                    <Sparkline data={sparks[ticker.base] ?? []} up={ticker.changePct >= 0} width={100} height={28} />
                  </div>

                  <ArrowUpRight className="h-3.5 w-3.5 justify-self-end text-faint" />
                </div>
              )
            })}
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-1 font-mono text-[9.5px] uppercase tracking-[0.1em] text-faint">
          <span>prices stream every ~700ms · candles refresh on load</span>
          <span className="flex items-center gap-1.5">
            {totals.gainers >= totals.losers ? <TrendingUp className="h-3 w-3 text-mint" /> : <ArrowDownRight className="h-3 w-3 text-rose" />}
            {totals.gainers >= totals.losers ? 'risk-on breadth' : 'risk-off breadth'}
          </span>
        </div>
      </section>

      <div className="marquee mt-16 border-y border-line py-6">
        <div className="marquee-track">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0" aria-hidden={copy === 1}>
              {['Live prices', 'Order books', 'Heatmap', 'Candles', 'Watchlist', '⌘K'].map((item) => (
                <span key={`${copy}-${item}`} className="marquee-item text-ink/90">
                  {item}
                  <span className="text-rose"> ✳</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <section className="wrap mt-16">
        <Reveal>
          <p className="text-center font-mono text-[9.5px] uppercase tracking-[0.18em] text-faint">
            built on infrastructure you already trust
          </p>
          <div className="mt-6 grid grid-cols-3 gap-y-5 border-y border-line py-7 sm:grid-cols-6">
            {['React', 'Vite', 'TypeScript', 'Tailwind', 'Zustand', 'Binance'].map((name) => (
              <div key={name} className="text-center font-display text-[15px] font-semibold tracking-tight text-ink/40 transition-colors hover:text-ink">
                {name}
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="wrap mt-20">
        <Reveal>
          <div className="mono-label">the desk</div>
          <h2 className="mt-2 max-w-2xl font-display text-[2rem] font-bold leading-[0.98] tracking-[-0.045em] sm:text-[2.8rem]">
            Everything the desk needs. Nothing pretend.
          </h2>
          <p className="mt-4 max-w-lg text-[13.5px] leading-relaxed text-muted">
            Tiles marked Live are wired to Binance's public spot feed. No mock rows, no placeholder charts.
          </p>
        </Reveal>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: 'Streaming quotes',
              text: '48 pairs repaint every 700ms from one multiplexed socket.',
              tag: 'Live',
              icon: Activity,
            },
            {
              title: 'Candles & volume',
              text: 'From 1m to 1w, with crosshair, tooltip and a live last price.',
              tag: 'Live',
              icon: Zap,
            },
            {
              title: 'Order book depth',
              text: 'Cumulative bids and asks for any pair, refreshed every five seconds.',
              tag: 'Live',
              icon: Layers,
            },
            {
              title: 'Market heatmap',
              text: 'Every pair sized by volume and tinted by its 24h move.',
              tag: 'Live',
              icon: LayoutGrid,
            },
            {
              title: 'Local watchlist',
              text: 'Stars live in localStorage. No account, no server, no sync.',
              tag: 'Local',
              icon: Bookmark,
            },
            {
              title: 'Command palette',
              text: 'Hit ⌘K anywhere to jump straight to a pair or a page.',
              tag: 'Live',
              icon: Terminal,
            },
          ].map((feature) => (
            <div key={feature.title} className="card-tilt h-full">
              <div className="panel h-full p-5 transition-shadow hover:shadow-[0_26px_60px_-38px_rgba(0,0,0,0.4)]">
                <div className="flex items-start justify-between gap-2">
                  <span className="grid h-9 w-9 place-items-center rounded-full border border-line bg-panel2 text-ink">
                    <feature.icon className="h-4 w-4" />
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 font-mono text-[8px] uppercase tracking-[0.1em] ${
                      feature.tag === 'Live' ? 'border-mint/30 text-mint' : 'border-line2 text-muted'
                    }`}
                  >
                    <span className="h-1 w-1 rounded-full bg-current" />
                    {feature.tag}
                  </span>
                </div>
                <h3 className="mt-4 font-display text-[15px] font-semibold">{feature.title}</h3>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted">{feature.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="wrap mt-20">
        <Reveal>
          <div className="mono-label">how it works</div>
          <h2 className="mt-2 max-w-xl font-display text-[2rem] font-bold leading-[0.98] tracking-[-0.045em] sm:text-[2.8rem]">
            Up and running in a second.
          </h2>
        </Reveal>
        <div className="mt-8 grid gap-3 md:grid-cols-3">
          {[
            { n: '01', title: 'Pick a pair', text: 'Search the tape or open the heatmap. Every row links to its own desk.' },
            { n: '02', title: 'Read the tape', text: 'Live price, candles, cumulative depth and six 24h stats on one screen.' },
            { n: '03', title: 'Save what matters', text: 'Star the pairs you follow. They stay on this device, no sign-up.' },
          ].map((step, index) => (
            <Reveal key={step.n} delay={index * 110}>
              <div className="panel h-full p-5">
                <div className="font-mono text-[10px] tracking-[0.14em] text-rose">{step.n}</div>
                <h3 className="mt-2.5 font-display text-[15px] font-semibold">{step.title}</h3>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted">{step.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <div className="marquee marquee-reverse mt-20 border-y border-ink bg-ink py-5 text-white">
        <div className="marquee-track">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0" aria-hidden={copy === 1}>
              {['No sign-up', 'No keys', 'No refresh', 'Just the tape', 'Open the desk'].map((item) => (
                <span key={`${copy}-${item}`} className="marquee-item text-white">
                  {item}
                  <span className="text-[#ff6b5e]"> ✳</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <section className="wrap mt-16 mb-4">
        <Reveal>
          <div className="cta-glow relative overflow-hidden rounded-[28px] bg-ink px-6 py-16 text-center text-white sm:px-16 sm:py-20">
            <div className="animate-glow pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-[radial-gradient(50%_120%_at_50%_100%,rgba(255,107,94,0.5),transparent_70%)]" />
            <Starburst className="star-spin absolute left-8 top-8 hidden h-8 w-8 text-white/25 sm:block" />
            <Starburst className="scroll-spin absolute bottom-10 right-10 hidden h-6 w-6 text-white/20 sm:block" />
            <div className="relative font-mono text-[9.5px] uppercase tracking-[0.2em] text-white/40">open the tape</div>
            <h2 className="cta-words relative mx-auto mt-4 max-w-3xl font-display text-[2.2rem] font-bold leading-[0.95] tracking-[-0.05em] sm:text-[3.6rem]">
              <span className="block">
                <span className="word"><span>Prices</span></span>{' '}
                <span className="word"><span style={{ animationDelay: '90ms' }}>don't</span></span>{' '}
                <span className="word"><span style={{ animationDelay: '180ms' }}>wait.</span></span>
              </span>
              <span className="block text-[#ff6b5e]">
                <span className="word"><span style={{ animationDelay: '270ms' }}>Neither</span></span>{' '}
                <span className="word"><span style={{ animationDelay: '360ms' }}>should</span></span>{' '}
                <span className="word"><span style={{ animationDelay: '450ms' }}>the</span></span>{' '}
                <span className="word"><span style={{ animationDelay: '540ms' }}>interface.</span></span>
              </span>
            </h2>
            <p className="relative mx-auto mt-5 max-w-md text-[13.5px] leading-relaxed text-white/55">
              Open any desk for live candles, cumulative depth and six 24h stats. No sign-up sheet between you and the
              chart.
            </p>
            <div className="relative mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link to="/coin/BTC" className="btn !bg-white !px-5 !py-3 !text-[#0a0a0a] hover:!bg-[#ff6b5e] hover:!text-white">
                Open BTC desk <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link to="/heatmap" className="group inline-flex items-center gap-1.5 text-[13px] font-semibold text-white/75 hover:text-white">
                See the heatmap
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  )
}
