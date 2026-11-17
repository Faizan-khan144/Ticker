import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowUpRight, BarChart3, Star } from 'lucide-react'
import CandleChart from '../components/CandleChart'
import ChangeBadge from '../components/ChangeBadge'
import CoinAvatar from '../components/CoinAvatar'
import DepthLadder from '../components/DepthLadder'
import PriceCell from '../components/PriceCell'
import Reveal from '../components/Reveal'
import Sparkline from '../components/Sparkline'
import { useSparklines } from '../hooks/useSparklines'
import {
  fetchDepth,
  fetchKlines,
  formatCompact,
  formatPct,
  formatPrice,
  type Candle,
  type Depth,
  type Interval,
} from '../lib/binance'
import { COINS, COIN_MAP, coinMeta } from '../lib/coins'
import { useMarket } from '../store/market'
import { useWatchlist } from '../store/watchlist'

const INTERVALS: { key: Interval; label: string }[] = [
  { key: '1h', label: '1H' },
  { key: '4h', label: '4H' },
  { key: '1d', label: '1D' },
  { key: '1w', label: '1W' },
]

export default function Coin() {
  const params = useParams()
  const symbol = (params.symbol ?? '').toUpperCase()
  const meta = coinMeta(symbol)
  const tickers = useMarket((state) => state.tickers)
  const status = useMarket((state) => state.status)
  const watched = useWatchlist((state) => state.symbols.includes(symbol))
  const toggle = useWatchlist((state) => state.toggle)

  const [interval, setInterval] = useState<Interval>('1h')
  const [candles, setCandles] = useState<Candle[]>([])
  const [candlesLoading, setCandlesLoading] = useState(true)
  const [candleError, setCandleError] = useState('')
  const [depth, setDepth] = useState<Depth | null>(null)
  const [depthTick, setDepthTick] = useState(0)

  const ticker = tickers[symbol]
  const pair = `${symbol}USDT`
  const known = COIN_MAP.has(symbol)

  useEffect(() => {
    document.title = known ? `${meta.name} (${symbol}) · Ticker` : 'Pair not found · Ticker'
  }, [known, meta.name, symbol])

  useEffect(() => {
    if (!known) return
    let alive = true
    setCandlesLoading(true)
    setCandleError('')
    fetchKlines(pair, interval, 120)
      .then((list) => {
        if (alive) {
          setCandles(list)
          setCandlesLoading(false)
        }
      })
      .catch(() => {
        if (alive) {
          setCandleError('Candles unavailable right now.')
          setCandlesLoading(false)
        }
      })
    return () => {
      alive = false
    }
  }, [known, pair, interval])

  useEffect(() => {
    if (!known) return
    let alive = true
    const pull = () => {
      fetchDepth(pair, 12)
        .then((book) => {
          if (alive) setDepth(book)
        })
        .catch(() => undefined)
    }
    pull()
    const timer = window.setInterval(() => {
      pull()
      setDepthTick((value) => value + 1)
    }, 5000)
    return () => {
      alive = false
      window.clearInterval(timer)
    }
  }, [known, pair])

  const related = useMemo(() => {
    const start = Math.max(0, COINS.findIndex((coin) => coin.symbol === symbol))
    return Array.from({ length: 6 }, (_, index) => COINS[(start + index + 1) % COINS.length]).filter(
      (coin) => coin.symbol !== symbol,
    )
  }, [symbol])
  const relatedSparks = useSparklines(related.map((coin) => coin.symbol))

  const lastCandle = candles[candles.length - 1]
  const range = ticker ? ticker.high - ticker.low : 0
  const rangePosition = ticker && range > 0 ? ((ticker.last - ticker.low) / range) * 100 : 50

  if (!known) {
    return (
      <div className="wrap flex flex-col items-center gap-4 py-24 text-center">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-faint">404 · pair</span>
        <h1 className="font-display text-3xl font-bold tracking-tight">{symbol || 'This'} is not on the tape</h1>
        <p className="max-w-sm text-[13px] text-muted">
          Ticker tracks a curated set of USDT majors. Head back to the market table to pick one.
        </p>
        <Link to="/" className="btn btn-mint">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to markets
        </Link>
      </div>
    )
  }

  const stats = ticker
    ? [
        { label: '24h high', value: formatPrice(ticker.high) },
        { label: '24h low', value: formatPrice(ticker.low) },
        { label: '24h open', value: formatPrice(ticker.open) },
        { label: '24h volume', value: `${formatCompact(ticker.volume)} ${symbol}` },
        { label: 'Quote volume', value: `$${formatCompact(ticker.quoteVolume)}` },
        { label: 'Trades', value: new Intl.NumberFormat('en-US').format(ticker.trades) },
      ]
    : []

  return (
    <div className="wrap py-8 sm:py-10">
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-faint transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-3 w-3" /> markets
        </Link>
        <span className="flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.12em] text-faint">
          <span className={`live-dot ${status === 'live' ? '' : 'is-off'}`} />
          {status === 'live' ? 'streaming' : 'reconnecting'}
        </span>
      </div>

      <div className="mt-5 flex flex-wrap items-start justify-between gap-5">
        <div className="flex items-center gap-4">
          <CoinAvatar symbol={symbol} size={54} />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-[1.9rem] font-bold leading-none tracking-[-0.04em] sm:text-[2.3rem]">
                {meta.name}
              </h1>
              <span className="chip !py-1">{symbol} / USDT</span>
            </div>
            <div className="mt-2.5 flex flex-wrap items-center gap-2.5">
              <PriceCell value={ticker?.last ?? 0} className="text-[1.45rem] font-semibold leading-none" />
              <ChangeBadge value={ticker?.changePct ?? 0} />
              {ticker && (
                <span className="font-mono text-[10.5px] text-faint">
                  {ticker.change >= 0 ? '+' : ''}
                  {formatPrice(Math.abs(ticker.change)).replace('$', '$')} today
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => toggle(symbol)}
          className={`btn ${watched ? 'border-amber/30 bg-amber/10 text-amber' : 'btn-ghost'}`}
        >
          <Star className={`h-3.5 w-3.5 ${watched ? 'fill-current' : ''}`} />
          {watched ? 'On watchlist' : 'Add to watchlist'}
        </button>
      </div>

      <Reveal className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
        <div className="panel p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1 rounded-lg border border-line bg-panel2/60 p-1">
              {INTERVALS.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setInterval(item.key)}
                  className={`rounded-md px-3 py-1.5 font-mono text-[10px] tracking-[0.08em] transition-colors ${
                    interval === item.key ? 'bg-mint/15 text-mint' : 'text-faint hover:text-ink'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3 font-mono text-[9.5px] uppercase tracking-[0.1em] text-faint">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-mint" /> up
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-rose" /> down
              </span>
              <span className="hidden sm:inline">120 candles</span>
            </div>
          </div>

          {candleError ? (
            <div className="grid h-[384px] place-items-center rounded-xl border border-line bg-panel/60 text-center">
              <div className="space-y-2">
                <p className="text-[13px] text-rose">{candleError}</p>
                <button
                  type="button"
                  onClick={() => setInterval((value) => value)}
                  className="btn btn-ghost"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : (
            <CandleChart candles={candles} interval={interval} loading={candlesLoading} />
          )}

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-line pt-3 font-mono text-[10px]">
            <span className="text-faint">
              O <span className="text-ink">{lastCandle ? formatPrice(lastCandle.open) : '—'}</span>
            </span>
            <span className="text-faint">
              H <span className="text-mint">{lastCandle ? formatPrice(lastCandle.high) : '—'}</span>
            </span>
            <span className="text-faint">
              L <span className="text-rose">{lastCandle ? formatPrice(lastCandle.low) : '—'}</span>
            </span>
            <span className="text-faint">
              C <span className="text-ink">{lastCandle ? formatPrice(lastCandle.close) : '—'}</span>
            </span>
            <span className="ml-auto text-faint">
              vol <span className="text-muted">{lastCandle ? formatCompact(lastCandle.volume) : '—'}</span>
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="panel p-4">
            <div className="flex items-center justify-between">
              <span className="mono-label">24h statistics</span>
              <BarChart3 className="h-3.5 w-3.5 text-faint" />
            </div>

            <div className="mt-3">
              <div className="flex items-center justify-between font-mono text-[9.5px] text-faint">
                <span>low</span>
                <span>24h range</span>
                <span>high</span>
              </div>
              <div className="relative mt-1.5 h-1.5 rounded-full bg-panel2">
                <span className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-rose/70 via-amber/70 to-mint/80" style={{ width: '100%' }} />
                <span
                  className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-bg bg-ink shadow"
                  style={{ left: `${Math.min(100, Math.max(0, rangePosition))}%` }}
                />
              </div>
              <div className="mt-1.5 flex justify-between font-mono text-[10px] text-muted">
                <span>{ticker ? formatPrice(ticker.low) : '—'}</span>
                <span>{ticker ? formatPrice(ticker.high) : '—'}</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line/60">
              {(stats.length ? stats : Array.from({ length: 6 }, () => ({ label: '—', value: '—' }))).map((stat) => (
                <div key={stat.label} className="bg-panel px-3 py-2.5">
                  <div className="font-mono text-[9px] uppercase tracking-[0.1em] text-faint">{stat.label}</div>
                  <div className="mt-0.5 truncate font-mono text-[11.5px] text-ink">{stat.value}</div>
                </div>
              ))}
            </div>
          </div>

          <DepthLadder depth={depth} loading={!depth} />
          <span className="hidden font-mono text-[9px] uppercase tracking-[0.1em] text-faint" data-tick={depthTick}>
            depth refresh · 5s
          </span>
        </div>
      </Reveal>

      <section className="mt-10">
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="mono-label">keep looking</div>
            <h2 className="mt-1.5 font-display text-xl font-bold tracking-tight">More majors</h2>
          </div>
          <Link to="/" className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.12em] text-faint hover:text-mint">
            all markets <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {related.map((coin) => {
            const relatedTicker = tickers[coin.symbol]
            return (
              <Link
                key={coin.symbol}
                to={`/coin/${coin.symbol}`}
                className="panel group flex flex-col gap-2 p-3 transition-colors hover:border-line2"
              >
                <div className="flex items-center justify-between">
                  <CoinAvatar symbol={coin.symbol} size={26} />
                  <span className={`num text-[10px] ${(relatedTicker?.changePct ?? 0) >= 0 ? 'text-mint' : 'text-rose'}`}>
                    {relatedTicker ? formatPct(relatedTicker.changePct) : '—'}
                  </span>
                </div>
                <div>
                  <div className="text-[11.5px] font-semibold leading-tight">{coin.symbol}</div>
                  <div className="truncate font-mono text-[9px] uppercase tracking-[0.08em] text-faint">{coin.name}</div>
                </div>
                <div className="flex items-center justify-between gap-1">
                  <span className="num text-[10.5px] text-muted">
                    {relatedTicker ? formatPrice(relatedTicker.last) : '—'}
                  </span>
                  <Sparkline
                    data={relatedSparks[coin.symbol] ?? []}
                    up={(relatedTicker?.changePct ?? 0) >= 0}
                    width={44}
                    height={18}
                  />
                </div>
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}
