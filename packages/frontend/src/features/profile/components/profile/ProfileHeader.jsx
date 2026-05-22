import React from 'react';

const ProfileHeader = ({ user, profile, stats }) => {
  return (
    <div className="relative flex flex-col md:flex-row items-center md:items-end gap-8 p-8 rounded-3xl bg-surface-container-low/40 border border-white/5 backdrop-blur-2xl">
      <div className="relative">
        <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl overflow-hidden border-4 border-primary/20 shadow-2xl">
          <img 
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`} 
            alt="Avatar" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute -bottom-2 -right-2 bg-primary text-on-primary px-3 py-1 rounded-full text-xs font-bold shadow-lg">
          LVL {stats?.level || 1}
        </div>
      </div>
      
      <div className="flex-1 text-center md:text-left space-y-2">
        <h1 className="text-4xl md:text-5xl font-extrabold font-headline tracking-tight">{user?.username}</h1>
        <div className="flex items-center justify-center md:justify-start gap-3 text-on-surface-variant">
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm text-primary">flag</span>
            {profile?.country}
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-white/10"></span>
          <span>Joined {new Date(user?.joinedAt).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-center md:text-right">
          <p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant">Balance</p>
          <p className="text-2xl font-bold font-headline">${profile?.walletBalance?.toLocaleString()}</p>
        </div>
        {profile?.isPremium && (
          <div className="px-3 py-1 bg-primary/20 text-primary border border-primary/30 rounded-lg text-xs font-bold tracking-widest">
            PREMIUM
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileHeader;
