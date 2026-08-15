import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

// ═══════════════════════════════════════════
// SyncModal — Cloud sync bottom sheet
// ═══════════════════════════════════════════

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SyncModal: React.FC<SyncModalProps> = ({ isOpen, onClose }) => {
  const { login } = useAuth();

  const handleSync = async () => {
    await login();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed bottom-0 left-0 right-0 z-50 flex justify-center"
            style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 1.5rem)' }}
          >
            <div
              className="w-[90vw] max-w-md rounded-3xl border border-white/10 backdrop-blur-xl p-8 text-center"
              style={{ background: 'rgba(0,0,0,0.9)' }}
            >
              <h3 className="font-cinzel text-base tracking-[0.2em] uppercase text-white/80 mb-4">
                Sync your progress
              </h3>
              <p className="font-philosopher text-sm text-white/40 leading-relaxed mb-8">
                Your recitations are currently saved on this device.
                <br />
                Sync them across all your devices.
              </p>

              <button
                onClick={handleSync}
                className="w-full py-3.5 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 transition-all duration-500 font-cinzel text-sm tracking-[0.15em] uppercase text-white/80 hover:text-white mb-4 focus:outline-none"
              >
                Continue with Google
              </button>

              <button
                onClick={onClose}
                className="text-xs tracking-wider uppercase text-white/25 hover:text-white/50 transition-colors focus:outline-none"
              >
                Not now
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
