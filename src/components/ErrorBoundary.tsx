import React from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error, errorInfo: null };
  }

  public override componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error("Uncaught runtime error caught by ErrorBoundary:", error, errorInfo);
    this.setState({ errorInfo });
  }

  public handleReset = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = window.location.pathname;
  };

  public override render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#E6EAF0] flex items-center justify-center p-6 font-jakarta">
          <div className="max-w-xl w-full bg-white rounded-2xl border border-[#DCE5EF] shadow-xl p-8 space-y-6">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center shrink-0 border border-rose-100">
                <AlertTriangle className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h1 className="text-lg font-black text-[#042C51]">Application Render Error</h1>
                <p className="text-xs text-[#667085]">An unexpected issue occurred while rendering this view.</p>
              </div>
            </div>

            <div className="bg-[#F8FAFC] border border-[#E6ECF2] rounded-xl p-4 text-xs font-mono text-slate-800 overflow-x-auto max-h-48">
              <p className="font-bold text-rose-700">{this.state.error?.toString() || "Unknown Error"}</p>
              {this.state.errorInfo?.componentStack && (
                <pre className="mt-2 text-[10px] text-[#667085] whitespace-pre-wrap">
                  {this.state.errorInfo.componentStack}
                </pre>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  try {
                    localStorage.clear();
                  } catch (e) {
                    // ignore
                  }
                  window.location.reload();
                }}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-[#042C51] text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4 text-slate-600" />
                Clear Cache &amp; Reload
              </button>

              <button
                type="button"
                onClick={this.handleReset}
                className="px-5 py-2.5 bg-[#FF5C28] hover:bg-[#e04f20] text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
              >
                <Home className="w-4 h-4" />
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
