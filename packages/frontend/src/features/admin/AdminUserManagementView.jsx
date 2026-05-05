import React, { useState } from 'react';
import { useAdminUsers } from './adminHook';

const AdminUserManagementView = () => {

  const { users, loading, error, toggleUserStatus, isToggling } = useAdminUsers();
  
  // Basic filtering state
  const [filter, setFilter] = useState('ALL'); 
  const [searchQuery, setSearchQuery] = useState('');

  // Filter logic
  const filteredUsers = users.filter(u => {
    const matchesFilter = filter === 'ALL' || (filter === 'ACTIVE' && u.isActive) || (filter === 'DEACTIVATED' && !u.isActive);
    const matchesSearch = 
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleToggle = async (userId, currentIsActive) => {
    await toggleUserStatus(userId, currentIsActive);
  };

  return (
    <div className="min-h-screen bg-background text-on-background font-body-md antialiased overflow-x-hidden">
      {/* Background Image */}
      <div 
        className="fixed inset-0 z-[-1] pointer-events-none opacity-40 bg-cover bg-center"
        style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDPwUEIEHZKpOAI8_4n75KICFn0gM3ezhvwVDeAfXbYaPm9S4cbCBz5U5r9SaeDhVwaEcsvOrKhqNUurUARqBaKBY-0ztDsQzc1lbNfz_CSnwL0b-fNemCSaJZfz1NcoOp9DwP0WChCXCg3oZptCv_rISxQ2jX0Vssp_gPHDbq_fkn93Qb4OKQS2HlmymbCbUvLwWxt9XcMptOZiWreaaxp1RbNBKEYevxNHgN08uNce45fACGLSsubJX2KWGqyuIOgiUTMc4roVGk')" }}
      ></div>
      <div className="fixed inset-0 z-[-1] bg-[radial-gradient(circle_at_top_center,rgba(206,193,255,0.15)_0%,transparent_70%)] pointer-events-none"></div>

      {/* Main Content Canvas */}
      <main className="max-w-7xl mx-auto pt-32 px-4 sm:px-6 lg:px-8 pb-32 relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="font-h1 text-[30px] font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-container">
            User Management
          </h1>
          <p className="font-body-md text-on-surface-variant max-w-2xl mx-auto">Manage platform users and their accounts</p>
        </div>

        {/* Controls Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <div className="relative w-full md:w-96">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">search</span>
            <input 
              className="w-full bg-surface-container-highest border-none text-on-surface rounded-full py-3 pl-12 pr-4 focus:ring-2 focus:ring-primary focus:outline-none placeholder:text-outline font-body-md transition-shadow" 
              placeholder="Search by username or email..." 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex bg-surface-container-high rounded-full p-1 border border-outline-variant/30">
            <button 
              onClick={() => setFilter('ALL')}
              className={`px-6 py-2 rounded-full font-body-md font-bold transition-colors ${filter === 'ALL' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              All
            </button>
            <button 
              onClick={() => setFilter('ACTIVE')}
              className={`px-6 py-2 rounded-full font-body-md font-bold transition-colors ${filter === 'ACTIVE' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              Active
            </button>
            <button 
              onClick={() => setFilter('DEACTIVATED')}
              className={`px-6 py-2 rounded-full font-body-md font-bold transition-colors ${filter === 'DEACTIVATED' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              Deactivated
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-[#28213e]/40 backdrop-blur-2xl rounded-xl border border-outline-variant/20 shadow-[0_0_20px_rgba(179,161,255,0.05)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-surface-container/50 border-b border-outline-variant/30">
                  <th className="py-4 px-6 font-label-caps text-[10px] font-extrabold text-on-surface-variant uppercase tracking-widest">User</th>
                  <th className="py-4 px-6 font-label-caps text-[10px] font-extrabold text-on-surface-variant uppercase tracking-widest">Email</th>
                  <th className="py-4 px-6 font-label-caps text-[10px] font-extrabold text-on-surface-variant uppercase tracking-widest">Country</th>
                  <th className="py-4 px-6 font-label-caps text-[10px] font-extrabold text-on-surface-variant uppercase tracking-widest">Premium</th>
                  <th className="py-4 px-6 font-label-caps text-[10px] font-extrabold text-on-surface-variant uppercase tracking-widest">Status</th>
                  <th className="py-4 px-6 font-label-caps text-[10px] font-extrabold text-on-surface-variant uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10 font-body-md">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="py-8 px-6 text-center text-on-surface-variant">Loading users...</td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="6" className="py-8 px-6 text-center text-error">{error}</td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 px-6 text-center text-on-surface-variant">No users found.</td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const isActive = u.isActive;
                    return (
                      <tr key={u.id} className="hover:bg-white/5 transition-colors group">
                        <td className="py-4 px-6 flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full bg-surface-bright overflow-hidden border border-outline-variant ${!isActive ? 'opacity-50' : ''}`}>
                            <img src={u.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                          </div>
                          <span className={`font-h2 text-[16px] font-bold text-on-surface transition-colors ${isActive ? 'group-hover:text-primary' : 'opacity-70'}`}>
                            {u.username}
                          </span>
                        </td>
                        <td className={`py-4 px-6 text-on-surface-variant ${!isActive ? 'opacity-70' : ''}`}>{u.email}</td>
                        <td className={`py-4 px-6 text-on-surface-variant ${!isActive ? 'opacity-70' : ''}`}>{u.country}</td>
                        <td className={`py-4 px-6 ${!isActive ? 'opacity-70' : ''}`}>
                          {u.isPremium ? (
                            <span className="inline-block px-2 py-1 rounded-full bg-secondary-container/50 text-secondary border border-secondary/30 font-label-caps text-[10px] font-extrabold">Premium</span>
                          ) : (
                            <span className="inline-block px-2 py-1 rounded-full bg-surface-variant text-on-surface-variant font-label-caps text-[10px] font-extrabold">Standard</span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          {isActive ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-900/30 text-emerald-400 border border-emerald-500/30 font-label-caps text-[10px] font-extrabold">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-variant text-outline border border-outline/30 font-label-caps text-[10px] font-extrabold">
                              <span className="w-1.5 h-1.5 rounded-full bg-outline"></span> deactivated
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button 
                            disabled={isToggling}
                            onClick={() => handleToggle(u.id, u.isActive)}
                            className={`px-4 py-1.5 rounded-lg font-bold text-xs transition-colors ${
                              isActive 
                                ? 'bg-error-container/20 text-error hover:bg-error hover:text-on-error border border-error/30' 
                                : 'bg-emerald-900/30 text-emerald-400 hover:bg-emerald-500 hover:text-white border border-emerald-500/30'
                            }`}
                          >
                            {isActive ? 'Deactivate' : 'Reactivate'}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          
          <div className="px-6 py-4 border-t border-outline-variant/20 flex justify-between items-center text-sm text-outline">
            <span>Showing {filteredUsers.length} users</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminUserManagementView;
