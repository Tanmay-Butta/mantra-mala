import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ═══════════════════════════════════════════
// AnimatedCounter — Sliding digit counter
// ═══════════════════════════════════════════

interface AnimatedCounterProps {
  value: number;
  onTap?: () => void;
  themeColor?: string;
}

const Digit: React.FC<{ digit: string }> = ({ digit }) => {
  return (
    <div className="relative overflow-hidden" style={{ width: digit === ',' ? '0.35em' : '0.65em', height: '1.15em' }}>
      <AnimatePresence mode="popLayout">
        <motion.span
          key={digit}
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: '0%', opacity: 1 }}
          exit={{ y: '-100%', opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="absolute inset-0 flex items-center justify-center"
        >
          {digit}
        </motion.span>
      </AnimatePresence>
    </div>
  );
};

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ value, onTap, themeColor }) => {
  const formatted = value.toLocaleString();
  const [showGlow, setShowGlow] = useState(false);
  const prevValue = useRef(value);

  useEffect(() => {
    if (value !== prevValue.current && value > 0) {
      setShowGlow(true);
      const t = setTimeout(() => setShowGlow(false), 800);
      prevValue.current = value;
      return () => clearTimeout(t);
    }
  }, [value]);

  return (
    <button
      onClick={onTap}
      className="flex flex-col items-center gap-2 focus:outline-none group cursor-pointer"
      aria-label={`${value} recitations. Tap for details.`}
    >
      <div
        className="flex items-center justify-center font-philosopher transition-all duration-500"
        style={{
          fontSize: 'clamp(2.5rem, 8vw, 4.5rem)',
          color: 'white',
          textShadow: showGlow && themeColor
            ? `0 0 30px ${themeColor}60, 0 0 60px ${themeColor}30`
            : 'none',
        }}
      >
        {formatted.split('').map((char, i) => (
          <Digit key={`${i}-${char}`} digit={char} />
        ))}
      </div>
      <span className="text-[10px] md:text-xs tracking-[0.3em] uppercase text-white/30 font-cinzel group-hover:text-white/50 transition-colors">
        Recitations
      </span>
    </button>
  );
};
