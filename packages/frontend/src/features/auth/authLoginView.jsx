import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './authHook.js';
import AuthInput from '../../components/auth/AuthInput.jsx';

const AuthLoginView = () => {
  const { login, loading, error } = useAuth();
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(formData); // Hook handles navigation on success
  };

  return (
    <div className="bg-surface font-body text-on-surface selection:bg-primary selection:text-on-primary overflow-hidden h-screen w-screen flex flex-col">
      {/* TopNavBar Shell */}
      <header className="w-full top-0 bg-transparent z-50">
        <div className="flex justify-between items-center w-full px-8 py-6 max-w-screen-2xl mx-auto">
          <div className="text-2xl font-bold bg-gradient-to-br from-indigo-300 to-purple-500 bg-clip-text text-transparent font-headline tracking-tight">
            TicTacToang
          </div>
          <div className="hidden md:flex gap-8 items-center font-headline tracking-tight">
            <span className="text-violet-100/70 hover:text-violet-100 transition-colors duration-300 cursor-pointer text-sm">Support</span>
            <Link to="/register" className="bg-transparent text-primary hover:text-primary-dim font-headline tracking-tight transition-colors duration-300 scale-95 active:opacity-80 transition-transform">
              Join Now
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="flex-1 relative flex items-center justify-center p-6 bg-surface">
        {/* Ambient Background Aesthetic */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-secondary-container/20 rounded-full blur-[160px]"></div>
        </div>

        {/* Login Modal */}
        <section className="relative z-10 w-full max-w-md">
          {/* Decorative Accent Element */}
          <div className="absolute -top-12 -right-8 w-24 h-24 bg-gradient-to-br from-primary to-primary-container rounded-lg rotate-12 opacity-50 blur-sm hidden sm:block"></div>
          
          <div className="bg-surface-container-highest/40 backdrop-blur-3xl rounded-lg p-10 border border-outline-variant/15 shadow-2xl shadow-indigo-950/50">
            <div className="mb-8 text-left">
              <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface mb-2">Welcome Back</h1>
              <p className="text-on-surface-variant font-body leading-relaxed">Enter your credentials to enter the multiverse.</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-error/10 border border-error/20 text-error text-sm rounded-lg text-center animate-shake">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <AuthInput 
                label="Username or Email"
                icon="person"
                placeholder="Enter your alias"
                value={formData.identifier}
                onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                required
                disabled={loading}
              />

              <AuthInput 
                label="Password"
                icon="lock"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                disabled={loading}
              />

              <div className="flex justify-end !mt-1">
                <a className="text-xs text-primary/70 hover:text-primary transition-colors" href="#">Forgot?</a>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-primary to-primary-container text-on-primary font-headline font-bold rounded-lg shadow-lg shadow-primary/10 hover:shadow-primary/30 transform transition-all active:scale-95 duration-200 disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Login'}
              </button>
            </form>

            <div className="mt-8 text-center text-sm">
              <p className="text-on-surface-variant font-body">
                Don't have an account? 
                <Link to="/register" className="text-primary font-semibold underline underline-offset-4 ml-1 hover:text-primary-dim transition-colors">
                  Register
                </Link>
              </p>
            </div>
          </div>
          
          {/* Bottom Modal Shadow/Reflection */}
          <div className="h-4 w-4/5 mx-auto bg-primary/20 blur-xl mt-4 rounded-full"></div>
        </section>

        {/* Decorative Card Overlap (Aetheris Aesthetic) */}
        <div className="hidden lg:block absolute -right-20 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none">
          <div className="w-80 h-96 bg-surface-container-high rounded-lg border border-outline-variant/10 rotate-6 flex flex-col items-center justify-center gap-4">
            <div className="w-20 h-20 rounded-full bg-surface-variant flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-outline">sports_esports</span>
            </div>
            <div className="w-40 h-4 bg-outline-variant/20 rounded"></div>
            <div className="w-32 h-4 bg-outline-variant/10 rounded"></div>
          </div>
        </div>
      </main>

      {/* Footer Shell */}
      <footer className="w-full py-8 bg-surface-container-lowest/80 border-t border-outline-variant/10 z-50">
        <div className="flex flex-col md:flex-row justify-between items-center px-12 max-w-7xl mx-auto">
          <div className="font-headline font-bold text-on-surface-variant/70 text-sm mb-4 md:mb-0">
            © 2024 Ethereal Core Gaming. All Rights Reserved.
          </div>
          <div className="flex gap-8 font-body text-xs text-on-surface-variant/50 leading-relaxed">
            <a className="hover:text-primary transition-colors cursor-pointer" href="#">Privacy Policy</a>
            <a className="hover:text-primary transition-colors cursor-pointer" href="#">Terms of Service</a>
            <a className="hover:text-primary transition-colors cursor-pointer" href="#">Cookie Settings</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AuthLoginView;
