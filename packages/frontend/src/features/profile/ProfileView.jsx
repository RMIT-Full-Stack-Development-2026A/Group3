import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useProfile } from './profileHook';
import { useWallet } from './wallet/walletHook';

import { getAvatarUrl } from '../../shared/utils/avatarUtil';
import { useAuthStore } from '../../app/store/authStore';
import EditProfileModal from './components/profile/EditProfileModal';
import WalletTopUpModal from './components/wallet/WalletTopUpModal';
import PremiumSubscribeModal from './components/wallet/PremiumSubscribeModal';
import { countries } from '../../shared/utils/countries';

const ProfileView = () => {
  const { profileData, loading, updating, error, refresh, updateAvatar, updateProfileInfo } = useProfile();
  const { walletData, actionLoading, handleTopUp, handleSubscribe, refresh: refreshWallet } = useWallet();
  const fileInputRef = useRef(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const updateUser = useAuthStore(state => state.actions.updateUser);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const updatedData = await updateAvatar(file);
      
      // Update global auth state with the new avatar URL
      if (updatedData?.profile?.avatarUrl) {
        updateUser({ avatarUrl: updatedData.profile.avatarUrl });
      }
    } catch (err) {
      alert('Failed to upload avatar: ' + err.message);
    }
  };

  // Wrap onTopUp to also refresh profile data after balance changes
  const onTopUp = async (amount) => {
    const result = await handleTopUp(amount);
    refresh(); // refresh profile to sync balance
    return result;
  };

  // Wrap onSubscribe to also refresh profile data after subscription
  const onSubscribe = async (plan) => {
    const result = await handleSubscribe(plan);
    refresh(); // refresh profile to sync isPremium, balance, etc.
    return result;
  };

  if (loading) return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center text-white gap-4">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="text-xl font-headline font-bold animate-pulse">Loading Persona...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center text-rose-500 gap-6 p-4 text-center pt-24">
      <span className="material-symbols-outlined text-6xl">error_outline</span>
      <p className="text-2xl font-bold">{error}</p>
      <button onClick={refresh} className="px-6 py-2 bg-primary text-on-primary rounded-lg font-bold shadow-lg hover:shadow-primary/20 active:scale-95 transition-all">
        Retry Request
      </button>
    </div>
  );

  const { user, profile, stats } = profileData || {};
  const countryData = countries.find(c => c.name === profile?.country);

  // Prefer wallet API data when available, fallback to profile data
  const currentBalance = walletData?.walletBalance ?? profile?.walletBalance ?? 0;
  const isPremium = walletData?.isPremium ?? profile?.isPremium ?? false;
  const premiumExpiry = walletData?.premiumExpiry ?? profile?.premiumExpiry ?? null;

  return (
    <div className="min-h-screen bg-background text-on-surface font-body selection:bg-primary/30 overflow-x-hidden">


      <main className="pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto space-y-12">
        {/* Premium Profile Header */}
        <header className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary/20 blur-3xl opacity-30 pointer-events-none"></div>
          <div className="relative flex flex-col md:flex-row items-start md:items-end justify-between gap-8 p-8 rounded-2xl bg-surface-container-low/40 border border-white/5 glassmorphism-blur">
            <div className="flex flex-col md:flex-row items-start gap-8">
              {/* Large Avatar */}
              <div className="relative group/avatar cursor-pointer" onClick={handleAvatarClick}>
                <div className={`w-32 h-32 md:w-40 md:h-40 rounded-3xl overflow-hidden border-4 border-primary/20 shadow-2xl transition-all ${updating ? 'opacity-50' : 'group-hover/avatar:border-primary/50'}`}>
                  <img
                    alt="User"
                    className="w-full h-full object-cover"
                    src={getAvatarUrl(profile?.avatarUrl, 400)}
                  />
                  {updating && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-3xl">cloud_upload</span>
                  </div>
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
                    {user?.username}
                  </h1>
                  <div className="flex items-center gap-3 mt-2 text-on-surface-variant">
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/5 border border-white/5">
                      {countryData ? (
                        <span className="text-lg">{countryData.flag}</span>
                      ) : (
                        <span className="material-symbols-outlined text-[18px] text-primary">flag</span>
                      )}
                      <span className="text-sm font-medium">{profile?.country}</span>
                    </div>
                    <div className="w-1.5 h-1.5 rounded-full bg-outline-variant"></div>
                    <span className="text-sm">Joined {new Date(user?.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${isPremium ? 'bg-gradient-to-r from-primary/20 to-secondary/10 border-primary/30' : 'bg-white/[0.03] border-white/10'}`}>
                    <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                    <span className={`text-sm font-bold tracking-wide ${isPremium ? 'text-primary' : 'text-on-surface-variant'}`}>{isPremium ? 'PREMIUM' : 'FREE USER'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-semibold">Account Balance</span>
                    <span className="text-xl font-bold headline-font text-on-surface">
                      ${currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
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
                {stats?.eloRating}
              </h2>
              <p className="text-secondary text-sm mt-1 font-medium flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">
                  {(!stats?.eloRating < 1100) ? 'shield' : 
                   (stats.eloRating < 1300) ? 'military_tech' : 
                   (stats.eloRating < 1500) ? 'workspace_premium' : 'diamond'}
                </span>
                {(!stats?.eloRating < 1100) ? 'Silver Tier' : 
                 (stats.eloRating < 1300) ? 'Gold Tier' : 
                 (stats.eloRating < 1500) ? 'Platinum Tier' : 'Grandmaster Tier'}
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
                    strokeDashoffset={251.2 - (251.2 * (stats?.winRateNumber)) / 100}
                  ></circle>
                </svg>
                <span className="text-2xl font-bold headline-font">{stats?.winRate}</span>
              </div>
              <span className="text-xs uppercase tracking-widest text-on-surface-variant font-bold">Win Rate</span>
            </div>
            <div className="grid grid-cols-2 gap-x-12 gap-y-6 flex-1">
              <div className="space-y-1">
                <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest">Total Battles</span>
                <p className="text-2xl font-bold headline-font text-on-surface">{stats?.totalGames}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest">Wins</span>
                <p className="text-2xl font-bold headline-font text-on-surface">{stats?.wins}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest">Total Draws</span>
                <p className="text-2xl font-bold headline-font text-on-surface">{stats?.draws}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest">Losses</span>
                <p className="text-2xl font-bold headline-font text-on-surface">{stats?.losses}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Wallet & Premium Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Wallet Card */}
          <div className="relative overflow-hidden group p-8 rounded-2xl bg-surface-container-high/60 border border-white/5 hover:border-primary/20 transition-all">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-15 transition-opacity">
              <span className="material-symbols-outlined text-8xl text-primary">account_balance_wallet</span>
            </div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Wallet Balance</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold headline-font text-on-surface tracking-tighter mb-2">
                ${currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </h2>
              <p className="text-on-surface-variant text-xs mb-6">Virtual currency for premium features</p>
              <button
                id="btn-top-up"
                onClick={() => setIsTopUpModalOpen(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold text-sm shadow-lg hover:shadow-primary/20 active:scale-95 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">add</span>
                Top Up
              </button>
            </div>
          </div>

          {/* Premium Card */}
          <div className={`relative overflow-hidden group p-8 rounded-2xl border transition-all ${isPremium ? 'bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20' : 'bg-surface-container-high/60 border-white/5 hover:border-secondary/20'}`}>
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-15 transition-opacity">
              <span className="material-symbols-outlined text-8xl text-secondary">workspace_premium</span>
            </div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isPremium ? 'bg-primary/20' : 'bg-secondary/15'}`}>
                  <span className="text-xl">👑</span>
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Premium Status</span>
                {isPremium && (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/20 text-[10px] font-bold text-emerald-400 uppercase tracking-wider ml-auto">Active</span>
                )}
              </div>
              {isPremium ? (
                <>
                  <h2 className="text-3xl md:text-4xl font-extrabold headline-font text-primary tracking-tighter mb-2">Premium Member</h2>
                  <p className="text-on-surface-variant text-xs mb-6">
                    Active until <span className="text-primary font-semibold">{new Date(premiumExpiry).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  </p>
                  <button
                    id="btn-premium-info"
                    onClick={() => setIsPremiumModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-surface-container-highest border border-outline-variant text-on-surface font-bold text-sm hover:bg-surface-bright active:scale-95 transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-lg">info</span>
                    View Benefits
                  </button>
                </>
              ) : (
                <>
                  <h2 className="text-3xl md:text-4xl font-extrabold headline-font text-on-surface tracking-tighter mb-2">Free Plan</h2>
                  <p className="text-on-surface-variant text-xs mb-6">Unlock premium features starting at $4.99/mo</p>
                  <button
                    id="btn-upgrade"
                    onClick={() => setIsPremiumModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-br from-secondary to-secondary-container text-on-primary font-bold text-sm shadow-lg hover:shadow-secondary/20 active:scale-95 transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-lg">rocket_launch</span>
                    Upgrade Now
                  </button>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Match History CTA */}
        <section className="relative overflow-hidden p-8 rounded-2xl bg-surface-container-high/60 border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 group hover:border-primary/20 transition-all">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <span className="material-symbols-outlined text-8xl">history</span>
          </div>
          <div>
            <h3 className="text-2xl font-bold headline-font mb-1">Battle Records</h3>
            <p className="text-on-surface-variant text-sm">View your full match history, search opponents, and analyze your battles.</p>
          </div>
          <Link
            to="/match-history"
            className="flex-shrink-0 px-6 py-3 rounded-xl bg-primary/15 border border-primary/20 text-primary font-bold text-sm flex items-center gap-2 hover:bg-primary/25 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
            View History
          </Link>
        </section>
      </main>

      {/* Modals */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentData={profileData}
        onUpdate={refresh}
        onSave={updateProfileInfo}
        loading={updating}
      />

      <WalletTopUpModal
        isOpen={isTopUpModalOpen}
        onClose={() => { setIsTopUpModalOpen(false); refreshWallet(); }}
        currentBalance={currentBalance}
        onTopUp={onTopUp}
        loading={actionLoading}
      />

      <PremiumSubscribeModal
        isOpen={isPremiumModalOpen}
        onClose={() => { setIsPremiumModalOpen(false); refreshWallet(); }}
        currentBalance={currentBalance}
        isPremium={isPremium}
        premiumExpiry={premiumExpiry}
        onSubscribe={onSubscribe}
        loading={actionLoading}
      />
    </div>
  );
};

export default ProfileView;
