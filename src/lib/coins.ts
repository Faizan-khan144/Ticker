export interface CoinMeta {
  symbol: string
  name: string
  color: string
}

export const COINS: CoinMeta[] = [
  { symbol: 'BTC', name: 'Bitcoin', color: '#f7931a' },
  { symbol: 'ETH', name: 'Ethereum', color: '#8a9bff' },
  { symbol: 'SOL', name: 'Solana', color: '#19f5b0' },
  { symbol: 'BNB', name: 'BNB', color: '#f3ba2f' },
  { symbol: 'XRP', name: 'XRP', color: '#7aa2ff' },
  { symbol: 'DOGE', name: 'Dogecoin', color: '#d6b24a' },
  { symbol: 'ADA', name: 'Cardano', color: '#4f8cff' },
  { symbol: 'AVAX', name: 'Avalanche', color: '#ff6a6a' },
  { symbol: 'LINK', name: 'Chainlink', color: '#5b8cff' },
  { symbol: 'DOT', name: 'Polkadot', color: '#ff5fa2' },
  { symbol: 'TON', name: 'Toncoin', color: '#3fb6f5' },
  { symbol: 'TRX', name: 'TRON', color: '#ff5a5a' },
  { symbol: 'LTC', name: 'Litecoin', color: '#c9d3de' },
  { symbol: 'BCH', name: 'Bitcoin Cash', color: '#7ad67a' },
  { symbol: 'UNI', name: 'Uniswap', color: '#ff5db1' },
  { symbol: 'ATOM', name: 'Cosmos', color: '#9aa4c7' },
  { symbol: 'ETC', name: 'Ethereum Classic', color: '#5fd35f' },
  { symbol: 'FIL', name: 'Filecoin', color: '#5cb3ff' },
  { symbol: 'APT', name: 'Aptos', color: '#8fdcff' },
  { symbol: 'ARB', name: 'Arbitrum', color: '#4fb2ff' },
  { symbol: 'OP', name: 'Optimism', color: '#ff5a5a' },
  { symbol: 'SUI', name: 'Sui', color: '#6bb8ff' },
  { symbol: 'NEAR', name: 'NEAR', color: '#7de6b8' },
  { symbol: 'INJ', name: 'Injective', color: '#4fe3ff' },
  { symbol: 'SEI', name: 'Sei', color: '#ff8a8a' },
  { symbol: 'PEPE', name: 'Pepe', color: '#6fdb66' },
  { symbol: 'SHIB', name: 'Shiba Inu', color: '#ff6b5e' },
  { symbol: 'WIF', name: 'dogwifhat', color: '#ffc766' },
  { symbol: 'BONK', name: 'Bonk', color: '#ffb347' },
  { symbol: 'RENDER', name: 'Render', color: '#ff7a45' },
  { symbol: 'FET', name: 'Fetch.ai', color: '#7d8bff' },
  { symbol: 'AAVE', name: 'Aave', color: '#c47ab8' },
  { symbol: 'MKR', name: 'Maker', color: '#4fd6c2' },
  { symbol: 'TAO', name: 'Bittensor', color: '#b388ff' },
  { symbol: 'TIA', name: 'Celestia', color: '#a87bff' },
  { symbol: 'STX', name: 'Stacks', color: '#8b8bff' },
  { symbol: 'HBAR', name: 'Hedera', color: '#c3d0dd' },
  { symbol: 'ICP', name: 'Internet Computer', color: '#5fc2ff' },
  { symbol: 'ALGO', name: 'Algorand', color: '#8d9cff' },
  { symbol: 'VET', name: 'VeChain', color: '#5ad8ff' },
  { symbol: 'GRT', name: 'The Graph', color: '#9b8cff' },
  { symbol: 'CRV', name: 'Curve', color: '#c7d34a' },
  { symbol: 'COMP', name: 'Compound', color: '#5ff0c8' },
  { symbol: 'SNX', name: 'Synthetix', color: '#6fe3ff' },
  { symbol: 'ENA', name: 'Ethena', color: '#c9b6ff' },
  { symbol: 'JUP', name: 'Jupiter', color: '#bdf08a' },
  { symbol: 'ONDO', name: 'Ondo', color: '#9aa6ff' },
  { symbol: 'WLD', name: 'Worldcoin', color: '#b6c2d1' },
  { symbol: 'IMX', name: 'Immutable', color: '#7dc8ff' },
]

export const COIN_MAP = new Map(COINS.map((coin) => [coin.symbol, coin]))

const FALLBACK_COLORS = ['#2fe3ad', '#66b8ff', '#ffcc66', '#c9b6ff', '#ff8fb8', '#7ef0d0', '#a8c0ff', '#ffb37a']

export function coinMeta(symbol: string): CoinMeta {
  const known = COIN_MAP.get(symbol)
  if (known) return known
  let hash = 0
  for (let index = 0; index < symbol.length; index += 1) {
    hash = (hash * 31 + symbol.charCodeAt(index)) % 997
  }
  return { symbol, name: symbol, color: FALLBACK_COLORS[hash % FALLBACK_COLORS.length] }
}

export function pairFor(symbol: string) {
  return `${symbol}USDT`
}

export const PAIRS = COINS.map((coin) => pairFor(coin.symbol))
