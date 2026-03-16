"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { getAuthInstance, isFirebaseConfigured, signOut as firebaseSignOut } from '@/lib/firebase';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';

export type AppAuthUser = {
  id: string;
  email: string | null;
  displayName: string;
  avatarUrl: string | null;
  provider: 'firebase' | 'supabase';
};

type AppAuthContextValue = {
  user: AppAuthUser | null;
  firebaseUser: AppAuthUser | null;
  supabaseUser: AppAuthUser | null;
  loading: boolean;
  hasFirebase: boolean;
  hasSupabase: boolean;
  signOut: () => Promise<void>;
};

const AppAuthContext = createContext<AppAuthContextValue | undefined>(undefined);

function mapFirebaseUser(user: FirebaseUser): AppAuthUser {
  return {
    id: user.uid,
    email: user.email,
    displayName: user.displayName || user.email || 'Google user',
    avatarUrl: user.photoURL,
    provider: 'firebase',
  };
}

function mapSupabaseUser(user: SupabaseUser): AppAuthUser {
  const meta = user.user_metadata ?? {};
  return {
    id: user.id,
    email: user.email ?? null,
    displayName:
      meta.display_name ??
      meta.full_name ??
      meta.name ??
      user.email ??
      'User',
    avatarUrl: meta.avatar_url ?? meta.picture ?? null,
    provider: 'supabase',
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<AppAuthUser | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<AppAuthUser | null>(null);
  const [firebaseLoading, setFirebaseLoading] = useState(true);
  const [supabaseLoading, setSupabaseLoading] = useState(true);
  const [hasSupabase, setHasSupabase] = useState(false);
  const hasFirebase = isFirebaseConfigured();

  useEffect(() => {
    if (!hasFirebase) {
      setFirebaseLoading(false);
      return;
    }

    const auth = getAuthInstance();
    if (!auth) {
      setFirebaseLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user ? mapFirebaseUser(user) : null);
      setFirebaseLoading(false);
    });

    return () => unsubscribe();
  }, [hasFirebase]);

  useEffect(() => {
    let cancelled = false;
    let unsubscribe: (() => void) | undefined;

    async function initSupabaseAuth() {
      const configured = await isSupabaseConfigured();
      if (cancelled) return;

      setHasSupabase(configured);
      if (!configured) {
        setSupabaseLoading(false);
        return;
      }

      const client = await getSupabaseClient();
      if (cancelled) return;

      if (!client) {
        setSupabaseLoading(false);
        return;
      }

      const { data } = await client.auth.getSession();
      if (cancelled) return;

      setSupabaseUser(data.session?.user ? mapSupabaseUser(data.session.user) : null);
      setSupabaseLoading(false);

      const listener = client.auth.onAuthStateChange((_event, session) => {
        setSupabaseUser(session?.user ? mapSupabaseUser(session.user) : null);
      });

      unsubscribe = () => listener.data.subscription.unsubscribe();
    }

    initSupabaseAuth().catch(() => {
      if (!cancelled) {
        setHasSupabase(false);
        setSupabaseLoading(false);
      }
    });

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  const value = useMemo<AppAuthContextValue>(() => ({
    user: supabaseUser ?? firebaseUser,
    firebaseUser,
    supabaseUser,
    loading: firebaseLoading || supabaseLoading,
    hasFirebase,
    hasSupabase,
    signOut: async () => {
      const tasks: Promise<unknown>[] = [];

      if (supabaseUser) {
        tasks.push(
          getSupabaseClient().then(async (client) => {
            if (client) await client.auth.signOut();
          })
        );
      }

      if (firebaseUser) {
        tasks.push(firebaseSignOut());
      }

      await Promise.allSettled(tasks);

      // Wipe local storage so new accounts don't inherit the previous user's game state
      if (typeof window !== 'undefined') {
        localStorage.removeItem('balance-quest-progress');
        window.location.href = '/'; 
      }
    },
  }), [firebaseLoading, firebaseUser, hasFirebase, hasSupabase, supabaseLoading, supabaseUser]);

  return <AppAuthContext.Provider value={value}>{children}</AppAuthContext.Provider>;
}

export function useAppAuth() {
  const context = useContext(AppAuthContext);
  if (!context) {
    throw new Error('useAppAuth must be used within AuthProvider.');
  }

  return context;
}