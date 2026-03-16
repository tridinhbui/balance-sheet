"use client";

import Link from 'next/link';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Loader2, LogIn, Mail, ShieldCheck, Sparkles, UserPlus } from 'lucide-react';
import { signInWithGoogle } from '@/lib/firebase';
import { getSupabaseClient } from '@/lib/supabase';
import { useAppAuth } from '@/components/AuthProvider';

const jakarta = Plus_Jakarta_Sans({
	subsets: ['latin'],
	weight: ['400', '500', '600', '700', '800'],
});

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
			await signInWithGoogle();
			router.replace(redirectTo);
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
				throw new Error('Supabase is not configured yet. Check your environment variables first.');
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
					data: {
						display_name: fullName.trim(),
					},
					emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}${redirectTo}` : undefined,
				},
			});

			if (error) throw error;

			const isExistingUser = Boolean(data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0);
			if (isExistingUser) {
				setMode('signin');
				setNotice({
					kind: 'info',
					text: 'Email already exists. Please log in instead.',
				});
				return;
			}

			if (data.session) {
				setNotice({ kind: 'success', text: 'Account created and logged in successfully.' });
				router.replace(redirectTo);
				return;
			}

			setMode('signin');
			setNotice({
				kind: 'success',
				text: 'Account successfully created. If Supabase email verification is enabled, please confirm your email before signing in.',
			});
		} catch (error) {
			setNotice({ kind: 'error', text: getErrorMessage(error) });
		} finally {
			setSubmitting(false);
		}
	};

	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
				<Loader2 className="h-8 w-8 animate-spin" />
			</div>
		);
	}

	return (
		<main
			className={`${jakarta.className} relative min-h-screen overflow-hidden bg-[linear-gradient(120deg,_#e2e8f0_0%,_#f8fafc_38%,_#dbeafe_100%)] px-4 py-8 text-slate-900 sm:px-6 lg:px-8`}
		>
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<div className="absolute -left-24 top-[-100px] h-64 w-64 rounded-full bg-amber-300/45 blur-3xl" />
				<div className="absolute right-[-140px] top-[18%] h-72 w-72 rounded-full bg-sky-300/35 blur-3xl" />
				<div className="absolute bottom-[-120px] left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-indigo-300/20 blur-3xl" />
			</div>

			<div className="relative mx-auto w-full max-w-xl">
				<section className="rounded-[32px] border border-slate-900/10 bg-[#020617]/95 p-6 text-white shadow-[0_32px_90px_rgba(15,23,42,0.35)] backdrop-blur sm:p-8">
					<div className="flex items-center justify-between gap-3">
						<Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300 transition-colors hover:text-white">
							<ArrowLeft size={16} />
							<span>Back to home</span>
						</Link>
						<div className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/[0.06] p-1">
							<button
								type="button"
								onClick={() => {
									setMode('signin');
									setNotice(null);
								}}
								className={`rounded-full px-5 py-2 text-sm font-semibold transition ${mode === 'signin' ? 'bg-white text-slate-950 shadow-[0_6px_24px_rgba(255,255,255,0.2)]' : 'text-white/70 hover:text-white'}`}
							>
								Log in
							</button>
							<button
								type="button"
								onClick={() => {
									setMode('signup');
									setNotice(null);
								}}
								className={`rounded-full px-5 py-2 text-sm font-semibold transition ${mode === 'signup' ? 'bg-white text-slate-950 shadow-[0_6px_24px_rgba(255,255,255,0.2)]' : 'text-white/70 hover:text-white'}`}
							>
								Sign up
							</button>
						</div>
					</div>

					<div className="mt-8 space-y-1">
						<p className="inline-flex items-center gap-2 rounded-full border border-amber-300/35 bg-amber-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-amber-200">
							<Sparkles className="h-3.5 w-3.5" />
							Balance Sheet Club
						</p>
						<h1 className="text-3xl font-extrabold leading-tight text-white sm:text-4xl">
							{mode === 'signin' ? 'Welcome back' : 'Create your account'}
						</h1>
						<p className="text-sm text-slate-300 sm:text-base">
							{mode === 'signin'
								? 'Sign in to continue your progress and daily streaks.'
								: 'Join now to save your game history and unlock achievements.'}
						</p>
					</div>

					<form onSubmit={handleSubmit} className="mt-7 space-y-4">
						{mode === 'signup' && (
							<label className="block">
								<span className="mb-2 block text-sm font-medium text-slate-200">Full name</span>
								<input
									value={fullName}
									onChange={(event) => setFullName(event.target.value)}
									placeholder="Your name"
									className="w-full rounded-2xl border border-white/15 bg-white/[0.06] px-4 py-3 text-white outline-none ring-0 transition duration-200 placeholder:text-slate-400 focus:border-amber-300 focus:bg-white/[0.08] focus:shadow-[0_0_0_4px_rgba(251,191,36,0.14)]"
								/>
							</label>
						)}

						<label className="block">
							<span className="mb-2 block text-sm font-medium text-slate-200">Email</span>
							<div className="group flex items-center gap-2 rounded-2xl border border-white/15 bg-white/[0.06] px-3 transition duration-200 focus-within:border-amber-300 focus-within:bg-white/[0.08] focus-within:shadow-[0_0_0_4px_rgba(251,191,36,0.14)]">
								<Mail className="h-4 w-4 text-slate-400 transition group-focus-within:text-amber-200" />
								<input
									type="email"
									value={email}
									onChange={(event) => setEmail(event.target.value)}
									placeholder="name@example.com"
									required
									className="w-full bg-transparent px-1 py-3 text-white outline-none placeholder:text-slate-400"
								/>
							</div>
						</label>

						<label className="block">
							<span className="mb-2 block text-sm font-medium text-slate-200">Password</span>
							<input
								type="password"
								value={password}
								onChange={(event) => setPassword(event.target.value)}
								placeholder="Enter your password"
								required
								minLength={6}
								className="w-full rounded-2xl border border-white/15 bg-white/[0.06] px-4 py-3 text-white outline-none ring-0 transition duration-200 placeholder:text-slate-400 focus:border-amber-300 focus:bg-white/[0.08] focus:shadow-[0_0_0_4px_rgba(251,191,36,0.14)]"
							/>
						</label>

						{notice && (
							<div className={`rounded-2xl border px-4 py-3 text-sm ${notice.kind === 'error' ? 'border-red-400/40 bg-red-500/10 text-red-100' : notice.kind === 'success' ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-100' : 'border-amber-400/40 bg-amber-500/10 text-amber-100'}`}>
								{notice.text}
							</div>
						)}

						<button
							type="submit"
							disabled={submitting || (mode === 'signup' && !hasSupabase)}
							className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-300 px-4 py-3.5 text-sm font-bold text-slate-950 transition duration-200 hover:-translate-y-0.5 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
						>
							{submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === 'signin' ? <LogIn className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
							<span>{mode === 'signin' ? 'Log in with email' : 'Create account'}</span>
						</button>
					</form>

					{!hasSupabase && (
						<p className="mt-4 rounded-xl border border-amber-300/30 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
							Supabase email auth is not ready. Please check `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` or `SUPABASE_ANON_KEY` in your environment file.
						</p>
					)}

					{hasFirebase && (
						<>
							<div className="my-6 flex items-center gap-3">
								<div className="h-px flex-1 bg-white/10" />
								<span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">or continue with</span>
								<div className="h-px flex-1 bg-white/10" />
							</div>

							<button
								type="button"
								onClick={handleGoogleSignIn}
								disabled={googleSubmitting}
								className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/[0.06] px-4 py-3 text-sm font-semibold text-white transition duration-200 hover:bg-white/[0.1] disabled:cursor-not-allowed disabled:opacity-60"
							>
								{googleSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
								<span>Continue with Google</span>
							</button>
						</>
					)}
				</section>
			</div>
		</main>
	);
}

export default function AuthPage() {
	return (
		<Suspense
			fallback={
				<div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
					<Loader2 className="h-8 w-8 animate-spin" />
				</div>
			}
		>
			<AuthPageContent />
		</Suspense>
	);
}
