import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as fbSignOut, updateProfile, type User } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import type { SavedProgress } from './storage';

export type LeaderboardEntry = {
  userId: string;
  displayName: string;
  avatarUrl: string;
  bestLevel: number;
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

export type UserProfile = {
  firstName: string;
  lastName: string;
  displayName: string;
};

export async function saveUserProfileToCloud(userId: string, profile: Partial<UserProfile>) {
  const db = getDb();
  if (!db) return;
  await setDoc(doc(db, 'users', userId, 'profile', 'info'), {
    ...profile,
    updatedAt: new Date().toISOString(),
  }, { merge: true });

  const auth = getAuthInstance();
  if (auth?.currentUser && profile.displayName) {
    await updateProfile(auth.currentUser, { displayName: profile.displayName }).catch(() => {});
  }
}

export async function loadUserProfileFromCloud(userId: string): Promise<Partial<UserProfile> | null> {
  const db = getDb();
  if (!db) return null;
  const snap = await getDoc(doc(db, 'users', userId, 'profile', 'info'));
  if (!snap.exists()) return null;
  const data = snap.data();
  const { updatedAt, ...rest } = data;
  return rest as Partial<UserProfile>;
}

/**
 * Add/update user in leaderboard only when they achieve a new higher best level (>= 5).
 * Returns true when a DB write happened.
 */
export async function addToLeaderboard(
  userId: string,
  displayName: string,
  avatarUrl: string,
  totalLevelsWon: number,
  bestLevel: number,
): Promise<boolean> {
  const db = getDb();
  console.log(`[addToLeaderboard] called for user=${userId}, bestLevel=${bestLevel} (totalWon=${totalLevelsWon})`);
  const normalizedBestLevel = Math.max(1, Math.floor(bestLevel || 1));
  if (!db || normalizedBestLevel < 5) {
    console.log(`[addToLeaderboard] SKIPPED: DB unavailable or bestLevel (${normalizedBestLevel}) < 5`);
    return false;
  }

  const ref = doc(db, 'leaderboard', userId);
  const snap = await getDoc(ref);
  const existing = snap.exists() ? snap.data() : null;
  const existingBestLevel = existing?.bestLevel || 0;
  const existingTotalLevelsWon = existing?.totalLevelsWon || 0;

  // Skip writes unless this user has reached a strictly higher best level.
  if (existingBestLevel >= normalizedBestLevel) {
    console.log(`[addToLeaderboard] SKIPPED: existingBestLevel (${existingBestLevel}) >= newBestLevel (${normalizedBestLevel})`);
    return false;
  }

  console.log(`[addToLeaderboard] ATTEMPTING SAVE: Updating to bestLevel=${normalizedBestLevel}`);

  const name = (displayName || 'Anonymous').trim().slice(0, 50);
  await setDoc(ref, {
    displayName: name,
    avatarUrl: (avatarUrl || '').trim(),
    totalLevelsWon: Math.max(totalLevelsWon, existingTotalLevelsWon),
    bestLevel: Math.max(normalizedBestLevel, existingBestLevel),
    updatedAt: new Date().toISOString(),
  }, { merge: true });

  console.log(`[addToLeaderboard] SUCCESS`);

  return true;
}

/** Fetch leaderboard entries filtered by bestLevel >= 5 and sorted by bestLevel desc */
export async function getLeaderboard(maxEntries = 50): Promise<LeaderboardEntry[]> {
  const db = getDb();
  if (!db) return [];
  const q = query(
    collection(db, 'leaderboard'),
    where('bestLevel', '>=', 5),
    orderBy('bestLevel', 'desc'),
    limit(maxEntries)
  );
  console.log('[getLeaderboard] Fetching leaderboard from Firestore...');
  const snap = await getDocs(q);
  console.log(`[getLeaderboard] Fetched ${snap.docs.length} entries from Firestore.`);
  const rows = snap.docs.map((d) => {
    const data = d.data();
    return {
      userId: d.id,
      displayName: data.displayName || 'Anonymous',
      avatarUrl: data.avatarUrl || '',
      bestLevel: data.bestLevel || data.totalLevelsWon || 1,
      totalLevelsWon: data.totalLevelsWon || 0,
      updatedAt: data.updatedAt || '',
    };
  });

  return rows.sort((a, b) => {
    if (b.bestLevel !== a.bestLevel) return b.bestLevel - a.bestLevel;
    if (b.totalLevelsWon !== a.totalLevelsWon) return b.totalLevelsWon - a.totalLevelsWon;
    return (b.updatedAt || '').localeCompare(a.updatedAt || '');
  });
}
