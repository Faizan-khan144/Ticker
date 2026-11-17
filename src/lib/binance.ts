import { PAIRS, pairFor } from './coins'

const HOSTS = ['https://api.binance.com', 'https://api1.binance.com', 'https://api2.binance.com', 'https://api3.binance.com']

export type Interval = '1h' | '4h' | '1d' | '1w'

export interface Ticker {
  symbol: string
  base: string
  last: number
  change: number
  changePct: number
  high: number
  low: number
  open: number
  volume: number
  quoteVolume: number
  trades: number
}

export interface Candle {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface DepthLevel {
  price: number
  quantity: number
  total: number
}

export interface Depth {
  bids: DepthLevel[]
  asks: DepthLevel[]
}

interface RawTicker {
  symbol: string
  lastPrice: string
  priceChange: string
  priceChangePercent: string
  highPrice: string
  lowPrice: string
  openPrice: string
  volume: string
  quoteVolume: string
  count: number
}

const num = (value: string | number) => Number(value)

async function requestJson<T>(path: string): Promise<T> {
  let lastError: unknown
  for (const host of HOSTS) {
    try {
      const response = await fetch(`${host}${path}`)
      if (!response.ok) throw new Error(`Binance responded ${response.status}`)
      return (await response.json()) as T
    } catch (error) {
      lastError = error
    }
  }
  throw lastError instanceof Error ? lastError : new Error('Network unavailable')
}

const toTicker = (raw: RawTicker): Ticker => ({
  symbol: raw.symbol,
  base: raw.symbol.replace(/USDT$/, ''),
  last: num(raw.lastPrice),
  change: num(raw.priceChange),
  changePct: num(raw.priceChangePercent),
  high: num(raw.highPrice),
  low: num(raw.lowPrice),
  open: num(raw.openPrice),
  volume: num(raw.volume),
  quoteVolume: num(raw.quoteVolume),
  trades: raw.count,
})

export async function fetchTickers(): Promise<Ticker[]> {
  const symbols = encodeURIComponent(JSON.stringify(PAIRS))
  const raw = await requestJson<RawTicker[]>(`/api/v3/ticker/24hr?symbols=${symbols}`)
  return raw.map(toTicker)
}

export async function fetchTicker(pair: string): Promise<Ticker> {
  const raw = await requestJson<RawTicker>(`/api/v3/ticker/24hr?symbol=${pair}`)
  return toTicker(raw)
}

export async function fetchKlines(pair: string, interval: Interval = '1h', limit = 120): Promise<Candle[]> {
  const raw = await requestJson<Array<[number, string, string, string, string, string]>>(
    `/api/v3/klines?symbol=${pair}&interval=${interval}&limit=${limit}`,
  )
  return raw.map((row) => ({
    time: row[0],
    open: num(row[1]),
    high: num(row[2]),
    low: num(row[3]),
    close: num(row[4]),
    volume: num(row[5]),
  }))
}

export async function fetchDepth(pair: string, limit = 12): Promise<Depth> {
  const raw = await requestJson<{ bids: Array<[string, string]>; asks: Array<[string, string]> }>(
    `/api/v3/depth?symbol=${pair}&limit=${limit}`,
  )
  let bidTotal = 0
  let askTotal = 0
  const bids = raw.bids.map(([price, quantity]) => {
    bidTotal += num(quantity)
    return { price: num(price), quantity: num(quantity), total: bidTotal }
  })
  const asks = raw.asks.map(([price, quantity]) => {
    askTotal += num(quantity)
    return { price: num(price), quantity: num(quantity), total: askTotal }
  })
  return { bids, asks }
}

export const wsUrl = () =>
  `wss://stream.binance.com:9443/stream?streams=${PAIRS.map((pair) => `${pair.toLowerCase()}@ticker`).join('/')}`

export const tickerPair = pairFor

const priceFormatters = {
  large: new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
  mid: new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 }),
}

export function formatPrice(value: number): string {
  if (!Number.isFinite(value)) return '—'
  if (value >= 1000) return `$${priceFormatters.large.format(value)}`
  if (value >= 1) return `$${priceFormatters.mid.format(value)}`
  if (value >= 0.01) return `$${value.toFixed(4)}`
  if (value >= 0.0001) return `$${value.toFixed(6)}`
  return `$${value.toPrecision(4)}`
}

export function formatCompact(value: number): string {
  if (!Number.isFinite(value)) return '—'
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 2 }).format(value)
}

export function formatPct(value: number, digits = 2): string {
  if (!Number.isFinite(value)) return '—'
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(digits)}%`
}

export function formatCandleTime(time: number, interval: Interval): string {
  const date = new Date(time)
  if (interval === '1d' || interval === '1w') {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
  return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}
