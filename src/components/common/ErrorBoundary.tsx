import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('CareDose Uncaught Error:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.removeItem('caredose_v1');
    } catch {
      // ignore
    }
    window.location.hash = '#/signin';
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#F7F5EF] text-[#1F2B25]">
          <div className="max-w-md w-full bg-white p-8 rounded-lg border border-[#D5DCD5] shadow-sm text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#FBECEA] flex items-center justify-center text-[#A3342A]">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-serif font-semibold mb-2">Something went wrong</h1>
            <p className="text-sm text-[#53645A] mb-4">
              CareDose encountered an unexpected issue. You can safely restore the sample data to continue.
            </p>
            {this.state.error && (
              <div className="p-3 mb-6 bg-[#F0F3ED] text-xs font-mono text-left rounded border border-[#D5DCD5] overflow-x-auto max-h-32">
                {this.state.error.message}
              </div>
            )}
            <button
              onClick={this.handleReset}
              className="inline-flex items-center justify-center gap-2 w-full min-h-[44px] px-4 py-2.5 bg-[#214F3A] hover:bg-[#173E2D] text-white font-medium rounded transition-colors focus-visible:outline-2 focus-visible:outline-[#94631A]"
            >
              <RotateCcw className="w-4 h-4" />
              Reset demo data & reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
