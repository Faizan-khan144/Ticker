import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CornerDownLeft, Search } from 'lucide-react'
import { COINS } from '../lib/coins'
import { formatPct, formatPrice } from '../lib/binance'
import { useMarket } from '../store/market'
import CoinAvatar from './CoinAvatar'

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
}

export default function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const navigate = useNavigate()
  const tickers = useMarket((state) => state.tickers)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return COINS.filter((coin) => !needle || `${coin.symbol} ${coin.name}`.toLowerCase().includes(needle)).slice(0, 8)
  }, [query])

  useEffect(() => {
    if (!open) return
    setQuery('')
    setSelected(0)
    const timer = window.setTimeout(() => inputRef.current?.focus(), 40)
    document.body.style.overflow = 'hidden'
    return () => {
      window.clearTimeout(timer)
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    setSelected(0)
  }, [query])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        setSelected((value) => Math.min(value + 1, results.length - 1))
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault()
        setSelected((value) => Math.max(value - 1, 0))
      }
      if (event.key === 'Enter' && results[selected]) {
        event.preventDefault()
        navigate(`/coin/${results[selected].symbol}`)
        onClose()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, results, selected, navigate, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center px-4 pt-[12vh]">
      <div className="absolute inset-0 bg-bg/80 backdrop-blur-md" onClick={onClose} />
      <div className="page-enter relative w-full max-w-lg overflow-hidden rounded-2xl border border-line2 bg-panel shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)]">
        <div className="flex items-center gap-3 border-b border-line px-4 py-3">
          <Search className="h-4 w-4 text-faint" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search a ticker or asset…"
            className="w-full bg-transparent text-[14px] text-ink outline-none placeholder:text-faint"
          />
          <kbd className="hidden rounded border border-line bg-panel2 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-faint sm:block">
            esc
          </kbd>
        </div>

        <div className="max-h-[320px] overflow-y-auto p-2">
          {results.length === 0 && (
            <p className="px-3 py-6 text-center font-mono text-[11px] uppercase tracking-[0.12em] text-faint">
              no matching ticker
            </p>
          )}
          {results.map((coin, index) => {
            const ticker = tickers[coin.symbol]
            return (
              <button
                key={coin.symbol}
                type="button"
                onMouseEnter={() => setSelected(index)}
                onClick={() => {
                  navigate(`/coin/${coin.symbol}`)
                  onClose()
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                  index === selected ? 'bg-panel2' : 'hover:bg-panel2/60'
                }`}
              >
                <CoinAvatar symbol={coin.symbol} size={30} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-semibold">{coin.name}</span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-faint">{coin.symbol} · USDT</span>
                </span>
                {ticker ? (
                  <span className="text-right">
                    <span className="num block text-[12px]">{formatPrice(ticker.last)}</span>
                    <span className={`num block text-[10px] ${ticker.changePct >= 0 ? 'text-mint' : 'text-rose'}`}>
                      {formatPct(ticker.changePct)}
                    </span>
                  </span>
                ) : (
                  <CornerDownLeft className="h-3.5 w-3.5 text-faint" />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
