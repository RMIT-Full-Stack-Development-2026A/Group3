import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../app/store/authStore';
import { getAvatarUrl } from '../../../shared/utils/avatarUtil';

const Header = ({ user }) => {
  const navigate = useNavigate();
  const logout = useAuthStore(state => state.logout);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="fixed top-0 w-full z-50 flex justify-between items-center px-8 py-4 bg-slate-950/40 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(16,11,31,0.4)]">
      <div className="flex items-center gap-8">
        <Link to="/dashboard">
          <h1 className="text-2xl font-bold bg-gradient-to-br from-indigo-300 to-purple-500 bg-clip-text text-transparent font-headline tracking-tight hover:brightness-110 transition-all">
            TicTacToang
          </h1>
        </Link>
      </div>
      
      <div className="flex items-center gap-4">
        <Link to="/profile" className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/30 hover:border-primary transition-colors active:scale-95 block">
          <img 
            alt="User Avatar" 
            className="w-full h-full object-cover" 
            src={getAvatarUrl(user?.avatarUrl, 100)} 
          />
        </Link>
        
        <button className="px-5 py-2 bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold rounded-lg hover:shadow-[0_0_15px_rgba(179,161,255,0.3)] transition-all active:scale-95">
          Subscription
        </button>
        
        <button 
          onClick={handleLogout}
          className="p-2 text-slate-400 hover:text-error transition-colors"
        >
          <span className="material-symbols-outlined">logout</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
