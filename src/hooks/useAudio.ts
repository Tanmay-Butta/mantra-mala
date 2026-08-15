import { useState, useEffect, useRef, useCallback } from 'react';

type AudioState = 'idle' | 'playing' | 'error';

let sharedAudioCtx: AudioContext | null = null;

// Premium synthetic Singing Bowl generator
const playSingingBowl = (playbackRate: number): { durationMs: number } => {
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContextClass) return { durationMs: 2500 / playbackRate };
  
  // Use a shared context to prevent browser limitations on creating too many contexts
  if (!sharedAudioCtx) {
    sharedAudioCtx = new AudioContextClass();
  }
  
  const ctx = sharedAudioCtx;
  
  // Must resume in case it was suspended by the browser's autoplay policy
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
  
  const dur = 2.5 / playbackRate; 
  
  // Fundamental tone (deep, resonant ~108Hz or 216Hz)
  const osc1 = ctx.createOscillator();
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(216, ctx.currentTime);
  
  // Overtone 1
  const osc2 = ctx.createOscillator();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(432, ctx.currentTime);
  
  // Overtone 2 (adds the "metallic" ring)
  const osc3 = ctx.createOscillator();
  osc3.type = 'sine';
  osc3.frequency.setValueAtTime(648, ctx.currentTime);
  
  const gain1 = ctx.createGain();
  const gain2 = ctx.createGain();
  const gain3 = ctx.createGain();
  
  // Envelope for gentle strike and long fade
  gain1.gain.setValueAtTime(0, ctx.currentTime);
  gain1.gain.linearRampToValueAtTime(0.5, ctx.currentTime + (0.1 / playbackRate));
  gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
  
  gain2.gain.setValueAtTime(0, ctx.currentTime);
  gain2.gain.linearRampToValueAtTime(0.2, ctx.currentTime + (0.05 / playbackRate));
  gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur * 0.8);
  
  gain3.gain.setValueAtTime(0, ctx.currentTime);
  gain3.gain.linearRampToValueAtTime(0.1, ctx.currentTime + (0.02 / playbackRate));
  gain3.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur * 0.5);
  
  osc1.connect(gain1);
  osc2.connect(gain2);
  osc3.connect(gain3);
  
  const master = ctx.createGain();
  master.gain.value = 0.6; // Master volume
  gain1.connect(master);
  gain2.connect(master);
  gain3.connect(master);
  master.connect(ctx.destination);
  
  osc1.start();
  osc2.start();
  osc3.start();
  
  osc1.stop(ctx.currentTime + dur);
  osc2.stop(ctx.currentTime + dur);
  osc3.stop(ctx.currentTime + dur);
  
  return { durationMs: dur * 1000 };
};

export const useAudio = (url?: string, playbackRate: number = 1.0) => {
  const [state, setState] = useState<AudioState>('idle');
  const [progress, setProgress] = useState(0); 
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const onCompleteRef = useRef<(() => void) | null>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!url) return;
    
    const audio = new Audio(url);
    audio.playbackRate = playbackRate;
    audioRef.current = audio;
    
    const handleEnded = () => {
      setState('idle');
      setProgress(1);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (onCompleteRef.current) {
        onCompleteRef.current();
      }
    };
    
    const handleError = () => {
      console.warn("Audio playback error, will use synth fallback");
    };

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    
    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.pause();
      audioRef.current = null;
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [url]);

  // Update playbackRate dynamically if it changes while audio exists
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  const play = useCallback((onComplete: () => void) => {
    if (state === 'playing') return;
    
    onCompleteRef.current = onComplete;
    setState('playing');
    setProgress(0);
    
    const playFallback = () => {
      // Use premium synthetic singing bowl
      const { durationMs } = playSingingBowl(playbackRate);
      
      const startTime = Date.now();
      progressIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        setProgress(Math.min(1, elapsed / durationMs));
        
        if (elapsed >= durationMs) {
          if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
          setState('idle');
          setProgress(1);
          if (onCompleteRef.current) onCompleteRef.current();
        }
      }, 16);
    };

    if (url && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.playbackRate = playbackRate;
      audioRef.current.play().catch(() => {
        playFallback();
      });
      
      // Update progress for real audio
      progressIntervalRef.current = setInterval(() => {
        if (audioRef.current && audioRef.current.duration) {
          setProgress(audioRef.current.currentTime / audioRef.current.duration);
        }
      }, 50);
    } else {
      playFallback();
    }
  }, [state, url, playbackRate]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    setState('idle');
    setProgress(0);
  }, []);

  return { play, stop, state, progress };
};
