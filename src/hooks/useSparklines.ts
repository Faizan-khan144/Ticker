import { useEffect, useState } from 'react'
import { fetchKlines } from '../lib/binance'

const cache = new Map<string, { at: number; data: number[] }>()
const TTL = 5 * 60 * 1000

export function useSparklines(symbols: string[]) {
  const key = symbols.join(',')
  const [data, setData] = useState<Record<string, number[]>>({})

  useEffect(() => {
    const list = key ? key.split(',') : []
    if (list.length === 0) return
    let alive = true

    const cached = Object.fromEntries(
      list
        .map((symbol) => {
          const hit = cache.get(symbol)
          return hit && Date.now() - hit.at < TTL ? [symbol, hit.data] : null
        })
        .filter((entry): entry is [string, number[]] => entry !== null),
    )
    setData((previous) => ({ ...previous, ...cached }))

    const missing = list.filter((symbol) => !cached[symbol])
    if (missing.length === 0) return

    const run = async () => {
      for (let start = 0; start < missing.length; start += 5) {
        const chunk = missing.slice(start, start + 5)
        const results = await Promise.all(
          chunk.map(async (symbol): Promise<[string, number[]]> => {
            try {
              const candles = await fetchKlines(`${symbol}USDT`, '1h', 24)
              return [symbol, candles.map((candle) => candle.close)]
            } catch {
              return [symbol, []]
            }
          }),
        )
        if (!alive) return
        const batch: Record<string, number[]> = {}
        results.forEach(([symbol, closes]) => {
          cache.set(symbol, { at: Date.now(), data: closes })
          batch[symbol] = closes
        })
        setData((previous) => ({ ...previous, ...batch }))
      }
    }

    void run()
    return () => {
      alive = false
    }
  }, [key])

  return data
}
