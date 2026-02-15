import React from 'react';
import { motion } from 'framer-motion';
import './ErrorBoundary.css';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    // You can also log the error to an error reporting service here
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <motion.div
            className="error-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2>Oops! Something went wrong</h2>
            <p>We're sorry, but something went wrong. Please try refreshing the page or contact support if the problem persists.</p>
            <button
              onClick={() => window.location.reload()}
              className="refresh-button"
            >
              Refresh Page
            </button>
            {import.meta.env.DEV && (
              <div className="error-details">
                <h3>Error Details:</h3>
                <pre>{this.state.error && this.state.error.toString()}</pre>
                <pre>{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
              </div>
            )}
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}