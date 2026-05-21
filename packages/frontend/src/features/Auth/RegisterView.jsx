import React, { useState, useRef, useEffect } from "react";
import { useRegister } from "./authHooks";
import { Link } from "react-router-dom";
import { countries } from "../../shared/utils/countries";

export default function RegisterView() {
  const { formData, errors, message, isSuccess, isLoading, handleChange, handleSubmit } = useRegister();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCountries = countries.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCountrySelect = (c) => {
    // Manually trigger handleChange for the country field
    const e = { target: { name: 'country', value: c.name } };
    handleChange(e);
    setIsDropdownOpen(false);
    setSearchTerm('');
  };

  const selectedCountryObj = countries.find(c => c.name === formData.country);

  return (
    <main className="flex-1 relative flex items-center justify-center p-6 min-h-[calc(100vh-80px)]">
      {/* Ambient Background Aesthetic */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-125 h-125 bg-secondary-container/20 rounded-full blur-[160px]"></div>
      </div>

      <section className="relative z-10 w-full max-w-lg">
        {/* Decorative Accent Element */}
        <div className="absolute -top-12 -right-8 w-24 h-24 bg-linear-to-br from-primary to-primary-container rounded-lg rotate-12 opacity-50 blur-sm hidden sm:block"></div>
        
        <div className="glass-panel rounded-2xl p-8 md:p-12 border border-outline-variant/15 shadow-2xl shadow-indigo-950/50">
          <header className="mb-10">
            <h1 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface mb-2">Create Account</h1>
            <p className="text-on-surface-variant text-sm font-body">Join the multiverse of competitive Tic-Tac-Toang.</p>
          </header>

          {message && (
            <div className={`mb-6 rounded-xl px-4 py-3 text-sm font-medium animate-in fade-in slide-in-from-top-2 ${isSuccess ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"}`} role="alert">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">{isSuccess ? 'check_circle' : 'error'}</span>
                {message}
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Username */}
            <div className="space-y-2 group">
              <label className="block text-xs font-bold uppercase tracking-widest text-primary/80 ml-1">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline group-focus-within:text-primary transition-colors">
                  <span className="material-symbols-outlined text-[20px]">person</span>
                </div>
                <input 
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`w-full bg-surface-container-highest/60 border-0 border-b-2 py-4 pl-12 pr-4 rounded-xl focus:ring-0 focus:bg-surface-container-highest transition-all duration-300 text-on-surface placeholder:text-outline/50 font-medium ${errors.username ? 'border-rose-500/50' : 'border-outline-variant/30 focus:border-primary'}`}
                  placeholder="LegendaryPlayer123" 
                  type="text"
                  required
                />
              </div>
              {errors.username && <p className="text-[10px] text-rose-400 font-bold uppercase tracking-wider ml-1">{errors.username}</p>}
            </div>

            {/* Email */}
            <div className="space-y-2 group">
              <label className="block text-xs font-bold uppercase tracking-widest text-primary/80 ml-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline group-focus-within:text-primary transition-colors">
                  <span className="material-symbols-outlined text-[20px]">mail</span>
                </div>
                <input 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full bg-surface-container-highest/60 border-0 border-b-2 py-4 pl-12 pr-4 rounded-xl focus:ring-0 focus:bg-surface-container-highest transition-all duration-300 text-on-surface placeholder:text-outline/50 font-medium ${errors.email ? 'border-rose-500/50' : 'border-outline-variant/30 focus:border-primary'}`}
                  placeholder="player@ethereal.core" 
                  type="email"
                  required
                />
              </div>
              {errors.email && <p className="text-[10px] text-rose-400 font-bold uppercase tracking-wider ml-1">{errors.email}</p>}
            </div>

            {/* Region (Country Selector) */}
            <div className="space-y-2 group" ref={dropdownRef}>
              <label className="block text-xs font-bold uppercase tracking-widest text-primary/80 ml-1">Region</label>
              <div className="relative">
                <div 
                  className={`flex items-center justify-between bg-surface-container-highest/60 rounded-xl px-4 py-4 border-b-2 transition-all cursor-pointer ${isDropdownOpen ? 'border-primary ring-2 ring-primary/20' : 'border-outline-variant/30 hover:border-primary/50'}`}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <div className="flex items-center">
                    <span className={`material-symbols-outlined mr-3 text-lg transition-colors ${isDropdownOpen ? 'text-primary' : 'text-outline'}`}>public</span>
                    <span className={formData.country ? 'text-on-surface font-medium' : 'text-outline/50'}>
                      {formData.country || 'Select your region'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {selectedCountryObj && <span className="text-xl">{selectedCountryObj.flag}</span>}
                    <span className={`material-symbols-outlined transition-transform duration-300 ${isDropdownOpen ? 'rotate-180 text-primary' : 'text-outline'}`}>expand_more</span>
                  </div>
                </div>

                {isDropdownOpen && (
                  <div className="absolute bottom-full mb-2 left-0 w-full bg-surface-container-high backdrop-blur-xl border border-outline-variant/20 rounded-xl overflow-hidden z-100 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <div className="p-3 border-b border-outline-variant/10">
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">search</span>
                        <input 
                          autoFocus
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full bg-surface-container-low border-none rounded-lg pl-9 pr-4 py-2 text-sm text-on-surface outline-none focus:ring-1 focus:ring-primary/30"
                          placeholder="Search region..."
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>
                    <div className="max-h-75 overflow-y-auto custom-scrollbar py-2">
                      {filteredCountries.length > 0 ? (
                        filteredCountries.map((c) => (
                          <div 
                            key={c.code}
                            onClick={() => handleCountrySelect(c)}
                            className={`flex items-center gap-3 px-5 py-3 hover:bg-primary/10 cursor-pointer transition-colors ${formData.country === c.name ? 'bg-primary/20 text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
                          >
                            <span className="text-xl">{c.flag}</span>
                            <span className="text-sm font-medium">{c.name}</span>
                            {formData.country === c.name && <span className="material-symbols-outlined ml-auto text-sm">check</span>}
                          </div>
                        ))
                      ) : (
                        <div className="px-5 py-4 text-center text-xs text-outline italic">No regions found.</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              {errors.country && <p className="text-[10px] text-rose-400 font-bold uppercase tracking-wider ml-1">{errors.country}</p>}
            </div>

            {/* Password Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 group">
                <label className="block text-xs font-bold uppercase tracking-widest text-primary/80 ml-1">Password</label>
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
              </div>
              <div className="space-y-2 group">
                <label className="block text-xs font-bold uppercase tracking-widest text-primary/80 ml-1">Confirm</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline group-focus-within:text-primary transition-colors">
                    <span className="material-symbols-outlined text-[20px]">verified_user</span>
                  </div>
                  <input 
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full bg-surface-container-highest/60 border-0 border-b-2 py-4 pl-12 pr-4 rounded-xl focus:ring-0 focus:bg-surface-container-highest transition-all duration-300 text-on-surface placeholder:text-outline/50 font-medium ${errors.confirmPassword ? 'border-rose-500/50' : 'border-outline-variant/30 focus:border-primary'}`}
                    placeholder="••••••••" 
                    type="password"
                    required
                  />
                </div>
              </div>
            </div>
            {errors.password && <p className="text-[10px] text-rose-400 font-bold uppercase tracking-wider ml-1">{errors.password}</p>}
            {errors.confirmPassword && <p className="text-[10px] text-rose-400 font-bold uppercase tracking-wider ml-1">{errors.confirmPassword}</p>}

            <div className="pt-4">
              <button 
                className="w-full py-4 rounded-xl bg-linear-to-br from-primary to-primary-container text-on-primary font-headline font-extrabold text-lg shadow-[0_0_20px_rgba(179,161,255,0.3)] hover:shadow-[0_0_30px_rgba(179,161,255,0.5)] transition-all transform active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed" 
                type="submit"
                disabled={isLoading}
                aria-busy={isLoading}
              >
                {isLoading ? 'Registering...' : 'Register Account'}
              </button>
            </div>
            <p className="text-center text-on-surface-variant text-[11px] mt-6 leading-relaxed">
              By registering, you agree to our 
              <a className="text-primary hover:underline mx-1 font-bold" href="#">Terms of Service</a> 
              and 
              <a className="text-primary hover:underline mx-1 font-bold" href="#">Privacy Policy</a>.
            </p>
          </form>

          <div className="mt-8 text-center pt-6 border-t border-outline-variant/10">
            <p className="text-on-surface-variant font-body text-sm">
              Already have an account? 
              <Link to="/login" className="text-primary font-bold underline underline-offset-4 ml-1 hover:text-primary-dim transition-colors">Sign In</Link>
            </p>
          </div>
        </div>

        {/* Bottom Modal Shadow/Reflection */}
        <div className="h-4 w-4/5 mx-auto bg-primary/20 blur-xl mt-4 rounded-full"></div>
      </section>
    </main>
  );
}
