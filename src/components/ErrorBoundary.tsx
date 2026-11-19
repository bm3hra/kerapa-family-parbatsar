import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error?.message || 'An unexpected archival error occurred.',
    };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FBF8F3] text-[#1C1917] flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-white border border-[#E5DEC9] rounded-xl p-8 text-center shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-[#6B1D2F] font-semibold mb-3">
              Kerapa Family Archive · Notice
            </p>
            <h1 className="font-serif text-3xl text-[#1C1917] mb-3">
              Unable to complete this archival request
            </h1>
            <p className="text-sm text-[#57534E] leading-relaxed mb-6 break-words">
              {this.state.message}
            </p>
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false, message: '' });
                window.location.assign('/');
              }}
              className="px-5 py-2.5 bg-[#6B1D2F] text-white text-sm font-medium rounded-lg hover:bg-[#4E1220] transition-colors"
            >
              Return to Home Archive
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
