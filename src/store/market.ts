import { create } from 'zustand'
import { fetchTickers, wsUrl, type Ticker } from '../lib/binance'

type Status = 'idle' | 'loading' | 'live' | 'offline' | 'error'

interface MarketState {
  tickers: Record<string, Ticker>
  status: Status
  updatedAt: number
  error: string
  load: () => Promise<void>
  connect: () => void
}

interface StreamPayload {
  s: string
  c: string
  P: string
  h: string
  l: string
  o: string
  q: string
  v: string
  n: number
}

let socket: WebSocket | null = null
let reconnectTimer: ReturnType<typeof setTimeout> | null = null
let flushTimer: ReturnType<typeof setInterval> | null = null
const buffer: Record<string, StreamPayload> = {}

const toPair = (base: string) => `${base}USDT`

export const useMarket = create<MarketState>((set, get) => ({
  tickers: {},
  status: 'idle',
  updatedAt: 0,
  error: '',

  load: async () => {
    if (get().status === 'loading') return
    set({ status: 'loading', error: '' })
    try {
      const list = await fetchTickers()
      const tickers = Object.fromEntries(list.map((ticker) => [ticker.base, ticker]))
      set({ tickers, status: 'live', updatedAt: Date.now() })
    } catch {
      set({ status: 'error', error: 'Could not reach the Binance market feed. Check your connection and retry.' })
    }
  },

  connect: () => {
    if (typeof window === 'undefined') return
    if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) return

    const open = () => {
      if (reconnectTimer) {
        clearTimeout(reconnectTimer)
        reconnectTimer = null
      }
      socket = new WebSocket(wsUrl())
      socket.onopen = () => set({ status: 'live' })
      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data as string) as { data?: StreamPayload }
          const payload = message.data
          if (!payload || !payload.s) return
          buffer[payload.s] = payload
        } catch {
          return
        }
      }
      socket.onclose = () => {
        socket = null
        set((state) => ({ status: state.status === 'error' ? 'error' : 'offline' }))
        reconnectTimer = setTimeout(open, 4000)
      }
      socket.onerror = () => {
        socket?.close()
      }
    }

    if (flushTimer) clearInterval(flushTimer)
    flushTimer = setInterval(() => {
      const pairs = Object.keys(buffer)
      if (pairs.length === 0) return
      set((state) => {
        const tickers = { ...state.tickers }
        for (const pair of pairs) {
          const payload = buffer[pair]
          delete buffer[pair]
          const base = payload.s.replace(/USDT$/, '')
          const current = tickers[base]
          if (!current) continue
          tickers[base] = {
            ...current,
            last: Number(payload.c),
            changePct: Number(payload.P),
            high: Number(payload.h),
            low: Number(payload.l),
            open: Number(payload.o),
            quoteVolume: Number(payload.q),
            volume: Number(payload.v),
            trades: payload.n,
            change: Number(payload.c) - Number(payload.o),
          }
        }
        return { tickers, updatedAt: Date.now() }
      })
    }, 700)

    open()
    if (Object.keys(get().tickers).length === 0) void get().load()
  },
}))

export const pairOf = toPair
