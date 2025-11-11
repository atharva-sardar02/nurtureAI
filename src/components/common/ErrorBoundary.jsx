/**
 * Error Boundary Component
 * Catches React errors and displays a fallback UI
 */

import { Component } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw, Home } from "lucide-react"

class ErrorBoundaryClass extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo)
    this.setState({
      error,
      errorInfo,
    })
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onReset={this.handleReset}
        />
      )
    }

    return this.props.children
  }
}

/**
 * Error Fallback UI Component
 */
function ErrorFallback({ error, errorInfo, onReset }) {
  const handleGoHome = () => {
    // Use window.location instead of navigate to avoid Router context issues
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-card border border-destructive/50 rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-destructive" />
            <h1 className="text-xl font-semibold">Something went wrong</h1>
          </div>
          
          <p className="text-sm text-muted-foreground">
            We're sorry, but something unexpected happened. Please try refreshing the page or returning home.
          </p>

          {process.env.NODE_ENV === "development" && error && (
            <details className="mt-4">
              <summary className="text-sm font-medium cursor-pointer text-muted-foreground hover:text-foreground">
                Error Details (Development Only)
              </summary>
              <pre className="mt-2 text-xs bg-muted p-3 rounded overflow-auto max-h-48">
                {error.toString()}
                {errorInfo && errorInfo.componentStack}
              </pre>
            </details>
          )}

          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button
              onClick={onReset}
              variant="default"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
            <Button
              onClick={handleGoHome}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Go Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Error Boundary Wrapper
 * Use this to wrap components that might throw errors
 */
export function ErrorBoundary({ children, fallback }) {
  return <ErrorBoundaryClass fallback={fallback}>{children}</ErrorBoundaryClass>
}

export default ErrorBoundary

