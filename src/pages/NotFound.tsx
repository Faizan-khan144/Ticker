import { Link } from 'react-router-dom'
import { ArrowLeft, LayoutGrid, Star } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="wrap flex flex-col items-center py-24 text-center">
      <div className="stat-value select-none bg-gradient-to-b from-ink to-panel2 bg-clip-text text-[7rem] font-bold leading-none text-transparent sm:text-[10rem]">
        404
      </div>
      <h1 className="mt-2 font-display text-2xl font-bold tracking-tight">This ticker does not exist</h1>
      <p className="mt-2 max-w-sm text-[13px] leading-relaxed text-muted">
        The page you followed is not on the tape. Head back to the market table and pick a pair.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-2">
        <Link to="/" className="btn btn-mint">
          <ArrowLeft className="h-3.5 w-3.5" /> Markets
        </Link>
        <Link to="/heatmap" className="btn btn-ghost">
          <LayoutGrid className="h-3.5 w-3.5" /> Heatmap
        </Link>
        <Link to="/watchlist" className="btn btn-ghost">
          <Star className="h-3.5 w-3.5" /> Watchlist
        </Link>
      </div>
    </div>
  )
}
