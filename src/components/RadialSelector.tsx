import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Mantra } from '../types';

// ═══════════════════════════════════════════
// RadialSelector — Orbital Mantra Mala
// ═══════════════════════════════════════════

interface RadialSelectorProps {
  mantras: Mantra[];
  activeMantraId: string;
  onSelect: (id: string) => void;
  onClose: () => void;
  isOpen: boolean;
  getCount: (id: string) => number;
}

// Small decorative bead between mantra nodes
const DecorationBead: React.FC<{ cx: number; cy: number; themeColor: string; delay: number }> = ({
  cx, cy, themeColor, delay,
}) => (
  <motion.circle
    cx={cx}
    cy={cy}
    r={3.5}
    initial={{ opacity: 0, r: 0 }}
    animate={{ opacity: 0.5, r: 3.5 }}
    exit={{ opacity: 0, r: 0 }}
    transition={{ duration: 0.5, delay }}
    fill={`url(#beadGrad)`}
    stroke={themeColor}
    strokeWidth={0.3}
    strokeOpacity={0.3}
  />
);

export const RadialSelector: React.FC<RadialSelectorProps> = ({
  mantras,
  activeMantraId,
  onSelect,
  onClose,
  isOpen,
  getCount,
}) => {
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [velocity, setVelocity] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastAngleRef = useRef(0);
  const lastTimeRef = useRef(0);
  const animFrameRef = useRef<number>(0);

  const radius = typeof window !== 'undefined' && window.innerWidth < 768 ? 120 : 170;
  const centerX = 200;
  const centerY = 200;
  const angleStep = (Math.PI * 2) / mantras.length;

  // Calculate angle from center to point
  const getAngle = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current) return 0;
    const rect = containerRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    return Math.atan2(clientY - cy, clientX - cx);
  }, []);

  // Handle drag start
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    setIsDragging(true);
    setVelocity(0);
    lastAngleRef.current = getAngle(e.clientX, e.clientY);
    lastTimeRef.current = Date.now();
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }, [getAngle]);

  // Handle drag move
  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    const currentAngle = getAngle(e.clientX, e.clientY);
    let delta = currentAngle - lastAngleRef.current;

    // Handle wrap-around
    if (delta > Math.PI) delta -= Math.PI * 2;
    if (delta < -Math.PI) delta += Math.PI * 2;

    const now = Date.now();
    const dt = Math.max(1, now - lastTimeRef.current);
    setVelocity(delta / dt * 1000); // radians per second

    setRotation(prev => prev + delta);
    lastAngleRef.current = currentAngle;
    lastTimeRef.current = now;
  }, [isDragging, getAngle]);

  // Handle drag end — apply inertia and snap
  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Inertia + snap animation
  useEffect(() => {
    if (isDragging) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    let currentVel = velocity;
    
    // We only want to capture the initial rotation when drag ends for snapping
    let currentRot = rotation;
    let isSnapping = false;
    let targetSnap = 0;

    const loop = () => {
      if (!isSnapping) {
        currentVel *= 0.92; // Friction
        if (Math.abs(currentVel) < 0.2) {
          isSnapping = true;
          // Calculate closest snap point
          targetSnap = Math.round(currentRot / angleStep) * angleStep;
        } else {
          currentRot += currentVel * 0.016;
          setRotation(currentRot);
        }
      }

      if (isSnapping) {
        const diff = targetSnap - currentRot;
        if (Math.abs(diff) < 0.005) {
          setRotation(targetSnap);
          return; // Stop animation
        }
        currentRot += diff * 0.15;
        setRotation(currentRot);
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    if (Math.abs(currentVel) > 0 || Math.abs(currentRot - Math.round(currentRot / angleStep) * angleStep) > 0.005) {
       animFrameRef.current = requestAnimationFrame(loop);
    }

    return () => cancelAnimationFrame(animFrameRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging]); // ONLY run when isDragging changes!

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKey);
      return () => window.removeEventListener('keydown', handleKey);
    }
  }, [isOpen, onClose]);

  // Find which mantra is focused (nearest to top position)
  const focusedIndex = (() => {
    const normalizedRot = ((rotation % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    const idx = Math.round(normalizedRot / angleStep) % mantras.length;
    return (mantras.length - idx) % mantras.length;
  })();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Selector */}
          <motion.div
            ref={containerRef}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          >
            <div
              className="relative pointer-events-auto touch-none"
              style={{ width: '400px', height: '400px' }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            >
              <svg
                viewBox="0 0 400 400"
                className="w-full h-full"
                style={{ overflow: 'visible' }}
              >
                <defs>
                  {/* Bead gradient */}
                  <radialGradient id="beadGrad" cx="35%" cy="35%">
                    <stop offset="0%" stopColor="#c9a45c" />
                    <stop offset="60%" stopColor="#8b6914" />
                    <stop offset="100%" stopColor="#4a3810" />
                  </radialGradient>
                </defs>

                {/* Orbit circle (thread) */}
                <motion.circle
                  cx={centerX}
                  cy={centerY}
                  r={radius}
                  fill="none"
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth={1}
                  initial={{ r: 0, opacity: 0 }}
                  animate={{ r: radius, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                />

                {/* Mantra nodes + connecting beads */}
                {mantras.map((mantra, i) => {
                  const angle = -Math.PI / 2 + i * angleStep + rotation;
                  const x = centerX + radius * Math.cos(angle);
                  const y = centerY + radius * Math.sin(angle);
                  const isFocused = i === focusedIndex;
                  const isActive = mantra.id === activeMantraId;

                  // Decorative beads between this node and next
                  const beadPositions = [0.25, 0.5, 0.75].map(t => {
                    const adjustedA = angle + t * angleStep;
                    return {
                      cx: centerX + radius * Math.cos(adjustedA),
                      cy: centerY + radius * Math.sin(adjustedA),
                    };
                  });

                  return (
                    <g key={mantra.id}>
                      {/* Connecting beads */}
                      {beadPositions.map((bp, bi) => (
                        <DecorationBead
                          key={bi}
                          cx={bp.cx}
                          cy={bp.cy}
                          themeColor={mantra.theme.primaryColor}
                          delay={0.2 + i * 0.1 + bi * 0.05}
                        />
                      ))}

                      {/* Mantra node */}
                      <motion.g
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        transition={{ duration: 0.4, delay: 0.15 + i * 0.08 }}
                        style={{ 
                          cursor: 'pointer',
                          transformOrigin: `${x}px ${y}px`
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelect(mantra.id);
                        }}
                      >
                        {/* Glow behind focused node */}
                        {isFocused && (
                          <circle
                            cx={x}
                            cy={y}
                            r={28}
                            fill={mantra.theme.glowColor}
                            opacity={0.4}
                          />
                        )}

                        {/* Node bead (larger) */}
                        <circle
                          cx={x}
                          cy={y}
                          r={isFocused ? 12 : 8}
                          fill={`url(#beadGrad)`}
                          stroke={isActive ? mantra.theme.primaryColor : 'rgba(255,255,255,0.15)'}
                          strokeWidth={isActive ? 2 : 1}
                          style={{ transition: 'all 0.3s ease' }}
                        />

                        {/* Mantra label */}
                        <text
                          x={x}
                          y={y + (y < centerY ? -22 : 28)}
                          textAnchor="middle"
                          fill={isFocused ? '#ffffff' : 'rgba(255,255,255,0.4)'}
                          fontSize={isFocused ? 11 : 9}
                          fontFamily="'Cinzel', serif"
                          letterSpacing="0.15em"
                          style={{ transition: 'all 0.3s ease', textTransform: 'uppercase' } as React.CSSProperties}
                        >
                          {mantra.displayName}
                        </text>

                        {/* Count below label */}
                        <text
                          x={x}
                          y={y + (y < centerY ? -10 : 42)}
                          textAnchor="middle"
                          fill="rgba(255,255,255,0.2)"
                          fontSize={8}
                          fontFamily="'Philosopher', sans-serif"
                        >
                          {getCount(mantra.id).toLocaleString()}
                        </text>
                      </motion.g>
                    </g>
                  );
                })}

                {/* Central ॐ */}
                <motion.text
                  x={centerX}
                  y={centerY + 8}
                  textAnchor="middle"
                  fill="rgba(212, 175, 55, 0.8)"
                  fontSize={36}
                  fontFamily="'Noto Sans Devanagari', sans-serif"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  ॐ
                </motion.text>
              </svg>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
