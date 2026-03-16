"use client";

import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Loader2, LogIn, Mail, UserPlus } from 'lucide-react';
import { signInWithGoogle } from '@/lib/firebase';
import { getSupabaseClient } from '@/lib/supabase';
import { useAppAuth } from '@/components/AuthProvider';

type AuthMode = 'signin' | 'signup';

type Notice = {
  kind: 'error' | 'success' | 'info';
  text: string;
};

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return 'Something went wrong. Please try again.';
}

function AuthPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading, hasFirebase, hasSupabase } = useAppAuth();
  const [mode, setMode] = useState<AuthMode>('signin');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);

  const redirectTo = searchParams.get('redirect') || '/';

  useEffect(() => {
    const requestedMode = searchParams.get('mode');
    if (requestedMode === 'signup' || requestedMode === 'signin') {
      setMode(requestedMode);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!loading && user) {
      router.replace(redirectTo);
    }
  }, [loading, redirectTo, router, user]);

  const handleGoogleSignIn = async () => {
    setNotice(null);
    setGoogleSubmitting(true);
    try {
      const user = await signInWithGoogle();
      if (user) router.replace(redirectTo);
    } catch (error) {
      setNotice({ kind: 'error', text: getErrorMessage(error) });
    } finally {
      setGoogleSubmitting(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice(null);
    setSubmitting(true);
    try {
      const client = await getSupabaseClient();
      if (!client) {
        throw new Error('Supabase is not configured yet.');
      }
      if (mode === 'signin') {
        const { error } = await client.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.replace(redirectTo);
        return;
      }
      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: fullName.trim() },
          emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}${redirectTo}` : undefined,
        },
      });
      if (error) throw error;
      const isExistingUser = Boolean(data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0);
      if (isExistingUser) {
        setMode('signin');
        setNotice({ kind: 'info', text: 'Email already exists. Please log in instead.' });
        return;
      }
      if (data.session) {
        setNotice({ kind: 'success', text: 'Account created and logged in.' });
        router.replace(redirectTo);
        return;
      }
      setMode('signin');
      setNotice({ kind: 'success', text: 'Account created. Please confirm your email before signing in.' });
    } catch (error) {
      setNotice({ kind: 'error', text: getErrorMessage(error) });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 mb-8">
          <ArrowLeft size={16} />
          Back to home
        </Link>

        <div className="text-4xl mb-4">⚖️</div>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">
          Balance <span className="text-amber-500">Quest</span>
        </h1>
        <p className="text-slate-500 text-sm mb-6">
          {mode === 'signin' ? 'Sign in to sync progress' : 'Create account to save progress'}
        </p>

        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => { setMode('signin'); setNotice(null); }}
            className={`flex-1 py-2 rounded-full text-sm font-medium transition-all ${
              mode === 'signin' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Log in
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setNotice(null); }}
            className={`flex-1 py-2 rounded-full text-sm font-medium transition-all ${
              mode === 'signup' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Sign up
          </button>
        </div>

        {hasFirebase && (
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleSubmitting}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm transition-all disabled:opacity-60 mb-6"
          >
            {googleSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            <span>Continue with Google</span>
          </button>
        )}

        {hasSupabase && (
          <>
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-xs text-slate-400">or</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Full name"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
                />
              )}
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 focus-within:border-slate-400 focus-within:ring-1 focus-within:ring-slate-400">
                <Mail className="h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  required
                  className="flex-1 bg-transparent text-slate-900 placeholder:text-slate-400 outline-none"
                />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                minLength={6}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
              />
              {notice && (
                <div className={`rounded-xl px-4 py-2.5 text-sm ${
                  notice.kind === 'error' ? 'bg-red-50 text-red-700' :
                  notice.kind === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                }`}>
                  {notice.text}
                </div>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl border-2 border-slate-200 text-slate-700 font-medium hover:border-slate-300 hover:bg-slate-50 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === 'signin' ? <LogIn size={16} /> : <UserPlus size={16} />}
                {mode === 'signin' ? 'Log in with email' : 'Create account'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    }>
      <AuthPageContent />
    </Suspense>
  );
}
