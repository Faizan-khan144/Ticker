import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface WatchlistState {
  symbols: string[]
  toggle: (symbol: string) => void
  clear: () => void
}

export const useWatchlist = create<WatchlistState>()(
  persist(
    (set) => ({
      symbols: [],
      toggle: (symbol) =>
        set((state) => ({
          symbols: state.symbols.includes(symbol)
            ? state.symbols.filter((item) => item !== symbol)
            : [...state.symbols, symbol],
        })),
      clear: () => set({ symbols: [] }),
    }),
    { name: 'ticker:watchlist' },
  ),
)
