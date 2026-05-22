import { Component } from "react";

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Application error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="surface-panel max-w-lg p-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-brand-300">
              Something went wrong
            </p>
            <h1 className="mt-3 text-3xl font-bold text-white">
              The app hit an unexpected error.
            </h1>
            <p className="mt-3 text-sm text-slate-300">
              Refresh the page to try again. If the issue continues, verify your
              Supabase configuration and network connection.
            </p>
            <button
              type="button"
              className="mt-6 rounded-2xl bg-brand-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-brand-400"
              onClick={() => window.location.reload()}
            >
              Reload app
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
