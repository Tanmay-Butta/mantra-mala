import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { MantraProvider } from './contexts/MantraContext';
import { MantraMalaApp } from './components/MantraMalaApp';
import { isFirebaseConfigured } from './services/firebase';

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: any}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ color: 'red', padding: '20px', background: 'black', height: '100vh', zIndex: 9999, position: 'relative' }}>
          <h2>React Error:</h2>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {this.state.error?.toString()}
          </pre>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', marginTop: '20px', fontSize: '12px' }}>
            {this.state.error?.stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export const App = () => {
  if (!isFirebaseConfigured) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center p-6 text-white text-center">
        <div className="max-w-md w-full border border-white/10 rounded-3xl p-8 backdrop-blur-md" style={{ background: 'rgba(0,0,0,0.8)' }}>
          <div className="text-4xl text-cosmic-gold mb-6 font-sanskrit">ॐ</div>
          <h1 className="text-xl font-cinzel tracking-[0.15em] mb-4">Configuration Required</h1>
          <div className="text-white/50 text-sm leading-relaxed mb-6 font-philosopher">
            <p className="mb-3">Firebase has not been configured yet.</p>
            <p>Copy <code className="bg-white/5 px-2 py-0.5 rounded text-xs">.env.example</code> to <code className="bg-white/5 px-2 py-0.5 rounded text-xs">.env</code> and add your Firebase configuration.</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 rounded-full border border-white/15 hover:border-white/30 text-sm font-cinzel tracking-wider transition-colors"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <AuthProvider>
        <MantraProvider>
          <MantraMalaApp />
        </MantraProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
