import React from 'react';
import { motion } from 'framer-motion';

// ═══════════════════════════════════════════
// RecitationOrb — The Central ॐ Interaction
// ═══════════════════════════════════════════

import type { RecitationState } from '../types';

interface RecitationOrbProps {
  state: RecitationState;
  themeColor: string;
  glowColor: string;
  progress: number; // 0-1, drives bead formation
  onTap: () => void;
  onMantraNameTap: () => void;
  mantraName: string;
}

export const RecitationOrb: React.FC<RecitationOrbProps> = ({
  state,
  themeColor,
  glowColor,
  progress: _progress,
  onTap,
  onMantraNameTap,
  mantraName,
}) => {
  const isIdle = state === 'idle';
  const isReciting = state === 'reciting';

  return (
    <div className="flex flex-col items-center justify-center relative">
      {/* Mantra name — tappable to open selector */}
      <button
        onClick={onMantraNameTap}
        className="mb-8 focus:outline-none group relative z-20 flex flex-col items-center gap-1.5"
        aria-label={`Current mantra: ${mantraName}. Tap to change.`}
      >
        <span className="text-[9px] font-bold tracking-widest text-white/30 uppercase group-hover:text-white/60 transition-colors bg-white/5 px-3 py-1 rounded-full border border-white/10">
          Change Mantra ▾
        </span>
        <div className="flex items-center">
          <span className="font-cinzel text-sm md:text-base font-bold tracking-[0.25em] uppercase text-white/90 group-hover:text-white transition-colors duration-500 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
            {mantraName}
          </span>
        </div>
      </button>

      {/* Breathing rings */}
      <div className="relative flex items-center justify-center">
        {/* Outer ring */}
        <motion.div
          animate={{
            scale: isReciting ? [1, 1.12, 1] : [1, 1.05, 1],
            opacity: isReciting ? [0.15, 0.3, 0.15] : [0.06, 0.12, 0.06],
          }}
          transition={{
            duration: isReciting ? 3 : 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute rounded-full border pointer-events-none"
          style={{
            width: 'clamp(14rem, 40vw, 22rem)',
            height: 'clamp(14rem, 40vw, 22rem)',
            borderColor: isReciting ? themeColor : 'rgba(255,255,255,0.1)',
          }}
        />

        {/* Inner ring */}
        <motion.div
          animate={{
            scale: isReciting ? [1, 1.08, 1] : [1, 1.03, 1],
            opacity: isReciting ? [0.2, 0.35, 0.2] : [0.08, 0.15, 0.08],
          }}
          transition={{
            duration: isReciting ? 2.5 : 5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.5,
          }}
          className="absolute rounded-full border pointer-events-none"
          style={{
            width: 'clamp(11rem, 32vw, 18rem)',
            height: 'clamp(11rem, 32vw, 18rem)',
            borderColor: isReciting ? themeColor : 'rgba(255,255,255,0.08)',
          }}
        />

        {/* The Orb itself */}
        <motion.button
          whileTap={(isIdle || isReciting) ? { scale: 0.92 } : {}}
          onClick={onTap}
          disabled={state === 'completing'}
          className="relative z-10 rounded-full flex flex-col items-center justify-center transition-all duration-700 focus:outline-none"
          style={{
            width: 'clamp(7rem, 22vw, 10rem)',
            height: 'clamp(7rem, 22vw, 10rem)',
            background: 'rgba(0,0,0,0.6)',
            border: `1px solid ${isReciting ? themeColor + '60' : 'rgba(255,255,255,0.1)'}`,
            boxShadow: isReciting
              ? `0 0 40px ${glowColor}, 0 0 80px ${glowColor}40`
              : `0 0 20px rgba(0,0,0,0.5)`,
            cursor: (isIdle || isReciting) ? 'pointer' : 'default',
          }}
          aria-label={isIdle ? 'Tap to recite' : 'Reciting... Tap to stop'}
        >
          {/* Ripple on tap */}
          {isReciting && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0.5 }}
              animate={{ scale: 2.5, opacity: 0 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{ background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)` }}
            />
          )}

          {/* ॐ symbol */}
          <span
            className="font-sanskrit transition-colors duration-700"
            style={{
              fontSize: 'clamp(2.5rem, 7vw, 4rem)',
              color: isReciting ? themeColor : 'rgba(255,255,255,0.75)',
            }}
          >
            ॐ
          </span>
        </motion.button>


      </div>

      {/* Status label */}
      <motion.div
        className="mt-6 text-[10px] md:text-xs tracking-[0.2em] uppercase transition-all duration-700"
        style={{
          color: isReciting ? themeColor : 'rgba(255,255,255,0.25)',
          opacity: isReciting ? 0.8 : 0.5,
        }}
      >
        {isReciting ? 'Reciting...' : 'Tap to Recite'}
      </motion.div>
    </div>
  );
};
