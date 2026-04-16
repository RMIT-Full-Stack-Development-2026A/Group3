import React from 'react';

const ProfileHeader = ({ 
  user, 
  profile, 
  stats, 
  isEditing, 
  editForm, 
  setEditForm, 
  updating, 
  onAvatarClick, 
  onEditToggle, 
  onSave,
  getAvatarUrl 
}) => {
  return (
    <header className="relative group">
      {/* Background Ambient Glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary/20 blur-3xl opacity-30 pointer-events-none"></div>
      
      <div className="relative flex flex-col md:flex-row items-start md:items-end justify-between gap-8 p-8 rounded-2xl bg-surface-container-low/40 border border-white/5 backdrop-blur-2xl">
        <div className="flex flex-col md:flex-row items-start gap-8">
          
          {/* Large Avatar */}
          <div className="relative cursor-pointer" onClick={onAvatarClick}>
            <div className={`w-32 h-32 md:w-40 md:h-40 rounded-3xl overflow-hidden border-4 border-primary/20 shadow-2xl transition-all ${updating ? 'opacity-50' : 'hover:border-primary'}`}>
              <img 
                alt="User" 
                className="w-full h-full object-cover" 
                src={getAvatarUrl(profile?.avatarUrl)} 
              />
              {updating && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            
            <div className="absolute -bottom-2 -right-2 bg-primary text-on-primary px-3 py-1 rounded-full text-xs font-bold shadow-lg">
              LVL {stats?.level || 1}
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
                  autoFocus
                />
              ) : (
                <h1 className="text-4xl md:text-5xl font-extrabold headline-font text-on-surface tracking-tight">
                  {user?.username}
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
                    <span className="text-sm font-medium">{profile?.country}</span>
                  )}
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-outline-variant"></div>
                <span className="text-sm">
                  {user?.joinedAt 
                    ? `Joined ${new Date(user.joinedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}` 
                    : 'New Member'}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {profile?.isPremium && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-primary/20 to-primary-container/10 border border-primary/30">
                  <span className="material-symbols-outlined text-primary fill-1" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                  <span className="text-sm font-bold text-primary tracking-wide">PREMIUM</span>
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-semibold">Account Balance</span>
                <span className="text-xl font-bold headline-font text-on-surface">
                  ${profile?.walletBalance?.toLocaleString()}
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
                onClick={onSave}
                disabled={updating}
                className="w-full md:w-auto px-8 py-3 rounded-lg bg-primary text-on-primary font-bold headline-font flex items-center justify-center gap-2 hover:brightness-110 transition-all active:scale-95 disabled:opacity-50"
              >
                <span className="material-symbols-outlined">save</span>
                Save Changes
              </button>
              <button 
                onClick={() => onEditToggle(false)}
                className="w-full md:w-auto px-8 py-3 rounded-lg bg-surface-container-high border border-outline-variant text-on-surface font-bold headline-font flex items-center justify-center gap-2 hover:bg-surface-bright transition-colors"
              >
                Cancel
              </button>
            </>
          ) : (
            <button 
              onClick={() => onEditToggle(true)}
              className="w-full md:w-auto px-8 py-4 rounded-lg bg-surface-container-high border border-outline-variant text-on-surface font-bold headline-font flex items-center justify-center gap-2 hover:bg-surface-bright transition-colors active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined">edit</span>
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default ProfileHeader;
