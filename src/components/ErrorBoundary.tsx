import { Component, type ErrorInfo, type ReactNode } from 'react'
import { RefreshCw } from 'lucide-react'

type Props = { children: ReactNode }
type State = { error: Error | null }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('render fault', error, info.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <div className="wrap flex flex-col items-center py-24 text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-rose">render fault</p>
        <h1 className="mt-3 font-display text-2xl font-bold tracking-tight">This view stopped painting</h1>
        <p className="mt-2 max-w-sm text-[13px] leading-relaxed text-muted">
          The feed is still live. Reload the page, or jump back to the market table and pick a pair.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-2">
          <button type="button" onClick={() => window.location.reload()} className="btn btn-mint">
            <RefreshCw className="h-3.5 w-3.5" /> Reload
          </button>
          <a href="/" className="btn btn-ghost">
            Markets
          </a>
        </div>
      </div>
    )
  }
}
