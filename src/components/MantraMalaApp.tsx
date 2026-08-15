import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMantra } from '../contexts/MantraContext';
import { CosmicBackground } from './CosmicBackground';
import { Landing } from './Landing';
import { MainExperience } from './MainExperience';
import type { AppState } from '../types';

// ═══════════════════════════════════════════
// MantraMalaApp — Single-page state machine
// ═══════════════════════════════════════════

export const MantraMalaApp: React.FC = () => {
  const { activeMantra } = useMantra();
  const [appState, setAppState] = useState<AppState>('landing');

  const themeColor = activeMantra?.theme?.primaryColor || '#d4af37';

  const handleBegin = useCallback(() => {
    setAppState('main');
  }, []);

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {/* Background — always present, continuous */}
      <CosmicBackground themeColor={themeColor} />

      {/* App states */}
      <AnimatePresence mode="wait">
        {appState === 'landing' ? (
          <motion.div
            key="landing"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="absolute inset-0 z-10"
          >
            <Landing onBegin={handleBegin} />
          </motion.div>
        ) : (
          <motion.div
            key="main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="absolute inset-0 z-10"
          >
            <MainExperience />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
