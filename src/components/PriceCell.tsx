import { useEffect, useRef } from 'react'
import { formatPrice } from '../lib/binance'

interface PriceCellProps {
  value: number
  className?: string
}

export default function PriceCell({ value, className = '' }: PriceCellProps) {
  const previous = useRef(value)
  const direction = value > previous.current ? 'up' : value < previous.current ? 'down' : 'flat'

  useEffect(() => {
    previous.current = value
  }, [value])

  return (
    <span
      key={value}
      className={`num inline-block ${direction === 'up' ? 'flash-up' : direction === 'down' ? 'flash-down' : ''} ${className}`}
    >
      {formatPrice(value)}
    </span>
  )
}
