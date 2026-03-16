import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as fbSignOut, type User } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import type { SavedProgress } from './storage';

export type LeaderboardEntry = {
  userId: string;
  displayName: string;
  totalLevelsWon: number;
  updatedAt: string;
};

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;

export function getFirebaseApp() {
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) return null;
  if (!app) app = initializeApp(firebaseConfig);
  return app;
}

export function getAuthInstance() {
  const a = getFirebaseApp();
  return a ? getAuth(a) : null;
}

export function getDb() {
  const a = getFirebaseApp();
  return a ? getFirestore(a) : null;
}

export function isFirebaseConfigured() {
  return !!(firebaseConfig.apiKey && firebaseConfig.projectId);
}

export async function signInWithGoogle(): Promise<User | null> {
  const auth = getAuthInstance();
  if (!auth) return null;
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

export async function signOut() {
  const auth = getAuthInstance();
  if (auth) await fbSignOut(auth);
}

export async function saveProgressToCloud(userId: string, progress: Partial<SavedProgress>) {
  const db = getDb();
  if (!db) return;
  await setDoc(doc(db, 'users', userId, 'progress', 'game'), {
    ...progress,
    updatedAt: new Date().toISOString(),
  }, { merge: true });
}

export async function loadProgressFromCloud(userId: string): Promise<Partial<SavedProgress> | null> {
  const db = getDb();
  if (!db) return null;
  const snap = await getDoc(doc(db, 'users', userId, 'progress', 'game'));
  if (!snap.exists()) return null;
  const data = snap.data();
  const { updatedAt, ...rest } = data;
  return rest as Partial<SavedProgress>;
}

/** Add/update user in leaderboard when they reach 5+ levels. Call on victory. */
export async function addToLeaderboard(userId: string, displayName: string, totalLevelsWon: number): Promise<void> {
  const db = getDb();
  if (!db || totalLevelsWon < 5) return;
  const name = (displayName || 'Anonymous').trim().slice(0, 50);
  await setDoc(doc(db, 'leaderboard', userId), {
    displayName: name,
    totalLevelsWon,
    updatedAt: new Date().toISOString(),
  }, { merge: true });
}

/** Fetch leaderboard entries sorted by totalLevelsWon desc */
export async function getLeaderboard(maxEntries = 50): Promise<LeaderboardEntry[]> {
  const db = getDb();
  if (!db) return [];
  const q = query(
    collection(db, 'leaderboard'),
    orderBy('totalLevelsWon', 'desc'),
    limit(maxEntries)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      userId: d.id,
      displayName: data.displayName || 'Anonymous',
      totalLevelsWon: data.totalLevelsWon || 0,
      updatedAt: data.updatedAt || '',
    };
  });
}
