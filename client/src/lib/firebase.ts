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
  serverTimestamp,
  onSnapshot,
  limit
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

// More robust Firestore settings for Replit environment
export const db = initializeFirestore(app, {
  // Force long polling for Replit sandbox environments to avoid WebSocket issues
  experimentalForceLongPolling: true,
  ignoreUndefinedProperties: true,
  // Performance optimizations
  cacheSizeBytes: 10485760, // 10MB cache for faster data access
  // Reduce connection timeouts to fail fast and retry
  experimentalAutoDetectLongPolling: false, // Disable auto-detect for consistency
});

console.log(`Firestore initialized for ${isDevelopment ? 'development' : 'production'} environment with long polling`);

// Enhanced in-memory cache for user documents to reduce Firestore calls
const userCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes cache for better performance

// Cache for auth state to avoid unnecessary user document fetches
const authStateCache = new Map<string, { isProcessing: boolean; timestamp: number }>();
const AUTH_PROCESSING_TTL = 30 * 1000; // 30 seconds

const getCachedUser = (uid: string) => {
  const cached = userCache.get(uid);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
};

const setCachedUser = (uid: string, data: any) => {
  userCache.set(uid, { data, timestamp: Date.now() });
};

// Robust Firestore error handling with improved retry logic
const withRetry = async <T>(operation: () => Promise<T>, retries = 2): Promise<T | null> => {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      const isRetryable = error?.code === 'unavailable' || 
                         error?.code === 'deadline-exceeded' ||
                         error?.code === 'cancelled' ||
                         error?.code === 'aborted' ||
                         error?.message === 'The user aborted a request.' ||
                         error?.name === 'FirebaseError';
      
      if (isRetryable && attempt < retries - 1) {
        const delay = Math.min(500 + (attempt * 200), 1500); // Faster retry with shorter backoff
        console.debug(`Firestore retry ${attempt + 1}/${retries} after ${delay}ms:`, error.code || error.name);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      if (isRetryable) {
        console.warn('Firestore temporarily unavailable after retries, using fallback');
        return null;
      }
      
      console.error('Non-retryable Firestore error:', error);
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
    
    console.log('Creating user document:', { uid, userData });
    await setDoc(doc(db, "users", uid), userDoc);
    
    // Cache the newly created user
    const cachedDoc = { id: uid, ...userDoc };
    setCachedUser(uid, cachedDoc);
    
    console.log('User document created successfully');
    return cachedDoc;
  });
};

// Enhanced getUserDocument with smarter caching and deduplication
export const getUserDocument = async (uid: string, bypassCache: boolean = false) => {
  // Check if already processing this user to avoid duplicate requests
  const authProcessing = authStateCache.get(uid);
  if (authProcessing?.isProcessing && Date.now() - authProcessing.timestamp < AUTH_PROCESSING_TTL) {
    // Wait a bit and try cache again
    await new Promise(resolve => setTimeout(resolve, 100));
    const cachedUser = getCachedUser(uid);
    if (cachedUser) return cachedUser;
  }

  // Check cache first only if not bypassed
  if (!bypassCache) {
    const cachedUser = getCachedUser(uid);
    if (cachedUser) {
      console.log('User document from cache:', uid);
      return cachedUser;
    }
  }

  // Mark as processing to prevent duplicate requests
  authStateCache.set(uid, { isProcessing: true, timestamp: Date.now() });

  try {
    const result = await withRetry(async () => {
      console.log('Fetching user document for:', uid, bypassCache ? '(bypassing cache)' : '');
      const userDoc = await getDoc(doc(db, "users", uid));
      return userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } : null;
    });
    
    // Cache the result if found
    if (result) {
      setCachedUser(uid, result);
    }
    
    console.log('User document result:', result ? 'found' : 'not found');
    return result;
  } finally {
    // Clear processing state
    authStateCache.delete(uid);
  }
};

export const updateUserDocument = async (uid: string, data: Partial<any>) => {
  return await withRetry(async () => {
    await updateDoc(doc(db, "users", uid), data);
    
    // Invalidate cache after update to ensure immediate effect
    userCache.delete(uid);
    
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
    
    // Invalidate cache after role update to ensure immediate effect
    userCache.delete(userId);
    
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

// Real-time functions for live data updates
export const subscribeToCollection = (
  collectionName: string,
  conditions?: Array<{ field: string; operator: any; value: any }>,
  orderByField?: string,
  orderDirection: 'asc' | 'desc' = 'desc',
  limitCount?: number,
  callback?: (documents: any[]) => void
) => {
  try {
    let q = query(collection(db, collectionName));
    
    if (conditions) {
      conditions.forEach(condition => {
        q = query(q, where(condition.field, condition.operator, condition.value));
      });
    }
    
    if (orderByField) {
      q = query(q, orderBy(orderByField, orderDirection));
    }
    
    if (limitCount) {
      q = query(q, limit(limitCount));
    }
    
    return onSnapshot(q, (snapshot) => {
      const documents: any[] = [];
      snapshot.forEach((doc) => {
        documents.push({
          id: doc.id,
          ...doc.data()
        });
      });
      callback?.(documents);
    }, (error) => {
      console.warn('Firestore subscription error:', error);
      // Call callback with empty array as fallback
      callback?.([]);
    });
  } catch (error) {
    console.error('Error setting up Firestore subscription:', error);
    // Return dummy unsubscribe function
    return () => {};
  }
};

// Specialized real-time subscriptions for better performance
export const subscribeToReports = (callback?: (reports: any[]) => void) => {
  return subscribeToCollection('reports', undefined, 'createdAt', 'desc', undefined, callback);
};

export const subscribeToActiveVisitors = (callback?: (visitors: any[]) => void) => {
  return subscribeToCollection('visitors', [
    { field: 'isActive', operator: '==', value: true }
  ], 'checkInTime', 'desc', undefined, callback);
};

export const subscribeToActiveNotices = (callback?: (notices: any[]) => void) => {
  return subscribeToCollection('notices', [
    { field: 'isActive', operator: '==', value: true }
  ], 'createdAt', 'desc', undefined, callback);
};

export const subscribeToCampaigns = (callback?: (campaigns: any[]) => void) => {
  return subscribeToCollection('campaigns', [
    { field: 'isActive', operator: '==', value: true }
  ], 'createdAt', 'desc', undefined, callback);
};

export const subscribeToUsers = (callback?: (users: any[]) => void) => {
  return subscribeToCollection('users', undefined, 'createdAt', 'desc', undefined, callback);
};