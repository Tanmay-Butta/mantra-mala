import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      const isFirebaseError = this.state.error?.message.includes('Firebase') || this.state.error?.message.includes('API key');
      
      return (
        <div className="min-h-screen bg-cosmic-dark flex items-center justify-center p-6 text-white font-sans text-center">
          <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md">
            <div className="text-4xl text-cosmic-gold mb-6">ॐ</div>
            <h1 className="text-2xl font-light mb-4">Application Error</h1>
            
            {isFirebaseError ? (
              <div className="text-white/70 text-sm leading-relaxed mb-6">
                <p className="mb-4">
                  It looks like Firebase has not been configured yet.
                </p>
                <p>
                  Please copy <code className="bg-black/30 px-2 py-1 rounded">.env.example</code> to <code className="bg-black/30 px-2 py-1 rounded">.env</code> and add your Firebase configuration details, then restart the development server.
                </p>
              </div>
            ) : (
              <div className="text-white/70 text-sm leading-relaxed mb-6">
                <p>{this.state.error?.message || "An unexpected error occurred."}</p>
              </div>
            )}
            
            <button 
              onClick={() => window.location.reload()}
              className="bg-white/10 hover:bg-white/20 transition-colors px-6 py-2 rounded-full text-sm font-medium tracking-wider"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
