import React from 'react';

import { Link } from 'react-router-dom';
import { useAdminUsers } from './adminHook';

const AdminDashboardView = () => {
  const { users, loading } = useAdminUsers();

  return (
    <div className="min-h-screen bg-background text-on-background font-body-md antialiased overflow-x-hidden">
      {/* Global Background Image */}
      <div 
        className="fixed inset-0 z-[-1] opacity-40 mix-blend-screen pointer-events-none bg-cover bg-center" 
        style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD1NfDHjqN4M8qLlJ_XRNQsvSOMtSeK9mbOWcUJ8njYbKkfVim7bVIH2yZ4CjjEOmbMg-KWt88f9ft9yHDZ1lKzlwhxTMEXQYpCf1f_W8zDnCjhvA07Mj1h8u1T5bkH-ZTeFCn7rV4gbndjeG_oNyXnJnmEquTIDj11lzLmxlKpD1kMtzJSwZ4m4DcDI_oXeuWTit-e2CVoZl0KjufV65vnqjKNKIGtMAq4zu4ZR09dz58lY9pYFJB9wsdj8seFAJmg7YU-DlMxYvw')" }}
      ></div>
      
      {/* Hero Gradient Overlay */}
      <div className="fixed inset-0 z-[-1] bg-[radial-gradient(circle_at_top_center,rgba(84,64,111,0.4)_0%,rgba(21,16,36,1)_70%)] pointer-events-none"></div>

      {/* Main Layout Grid */}
      <main className="py-24 px-8 max-w-[1024px] mx-auto min-h-screen flex flex-col justify-center gap-8 relative z-10 w-full">
        {/* Top Management Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          {/* User Management Card */}
          <div className="bg-[linear-gradient(135deg,rgba(84,64,111,0.6)_0%,rgba(34,28,49,0.8)_100%)] backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 flex flex-col gap-6 relative overflow-hidden group shadow-[0_0_20px_rgba(179,161,255,0.15)]">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none group-hover:bg-primary/20 transition-colors duration-500"></div>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-surface-container-high border border-white/5 flex items-center justify-center shadow-inner">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 0" }}>group</span>
              </div>
              <h2 className="font-h2 text-[18px] font-bold text-on-surface">User Management</h2>
            </div>
            <p className="text-on-surface-variant font-body-md max-w-sm">
              Manage player accounts, handle suspensions
            </p>
            <div className="mt-auto pt-4">
              <Link to="/admin/users" className="bg-primary text-on-primary font-body-md font-bold px-6 py-3 rounded-full hover:bg-primary-fixed-dim transition-colors duration-200 active:scale-95 shadow-lg flex items-center justify-center gap-2 w-max">
                View Users
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>
          </div>

          {/* Room Management Card */}
          <div className="bg-[linear-gradient(135deg,rgba(84,64,111,0.6)_0%,rgba(34,28,49,0.8)_100%)] backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 flex flex-col gap-6 relative overflow-hidden group shadow-[0_0_20px_rgba(179,161,255,0.15)]">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl pointer-events-none group-hover:bg-secondary/20 transition-colors duration-500"></div>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-surface-container-high border border-white/5 flex items-center justify-center shadow-inner">
                <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 0" }}>meeting_room</span>
              </div>
              <h2 className="font-h2 text-[18px] font-bold text-on-surface">Room Management</h2>
            </div>
            <p className="text-on-surface-variant font-body-md max-w-sm">
              Monitor active game sessions
            </p>
            <div className="mt-auto pt-4">
              <Link to="/admin/rooms" className="bg-primary text-on-primary font-body-md font-bold px-6 py-3 rounded-full hover:bg-primary-fixed-dim transition-colors duration-200 active:scale-95 shadow-lg flex items-center justify-center gap-2 w-max">
                View Rooms
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Platform Overview Section */}
        <div className="mt-8 flex flex-col gap-6 w-full">
          <h3 className="font-h2 text-[18px] font-bold text-on-surface px-2">Platform Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Total Users Stat */}
            <div className="bg-surface-container-high/80 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6 flex flex-col gap-2 hover:bg-surface-container-highest transition-colors duration-300 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none"></div>
              <div className="flex justify-between items-start">
                <span className="font-label-caps text-[10px] font-extrabold text-on-surface-variant uppercase tracking-widest">Total Users</span>
              </div>
              <div className="font-display text-[32px] font-bold text-on-surface mt-2 tracking-tight">
                {loading ? '...' : users.length}
              </div>
            </div>

            {/* Active Rooms Stat */}
            <div className="bg-surface-container-high/80 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6 flex flex-col gap-2 hover:bg-surface-container-highest transition-colors duration-300 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent pointer-events-none"></div>
              <div className="flex justify-between items-start">
                <span className="font-label-caps text-[10px] font-extrabold text-on-surface-variant uppercase tracking-widest">Active Rooms</span>
              </div>
              <div className="font-display text-[32px] font-bold text-on-surface mt-2 tracking-tight">142</div>
            </div>
          </div>
        </div>
      </main>

    </div>
  );
};

export default AdminDashboardView;
