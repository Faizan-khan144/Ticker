import { lazy, Suspense, useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Footer from './components/Footer'
import Header from './components/Header'
import { useMarket } from './store/market'

const Markets = lazy(() => import('./pages/Markets'))
const Coin = lazy(() => import('./pages/Coin'))
const Heatmap = lazy(() => import('./pages/Heatmap'))
const Watchlist = lazy(() => import('./pages/Watchlist'))
const About = lazy(() => import('./pages/About'))
const NotFound = lazy(() => import('./pages/NotFound'))

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
        <Suspense
          fallback={
            <div className="wrap py-20">
              <div className="skeleton h-3 w-24" />
              <div className="skeleton mt-4 h-10 w-72 max-w-full" />
              <div className="skeleton mt-8 h-72 w-full" />
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<Markets />} />
            <Route path="/coin/:symbol" element={<Coin />} />
            <Route path="/heatmap" element={<Heatmap />} />
            <Route path="/watchlist" element={<Watchlist />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
