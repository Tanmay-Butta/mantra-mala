import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ═══════════════════════════════════════════
// StatsPanel — Expandable stats overlay
// ═══════════════════════════════════════════

interface StatsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  mantraName: string;
  count: number;
  target: number;
  themeColor: string;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({
  isOpen,
  onClose,
  mantraName,
  count,
  target,
  themeColor,
}) => {
  const completedMalas = Math.floor(count / 108);
  const currentMalaBeads = count % 108;
  const percentage = target > 0 ? ((count / target) * 100).toFixed(1) : '0';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[85vw] max-w-sm"
          >
            <div
              className="rounded-3xl border border-white/10 backdrop-blur-xl p-8 text-center"
              style={{ background: 'rgba(0,0,0,0.85)' }}
            >
              {/* Mantra name */}
              <h3 className="font-cinzel text-xs tracking-[0.25em] uppercase text-white/50 mb-6">
                {mantraName}
              </h3>

              {/* Large count */}
              <div
                className="font-philosopher text-4xl md:text-5xl mb-1"
                style={{ color: themeColor }}
              >
                {count.toLocaleString()}
              </div>
              <div className="text-[10px] tracking-[0.3em] uppercase text-white/30 mb-8 font-cinzel">
                Recitations
              </div>

              {/* Stats grid */}
              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center border-t border-white/5 pt-4">
                  <span className="text-white/40 tracking-wider">Complete Malas</span>
                  <span className="text-white/70 font-philosopher">{completedMalas}</span>
                </div>
                <div className="flex justify-between items-center border-t border-white/5 pt-4">
                  <span className="text-white/40 tracking-wider">Current Mala</span>
                  <span className="text-white/70 font-philosopher">{currentMalaBeads} / 108</span>
                </div>
                <div className="flex justify-between items-center border-t border-white/5 pt-4">
                  <span className="text-white/40 tracking-wider">Goal Progress</span>
                  <span className="text-white/70 font-philosopher">{percentage}% of {target.toLocaleString()}</span>
                </div>
              </div>

              {/* Close */}
              <button
                onClick={onClose}
                className="mt-8 text-xs tracking-wider uppercase text-white/30 hover:text-white/60 transition-colors focus:outline-none"
              >
                Close
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
