import React from 'react';
import { Link } from 'react-router-dom';

// Catches an error thrown while rendering a page, so one bad payload shows a
// message instead of unmounting the whole app. The navigation bar, footer and
// player sit outside it and keep working. App passes the path as resetKey, so
// going to any other page clears the error.
class ErrorBoundary extends React.Component {
    state = { hasError: false };

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidUpdate(prevProps) {
        if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
            this.setState({ hasError: false });
        }
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="page-wrapper">
                    <h1>Something went wrong on this page.</h1>
                    <Link to="/">Back to home</Link>
                </div>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;
