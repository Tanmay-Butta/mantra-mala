import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMantra } from '../contexts/MantraContext';
import { useAudio } from '../hooks/useAudio';
import { useParallax } from '../hooks/useParallax';
import { RecitationOrb } from './RecitationOrb';
import { AnimatedCounter } from './AnimatedCounter';
import { MalaVisualization } from './MalaVisualization';
import { RadialSelector } from './RadialSelector';
import { StatsPanel } from './StatsPanel';
import { SyncModal } from './SyncModal';
import type { RecitationState } from '../types';

// ═══════════════════════════════════════════
// MainExperience — The Primary Recitation UI
// ═══════════════════════════════════════════

export const MainExperience: React.FC = () => {
  const { 
    activeMantra, 
    activeProgress,
    getProgressForMantra, 
    incrementRecitation,
    setActiveMantraId,
    mantras
  } = useMantra();

  const [recitationState, setRecitationState] = useState<RecitationState>('idle');
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [syncOpen, setSyncOpen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1);

  const { play, stop, progress } = useAudio(activeMantra?.audioUrl, playbackRate);
  const parallax = useParallax(1);

  const count = activeProgress?.count || 0;
  const target = activeProgress?.target || activeMantra?.target || 100000;
  const themeColor = activeMantra?.theme?.primaryColor || '#d4af37';
  const glowColor = activeMantra?.theme?.glowColor || 'rgba(212,175,55,0.35)';

  // Handle recitation tap (start or cancel)
  const handleRecite = useCallback(() => {
    if (recitationState === 'completing') return;

    if (recitationState === 'reciting') {
      stop();
      setRecitationState('idle');
      return;
    }

    setRecitationState('reciting');

    play(async () => {
      setRecitationState('completing');
      await incrementRecitation();
      setTimeout(() => {
        setRecitationState('idle');
      }, 600 / playbackRate);
    });
  }, [recitationState, play, stop, incrementRecitation, playbackRate]);

  // Keyboard support
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        if ((recitationState === 'idle' || recitationState === 'reciting') && !selectorOpen && !statsOpen && !syncOpen) {
          e.preventDefault();
          handleRecite();
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [recitationState, handleRecite, selectorOpen, statsOpen, syncOpen]);

  // Get count for radial selector
  const getCountForMantra = useCallback((id: string): number => {
    if (id === activeMantra?.id) return count;
    return getProgressForMantra(id).count;
  }, [activeMantra, count, getProgressForMantra]);

  // Handle mantra selection
  const handleSelectMantra = useCallback((id: string) => {
    if (recitationState !== 'idle') {
      stop();
      setRecitationState('idle');
    }
    setActiveMantraId(id);
    setSelectorOpen(false);
  }, [setActiveMantraId, recitationState, stop]);

  if (!activeMantra) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="absolute inset-0 z-20 flex flex-col items-center justify-between overflow-hidden"
      style={{
        paddingTop: 'max(env(safe-area-inset-top), 1rem)',
        paddingBottom: 'max(env(safe-area-inset-bottom), 1.5rem)',
      }}
    >
      {/* Top bar */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="w-full px-5 py-3 flex items-center justify-between"
      >
        <div className="flex items-center gap-2 select-none">
          <span style={{ color: themeColor }} className="text-xl">ॐ</span>
          <span className="text-[10px] tracking-[0.2em] uppercase text-white/50 font-cinzel">
            MantraMala
          </span>
        </div>

        {/* Right: Speed Selector & Sync Status */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              const rates = [1, 1.25, 1.5, 1.75, 2];
              const nextIndex = (rates.indexOf(playbackRate) + 1) % rates.length;
              setPlaybackRate(rates[nextIndex]);
            }}
            className="text-xs font-bold tracking-wider text-white/80 hover:text-white transition-colors select-none px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 shadow-lg backdrop-blur-md"
            title="Playback Speed"
          >
            {playbackRate}x
          </button>
          <span className="text-[10px] tracking-[0.15em] uppercase text-white/25 select-none" title="Cloud Sync Active">
            ☁ ✓
          </span>
        </div>
      </motion.div>

      {/* Mantra Text Display (Fills the empty top space beautifully) */}
      <motion.div
        key={activeMantra.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="w-full max-w-md mx-auto px-8 mt-12 md:mt-16 text-center pointer-events-none z-10"
      >
        <div className="font-cinzel text-[11px] md:text-sm tracking-[0.2em] leading-[2.5]" style={{ color: themeColor, opacity: 0.45 }}>
          {activeMantra.text.split('\n').map((line, i) => (
            <span key={i} className="block drop-shadow-lg">{line}</span>
          ))}
        </div>
      </motion.div>

      {/* Center area — Orb + Counter (Foreground Parallax layer) */}
      <div 
        className="flex-1 flex flex-col items-center justify-center w-full max-w-lg mx-auto px-6 transition-transform duration-700 ease-out"
        style={{ transform: `translate(${parallax.x * 15}px, ${parallax.y * 15}px)` }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
        >
          <RecitationOrb
            state={recitationState}
            themeColor={themeColor}
            glowColor={glowColor}
            progress={progress}
            onTap={handleRecite}
            onMantraNameTap={() => setSelectorOpen(true)}
            mantraName={activeMantra.displayName}
          />
        </motion.div>

        {/* Counter */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="mt-8"
        >
          <AnimatedCounter
            value={count}
            onTap={() => setStatsOpen(true)}
            themeColor={themeColor}
          />
        </motion.div>

        {/* Mala Visualization */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="w-full max-w-4xl absolute bottom-8 md:bottom-12 pb-safe"
        >
          <MalaVisualization
            count={count}
            themeColor={themeColor}
            recitationState={recitationState}
            progress={progress}
          />
        </motion.div>

        {/* Empty state message */}
        {count === 0 && recitationState === 'idle' && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="mt-4 font-philosopher italic text-white/20 text-sm tracking-wide"
          >
            Your first bead awaits.
          </motion.p>
        )}
      </div>

      {/* Goal progress — very subtle at bottom */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3, duration: 0.8 }}
        className="pb-2 text-center"
      >
        <span className="text-[9px] tracking-[0.15em] uppercase text-white/15">
          {count.toLocaleString()} / {target.toLocaleString()}
        </span>
      </motion.div>

      {/* Radial Selector Overlay */}
      <RadialSelector
        mantras={mantras}
        activeMantraId={activeMantra.id}
        onSelect={handleSelectMantra}
        onClose={() => setSelectorOpen(false)}
        isOpen={selectorOpen}
        getCount={getCountForMantra}
      />

      {/* Stats Panel */}
      <StatsPanel
        isOpen={statsOpen}
        onClose={() => setStatsOpen(false)}
        mantraName={activeMantra.displayName}
        count={count}
        target={target}
        themeColor={themeColor}
      />

      {/* Sync Modal */}
      <SyncModal
        isOpen={syncOpen}
        onClose={() => setSyncOpen(false)}
      />
    </motion.div>
  );
};
