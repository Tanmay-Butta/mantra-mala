import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};




export const isFirebaseConfigured = !!firebaseConfig.apiKey;

// Initialize Firebase only if configured
export const app = isFirebaseConfigured ? initializeApp(firebaseConfig) : null;

// Initialize Firebase services conditionally
export const auth = isFirebaseConfigured ? getAuth(app!) : null as any;
export const googleProvider = isFirebaseConfigured ? new GoogleAuthProvider() : null as any;
export const db = isFirebaseConfigured ? getFirestore(app!) : null as any;
export const storage = isFirebaseConfigured ? getStorage(app!) : null as any;
