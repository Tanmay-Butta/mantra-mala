// ═══════════════════════════════════════════
// MantraMala — Core Types
// ═══════════════════════════════════════════

export interface MantraTheme {
  primaryColor: string;
  secondaryColor: string;
  glowColor: string;
  bgTint: string;
  particleColor: string;
  backgroundStyle: string;
}

export interface Mantra {
  id: string;
  name: string;
  displayName: string;
  text: string;
  description: string;
  audioUrl: string;
  target: number;
  category: string;
  order: number;
  enabled: boolean;
  theme: MantraTheme;
}

export interface UserMantraProgress {
  mantraId: string;
  count: number;
  target: number;
  lastRecitedAt: any; // Firestore Timestamp or Date
  createdAt: any;
  updatedAt: any;
}

export interface UserProfile {
  displayName: string;
  email: string;
  photoURL: string;
  createdAt: any;
  lastActiveAt: any;
}

// App state machine
export type AppState = 'landing' | 'main';

// Recitation lifecycle
export type RecitationState = 'idle' | 'reciting' | 'completing';
