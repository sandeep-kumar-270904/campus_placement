import React, { Component } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[PLACEearly ErrorBoundary caught error]:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch {}
    window.location.href = '/login';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          aria-live="assertive"
          className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 selection:bg-rose-500 selection:text-white"
        >
          <div className="max-w-md w-full bg-slate-900 border border-rose-500/30 rounded-2xl p-6 shadow-2xl shadow-rose-950/40 text-center flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mb-4">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <h1 className="text-lg font-bold text-white mb-2">Something went wrong</h1>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              An unexpected application error occurred. You can reload the page or return to sign-in.
            </p>

            {this.state.error && (
              <details className="w-full text-left bg-slate-950/80 rounded-lg p-3 border border-slate-800 text-[11px] font-mono text-rose-300 mb-5 overflow-x-auto">
                <summary className="cursor-pointer text-slate-400 font-sans text-xs hover:text-slate-200">
                  Technical Details
                </summary>
                <div className="mt-2 whitespace-pre-wrap">{this.state.error.toString()}</div>
              </details>
            )}

            <div className="flex items-center gap-3 w-full">
              <button
                onClick={this.handleReload}
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Page
              </button>
              <button
                onClick={this.handleReset}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Home className="w-4 h-4" />
                Sign In
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
