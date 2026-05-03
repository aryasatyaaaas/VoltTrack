'use client'
import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}
interface State { hasError: boolean; message: string }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message }
  }

  componentDidCatch(error: Error) {
    console.error('[ErrorBoundary]', error)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div
          className="rounded-2xl p-6 text-center"
          style={{ background: 'var(--surface)', color: 'var(--ink-muted)' }}
        >
          <p style={{ fontSize: 14 }}>
            Gagal memuat konten. Coba refresh halaman.
          </p>
        </div>
      )
    }
    return this.props.children
  }
}
