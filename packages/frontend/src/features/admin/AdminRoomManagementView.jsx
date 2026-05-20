import React, { useState, useEffect } from 'react';
import { useAdminRooms } from './adminHook';

const AdminRoomManagementView = () => {
  const [filter, setFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { rooms, loading, error, isClosing, pagination, fetchRooms, closeRoom } = useAdminRooms();

  useEffect(() => {
    let statusParam = 'all';
    if (filter === 'ACTIVE') statusParam = 'PLAYING';
    if (filter === 'WAITING') statusParam = 'WAITING';

    const timeoutId = setTimeout(() => {
      fetchRooms({
        search: searchQuery,
        status: statusParam,
        limit: 20
      });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [filter, searchQuery, fetchRooms]);

  const handleCloseRoom = async (roomId) => {
    if (window.confirm('Are you sure you want to force terminate this room?')) {
      await closeRoom(roomId, 'Admin terminated');
    }
  };

  const getActiveDuration = (startTime) => {
    if (!startTime) return 'Unknown';
    const start = new Date(startTime);
    const now = new Date();
    const diffMins = Math.floor((now - start) / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `Active for ${diffMins} mins`;
    return `Active for ${Math.floor(diffMins/60)} hours`;
  };

  return (
    <div className="min-h-screen bg-background text-on-background font-body-md antialiased overflow-x-hidden hero-gradient">
      {/* Decorative gradient overlay */}
      <div 
        className="fixed inset-0 z-[-1] pointer-events-none opacity-40 bg-cover bg-center"
        style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDPwUEIEHZKpOAI8_4n75KICFn0gM3ezhvwVDeAfXbYaPm9S4cbCBz5U5r9SaeDhVwaEcsvOrKhqNUurUARqBaKBY-0ztDsQzc1lbNfz_CSnwL0b-fNemCSaJZfz1NcoOp9DwP0WChCXCg3oZptCv_rISxQ2jX0Vssp_gPHDbq_fkn93Qb4OKQS2HlmymbCbUvLwWxt9XcMptOZiWreaaxp1RbNBKEYevxNHgN08uNce45fACGLSsubJX2KWGqyuIOgiUTMc4roVGk')" }}
      ></div>
      <div className="fixed inset-0 z-[-1] bg-[radial-gradient(circle_at_top_center,rgba(179,161,255,0.15)_0%,rgba(21,16,36,1)_70%)] pointer-events-none"></div>

      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 pt-24 md:pt-28 pb-32 md:pb-12 relative z-10 transition-all">
        {/* Header Section */}
        <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="font-h1 text-[30px] font-extrabold text-on-surface">Room Management</h1>
            <p className="font-body-md text-[14px] text-on-surface-variant mt-2">Monitor and manage active game sessions.</p>
          </div>
          
          {/* Quick Actions / Filters */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            {/* Search Bar */}
            <div className="relative w-full sm:w-64">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none">search</span>
              <input 
                className="w-full bg-surface-container-highest border-none text-on-surface rounded-full py-2 pl-12 pr-4 focus:ring-1 focus:ring-primary outline-none text-sm transition-all focus:w-full sm:focus:w-72" 
                placeholder="Search rooms..." 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="bg-surface-container-high rounded-full p-1 flex items-center border border-outline-variant/20 w-full sm:w-auto justify-between sm:justify-start">
              <button 
                onClick={() => setFilter('ALL')}
                className={`px-4 py-1.5 rounded-full font-label-caps text-[10px] font-extrabold uppercase tracking-widest transition-all ${filter === 'ALL' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                All
              </button>
              <button 
                onClick={() => setFilter('ACTIVE')}
                className={`px-4 py-1.5 rounded-full font-label-caps text-[10px] font-extrabold uppercase tracking-widest transition-all ${filter === 'ACTIVE' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                Active
              </button>
              <button 
                onClick={() => setFilter('WAITING')}
                className={`px-4 py-1.5 rounded-full font-label-caps text-[10px] font-extrabold uppercase tracking-widest transition-all ${filter === 'WAITING' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                Waiting
              </button>
            </div>
          </div>
        </header>

        {/* Main Glass Panel Container (Table) */}
        <div className="bg-[#b3a1ff]/5 backdrop-blur-3xl border-t border-l border-white/10 rounded-xl overflow-hidden shadow-2xl relative">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary-container/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-white/10 bg-surface-container-low/50">
                  <th className="px-6 py-4 font-label-caps text-[10px] uppercase font-extrabold text-on-surface-variant tracking-wider">Room Code</th>
                  <th className="px-6 py-4 font-label-caps text-[10px] uppercase font-extrabold text-on-surface-variant tracking-wider">Active Duration</th>
                  <th className="px-6 py-4 font-label-caps text-[10px] uppercase font-extrabold text-on-surface-variant tracking-wider">Host (P1)</th>
                  <th className="px-6 py-4 font-label-caps text-[10px] uppercase font-extrabold text-on-surface-variant tracking-wider">Challenger (P2)</th>
                  <th className="px-6 py-4 font-label-caps text-[10px] uppercase font-extrabold text-on-surface-variant tracking-wider">Status</th>
                  <th className="px-6 py-4 font-label-caps text-[10px] uppercase font-extrabold text-on-surface-variant tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="font-body-md text-sm text-on-surface divide-y divide-white/10">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-on-surface-variant">Loading rooms...</td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-error">{error}</td>
                  </tr>
                ) : rooms.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-on-surface-variant">No rooms found.</td>
                  </tr>
                ) : (
                  rooms.map((room) => {
                    const isClosed = room.status === 'CLOSED';
                    return (
                      <tr key={room.id} className={`hover:bg-white/5 transition-colors group ${isClosed ? 'opacity-60' : ''}`}>
                        <td className="px-6 py-4 align-middle">
                          <span className={`bg-surface-container-highest/80 border border-outline-variant/40 px-2 py-1 rounded-md font-mono text-xs font-bold shadow-inner ${isClosed ? 'text-outline' : 'text-primary'}`}>
                            {room.roomCode}
                          </span>
                        </td>
                        <td className="px-6 py-4 align-middle text-on-surface-variant">
                          {isClosed ? 'Ended' : getActiveDuration(room.startTime)}
                        </td>
                        <td className="px-6 py-4 align-middle">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full bg-surface-bright overflow-hidden border border-outline-variant/50 ${isClosed ? 'grayscale' : ''}`}>
                              <div className="w-full h-full bg-secondary-container flex items-center justify-center text-on-secondary font-bold text-xs uppercase">
                                {room.player1Name.substring(0, 2)}
                              </div>
                            </div>
                            <span className={`font-semibold transition-colors ${isClosed ? 'text-outline group-hover:text-on-surface' : 'text-on-surface group-hover:text-primary'}`}>
                              {room.player1Name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 align-middle">
                          {room.status === 'WAITING' ? (
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container/30 border border-white/5 animate-[pulse_3s_cubic-bezier(0.4,0,0.6,1)_infinite]">
                              <span className="material-symbols-outlined text-[#14b8a6] text-sm animate-spin" style={{ animationDuration: '3s' }}>hourglass_empty</span>
                              <span className="text-[#14b8a6] text-xs font-medium italic opacity-80">Awaiting Challenger...</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full bg-surface-bright overflow-hidden border border-outline-variant/50 ${isClosed ? 'grayscale' : ''}`}>
                                <div className="w-full h-full bg-tertiary-container flex items-center justify-center text-on-tertiary font-bold text-xs uppercase">
                                  {room.player2Name.substring(0, 2)}
                                </div>
                              </div>
                              <span className={`font-medium ${isClosed ? 'text-outline' : 'text-on-surface'}`}>
                                {room.player2Name}
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 align-middle">
                          {room.status === 'PLAYING' ? (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#f59e0b]/10 border border-[#f59e0b]/30 text-[#fcd34d] font-label-caps text-[10px] uppercase shadow-[0_0_10px_rgba(245,158,11,0.15)]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] animate-pulse"></span>
                              PLAYING
                            </div>
                          ) : room.status === 'WAITING' ? (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#14b8a6]/10 border border-[#14b8a6]/30 text-[#5eead4] font-label-caps text-[10px] uppercase shadow-[0_0_10px_rgba(20,184,166,0.15)]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#14b8a6]"></span>
                              WAITING
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-variant border border-outline-variant/30 text-outline font-label-caps text-[10px] uppercase">
                              <span className="w-1.5 h-1.5 rounded-full bg-outline"></span>
                              CLOSED
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 align-middle text-right">
                          <div className="flex justify-end gap-2">
                            {isClosed ? (
                              <button className="bg-outline/10 text-outline border border-outline/30 rounded-lg px-3 py-1 text-xs font-bold cursor-not-allowed opacity-50 flex items-center gap-1" disabled>
                                <span className="material-symbols-outlined text-sm">block</span> Terminated
                              </button>
                            ) : (
                              <button 
                                onClick={() => handleCloseRoom(room.id)}
                                disabled={isClosing}
                                className="bg-error/10 hover:bg-error/20 text-error border border-error/30 rounded-lg px-3 py-1 text-xs font-bold transition-all flex items-center gap-1 backdrop-blur-sm disabled:opacity-50"
                                title="Force Terminate"
                              >
                                <span className="material-symbols-outlined text-sm">block</span> Force Terminate
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Footer */}
          {pagination && pagination.totalItems > 0 && (
            <div className="px-6 py-4 border-t border-white/10 bg-surface-container-low/30 flex items-center justify-between">
              <span className="text-xs text-on-surface-variant">
                Showing page {pagination.page} of {pagination.totalPages} ({pagination.totalItems} entries)
              </span>
              <div className="flex gap-1">
                <button 
                  disabled={!pagination.hasPreviousPage}
                  onClick={() => fetchRooms({ search: searchQuery, status: filter === 'ALL' ? 'all' : filter, page: pagination.page - 1 })}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-outline hover:bg-white/5 transition-colors disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-sm">chevron_left</span>
                </button>
                <button className="w-8 h-8 rounded-full flex items-center justify-center bg-primary text-on-primary font-bold text-xs">
                  {pagination.page}
                </button>
                <button 
                  disabled={!pagination.hasNextPage}
                  onClick={() => fetchRooms({ search: searchQuery, status: filter === 'ALL' ? 'all' : filter, page: pagination.page + 1 })}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface hover:bg-white/5 transition-colors disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminRoomManagementView;
