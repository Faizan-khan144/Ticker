import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Code2, Database, Lock, Radio, Star, Zap } from 'lucide-react'
import Reveal from '../components/Reveal'

const FEATURES = [
  {
    icon: Radio,
    title: 'Socket-first prices',
    text: 'A single WebSocket carries 48 ticker streams. Updates are batched every 700ms so the table moves without melting the main thread.',
  },
  {
    icon: Zap,
    title: 'Candles and depth',
    text: 'REST klines power the chart across four intervals. The order book refreshes every five seconds with cumulative depth bars.',
  },
  {
    icon: Star,
    title: 'Local watchlist',
    text: 'Stars persist in localStorage. Nothing leaves the browser and there is nothing to sign up for.',
  },
  {
    icon: Lock,
    title: 'Keyless by design',
    text: 'Only public Binance endpoints are used. No API keys, no proxy server, no accounts to leak.',
  },
]

const STEPS = [
  {
    n: '01',
    title: 'Snapshot on load',
    text: 'One batch request pulls 24h stats for every tracked USDT pair, then the socket takes over.',
  },
  {
    n: '02',
    title: 'Stream and batch',
    text: 'Incoming ticker frames land in a buffer and flush on a timer, keeping renders predictable.',
  },
  {
    n: '03',
    title: 'Drill down',
    text: 'Klines, depth and related majors load per pair. The chart can crosshair any candle locally.',
  },
]

export default function About() {
  useEffect(() => {
    document.title = 'About · Ticker'
  }, [])

  return (
    <div className="wrap py-9 sm:py-12">
      <Reveal className="grid items-center gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <div className="chip">about</div>
          <h1 className="mt-4 font-display text-[2.6rem] font-bold leading-[0.94] tracking-[-0.055em] sm:text-[4rem]">
            No keys.
            <br />
            No accounts.
            <br />
            <span className="relative inline-block">
              Just the tape.
              <svg className="wave-under" viewBox="0 0 300 12" preserveAspectRatio="none" aria-hidden="true">
                <path pathLength="1" d="M2 8 Q 26 2 50 7 T 98 7 T 146 7 T 194 7 T 242 7 T 298 6" />
              </svg>
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-[14px] leading-relaxed text-muted">
            Ticker is a small, opinionated crypto terminal for the spot market. It tracks a curated set of majors,
            streams their prices, and stays out of the way. Built as a front-end exercise in realtime data, motion and
            restraint.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link to="/" className="btn btn-mint">
              Open markets <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <a href="https://github.com/Faizan-khan144" target="_blank" rel="noreferrer" className="btn btn-ghost">
              <Code2 className="h-3.5 w-3.5" /> GitHub
            </a>
          </div>
        </div>

        <div className="panel relative overflow-hidden p-5">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage:
                'linear-gradient(#0a0a0a 1px, transparent 1px), linear-gradient(90deg, #0a0a0a 1px, transparent 1px)',
              backgroundSize: '30px 30px',
              maskImage: 'radial-gradient(80% 80% at 50% 0%, #000, transparent)',
            }}
          />
          <div className="relative space-y-3">
            {[
              { label: 'pairs tracked', value: '48' },
              { label: 'socket streams', value: '48' },
              { label: 'flush interval', value: '700ms' },
              { label: 'depth refresh', value: '5s' },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between border-b border-line/60 pb-2.5 last:border-0 last:pb-0">
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-faint">{row.label}</span>
                <span className="stat-value text-[13px] text-ink">{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      <section className="mt-14">
        <div className="mono-label">the build</div>
        <h2 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">Small surface, sharp edges</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {FEATURES.map((feature, index) => (
            <Reveal key={feature.title} delay={index * 90}>
              <div className="panel h-full p-5 transition-all hover:-translate-y-0.5 hover:shadow-[0_24px_50px_-32px_rgba(0,0,0,0.35)]">
                <span className="grid h-9 w-9 place-items-center rounded-full border border-line bg-panel2 text-ink">
                  <feature.icon className="h-4 w-4" />
                </span>
                <h3 className="mt-3.5 font-display text-[15px] font-semibold">{feature.title}</h3>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted">{feature.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <div className="mono-label">pipeline</div>
        <h2 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">From frame to pixel</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <Reveal key={step.n} delay={index * 110}>
              <div className="panel h-full p-5 transition-all hover:-translate-y-0.5 hover:shadow-[0_24px_50px_-32px_rgba(0,0,0,0.35)]">
                <div className="font-mono text-[10px] tracking-[0.14em] text-rose">{step.n}</div>
                <h3 className="mt-2 font-display text-[15px] font-semibold">{step.title}</h3>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted">{step.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mt-14 grid gap-3 md:grid-cols-[1.1fr_0.9fr]">
        <div className="panel p-5">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-sky" />
            <h2 className="font-display text-[15px] font-semibold">Data & limits</h2>
          </div>
          <p className="mt-2.5 text-[12.5px] leading-relaxed text-muted">
            Prices come from Binance's public spot API. Public endpoints are rate limited and may be geo-blocked in
            some regions; the UI falls back across four hosts and reconnects the socket automatically. Numbers can lag
            the exchange book and are provided for information only — not financial advice.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {['React 19', 'Vite', 'TypeScript', 'Tailwind 4', 'Zustand', 'Binance API'].map((tag) => (
              <span key={tag} className="chip !normal-case !tracking-normal">
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="panel flex flex-col justify-between p-5">
          <div>
            <div className="mono-label">disclaimer</div>
            <p className="mt-2 text-[12.5px] leading-relaxed text-muted">
              Ticker is an independent fan project. It is not affiliated with Binance. Nothing here is investment
              advice, and no orders can be placed from this interface.
            </p>
          </div>
          <span className="mt-4 font-mono text-[9px] uppercase tracking-[0.12em] text-faint">read the tape, not the hype</span>
        </div>
      </section>
    </div>
  )
}
