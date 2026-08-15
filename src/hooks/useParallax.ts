import { useState, useEffect } from 'react';

export function useParallax(intensity = 1) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let isMobile = false;
    
    let targetX = 0;
    let targetY = 0;
    
    let currentX = 0;
    let currentY = 0;
    
    let animationFrameId: number;

    const lerp = (start: number, end: number, factor: number) => {
      return start + (end - start) * factor;
    };

    const updateLoop = () => {
      currentX = lerp(currentX, targetX, 0.05); // Smooth interpolation
      currentY = lerp(currentY, targetY, 0.05);
      
      setOffset({
        x: currentX * intensity,
        y: currentY * intensity,
      });
      
      animationFrameId = requestAnimationFrame(updateLoop);
    };
    
    updateLoop();

    const handleMouseMove = (e: MouseEvent) => {
      if (isMobile) return; // Don't process mouse if tilt is active
      targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (!e.gamma || !e.beta) return;
      isMobile = true;
      
      // gamma is left/right tilt in degrees, [-90, 90]
      // beta is front/back tilt in degrees, [-180, 180]
      // Normal holding angle for beta is around 45 degrees
      let x = e.gamma / 30; 
      let y = (e.beta - 45) / 30; 
      
      // Clamp values
      x = Math.max(-1, Math.min(1, x));
      y = Math.max(-1, Math.min(1, y));
      
      targetX = x;
      targetY = y;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('deviceorientation', handleOrientation);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('deviceorientation', handleOrientation);
      cancelAnimationFrame(animationFrameId);
    };
  }, [intensity]);

  return offset;
}
