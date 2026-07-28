import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Uncaught error in component tree:', error, info);
  }

  handleReload = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-page">
          <h1>Something went wrong</h1>
          <p>An unexpected error occurred. This has been logged — please try reloading the page.</p>
          <button className="btn" onClick={this.handleReload}>Go to Home</button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;