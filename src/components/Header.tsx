import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Menu, Search, Star, X } from 'lucide-react'
import Logo from './Logo'
import CommandPalette from './CommandPalette'
import { useMarket } from '../store/market'
import { useWatchlist } from '../store/watchlist'

const NAV = [
  { to: '/', label: 'Markets', end: true },
  { to: '/heatmap', label: 'Heatmap' },
  { to: '/watchlist', label: 'Watchlist' },
  { to: '/about', label: 'About' },
]

export default function Header() {
  const status = useMarket((state) => state.status)
  const saved = useWatchlist((state) => state.symbols.length)
  const location = useLocation()
  const [mobile, setMobile] = useState(false)
  const [palette, setPalette] = useState(false)

  useEffect(() => {
    setMobile(false)
  }, [location.pathname])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const typing = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setPalette((value) => !value)
        return
      }
      if (event.key === '/' && !typing) {
        event.preventDefault()
        setPalette(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const live = status === 'live'

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-line/70 bg-bg/85 backdrop-blur-2xl">
        <div className="wrap relative flex h-[66px] items-center gap-2">
          <Link to="/" className="mr-4 shrink-0" aria-label="Ticker home">
            <Logo />
          </Link>

          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 md:flex">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `relative rounded-lg px-3 py-2 text-[13px] transition-colors ${
                    isActive ? 'font-semibold text-ink' : 'text-muted hover:text-ink'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {item.label}
                    <span
                      className={`absolute inset-x-3 -bottom-2 h-[1.5px] rounded-full bg-rose transition-all duration-300 ${
                        isActive ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0'
                      }`}
                    />
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1.5 sm:gap-3">
            <span
              className="hidden items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-faint lg:flex"
              title={live ? 'Streaming Binance spot data' : 'Reconnecting to the feed'}
            >
              <span className={`live-dot ${live ? '' : 'is-off'}`} />
              {live ? 'live' : status === 'loading' ? 'syncing' : 'offline'}
            </span>

            <button
              type="button"
              onClick={() => setPalette(true)}
              className="hidden items-center gap-2 rounded-full px-2 py-1.5 text-[12.5px] text-muted transition-colors hover:text-ink sm:flex"
              aria-label="Search assets"
            >
              <Search className="h-3.5 w-3.5" />
              <span className="hidden lg:inline">Search</span>
              <kbd className="hidden rounded border border-line bg-panel2 px-1 py-0.5 font-mono text-[9px] text-faint lg:inline">⌘K</kbd>
            </button>

            <Link
              to="/watchlist"
              className="relative grid h-8 w-8 place-items-center rounded-full text-muted transition-colors hover:text-ink"
              aria-label={`Watchlist, ${saved} saved`}
            >
              <Star className="h-4 w-4" />
              {saved > 0 && (
                <span className="absolute right-0 top-0 grid h-3.5 min-w-3.5 place-items-center rounded-full bg-rose px-0.5 font-mono text-[8px] font-bold text-white">
                  {saved}
                </span>
              )}
            </Link>

            <Link to="/coin/BTC" className="btn btn-mint !hidden !px-4 !py-2.5 !text-[12px] sm:!inline-flex">
              Open desk
            </Link>

            <button
              type="button"
              onClick={() => setMobile((value) => !value)}
              className="grid h-9 w-9 place-items-center rounded-full text-muted transition-colors hover:text-ink md:hidden"
              aria-label="Toggle navigation"
              aria-expanded={mobile}
            >
              {mobile ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
            </button>
          </div>
        </div>
      </header>

      {mobile && (
        <div className="sticky top-[66px] z-40 border-b border-line bg-bg/95 backdrop-blur-2xl md:hidden">
          <div className="page-enter wrap grid gap-1 py-3">
            {NAV.map((item, index) => (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-center justify-between rounded-lg px-3 py-3 transition-colors hover:bg-panel2"
                style={{ animationDelay: `${index * 40}ms` }}
              >
                <span className="text-[15px] font-medium">{item.label}</span>
                <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-faint">
                  {item.label === 'Watchlist' ? `${saved} saved` : 'open'}
                </span>
              </Link>
            ))}
            <button
              type="button"
              onClick={() => {
                setMobile(false)
                setPalette(true)
              }}
              className="mt-1 flex items-center gap-2 rounded-lg border border-line px-3 py-3 text-left text-[13px] text-muted"
            >
              <Search className="h-4 w-4" /> Search assets
            </button>
          </div>
        </div>
      )}

      <CommandPalette open={palette} onClose={() => setPalette(false)} />
    </>
  )
}
