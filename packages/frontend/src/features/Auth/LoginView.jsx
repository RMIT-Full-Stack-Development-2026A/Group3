import React from 'react';
import { useLogin } from './authHooks';
import { Link } from 'react-router-dom';

export default function LoginView() {
  const { formData, errors, message, isSuccess, isLoading, handleChange, handleSubmit } = useLogin();

  return (
    <main className="flex-1 relative flex items-center justify-center p-6 min-h-[calc(100vh-80px)]">
      {/* Ambient Background Aesthetic */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-125 h-125 bg-secondary-container/20 rounded-full blur-[160px]"></div>
      </div>

      {/* Login Modal */}
      <section className="relative z-10 w-full max-w-md">
        {/* Decorative Accent Element */}
        <div className="absolute -top-12 -right-8 w-24 h-24 bg-linear-to-br from-primary to-primary-container rounded-lg rotate-12 opacity-50 blur-sm hidden sm:block"></div>
        
        <div className="glass-panel rounded-2xl p-10 border border-outline-variant/15 shadow-2xl shadow-indigo-950/50">
          <div className="mb-8">
            <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface mb-2">Welcome Back</h1>
            <p className="text-on-surface-variant font-body leading-relaxed text-sm">Enter your credentials to enter the multiverse.</p>
          </div>

          {message && (
            <div className={`mb-6 rounded-xl px-4 py-3 text-sm font-medium animate-in fade-in slide-in-from-top-2 ${isSuccess ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"}`} role="alert">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">{isSuccess ? 'check_circle' : 'error'}</span>
                {message}
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Username/Email Field */}
            <div className="space-y-2 group">
              <label className="block text-xs font-bold uppercase tracking-widest text-primary/80 ml-1">Username or Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline group-focus-within:text-primary transition-colors">
                  <span className="material-symbols-outlined text-[20px]">person</span>
                </div>
                <input 
                  name="identifier"
                  value={formData.identifier}
                  onChange={handleChange}
                  className={`w-full bg-surface-container-highest/60 border-0 border-b-2 py-4 pl-12 pr-4 rounded-xl focus:ring-0 focus:bg-surface-container-highest transition-all duration-300 text-on-surface placeholder:text-outline/50 font-medium ${errors.identifier ? 'border-rose-500/50' : 'border-outline-variant/30 focus:border-primary'}`}
                  placeholder="Enter your alias" 
                  type="text"
                  required
                />
              </div>
              {errors.identifier && <p className="text-[10px] text-rose-400 font-bold uppercase tracking-wider ml-1">{errors.identifier}</p>}
            </div>

            {/* Password Field */}
            <div className="space-y-2 group">
              <div className="flex justify-between items-center ml-1">
                <label className="block text-xs font-bold uppercase tracking-widest text-primary/80">Password</label>
                <Link to="/forgot-password" title="Coming soon!" className="text-[10px] font-bold uppercase tracking-wider text-primary/60 hover:text-primary transition-colors">Forgot?</Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline group-focus-within:text-primary transition-colors">
                  <span className="material-symbols-outlined text-[20px]">lock</span>
                </div>
                <input 
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full bg-surface-container-highest/60 border-0 border-b-2 py-4 pl-12 pr-4 rounded-xl focus:ring-0 focus:bg-surface-container-highest transition-all duration-300 text-on-surface placeholder:text-outline/50 font-medium ${errors.password ? 'border-rose-500/50' : 'border-outline-variant/30 focus:border-primary'}`}
                  placeholder="••••••••" 
                  type="password"
                  required
                />
              </div>
              {errors.password && <p className="text-[10px] text-rose-400 font-bold uppercase tracking-wider ml-1">{errors.password}</p>}
            </div>

            {/* Login Button */}
            <button 
              className="w-full py-4 bg-linear-to-r from-primary to-primary-container text-on-primary font-headline font-extrabold text-lg rounded-xl shadow-lg shadow-primary/10 hover:shadow-primary/30 transform transition-all active:scale-[0.98] duration-200 mt-4 disabled:opacity-60 disabled:cursor-not-allowed" 
              type="submit"
              disabled={isLoading}
              aria-busy={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-on-surface-variant font-body text-sm">
              Don't have an account? 
              <Link to="/register" className="text-primary font-bold underline underline-offset-4 ml-1 hover:text-primary-dim transition-colors">Register</Link>
            </p>
          </div>
        </div>

        {/* Bottom Modal Shadow/Reflection */}
        <div className="h-4 w-4/5 mx-auto bg-primary/20 blur-xl mt-4 rounded-full"></div>
      </section>

      {/* Decorative Card Overlap (Desktop Only) */}
      <div className="hidden lg:block absolute -right-20 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none">
        <div className="w-80 h-96 bg-surface-container-high rounded-2xl border border-outline-variant/10 rotate-6 flex flex-col items-center justify-center gap-4">
          <div className="w-20 h-20 rounded-full bg-surface-variant flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl text-outline">sports_esports</span>
          </div>
          <div className="w-40 h-4 bg-outline-variant/20 rounded"></div>
          <div className="w-32 h-4 bg-outline-variant/10 rounded"></div>
        </div>
      </div>
    </main>
  );
}
