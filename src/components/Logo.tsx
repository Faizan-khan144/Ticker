interface LogoProps {
  size?: number
}

export default function Logo({ size = 32 }: LogoProps) {
  return (
    <span className="flex items-center gap-2.5">
      <span
        className="grid shrink-0 place-items-center rounded-full bg-ink font-display font-bold text-white"
        style={{ width: size, height: size, fontSize: Math.round(size * 0.5) }}
        aria-hidden="true"
      >
        t
      </span>
      <span className="font-display text-[19px] font-bold tracking-[-0.045em]">
        Ticker<span className="text-rose">.</span>
      </span>
    </span>
  )
}
