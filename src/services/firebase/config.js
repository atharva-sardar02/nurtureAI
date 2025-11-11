import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Validate that required config values are present
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error(
    'Firebase configuration is missing. Please check your environment variables.',
    {
      apiKey: firebaseConfig.apiKey ? '✓' : '✗',
      projectId: firebaseConfig.projectId ? '✓' : '✗',
      authDomain: firebaseConfig.authDomain ? '✓' : '✗',
    }
  );
  throw new Error('Firebase configuration is incomplete. Please check your .env file and ensure all VITE_FIREBASE_* variables are set.');
}

// Initialize Firebase
let app;
try {
  app = initializeApp(firebaseConfig);
  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  throw error;
}

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;

