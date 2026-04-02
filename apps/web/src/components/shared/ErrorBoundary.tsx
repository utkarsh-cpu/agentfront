import * as React from "react"
import { Button } from "@workspace/ui/components/button"

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack)
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex items-center justify-center p-8">
          <div className="w-full max-w-lg border border-destructive/40 bg-destructive/5 font-mono">
            <div className="flex items-center gap-2 border-b border-destructive/30 bg-destructive/10 px-4 py-2">
              <span className="inline-block size-2 rounded-full bg-destructive" />
              <span className="text-xs font-medium tracking-wider text-destructive uppercase">
                Runtime Error
              </span>
            </div>

            <div className="space-y-3 p-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  <span className="text-destructive">err:</span>{" "}
                  {this.state.error?.message ?? "Unknown error"}
                </p>
                {this.state.error?.stack && (
                  <pre className="mt-2 max-h-40 overflow-auto bg-background/60 p-2 text-[10px] leading-relaxed text-muted-foreground">
                    {this.state.error.stack}
                  </pre>
                )}
              </div>

              <div className="flex items-center gap-2 border-t border-destructive/20 pt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={this.handleRetry}
                >
                  Retry
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.location.reload()}
                >
                  Reload Page
                </Button>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
