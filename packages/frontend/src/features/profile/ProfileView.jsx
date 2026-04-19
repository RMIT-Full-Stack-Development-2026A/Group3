import React, { useRef, useState } from 'react';
import { useProfile } from './profileHook';
import { useMatchHistory } from '../MatchHistory/matchHistoryHook';
import Header from '../../shared/components/layout/Header';
import BottomDock from '../../shared/components/layout/BottomDock';
import profileService from './profileService';
import { useAuthStore } from '../../app/store/authStore';
import { API_CONFIG } from '../../configs/apiConfig';
import EditProfileModal from './components/EditProfileModal';
import { countries } from '../../shared/utils/countries';

const ProfileView = () => {
  const { profileData, loading, error, refresh } = useProfile();
  const { history, loading: historyLoading } = useMatchHistory();
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { updateUser } = useAuthStore();

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const getFullAvatarUrl = (url) => {
    if (!url) return "https://api.dicebear.com/7.x/avataaars/svg?seed=Kaelen";
    if (url.startsWith('http')) return url;
    const serverBase = API_CONFIG.BASE_URL.replace('/api/v1', '');
    return `${serverBase}${url}`;
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const response = await profileService.uploadAvatar(file);
      const newAvatarUrl = response.data.profile.avatarUrl;
      
      // Update global auth state with the new avatar URL
      updateUser({ avatarUrl: newAvatarUrl });
      
      // Refresh local profile page data
      refresh();
    } catch (err) {
      alert('Failed to upload avatar: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center text-white gap-4">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="text-xl font-headline font-bold animate-pulse">Loading Persona...</p>
    </div>
  );

  const { user, profile, stats } = profileData || {};
  const countryData = countries.find(c => c.name === profile?.country);

  return (
    <div className="min-h-screen bg-background text-on-surface font-body selection:bg-primary/30 overflow-x-hidden">
      <Header user={{ ...user, avatarUrl: profile?.avatarUrl }} />

      <main className="pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto space-y-12">
        {/* Premium Profile Header */}
        <header className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary/20 blur-3xl opacity-30 pointer-events-none"></div>
          <div className="relative flex flex-col md:flex-row items-start md:items-end justify-between gap-8 p-8 rounded-2xl bg-surface-container-low/40 border border-white/5 glassmorphism-blur">
            <div className="flex flex-col md:flex-row items-start gap-8">
              {/* Large Avatar */}
              <div className="relative group/avatar cursor-pointer" onClick={handleAvatarClick}>
                <div className={`w-32 h-32 md:w-40 md:h-40 rounded-3xl overflow-hidden border-4 border-primary/20 shadow-2xl transition-all ${uploading ? 'opacity-50' : 'group-hover/avatar:border-primary/50'}`}>
                  <img 
                    alt="User" 
                    className="w-full h-full object-cover" 
                    src={getFullAvatarUrl(profile?.avatarUrl)} 
                  />
                  {uploading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-3xl">cloud_upload</span>
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 bg-primary text-on-primary px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                  LVL {stats?.level || 1}
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                  accept="image/*"
                />
              </div>

              {/* User Details */}
              <div className="space-y-4">
                <div>
                  <h1 className="text-4xl md:text-5xl font-extrabold headline-font text-on-surface tracking-tight">
                    {user?.username || 'Kaelen_Void'}
                  </h1>
                  <div className="flex items-center gap-3 mt-2 text-on-surface-variant">
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/5 border border-white/5">
                      {countryData ? (
                        <span className="text-lg">{countryData.flag}</span>
                      ) : (
                        <span className="material-symbols-outlined text-[18px] text-primary">flag</span>
                      )}
                      <span className="text-sm font-medium">{profile?.country || 'Global'}</span>
                    </div>
                    <div className="w-1.5 h-1.5 rounded-full bg-outline-variant"></div>
                    <span className="text-sm">Joined {new Date(user?.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-primary/20 to-primary-container/10 border border-primary/30">
                    <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                    <span className="text-sm font-bold text-primary tracking-wide">{profile?.isPremium ? 'PREMIUM' : 'FREE USER'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-semibold">Account Balance</span>
                    <span className="text-xl font-bold headline-font text-on-surface">
                      ${(profile?.walletBalance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {/* Action Button */}
            <div className="w-full md:w-auto">
              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="w-full md:w-auto px-8 py-4 rounded-lg bg-surface-container-high border border-outline-variant text-on-surface font-bold headline-font flex items-center justify-center gap-2 hover:bg-surface-bright transition-colors active:scale-95 duration-200"
              >
                <span className="material-symbols-outlined">edit</span>
                Edit Profile
              </button>
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="relative overflow-hidden group p-8 rounded-2xl bg-surface-container-high/60 border border-white/5 flex flex-col justify-between min-h-[220px]">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="material-symbols-outlined text-8xl">trending_up</span>
            </div>
            <span className="text-on-surface-variant text-sm font-semibold uppercase tracking-widest">Current Rating</span>
            <div>
              <h2 className="text-6xl font-extrabold headline-font text-primary tracking-tighter">
                {stats?.eloRating || 1200}
              </h2>
              <p className="text-secondary text-sm mt-1 font-medium flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">arrow_upward</span>
                +0 this week
              </p>
            </div>
          </div>

          <div className="md:col-span-2 relative p-8 rounded-2xl bg-surface-container-high/60 border border-white/5 flex flex-col md:flex-row gap-8 items-center justify-around">
            <div className="flex flex-col items-center gap-2">
              <div className="w-24 h-24 rounded-full border-4 border-primary/20 flex items-center justify-center relative">
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle className="text-white/5" cx="50" cy="50" fill="transparent" r="40" stroke="currentColor" strokeWidth="8"></circle>
                  <circle 
                    className="text-primary transition-all duration-1000" 
                    cx="50" 
                    cy="50" 
                    fill="transparent" 
                    r="40" 
                    stroke="currentColor" 
                    strokeWidth="8"
                    strokeDasharray="251.2"
                    strokeDashoffset={251.2 - (251.2 * (parseFloat(stats?.winRate) || 0)) / 100}
                  ></circle>
                </svg>
                <span className="text-2xl font-bold headline-font">{stats?.winRate || '0%'}</span>
              </div>
              <span className="text-xs uppercase tracking-widest text-on-surface-variant font-bold">Win Rate</span>
            </div>
            <div className="grid grid-cols-2 gap-x-12 gap-y-6 flex-1">
              <div className="space-y-1">
                <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest">Total Battles</span>
                <p className="text-2xl font-bold headline-font text-on-surface">{stats?.totalGames || 0}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest">Victory Streak</span>
                <p className="text-2xl font-bold headline-font text-on-surface">0</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest">Total Draws</span>
                <p className="text-2xl font-bold headline-font text-on-surface">{stats?.draws || 0}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest">Avg Game Time</span>
                <p className="text-2xl font-bold headline-font text-on-surface">1m 24s</p>
              </div>
            </div>
          </div>
        </section>

        {/* Match History */}
        <section className="space-y-6">
          <h3 className="text-2xl font-bold headline-font">Match History</h3>
          <div className="overflow-x-auto rounded-2xl bg-surface-container-low/60 border border-white/5">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/5">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Match ID</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Opponent</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Result</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {historyLoading ? (
                  <tr><td colSpan="4" className="px-6 py-10 text-center">Loading...</td></tr>
                ) : history.length === 0 ? (
                  <tr><td colSpan="4" className="px-6 py-10 text-center">No matches found.</td></tr>
                ) : (
                  history.slice(0, 5).map((match) => (
                    <tr key={match.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-5 text-sm font-mono text-violet-300">#{match.id.slice(-8).toUpperCase()}</td>
                      <td className="px-6 py-5 text-sm">{match.opponent}</td>
                      <td className="px-6 py-5">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${match.result === 'Victory' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : match.result === 'Defeat' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-white/5 text-on-surface-variant border-white/10'}`}>
                          {match.result}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-sm text-on-surface-variant">{new Date(match.date).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <EditProfileModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentData={profileData}
        onUpdate={refresh}
      />

      <BottomDock />
    </div>
  );
};

export default ProfileView;
