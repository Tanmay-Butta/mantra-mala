import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

// ═══════════════════════════════════════════
// Landing — Cinematic Entry
// ═══════════════════════════════════════════

interface LandingProps {
  onBegin: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onBegin }) => {
  const { user, login } = useAuth();

  return (
    <motion.div
      className="absolute inset-0 z-20 flex flex-col items-center justify-between"
      style={{ paddingTop: 'max(env(safe-area-inset-top), 2rem)', paddingBottom: 'max(env(safe-area-inset-bottom), 2rem)' }}
    >
      {/* Center content */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-lg mx-auto text-center px-6">
        {/* Small decorative star */}
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 0.6 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="text-cosmic-gold text-sm mb-6"
        >
          ✦
        </motion.div>

        {/* Large ॐ */}
        <motion.div
          initial={{ opacity: 1, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="font-sanskrit text-cosmic-gold mb-8"
          style={{ fontSize: 'clamp(5rem, 12vw, 8rem)' }}
        >
          ॐ
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 1, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="font-cinzel text-white tracking-[0.25em] uppercase mb-5"
          style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)' }}
        >
          MantraMala
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 1, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="font-philosopher italic text-white/60 tracking-wide mb-16"
          style={{ fontSize: 'clamp(0.9rem, 2vw, 1.15rem)' }}
        >
          Your digital mala.
        </motion.p>

        {/* Begin button */}
        <motion.div
          initial={{ opacity: 1, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <button
            onClick={onBegin}
            className="group relative px-10 py-3.5 rounded-full border border-white/15 hover:border-white/40 bg-transparent transition-all duration-700 focus:outline-none focus:ring-1 focus:ring-cosmic-gold/30"
            aria-label="Begin reciting"
          >
            <div className="absolute inset-0 rounded-full bg-cosmic-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <span className="relative font-cinzel text-sm tracking-[0.25em] uppercase text-white/80 group-hover:text-white transition-colors duration-500">
              Begin
            </span>
          </button>
        </motion.div>
      </div>

      {/* Bottom: Sync */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, delay: 2 }}
        className="pb-4"
      >
        {!user ? (
          <button
            onClick={() => login()}
            className="text-xs tracking-[0.15em] uppercase text-white/30 hover:text-white/60 transition-colors duration-500 focus:outline-none"
            aria-label="Sync progress to cloud"
          >
            ☁ Sync to Cloud
          </button>
        ) : (
          <span className="text-xs tracking-[0.15em] uppercase text-white/30">
            ☁ Synced
          </span>
        )}
      </motion.div>
    </motion.div>
  );
};
