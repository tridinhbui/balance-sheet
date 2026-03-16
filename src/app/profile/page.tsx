"use client";

import React, { useEffect, useState } from 'react';
import { useAppAuth } from '@/components/AuthProvider';
import { loadUserProfileFromCloud, saveUserProfileToCloud, type UserProfile } from '@/lib/firebase';
import { loadProgressFromCloud } from '@/lib/firebase';
import { ArrowLeft, Camera, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';

export default function ProfilePage() {
  const { user, loading: authLoading } = useAppAuth();
  const router = useRouter();
  
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    displayName: '',
  });

  const [stats, setStats] = useState({
    xp: 0,
    highestLevel: 0,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      
      const [cloudProfile, cloudProgress] = await Promise.all([
        loadUserProfileFromCloud(user.id),
        loadProgressFromCloud(user.id),
      ]);

      setProfile({
        displayName: cloudProfile?.displayName || user.displayName || '',
      });

      setStats({
        xp: cloudProgress?.xp || 0,
        highestLevel: cloudProgress?.highestLevel || cloudProgress?.level || 1,
      });

      setLoadingData(false);
    }

    if (user && !authLoading) {
      loadData();
    }
  }, [user, authLoading]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    await saveUserProfileToCloud(user.id, profile);
    setIsSaving(false);
  };

  if (authLoading || loadingData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-amber-500 w-8 h-8" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#f8f9fc] flex flex-col font-sans">
      <header className="p-4 sm:p-6 flex items-center gap-4">
        <Link href="/" className="p-2 rounded-full hover:bg-slate-200 transition-colors tooltip" title="Back to Game">
          <ArrowLeft size={24} className="text-slate-700" />
        </Link>
        <div className="flex-1" />
      </header>

      <main className="flex-1 flex justify-center px-4 sm:px-6 py-10">
        <div className="w-full max-w-4xl flex flex-col md:flex-row gap-8 md:gap-10 items-stretch md:items-start justify-center">
          
          {/* LEFT COLUMN: Avatar & Stats */}
          <div className="w-full md:w-64 flex flex-col items-center">
            <div className="w-full bg-white rounded-2xl shadow-sm overflow-hidden">
              {/* Avatar - centered inside card */}
              <div className="flex justify-center pt-8 pb-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden bg-amber-100 flex items-center justify-center ring-2 ring-slate-100">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl font-bold text-amber-500">
                        {profile.displayName?.slice(0, 1).toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                  <button className="absolute -bottom-1 -right-1 bg-slate-900 text-white p-1.5 rounded-full border-2 border-white hover:bg-slate-800 transition-colors shadow">
                    <Camera size={14} />
                  </button>
                </div>
              </div>
              {/* Stats */}
              <div className="px-6 pb-8 flex flex-col gap-6">
                <div className="text-center">
                  <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-0.5">Total XP</p>
                  <p className="text-2xl font-bold text-slate-800">{stats.xp.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-0.5">Highest Level</p>
                  <p className="text-2xl font-bold text-slate-800">{stats.highestLevel.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: User Information Form */}
          <div className="w-full md:w-[400px] bg-white rounded-2xl shadow-sm">
            {/* Header - inside card */}
            <div className="px-6 pt-6 pb-2">
              <h2 className="text-xs font-bold text-slate-400 tracking-widest uppercase">User Information</h2>
            </div>
            <form onSubmit={handleSave} className="p-6 pt-2 pb-8 flex flex-col gap-5">
              
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600">Display name</label>
                <input 
                  type="text" 
                  value={profile.displayName} 
                  onChange={(e) => setProfile(p => ({ ...p, displayName: e.target.value }))}
                  className="px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-800 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium text-sm"
                  placeholder="e.g. Master Trader"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600">Email address</label>
                <input 
                  type="text" 
                  value={user.email || 'No email associated'} 
                  disabled
                  className="px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 outline-none font-medium text-sm cursor-not-allowed"
                />
              </div>

              <div className="flex gap-4 mt-4">
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className={clsx(
                    "bg-slate-900 text-white font-bold text-sm px-8 py-3 rounded-lg hover:bg-slate-800 transition-colors flex items-center justify-center gap-2",
                    isSaving && "opacity-70 cursor-not-allowed"
                  )}
                >
                  {isSaving && <Loader2 size={16} className="animate-spin" />}
                  Save
                </button>
                <Link 
                  href="/"
                  className="inline-flex items-center justify-center bg-white border-2 border-slate-900 text-slate-900 font-bold text-sm px-8 py-3 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </Link>
              </div>

            </form>
          </div>

        </div>
      </main>
    </div>
  );
}
