import React, { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParallax } from '../hooks/useParallax';

// ═══════════════════════════════════════════
// Cosmic Background — 2D Canvas + Floating ॐ
// ═══════════════════════════════════════════

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  baseOpacity: number;
}

// --- 2D Particle Canvas ---
const ParticleCanvas: React.FC<{ themeColor: string }> = ({ themeColor }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number>(0);
  const prevColorRef = useRef(themeColor);
  const currentColorRef = useRef(themeColor);
  const colorTransitionRef = useRef(1);

  // Initialize particles
  useEffect(() => {
    const count = window.innerWidth < 768 ? 80 : 150;
    const particles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const baseOpacity = Math.random() * 0.4 + 0.1;
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.1,
        size: Math.random() * 2 + 0.5,
        opacity: baseOpacity,
        baseOpacity,
      });
    }
    particlesRef.current = particles;
  }, []);

  // Handle theme color transitions
  useEffect(() => {
    if (themeColor !== currentColorRef.current) {
      prevColorRef.current = currentColorRef.current;
      currentColorRef.current = themeColor;
      colorTransitionRef.current = 0;
    }
  }, [themeColor]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    const hexToRgb = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16) || 0;
      const g = parseInt(hex.slice(3, 5), 16) || 0;
      const b = parseInt(hex.slice(5, 7), 16) || 0;
      return { r, g, b };
    };

    const draw = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      // Smoothly transition color
      if (colorTransitionRef.current < 1) {
        colorTransitionRef.current = Math.min(1, colorTransitionRef.current + 0.005);
      }

      const t = colorTransitionRef.current;
      const from = hexToRgb(prevColorRef.current);
      const to = hexToRgb(currentColorRef.current);
      const cr = Math.round(from.r + (to.r - from.r) * t);
      const cg = Math.round(from.g + (to.g - from.g) * t);
      const cb = Math.round(from.b + (to.b - from.b) * t);

      for (const p of particlesRef.current) {
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;

        // Subtle breathing opacity
        p.opacity = p.baseOpacity + Math.sin(Date.now() * 0.0005 + p.x * 0.01) * 0.1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${Math.max(0, p.opacity)})`;
        ctx.fill();
      }

      // Draw a few white accent particles
      for (let i = 0; i < 20; i++) {
        const p = particlesRef.current[i];
        if (!p) break;
        ctx.beginPath();
        ctx.arc(p.x + 5, p.y + 5, p.size * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity * 0.3})`;
        ctx.fill();
      }

      animFrameRef.current = requestAnimationFrame(draw);
    };

    // Pause when tab hidden
    const handleVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(animFrameRef.current);
      } else {
        draw();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    draw();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ width: '100%', height: '100%' }}
    />
  );
};

// --- Floating ॐ Symbol ---
interface FloatingOmProps {
  id: number;
  color: string;
  onComplete: (id: number) => void;
  offsetX: number;
  offsetY: number;
}

const FloatingOm: React.FC<FloatingOmProps> = ({ id, color, onComplete, offsetX, offsetY }) => {
  const startX = useMemo(() => Math.random() * 100, []);
  const startY = useMemo(() => Math.random() * 100, []);
  const endX = useMemo(() => startX + (Math.random() - 0.5) * 20, []);
  const endY = useMemo(() => startY + (Math.random() - 0.5) * 20, []);
  const duration = useMemo(() => Math.random() * 8 + 6, []);
  const scale = useMemo(() => Math.random() * 0.8 + 0.4, []);

  // Increase the parallax effect heavily for floating background elements
  const px = offsetX * 30 * scale; 
  const py = offsetY * 30 * scale;

  return (
    <motion.div
      initial={{ opacity: 0, left: `${startX}%`, top: `${startY}%`, scale: scale * 0.5 }}
      animate={{
        opacity: [0, 0.3, 0.6, 0.3, 0],
        scale: [scale * 0.5, scale, scale * 1.5],
        left: [`${startX}%`, `${endX}%`],
        top: [`${startY}%`, `${endY}%`],
      }}
      transition={{
        duration,
        ease: 'easeInOut',
      }}
      onAnimationComplete={() => onComplete(id)}
      className="absolute pointer-events-none select-none"
      style={{
        transform: `translate(calc(-50% + ${px}px), calc(-50% + ${py}px))`,
        fontSize: '25px',
        color,
        filter: 'blur(0.5px)',
        fontFamily: "'Noto Sans Devanagari', sans-serif",
      }}
    >
      ॐ
    </motion.div>
  );
};

// --- Floating ॐ Manager ---
const FloatingOmsLayer: React.FC<{ themeColor: string; parallax: { x: number; y: number } }> = ({ themeColor, parallax }) => {
  const [oms, setOms] = useState<{ id: number; color: string }[]>([]);
  const idCounter = useRef(0);

  useEffect(() => {
    // Spawn initial oms
    const initial = Array.from({ length: 15 }).map(() => {
      idCounter.current += 1;
      return { id: idCounter.current, color: themeColor };
    });
    setOms(initial);

    const interval = setInterval(() => {
      setOms(prev => {
        if (prev.length < 40) {
          idCounter.current += 1;
          return [...prev, { id: idCounter.current, color: themeColor }];
        }
        return prev;
      });
    }, 400);

    return () => clearInterval(interval);
  }, [themeColor]);

  const handleComplete = useCallback((id: number) => {
    setOms(prev => prev.filter(om => om.id !== id));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <AnimatePresence>
        {oms.map(om => (
          <FloatingOm key={om.id} id={om.id} color={om.color} onComplete={handleComplete} offsetX={parallax.x} offsetY={parallax.y} />
        ))}
      </AnimatePresence>
    </div>
  );
};

// ═══════════════════════════════════════════
// Main Export
// ═══════════════════════════════════════════

interface CosmicBackgroundProps {
  themeColor?: string;
}

export const CosmicBackground: React.FC<CosmicBackgroundProps> = ({
  themeColor = '#d4af37',
}) => {
  const parallax = useParallax(1); // Get normalized tilt/mouse (-1 to 1)

  return (
    <div className="fixed inset-0 z-0 pointer-events-none bg-black overflow-hidden">
      {/* 2D Particle canvas (Base layer, no parallax to create depth) */}
      <ParticleCanvas themeColor={themeColor} />

      {/* Floating ॐ symbols (Mid layer, medium parallax) */}
      <FloatingOmsLayer themeColor={themeColor} parallax={parallax} />

      {/* Central faint ॐ (Deep background layer, reverse parallax) */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none transition-transform duration-700 ease-out"
        style={{ 
          opacity: 0.03,
          transform: `translate(${parallax.x * -40}px, ${parallax.y * -40}px) scale(1.05)`
        }}
      >
        <span
          className="font-sanskrit"
          style={{ fontSize: 'clamp(20rem, 45vw, 50rem)', color: themeColor }}
        >
          ॐ
        </span>
      </div>

      {/* Atmospheric gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/50 opacity-80" />
      <div
        className="absolute inset-0 opacity-30 transition-colors duration-[1500ms]"
        style={{
          background: `radial-gradient(ellipse at 50% 80%, ${themeColor}08 0%, transparent 60%)`,
          transform: `translate(${parallax.x * 20}px, ${parallax.y * 20}px)`
        }}
      />
    </div>
  );
};
