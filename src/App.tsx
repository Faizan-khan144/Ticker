import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Footer from './components/Footer'
import Header from './components/Header'
import About from './pages/About'
import Coin from './pages/Coin'
import Heatmap from './pages/Heatmap'
import Markets from './pages/Markets'
import NotFound from './pages/NotFound'
import Watchlist from './pages/Watchlist'
import { useMarket } from './store/market'

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])

  return null
}

export default function App() {
  const location = useLocation()
  const load = useMarket((state) => state.load)
  const connect = useMarket((state) => state.connect)

  useEffect(() => {
    void load()
    connect()
  }, [load, connect])

  return (
    <div className="grain relative flex min-h-screen flex-col">
      <div className="scroll-progress" aria-hidden="true" />
      <ScrollToTop />
      <Header />
      <main key={location.pathname} className="page-enter relative z-10 flex-1">
        <Routes>
          <Route path="/" element={<Markets />} />
          <Route path="/coin/:symbol" element={<Coin />} />
          <Route path="/heatmap" element={<Heatmap />} />
          <Route path="/watchlist" element={<Watchlist />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
