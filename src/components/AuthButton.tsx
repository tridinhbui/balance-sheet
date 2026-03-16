"use client";

import Link from 'next/link';
import React, { useState } from 'react';
import { LogIn, LogOut, Loader2, UserPlus } from 'lucide-react';
import { useAppAuth } from '@/components/AuthProvider';

export function AuthButton() {
  const { user, loading, signOut } = useAppAuth();
  const [signingOut, setSigningOut] = useState(false);

  if (loading) return <div className="h-10 w-32 animate-pulse rounded-xl bg-slate-200" />;

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/profile" className="flex items-center gap-2 hover:bg-slate-100 p-1.5 rounded-lg transition-colors cursor-pointer" title="Go to Profile">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt="" className="h-7 w-7 rounded-full object-cover" />
          ) : (
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
              {user.displayName.slice(0, 1).toUpperCase()}
            </div>
          )}
          <span className="hidden max-w-[120px] truncate text-xs text-slate-600 font-medium sm:inline">{user.displayName}</span>
        </Link>
        <button
          onClick={async () => {
            setSigningOut(true);
            try {
              await signOut();
            } finally {
              setSigningOut(false);
            }
          }}
          className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg p-2.5 text-slate-500 hover:bg-slate-100 md:min-h-0 md:min-w-0 md:rounded md:p-1.5"
          title="Sign out"
          disabled={signingOut}
        >
          {signingOut ? <Loader2 size={18} className="animate-spin" /> : <LogOut size={18} />}
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/auth?mode=signin"
        className="flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
      >
        <LogIn size={16} />
        <span>Log in</span>
      </Link>
      <Link
        href="/auth?mode=signup"
        className="flex min-h-[44px] items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
      >
        <UserPlus size={16} />
        <span>Sign up</span>
      </Link>
    </div>
  );
}
