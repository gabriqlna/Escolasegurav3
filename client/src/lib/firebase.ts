// Firebase configuration and initialization
// Based on firebase_barebones_javascript integration
import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile
} from "firebase/auth";
import { 
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  orderBy,
  serverTimestamp
} from "firebase/firestore";
import { initializeFirestore } from "firebase/firestore";
// import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Debug configuration
console.log('Firebase Config:', {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  hasApiKey: !!import.meta.env.VITE_FIREBASE_API_KEY,
  hasAppId: !!import.meta.env.VITE_FIREBASE_APP_ID
});

// Initialize Firebase with HMR-safe initialization
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase services with better sandbox connectivity
export const auth = getAuth(app);

// Initialize Firestore with optimized settings for Replit/sandbox environments
// Detect if we're in development mode
const isDevelopment = import.meta.env.DEV || import.meta.env.NODE_ENV === 'development';

// Force long polling in both dev and prod for Replit stability
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  experimentalAutoDetectLongPolling: false,
  ignoreUndefinedProperties: true,
});

console.log(`Firestore initialized for ${isDevelopment ? 'development' : 'production'} environment with long polling`);

// Centralized Firestore error handling with retry logic
const withRetry = async <T>(operation: () => Promise<T>, retries = 3): Promise<T | null> => {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      const isRetryable = error?.code === 'unavailable' || 
                         error?.code === 'deadline-exceeded' ||
                         error?.message === 'The user aborted a request.';
      
      if (isRetryable && attempt < retries - 1) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        console.debug(`Firestore retry ${attempt + 1}/${retries} after ${delay}ms:`, error.code);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      if (isRetryable) {
        console.warn('Firestore temporarily unavailable, using fallback data');
        return null;
      }
      
      throw error;
    }
  }
  return null;
};

// Enhanced error handling is now integrated into withRetry function

// Suppress unhandled Firebase connection retries (scoped to Firebase errors)
if (isDevelopment) {
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason?.message === 'The user aborted a request.' ||
        event.reason?.code === 'unavailable' ||
        event.reason?.code === 'deadline-exceeded') {
      event.preventDefault(); // Prevent noise in dev console
      return;
    }
  });
}
// export const messaging = getMessaging(app); // TODO: Configure messaging later

// Auth functions
export const signIn = async (email: string, password: string) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

export const signUp = async (email: string, password: string, name: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(userCredential.user, { displayName: name });
  return userCredential;
};

export const logout = async () => {
  return await signOut(auth);
};

// User data functions
export const createUserDocument = async (
  uid: string, 
  userData: {
    name: string;
    email: string;
    role: "aluno" | "funcionario" | "direcao";
    isActive?: boolean;
  }
) => {
  return await withRetry(async () => {
    const userDoc = {
      ...userData,
      isActive: userData.isActive ?? true,
      createdAt: serverTimestamp(),
    };
    
    await setDoc(doc(db, "users", uid), userDoc);
    return userDoc;
  });
};

export const getUserDocument = async (uid: string) => {
  return await withRetry(async () => {
    const userDoc = await getDoc(doc(db, "users", uid));
    return userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } : null;
  });
};

export const updateUserDocument = async (uid: string, data: Partial<any>) => {
  return await withRetry(async () => {
    await updateDoc(doc(db, "users", uid), data);
    return true;
  });
};

// Auth state observer
export const onAuthStateChange = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// User management functions (admin only)
export const getAllUsers = async () => {
  return await withRetry(async () => {
    const querySnapshot = await getDocs(collection(db, 'users'));
    const users: any[] = [];
    querySnapshot.forEach((doc: any) => {
      users.push({
        id: doc.id,
        ...doc.data()
      });
    });
    return users;
  }) ?? []; // Return empty array as fallback
};

// Note: Role updates are now restricted by Firestore security rules
// Only users with 'direcao' role can update user roles
export const updateUserRole = async (userId: string, newRole: "aluno" | "funcionario" | "direcao") => {
  return await withRetry(async () => {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      role: newRole
    });
    return true;
  });
};

// Push notifications - TODO: Implement after configuring Firebase Messaging
export const requestNotificationPermission = async () => {
  console.log('Notification permission not yet configured');
  return null;
};

export const onNotificationMessage = (callback: (payload: any) => void) => {
  console.log('Notification messaging not yet configured');
  return () => {};
};

// Firestore collections helpers
export const collections = {
  users: 'users',
  reports: 'reports',
  notices: 'notices',
  visitors: 'visitors',
  occurrences: 'occurrences',
  checklistItems: 'checklistItems',
  drills: 'drills',
  campaigns: 'campaigns',
  emergencyAlerts: 'emergencyAlerts',
} as const;

// Generic Firestore functions
export const addDocument = async (collectionName: string, data: any) => {
  return await withRetry(async () => {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  });
};

export const getDocuments = async (
  collectionName: string, 
  conditions?: Array<{ field: string; operator: any; value: any }>,
  orderByField?: string,
  orderDirection: 'asc' | 'desc' = 'desc'
) => {
  return await withRetry(async () => {
    let q = query(collection(db, collectionName));
    
    if (conditions) {
      conditions.forEach(condition => {
        q = query(q, where(condition.field, condition.operator, condition.value));
      });
    }
    
    if (orderByField) {
      q = query(q, orderBy(orderByField, orderDirection));
    }
    
    const querySnapshot = await getDocs(q);
    const documents: any[] = [];
    querySnapshot.forEach((doc: any) => {
      documents.push({
        id: doc.id,
        ...doc.data()
      });
    });
    return documents;
  }) ?? []; // Return empty array as fallback
};

export const updateDocument = async (collectionName: string, docId: string, data: any) => {
  return await withRetry(async () => {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
    return true;
  });
};

export const deleteDocument = async (collectionName: string, docId: string) => {
  return await withRetry(async () => {
    await deleteDoc(doc(db, collectionName, docId));
    return true;
  });
};