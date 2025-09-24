import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, initializeAuth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getFunctions, Functions } from 'firebase/functions';
// Import only when React Native AsyncStorage is available
let AsyncStorage: any;

// Firebase configuration using environment variables
// For React Native/Expo, we use EXPO_PUBLIC_ prefixed environment variables
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: `${process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: `${process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID}.firebasestorage.app`,
  messagingSenderId: "123456789", // Placeholder - can be updated later
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
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