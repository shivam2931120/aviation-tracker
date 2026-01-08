import { Component, ReactNode } from 'react'
import { RefreshCw } from 'lucide-react'

interface Props {
    children: ReactNode
    fallback?: ReactNode
}

interface State {
    hasError: boolean
    error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: any) {
        console.error('ErrorBoundary caught an error:', error, errorInfo)
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div className="w-full h-full flex items-center justify-center bg-aviation-darker rounded-xl">
                    <div className="text-center p-4">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-aviation-red/20 flex items-center justify-center">
                            <svg className="w-6 h-6 text-aviation-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <p className="text-aviation-muted text-sm mb-2">Unable to load 3D visualization</p>
                        <p className="text-aviation-muted text-xs mb-3">WebGL may not be available</p>
                        <button
                            onClick={() => this.setState({ hasError: false })}
                            className="btn-primary text-xs py-1.5 px-3 inline-flex items-center gap-1.5"
                        >
                            <RefreshCw className="w-3 h-3" />
                            Try Again
                        </button>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}

export default ErrorBoundary
