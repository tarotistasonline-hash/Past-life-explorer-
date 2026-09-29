import React, { ErrorInfo, ReactNode } from "react";
import { Sparkles, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  declare state: State;
  declare props: Props;
  declare setState: any;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an unhandled error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#080503] text-purple-100 flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md w-full p-8 rounded-3xl bg-[#0e0a18] border border-purple-500/40 shadow-[0_0_50px_rgba(168,85,247,0.3)] space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-purple-950 border border-purple-500/60 flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-amber-300" />
            </div>
            <h2 className="font-cinzel text-lg font-bold text-amber-200">
              El Portal Astral se está reconectando
            </h2>
            <p className="text-xs text-purple-300/80 font-gothic leading-relaxed">
              Las frecuencias del oráculo se están estabilizando. Haz clic a continuación para ingresar de inmediato.
            </p>
            <button
              onClick={this.handleReset}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-600 hover:to-indigo-500 text-white font-cinzel text-xs font-bold uppercase tracking-wider shadow-lg flex items-center justify-center space-x-2 transition cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Ingresar al Portal Akáshico</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
