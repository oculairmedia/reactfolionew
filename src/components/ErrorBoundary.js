import React, { Component } from 'react';
import './ErrorBoundary.css';

/**
 * Error Boundary Component
 *
 * Catches errors in child components and displays a fallback UI
 * instead of crashing the entire app.
 *
 * Usage:
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    const timestamp = new Date().toISOString();

    console.error('🔴 Error Boundary caught an error:', {
      timestamp,
      error: error.toString(),
      componentStack: errorInfo.componentStack,
      errorCount: this.state.errorCount + 1,
    });

    // Update state with error details
    this.setState(prevState => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));

    // Optional: Send to error tracking service (e.g., Sentry)
    if (window.Sentry) {
      window.Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
          },
        },
      });
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    // Optional: Reload the page if errors persist
    if (this.state.errorCount > 3) {
      window.location.reload();
    }
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom error UI
      const { FallbackComponent, fallback } = this.props;

      // Use custom fallback component if provided
      if (FallbackComponent) {
        return (
          <FallbackComponent
            error={this.state.error}
            errorInfo={this.state.errorInfo}
            resetError={this.handleReset}
          />
        );
      }

      // Use custom fallback element if provided
      if (fallback) {
        return fallback;
      }

      // Default error UI
      return (
        <div className="error-boundary-container">
          <div className="error-boundary-content">
            <div className="error-icon">⚠️</div>
            <h1 className="error-title">Oops! Something went wrong</h1>
            <p className="error-message">
              We're sorry for the inconvenience. The application encountered an unexpected error.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="error-details">
                <summary className="error-summary">Error Details (Development Only)</summary>
                <div className="error-stack">
                  <p className="error-name">
                    <strong>Error:</strong> {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <pre className="error-component-stack">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              </details>
            )}

            <div className="error-actions">
              <button
                className="error-button error-button-primary"
                onClick={this.handleReset}
              >
                Try Again
              </button>
              <button
                className="error-button error-button-secondary"
                onClick={this.handleReload}
              >
                Reload Page
              </button>
              <a
                href="/"
                className="error-button error-button-secondary"
              >
                Go Home
              </a>
            </div>

            {this.state.errorCount > 1 && (
              <p className="error-persistent">
                This error has occurred {this.state.errorCount} times.
                {this.state.errorCount > 3 && ' Consider reloading the page.'}
              </p>
            )}
          </div>
        </div>
      );
    }

    // No error, render children normally
    return this.props.children;
  }
}

/**
 * Specialized Error Boundary for CMS data fetching
 */
export class CMSErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      isOnline: navigator.onLine,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('🔴 CMS Error Boundary caught an error:', {
      error: error.toString(),
      isOnline: navigator.onLine,
      timestamp: new Date().toISOString(),
    });

    this.setState({ isOnline: navigator.onLine });
  }

  componentDidMount() {
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
  }

  componentWillUnmount() {
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
  }

  handleOnline = () => {
    this.setState({ isOnline: true });
  };

  handleOffline = () => {
    this.setState({ isOnline: false });
  };

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="cms-error-container">
          <div className="cms-error-content">
            <div className="error-icon">📡</div>
            <h2 className="error-title">
              {this.state.isOnline
                ? 'Unable to Load Content'
                : 'You are currently offline'}
            </h2>
            <p className="error-message">
              {this.state.isOnline
                ? 'We're having trouble connecting to the content server. Please try again in a moment.'
                : 'Please check your internet connection and try again.'}
            </p>
            <button
              className="error-button error-button-primary"
              onClick={this.handleRetry}
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
