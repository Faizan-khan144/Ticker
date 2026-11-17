# Ticker

A realtime crypto desk for the spot market. Live prices from Binance's public API, candles, cumulative depth, a volume-weighted heatmap and a local watchlist — no account, no keys.

## Run

```bash
npm install
npm run dev
```

```bash
npm run build
npx oxlint src
```

## What's inside

- **Markets** — 48 USDT pairs streaming over one multiplexed WebSocket, batched into the UI every 700ms.
- **Coin desk** — `/coin/:symbol` with 1m–1w candles, volume, 24h stats, order book depth and related majors.
- **Heatmap** — every pair sized by 24h dollar volume and tinted by its move.
- **Watchlist** — stars persisted in `localStorage`, with combined volume and top/weakest movers.
- **Command palette** — `⌘K` or `/` to jump to a pair or page.

## Stack

React 19, Vite, TypeScript, Tailwind CSS 4, Zustand, react-router, lucide-react. Charts are hand-rolled SVG/CSS.

## Data

Public Binance spot endpoints only (`api.binance.com` with fallbacks) plus `wss://stream.binance.com` for live tickers. Public endpoints can be rate limited or geo-blocked; the UI falls back across hosts and reconnects automatically. Numbers are informational only, not financial advice.
