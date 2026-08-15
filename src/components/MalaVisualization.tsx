import React, { useEffect, useRef } from 'react';
import type { RecitationState } from '../types';

// ═══════════════════════════════════════════
// MalaVisualization — Canvas arc of beads
// ═══════════════════════════════════════════

interface MalaVisualizationProps {
  count: number;
  themeColor: string;
  recitationState: RecitationState;
  progress?: number;
}

export const MalaVisualization: React.FC<MalaVisualizationProps> = ({
  count,
  themeColor,
  recitationState,
  progress = 0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentBeads = count % 108;
  
  // Ref for smooth rotation interpolation
  const rotationRef = useRef(- (currentBeads / 108) * Math.PI * 2);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;

    // Geometry
    const centerX = w / 2;
    // Anchor it slightly higher relative to height so it has massive bottom padding
    const centerY = h * 0.35; 
    const radiusX = Math.min(w * 0.45, 340);
    const radiusY = Math.min(h * 0.25, 110); 
    
    // Base bead sizing (adjusted to completely eliminate overlap)
    // The exact apparent circumference is ~1550. 
    // 1550 / 108 = 14.35 space per bead on average.
    const baseBeadRadius = Math.max(4, Math.min(6, w / 140)); // Smaller radius to fit 108 perfectly

    // Rich golden amber color for the active bead
    const gold = { r: 255, g: 170, b: 20 };

    let raf: number;
    
    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      // Smoothly interpolate rotation to target (POSITIVE for clockwise)
      const targetRotation = (currentBeads / 108) * Math.PI * 2;
      let diff = targetRotation - rotationRef.current;
      // Handle wrap-around
      if (diff > Math.PI) diff -= Math.PI * 2;
      if (diff < -Math.PI) diff += Math.PI * 2;
      
      if (Math.abs(diff) > 0.001) {
        rotationRef.current += diff * 0.1; // lerp
      }
      
      const currentRot = rotationRef.current;

      // Draw thread
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI, false);
      ctx.strokeStyle = `rgba(255, 255, 255, 0.08)`;
      ctx.lineWidth = 2;
      ctx.stroke();

      const beadData = [];
      for (let i = 0; i < 108; i++) {
        // Clockwise arrangement: subtract angle instead of add
        let angle = (Math.PI / 2) - (i / 108) * Math.PI * 2 + currentRot;
        
        // Normalize angle for z-calculation
        let normAngle = angle % (Math.PI * 2);
        if (normAngle < 0) normAngle += Math.PI * 2;

        const x = centerX + radiusX * Math.cos(normAngle);
        const y = centerY + radiusY * Math.sin(normAngle);
        
        const dx = -radiusX * Math.sin(normAngle);
        const dy = radiusY * Math.cos(normAngle);
        // Correct tangent for oval rotation
        const tangent = Math.atan2(dy, dx);
        
        const z = Math.sin(normAngle); 
        // Exaggerated perspective: front is 1.6x, back is 0.4x
        const scale = 0.4 + ((z + 1) / 2) * 1.2; 

        beadData.push({ i, x, y, z, scale, tangent });
      }

      beadData.sort((a, b) => a.z - b.z);

      const isReciting = recitationState !== 'idle';
      const isCompleting = recitationState === 'completing';

      beadData.forEach(({ i, x, y, scale, tangent }) => {
        const isActive = i === currentBeads;
        const isCompleted = i < currentBeads;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(tangent);

        // Make them slightly oval (length along thread > width)
        const bLen = baseBeadRadius * scale * 1.1;
        const bWid = baseBeadRadius * scale * 0.9;

        // --- GLOBAL LIGHTING MATH ---
        // We want the light to always come from the top-left of the screen (-45 degrees or -PI/4).
        // Since the canvas is rotated by `tangent`, we must un-rotate the light vector
        // so the highlight stays on the global top-left of every bead.
        const globalLightAngle = -Math.PI / 4;
        const localLightAngle = globalLightAngle - tangent;
        
        // Offset for the core highlight (30% from center towards the light)
        const hx = Math.cos(localLightAngle) * bLen * 0.3;
        const hy = Math.sin(localLightAngle) * bWid * 0.3;

        // Base gradient for all beads, using global lighting
        const grad = ctx.createRadialGradient(
          hx, hy, 0,
          0, 0, Math.max(bLen, bWid)
        );

        if (isActive) {
          // Active Bead: Starts dark, glows as progress increases
          const fillProgress = isCompleting ? 1 : (isReciting ? progress : 0);
          
          if (fillProgress > 0) {
            // Glowing state - Rich Yellowish Gold!
            grad.addColorStop(0, `rgba(255, 255, 220, 1)`); // Bright yellow-white core
            grad.addColorStop(0.2, `rgba(${gold.r}, ${gold.g}, ${gold.b}, 1)`); // Pure gold
            grad.addColorStop(0.6, `rgba(180, 80, 0, 1)`); // Deep amber/orange
            grad.addColorStop(1, `rgba(50, 15, 0, 1)`); // Dark fiery edge

            ctx.shadowColor = `rgba(255, 170, 0, ${fillProgress})`;
            // Huge flash when completing
            ctx.shadowBlur = (15 + (isCompleting ? 40 : 15 * fillProgress)) * scale;
          } else {
            // Idle active bead (waiting to be recited) - dark earthy wait state
            grad.addColorStop(0, `rgba(120, 110, 100, 1)`); 
            grad.addColorStop(0.4, `rgba(40, 35, 30, 1)`);
            grad.addColorStop(0.8, `rgba(10, 8, 5, 1)`);
            grad.addColorStop(1, `rgba(30, 25, 20, 1)`); // Rim bounce light
            ctx.shadowColor = `rgba(255, 170, 0, 0.15)`;
            ctx.shadowBlur = 8 * scale;
          }
        } else if (isCompleted) {
          // Completed bead: Hyper-realistic solid polished Gold!
          grad.addColorStop(0, `rgba(255, 245, 190, 1)`); // intense highlight
          grad.addColorStop(0.3, `rgba(215, 165, 45, 1)`); // rich gold body
          grad.addColorStop(0.8, `rgba(100, 60, 10, 1)`); // core dark shadow
          grad.addColorStop(1, `rgba(160, 110, 30, 1)`); // rim bounce light
          ctx.shadowColor = 'rgba(215, 165, 45, 0.2)'; 
          ctx.shadowBlur = 6 * scale;
        } else {
          // Future bead: Hyper-realistic dark polished stone (like obsidian)
          grad.addColorStop(0, `rgba(120, 120, 130, 1)`); // soft top-left reflection
          grad.addColorStop(0.4, `rgba(35, 35, 40, 1)`); // dark body midtone
          grad.addColorStop(0.8, `rgba(10, 10, 12, 1)`); // deep core shadow
          grad.addColorStop(1, `rgba(40, 40, 45, 1)`); // rim bounce light
          ctx.shadowColor = 'rgba(0,0,0,0.8)';
          ctx.shadowBlur = 5 * scale;
        }

        ctx.beginPath();
        // Slightly larger when completing
        const popScale = (isActive && isCompleting) ? 1.2 : 1;
        ctx.ellipse(0, 0, bLen * popScale, bWid * popScale, 0, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // PHYSICAL DETAILS: Draw thread holes at the poles to make it look like a real bead
        // The thread passes through along the x-axis in local space (-bLen to +bLen)
        if (!isActive || (isActive && progress === 0)) {
          ctx.fillStyle = 'rgba(0,0,0,0.6)';
          
          // Left thread hole dimple
          ctx.beginPath();
          ctx.ellipse(-bLen * 0.9, 0, bLen * 0.15, bWid * 0.25, 0, 0, Math.PI * 2);
          ctx.fill();
          
          // Right thread hole dimple
          ctx.beginPath();
          ctx.ellipse(bLen * 0.9, 0, bLen * 0.15, bWid * 0.25, 0, 0, Math.PI * 2);
          ctx.fill();
        }

        // High gloss specular highlight using the same global lighting angle
        if (!isActive || (isActive && progress === 0)) {
          // Primary soft reflection (shifted towards light)
          const rx1 = Math.cos(localLightAngle) * bLen * 0.35;
          const ry1 = Math.sin(localLightAngle) * bWid * 0.35;
          ctx.beginPath();
          ctx.ellipse(rx1, ry1, bLen * 0.25, bWid * 0.15, localLightAngle, 0, Math.PI * 2);
          ctx.fillStyle = isCompleted ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.15)';
          ctx.fill();

          // Secondary sharp, intense specular dot (shifted closer to edge)
          const rx2 = Math.cos(localLightAngle) * bLen * 0.45;
          const ry2 = Math.sin(localLightAngle) * bWid * 0.45;
          ctx.beginPath();
          ctx.ellipse(rx2, ry2, bLen * 0.08, bWid * 0.05, localLightAngle, 0, Math.PI * 2);
          ctx.fillStyle = isCompleted ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.4)';
          ctx.fill();
        }

        ctx.restore();
      });

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [count, recitationState, progress, themeColor, currentBeads]);

  return (
    <div className="w-full flex flex-col items-center">
      <canvas
        ref={canvasRef}
        className="w-full"
        style={{ maxWidth: '800px', width: '100%', aspectRatio: '800/450' }}
      />
      <div className="flex items-center gap-4 mt-1">
        <span className="text-[10px] md:text-xs tracking-[0.2em] uppercase text-white/25 font-cinzel md:hidden">
          {currentBeads} / 108
        </span>
      </div>
    </div>
  );
};
