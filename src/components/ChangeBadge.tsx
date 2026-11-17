import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import { formatPct } from '../lib/binance'

interface ChangeBadgeProps {
  value: number
  compact?: boolean
}

export default function ChangeBadge({ value, compact = false }: ChangeBadgeProps) {
  const up = value > 0
  const flat = Math.abs(value) < 0.005
  const tone = flat
    ? 'border-line bg-panel2/60 text-muted'
    : up
      ? 'border-mint/25 bg-mint/10 text-mint'
      : 'border-rose/25 bg-rose/10 text-rose'
  const Icon = flat ? Minus : up ? ArrowUpRight : ArrowDownRight

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border font-mono text-[11.5px] font-medium tabular-nums ${tone} ${
        compact ? 'px-1.5 py-0.5' : 'px-2 py-1'
      }`}
    >
      <Icon className={compact ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
      {formatPct(value)}
    </span>
  )
}
