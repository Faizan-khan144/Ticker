import { Code2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import Logo from './Logo'

export default function Footer() {
  return (
    <footer className="relative z-10 mt-20 border-t border-line bg-panel/40">
      <div className="wrap grid gap-10 py-12 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <Logo size={28} />
          <p className="mt-4 max-w-sm text-[13px] leading-relaxed text-muted">
            A realtime crypto terminal for the spot market. Live prices over WebSocket, candles, depth and a heatmap —
            no account, no API keys, no noise.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <span className="chip">binance spot</span>
            <span className="chip">keyless</span>
            <span className="chip">local watchlist</span>
          </div>
        </div>

        <div>
          <div className="mono-label">Terminal</div>
          <div className="mt-4 flex flex-col gap-2.5 text-[13px] text-muted">
            <Link to="/" className="transition-colors hover:text-mint">Markets</Link>
            <Link to="/heatmap" className="transition-colors hover:text-mint">Heatmap</Link>
            <Link to="/watchlist" className="transition-colors hover:text-mint">Watchlist</Link>
            <Link to="/about" className="transition-colors hover:text-mint">About</Link>
          </div>
        </div>

        <div>
          <div className="mono-label">Sources</div>
          <div className="mt-4 flex flex-col gap-2.5 text-[13px] text-muted">
            <a href="https://www.binance.com" target="_blank" rel="noreferrer" className="transition-colors hover:text-mint">
              Binance
            </a>
            <a href="https://binance-docs.github.io/apidocs/spot/en/" target="_blank" rel="noreferrer" className="transition-colors hover:text-mint">
              API docs
            </a>
            <a href="https://github.com/Faizan-khan144" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 transition-colors hover:text-mint">
              <Code2 className="h-3.5 w-3.5" /> GitHub
            </a>
          </div>
        </div>
      </div>

      <div className="wrap flex flex-col gap-2 border-t border-line py-5 text-[11.5px] text-faint sm:flex-row sm:items-center sm:justify-between">
        <span>© {new Date().getFullYear()} Ticker. Market data is delayed and for information only — not financial advice.</span>
        <span className="font-mono text-[10px] uppercase tracking-[0.14em]">spot prices via binance public api</span>
      </div>
    </footer>
  )
}
