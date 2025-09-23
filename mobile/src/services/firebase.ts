import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, initializeAuth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getFunctions, Functions } from 'firebase/functions';
// Import only when React Native AsyncStorage is available
let AsyncStorage: any;

// Firebase configuration using environment variables
// For Replit compatibility, we use the same VITE_ environment variables as the web app
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: `${process.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${process.env.VITE_FIREBASE_PROJECT_ID}.firebasestorage.app`,
  messagingSenderId: "123456789", // Placeholder - can be updated later
  appId: process.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;
let firestore: Firestore;
let functions: Functions;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  
  // Initialize Auth (persistence configured differently for web vs mobile)
  try {
    // For React Native, we would use initializeAuth with AsyncStorage persistence
    // For now, using standard getAuth for broader compatibility
    auth = getAuth(app);
  } catch (error) {
    console.warn('Auth initialization fallback:', error);
    auth = getAuth(app);
  }
  
  firestore = getFirestore(app);
  functions = getFunctions(app);
} else {
  app = getApps()[0];
  auth = getAuth(app);
  firestore = getFirestore(app);
  functions = getFunctions(app);
}

export { app, auth, functions };
export { firestore as db };