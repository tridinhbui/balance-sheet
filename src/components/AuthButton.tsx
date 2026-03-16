"use client";

import React, { useState, useEffect } from 'react';
import { getAuthInstance, signInWithGoogle, signOut, isFirebaseConfigured } from '@/lib/firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { LogIn, LogOut, Loader2 } from 'lucide-react';

export function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    const auth = getAuthInstance();
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleSignIn = async () => {
    setSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (e) {
      console.error('Sign in failed:', e);
    }
    setSigningIn(false);
  };

  if (!isFirebaseConfigured()) return null;
  if (loading) return <div className="w-8 h-8 animate-pulse bg-slate-200 rounded" />;

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <img src={user.photoURL || ''} alt="" className="w-7 h-7 rounded-full" />
        <span className="text-xs text-slate-600 max-w-[80px] truncate hidden sm:inline">{user.displayName}</span>
        <button
          onClick={() => signOut()}
          className="p-2.5 md:p-1.5 rounded-lg md:rounded hover:bg-slate-100 text-slate-500 min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 flex items-center justify-center touch-manipulation"
          title="Sign out"
        >
          <LogOut size={18} />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleSignIn}
      disabled={signingIn}
      className="flex items-center gap-2 px-4 py-2.5 md:py-1.5 rounded-lg bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-sm font-medium text-slate-700 disabled:opacity-50 min-h-[44px] touch-manipulation"
    >
      {signingIn ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
      <span className="hidden sm:inline">Sign in with Google</span>
    </button>
  );
}
