import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import ProfileService from './profileService';
import Header from '../../components/layout/Header';
import BottomDock from '../../components/layout/BottomDock';

const ProfileView = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [profileData, setProfileData] = useState(null);
  const [matchHistory, setMatchHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ username: '', country: '' });
  const [updating, setUpdating] = useState(false);
  
  const fileInputRef = useRef(null);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      console.log('Fetching all profile data...');
      const [profileRes, historyRes] = await Promise.all([
        ProfileService.getProfile(),
        ProfileService.getMatchHistory()
      ]);
      console.log('Profile Data Fetch Success:', { profileRes, historyRes });

      if (profileRes.success) {
        setProfileData(profileRes.data);
        setEditForm({
          username: profileRes.data.user.username,
          country: profileRes.data.profile.country
        });
      }

      if (historyRes.success) {
        setMatchHistory(historyRes.data);
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUpdating(true);
    try {
      const res = await ProfileService.uploadAvatar(file);
      if (res.success) {
        // Refresh data to show new avatar
        await fetchAllData();
      }
    } catch (error) {
      alert('Failed to upload avatar: ' + error.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateProfile = async () => {
    console.log('Initiating profile update with data:', editForm);
    setUpdating(true);
    try {
      const res = await ProfileService.updateProfile(editForm);
      console.log('Profile Update Success:', res);
      if (res.success) {
        setProfileData(res.data);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Profile Update Error:', error);
      alert('Failed to update profile: ' + (error.response?.data?.message || error.message));
    } finally {
      setUpdating(false);
    }
  };

  const getAvatarUrl = (url) => {
    if (!url) return "https://api.dicebear.com/7.x/avataaars/svg?seed=default";
    if (url.startsWith('http')) return url;
    // Map relative server path to full URL
    return `http://localhost:5001${url}`;
  };

  if (loading && !profileData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const { user: u, profile: p, statistics: s } = profileData || {};

  return (
    <div className="min-h-screen bg-surface text-on-surface font-body selection:bg-primary selection:text-on-primary overflow-x-hidden">
      <Header user={user} />

      <main className="pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto space-y-12">
        {/* Hidden File Input */}
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleFileChange} 
        />

        {/* Premium Profile Header */}
        <header className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary/20 blur-3xl opacity-30 pointer-events-none"></div>
          <div className="relative flex flex-col md:flex-row items-start md:items-end justify-between gap-8 p-8 rounded-2xl bg-surface-container-low/40 border border-white/5 backdrop-blur-2xl">
            <div className="flex flex-col md:flex-row items-start gap-8">
              {/* Large Avatar */}
              <div className="relative cursor-pointer" onClick={handleAvatarClick}>
                <div className={`w-32 h-32 md:w-40 md:h-40 rounded-3xl overflow-hidden border-4 border-primary/20 shadow-2xl transition-all ${updating ? 'opacity-50' : 'hover:border-primary'}`}>
                  <img 
                    alt="User" 
                    className="w-full h-full object-cover" 
                    src={getAvatarUrl(p?.avatarUrl)} 
                  />
                  {updating && (
                     <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                     </div>
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-primary text-on-primary px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                  LVL {Math.floor((s?.totalGames || 0) / 10) + 1}
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 rounded-3xl">
                   <span className="material-symbols-outlined text-white text-3xl">photo_camera</span>
                </div>
              </div>

              {/* User Details */}
              <div className="space-y-4">
                <div>
                  {isEditing ? (
                    <input 
                      className="text-4xl md:text-5xl font-extrabold headline-font bg-white/5 border border-primary/30 rounded-lg px-2 text-on-surface tracking-tight w-full max-w-md outline-none focus:border-primary"
                      value={editForm.username}
                      onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                    />
                  ) : (
                    <h1 className="text-4xl md:text-5xl font-extrabold headline-font text-on-surface tracking-tight">
                      {u?.username}
                    </h1>
                  )}
                  
                  <div className="flex items-center gap-3 mt-2 text-on-surface-variant">
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/5 border border-white/5">
                      <span className="material-symbols-outlined text-[18px] text-primary">flag</span>
                      {isEditing ? (
                        <input 
                          className="bg-transparent border-none text-sm font-medium outline-none text-on-surface p-0 w-24"
                          value={editForm.country}
                          onChange={(e) => setEditForm({...editForm, country: e.target.value})}
                        />
                      ) : (
                        <span className="text-sm font-medium">{p?.country}</span>
                      )}
                    </div>
                    <div className="w-1.5 h-1.5 rounded-full bg-outline-variant"></div>
                    <span className="text-sm">
                      {u?.joinedAt 
                        ? `Joined ${new Date(u.joinedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}` 
                        : 'New Member'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  {p?.isPremium && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-primary/20 to-primary-container/10 border border-primary/30">
                      <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                      <span className="text-sm font-bold text-primary tracking-wide">PREMIUM</span>
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-semibold">Account Balance</span>
                    <span className="text-xl font-bold headline-font text-on-surface">
                      ${p?.walletBalance?.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="w-full md:w-auto flex flex-col gap-2">
              {isEditing ? (
                <>
                  <button 
                    onClick={handleUpdateProfile}
                    disabled={updating}
                    className="w-full md:w-auto px-8 py-3 rounded-lg bg-primary text-on-primary font-bold headline-font flex items-center justify-center gap-2 hover:brightness-110 transition-all active:scale-95 disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined">save</span>
                    Save Changes
                  </button>
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="w-full md:w-auto px-8 py-3 rounded-lg bg-surface-container-high border border-outline-variant text-on-surface font-bold headline-font flex items-center justify-center gap-2 hover:bg-surface-bright transition-colors"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="w-full md:w-auto px-8 py-4 rounded-lg bg-surface-container-high border border-outline-variant text-on-surface font-bold headline-font flex items-center justify-center gap-2 hover:bg-surface-bright transition-colors active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined">edit</span>
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Stats Grid (Bento Style) */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Current Rating Card */}
          <div className="relative overflow-hidden group p-8 rounded-2xl bg-surface-container-high/60 border border-white/5 flex flex-col justify-between min-h-[220px]">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="material-symbols-outlined text-8xl">trending_up</span>
            </div>
            <span className="text-on-surface-variant text-sm font-semibold uppercase tracking-widest">Current Rating</span>
            <div>
              <h2 className="text-6xl font-extrabold headline-font text-primary tracking-tighter">{s?.eloRating}</h2>
              <p className="text-secondary text-sm mt-1 font-medium flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">arrow_upward</span>
                Global Rank: #1,204
              </p>
            </div>
          </div>

          {/* Battle Analytics Card */}
          <div className="md:col-span-2 relative p-8 rounded-2xl bg-surface-container-high/60 border border-white/5 flex flex-col md:flex-row gap-8 items-center justify-around">
            <div className="flex flex-col items-center gap-2">
              <div className="w-24 h-24 rounded-full border-4 border-primary/20 flex items-center justify-center relative">
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle className="text-white/5" cx="48" cy="48" fill="transparent" r="40" stroke="currentColor" strokeWidth="8"></circle>
                  <circle 
                    className="text-primary" 
                    cx="48" cy="48" fill="transparent" r="40" stroke="currentColor" strokeWidth="8"
                    strokeDasharray="251.2"
                    strokeDashoffset={251.2 - (251.2 * (s?.winRate || 0)) / 100}
                  ></circle>
                </svg>
                <span className="text-2xl font-bold headline-font">{s?.winRate}%</span>
              </div>
              <span className="text-xs uppercase tracking-widest text-on-surface-variant font-bold">Win Rate</span>
            </div>
            <div className="grid grid-cols-2 gap-x-12 gap-y-6 flex-1 text-center md:text-left">
              <div className="space-y-1">
                <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest">Total Battles</span>
                <p className="text-2xl font-bold headline-font text-on-surface">{s?.totalGames}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest">Victories</span>
                <p className="text-2xl font-bold headline-font text-on-surface">{s?.wins}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest">Total Draws</span>
                <p className="text-2xl font-bold headline-font text-on-surface">{s?.draws}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest">Losses</span>
                <p className="text-2xl font-bold headline-font text-on-surface">{s?.losses}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Match History Section */}
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 className="text-2xl font-bold headline-font">Match History</h3>
            <div className="flex items-center gap-3">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
                <input 
                  className="bg-surface-container-highest border-none rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/50 w-full md:w-64" 
                  placeholder="Search opponent..." 
                  type="text"
                />
              </div>
              <button className="p-2.5 rounded-xl bg-surface-container-highest text-on-surface-variant hover:text-primary transition-colors">
                <span className="material-symbols-outlined">filter_list</span>
              </button>
            </div>
          </div>
          <div className="overflow-x-auto rounded-2xl bg-surface-container-low/60 border border-white/5">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/5">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Match ID</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Opponent</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Result</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Rating Change</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Duration</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {matchHistory.length > 0 ? matchHistory.map((game) => {
                  const isPlayer1 = game.player1Id === u?.id;
                  const opponentName = isPlayer1 ? game.player2Name : game.player1Name;
                  const opponentAvatar = isPlayer1 ? game.player2Avatar : game.player1Avatar;
                  const isWinner = game.winnerId === u?.id;
                  const isDraw = !game.winnerId && game.status === 'COMPLETED';

                  return (
                    <tr key={game._id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-5 text-sm font-mono text-tertiary">#{game._id.slice(-7).toUpperCase()}</td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-surface-container-high border border-white/10 overflow-hidden text-xs flex items-center justify-center">
                            {opponentAvatar ? (
                              <img src={getAvatarUrl(opponentAvatar)} alt={opponentName} className="w-full h-full object-cover" />
                            ) : (
                               <span className="material-symbols-outlined text-primary">person</span>
                            )}
                          </div>
                          <span className="font-medium text-sm">{opponentName || 'AI Core'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        {isWinner ? (
                          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-widest border border-emerald-500/20">Victory</span>
                        ) : isDraw ? (
                          <span className="px-3 py-1 rounded-full bg-white/5 text-on-surface-variant text-[10px] font-bold uppercase tracking-widest border border-white/10">Draw</span>
                        ) : (
                          <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 text-[10px] font-bold uppercase tracking-widest border border-rose-500/20">Defeat</span>
                        )}
                      </td>
                      <td className={`px-6 py-5 font-bold text-sm ${isWinner ? 'text-emerald-400' : isDraw ? 'text-on-surface-variant' : 'text-rose-400'}`}>
                        {isWinner ? '+24' : isDraw ? '0' : '-18'}
                      </td>
                      <td className="px-6 py-5 text-sm text-on-surface-variant">
                        {game.startTime && game.endTime ? 
                           `${Math.floor((new Date(game.endTime) - new Date(game.startTime)) / 60000)}m ${Math.floor(((new Date(game.endTime) - new Date(game.startTime)) % 60000) / 1000)}s` 
                           : '--:--'}
                      </td>
                      <td className="px-6 py-5 text-sm text-on-surface-variant">{new Date(game.createdAt).toLocaleDateString()}</td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-10 text-center text-on-surface-variant italic">No matches played yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <BottomDock />
    </div>
  );
};

export default ProfileView;
