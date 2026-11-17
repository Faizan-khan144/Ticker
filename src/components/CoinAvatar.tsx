import { coinMeta } from '../lib/coins'

interface CoinAvatarProps {
  symbol: string
  size?: number
}

export default function CoinAvatar({ symbol, size = 34 }: CoinAvatarProps) {
  const meta = coinMeta(symbol)
  return (
    <span
      className="grid shrink-0 place-items-center rounded-[2px] border font-mono font-bold tracking-tight"
      style={{
        width: size,
        height: size,
        color: meta.color,
        backgroundColor: `${meta.color}14`,
        borderColor: `${meta.color}3d`,
        boxShadow: `inset 0 0 18px -8px ${meta.color}`,
        fontSize: Math.max(8, Math.round(size * 0.24)),
      }}
      aria-hidden="true"
    >
      {symbol.slice(0, 4)}
    </span>
  )
}
