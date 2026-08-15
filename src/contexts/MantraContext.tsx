import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { doc, onSnapshot, setDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from './AuthContext';
import type { Mantra, UserMantraProgress } from '../types';
import { MOCK_MANTRAS } from '../data/mockMantras';

// ═══════════════════════════════════════════
// MantraContext — Local-first data layer
// ═══════════════════════════════════════════

interface MantraContextType {
  mantras: Mantra[];
  activeMantra: Mantra | null;
  activeProgress: UserMantraProgress | null;
  setActiveMantraId: (id: string) => void;
  incrementRecitation: () => Promise<void>;
  getProgressForMantra: (id: string) => UserMantraProgress;
  loading: boolean;
}

const MantraContext = createContext<MantraContextType>({
  mantras: [],
  activeMantra: null,
  activeProgress: null,
  setActiveMantraId: () => {},
  incrementRecitation: async () => {},
  getProgressForMantra: () => ({ mantraId: '', count: 0, target: 100000, lastRecitedAt: null, createdAt: null, updatedAt: null }),
  loading: true,
});

export const useMantra = () => useContext(MantraContext);

// Helper: load progress from localStorage
const loadLocalProgress = (mantraId: string, target: number): UserMantraProgress => {
  const stored = localStorage.getItem(`mantramala_progress_${mantraId}`);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return {
        ...parsed,
        lastRecitedAt: parsed.lastRecitedAt ? new Date(parsed.lastRecitedAt) : null,
        createdAt: parsed.createdAt ? new Date(parsed.createdAt) : new Date(),
        updatedAt: parsed.updatedAt ? new Date(parsed.updatedAt) : new Date(),
      };
    } catch {
      // Corrupted data, return fresh
    }
  }
  return {
    mantraId,
    count: 0,
    target,
    lastRecitedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};

export const MantraProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [mantras] = useState<Mantra[]>(MOCK_MANTRAS);

  // Persist activeMantraId to localStorage
  const [activeMantraId, setActiveMantraIdState] = useState<string | null>(() => {
    const saved = localStorage.getItem('mantramala_active_mantra');
    if (saved && MOCK_MANTRAS.some(m => m.id === saved)) return saved;
    return MOCK_MANTRAS.length > 0 ? MOCK_MANTRAS[0].id : null;
  });

  const setActiveMantraId = useCallback((id: string) => {
    setActiveMantraIdState(id);
    localStorage.setItem('mantramala_active_mantra', id);
  }, []);

  const [activeProgress, setActiveProgress] = useState<UserMantraProgress | null>(null);
  const [loading, setLoading] = useState(true);

  // Get progress for any mantra (used by radial selector to show counts)
  const getProgressForMantra = useCallback((id: string): UserMantraProgress => {
    const mantra = mantras.find(m => m.id === id);
    return loadLocalProgress(id, mantra?.target || 100000);
  }, [mantras]);

  // Load active mantra progress
  useEffect(() => {
    if (!activeMantraId) return;

    if (!user) {
      // Local Storage Mode
      const mantra = mantras.find(m => m.id === activeMantraId);
      const progress = loadLocalProgress(activeMantraId, mantra?.target || 100000);
      setActiveProgress(progress);
      setLoading(false);
      return;
    }

    // Cloud Mode (Firestore)
    const progressRef = doc(db, 'users', user.uid, 'mantras', activeMantraId);
    
    const unsubscribe = onSnapshot(progressRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setActiveProgress({
          ...data,
          lastRecitedAt: data.lastRecitedAt?.toDate ? data.lastRecitedAt.toDate() : data.lastRecitedAt,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt,
        } as UserMantraProgress);
      } else {
        const initialProgress: UserMantraProgress = {
          mantraId: activeMantraId,
          count: 0,
          target: mantras.find(m => m.id === activeMantraId)?.target || 100000,
          lastRecitedAt: null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        setActiveProgress(initialProgress);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching mantra progress:", error);
      // Fallback to local
      const mantra = mantras.find(m => m.id === activeMantraId);
      setActiveProgress(loadLocalProgress(activeMantraId, mantra?.target || 100000));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, activeMantraId, mantras]);

  const incrementRecitation = async () => {
    if (!activeMantraId) return;

    if (!user) {
      // Update Local Storage
      const currentCount = activeProgress?.count || 0;
      const target = activeProgress?.target || mantras.find(m => m.id === activeMantraId)?.target || 100000;
      const updatedProgress: UserMantraProgress = {
        mantraId: activeMantraId,
        count: currentCount + 1,
        target,
        lastRecitedAt: new Date(),
        createdAt: activeProgress?.createdAt || new Date(),
        updatedAt: new Date(),
      };
      localStorage.setItem(`mantramala_progress_${activeMantraId}`, JSON.stringify(updatedProgress));
      setActiveProgress(updatedProgress);
      return;
    }

    // Update Firestore
    const progressRef = doc(db, 'users', user.uid, 'mantras', activeMantraId);
    
    try {
      await setDoc(progressRef, {
        mantraId: activeMantraId,
        count: increment(1),
        lastRecitedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        target: activeProgress?.target || 100000,
      }, { merge: true });
    } catch (error) {
      console.error("Error incrementing recitation:", error);
      throw error;
    }
  };

  // Sync local progress to cloud when user logs in
  const syncLocalToCloud = async () => {
    if (!user) return;
    
    for (const mantra of mantras) {
      const storedData = localStorage.getItem(`mantramala_progress_${mantra.id}`);
      if (storedData) {
        try {
          const parsed = JSON.parse(storedData) as UserMantraProgress;
          if (parsed.count > 0) {
            const progressRef = doc(db, 'users', user.uid, 'mantras', mantra.id);
            await setDoc(progressRef, {
              mantraId: mantra.id,
              count: increment(parsed.count),
              lastRecitedAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
              target: parsed.target || mantra.target || 100000,
            }, { merge: true });
            
            localStorage.removeItem(`mantramala_progress_${mantra.id}`);
          }
        } catch (e) {
          console.error("Error syncing local progress to cloud for", mantra.id, e);
        }
      }
    }
  };

  useEffect(() => {
    if (user && mantras.length > 0) {
      syncLocalToCloud();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, mantras]);

  const activeMantra = mantras.find(m => m.id === activeMantraId) || null;

  return (
    <MantraContext.Provider value={{
      mantras,
      activeMantra,
      activeProgress,
      setActiveMantraId,
      incrementRecitation,
      getProgressForMantra,
      loading
    }}>
      {children}
    </MantraContext.Provider>
  );
};
