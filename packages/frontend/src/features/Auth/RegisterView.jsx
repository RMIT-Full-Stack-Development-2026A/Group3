import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import {
  User,
  EnvelopeSimple,
  Globe,
  LockKey,
  ShieldCheck,
  MagnifyingGlass,
  CaretDown,
  Check,
  ArrowRight,
} from "@phosphor-icons/react";
import { useRegister } from "./authHooks";
import { countries } from "../../shared/utils/countries";
import AuthBrandPanel from "../../shared/components/auth/AuthBrandPanel";

export default function RegisterView() {
  const { formData, errors, message, isSuccess, isLoading, handleChange, handleSubmit } = useRegister();
  const prefersReducedMotion = useReducedMotion();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const closeDropdown = () => {
    setIsDropdownOpen(false);
    setSearchTerm('');
    triggerRef.current?.focus();
  };

  const filteredCountries = countries.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCountrySelect = (c) => {
    handleChange({ target: { name: 'country', value: c.name } });
    closeDropdown();
  };

  const selectedCountryObj = countries.find((c) => c.name === formData.country);

  return (
    <main className="min-h-dvh bg-surface text-on-surface flex flex-col lg:grid lg:grid-cols-2">
      <div className="lg:hidden">
        <AuthBrandPanel compact />
      </div>
      <div className="hidden lg:block">
        <AuthBrandPanel tagline="One more player joins the grid." />
      </div>

      <div className="flex flex-col lg:items-center lg:justify-center px-6 py-10 lg:py-16">
        <motion.section
          initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-sm"
        >
          <div className="mb-8">
            <h2 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface mb-2">Create account</h2>
            <p className="text-on-surface-variant text-sm">Join the queue in under a minute.</p>
          </div>

          {message && (
            <div
              className={`mb-6 rounded-xl px-4 py-3 text-sm font-medium ${
                isSuccess
                  ? 'bg-volt/10 text-volt border border-volt/30'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}
              role="alert"
              aria-live="polite"
            >
              {message}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <div className="space-y-2">
              <label htmlFor="username" className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                Username
              </label>
              <div className="relative">
                <User size={18} weight="bold" aria-hidden="true" className="absolute inset-y-0 left-4 my-auto text-outline" />
                <input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  autoComplete="username"
                  spellCheck={false}
                  className={`w-full bg-surface-container-highest/60 border-0 border-b-2 py-3.5 pl-11 pr-4 rounded-xl text-on-surface placeholder:text-outline/50 font-medium outline-none focus-visible:ring-2 focus-visible:ring-volt/60 transition-colors ${
                    errors.username ? 'border-rose-500/50' : 'border-outline-variant/30 focus:border-volt'
                  }`}
                  placeholder="your-alias"
                  type="text"
                  required
                />
              </div>
              {errors.username && <p className="text-xs text-rose-400 font-medium">{errors.username}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                Email address
              </label>
              <div className="relative">
                <EnvelopeSimple size={18} weight="bold" aria-hidden="true" className="absolute inset-y-0 left-4 my-auto text-outline" />
                <input
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  spellCheck={false}
                  inputMode="email"
                  className={`w-full bg-surface-container-highest/60 border-0 border-b-2 py-3.5 pl-11 pr-4 rounded-xl text-on-surface placeholder:text-outline/50 font-medium outline-none focus-visible:ring-2 focus-visible:ring-volt/60 transition-colors ${
                    errors.email ? 'border-rose-500/50' : 'border-outline-variant/30 focus:border-volt'
                  }`}
                  placeholder="you@example.com"
                  type="email"
                  required
                />
              </div>
              {errors.email && <p className="text-xs text-rose-400 font-medium">{errors.email}</p>}
            </div>

            {/* Region (Country Selector) — accessible combobox-style picker */}
            <div className="space-y-2" ref={dropdownRef}>
              <label id="region-label" className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                Region
              </label>
              <div className="relative">
                <button
                  ref={triggerRef}
                  type="button"
                  aria-haspopup="listbox"
                  aria-expanded={isDropdownOpen}
                  aria-labelledby="region-label"
                  onClick={() => setIsDropdownOpen((open) => !open)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') closeDropdown();
                  }}
                  className={`w-full flex items-center justify-between bg-surface-container-highest/60 rounded-xl px-4 py-3.5 border-0 border-b-2 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-volt/60 ${
                    isDropdownOpen ? 'border-volt' : 'border-outline-variant/30 hover:border-volt/50'
                  }`}
                >
                  <span className="flex items-center min-w-0">
                    <Globe size={18} weight="bold" aria-hidden="true" className={`mr-3 shrink-0 ${isDropdownOpen ? 'text-volt' : 'text-outline'}`} />
                    <span className={`truncate ${formData.country ? 'text-on-surface font-medium' : 'text-outline/50'}`}>
                      {formData.country || 'Select your region'}
                    </span>
                  </span>
                  <span className="flex items-center gap-2 shrink-0 ml-2">
                    {selectedCountryObj && <span className="text-lg" aria-hidden="true">{selectedCountryObj.flag}</span>}
                    <CaretDown
                      size={16}
                      weight="bold"
                      aria-hidden="true"
                      className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180 text-volt' : 'text-outline'}`}
                    />
                  </span>
                </button>

                {isDropdownOpen && (
                  <div className="absolute bottom-full mb-2 left-0 w-full bg-surface-container-high border border-outline-variant/20 rounded-xl overflow-hidden z-20 shadow-2xl">
                    <div className="p-3 border-b border-outline-variant/10">
                      <div className="relative">
                        <MagnifyingGlass size={16} weight="bold" aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
                        <input
                          autoFocus
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Escape') closeDropdown();
                          }}
                          autoComplete="off"
                          spellCheck={false}
                          className="w-full bg-surface-container-low border-none rounded-lg pl-9 pr-4 py-2 text-sm text-on-surface outline-none focus-visible:ring-2 focus-visible:ring-volt/60"
                          placeholder="Search region…"
                        />
                      </div>
                    </div>
                    <ul role="listbox" aria-label="Region options" className="max-h-60 overflow-y-auto scrollbar-ethereal py-2">
                      {filteredCountries.length > 0 ? (
                        filteredCountries.map((c) => (
                          <li key={c.code}>
                            <button
                              type="button"
                              role="option"
                              aria-selected={formData.country === c.name}
                              onClick={() => handleCountrySelect(c)}
                              className={`w-full flex items-center gap-3 px-5 py-2.5 text-left hover:bg-volt/10 focus-visible:bg-volt/10 outline-none transition-colors ${
                                formData.country === c.name ? 'bg-volt/15 text-volt' : 'text-on-surface-variant hover:text-on-surface'
                              }`}
                            >
                              <span className="text-lg" aria-hidden="true">{c.flag}</span>
                              <span className="text-sm font-medium">{c.name}</span>
                              {formData.country === c.name && <Check size={16} weight="bold" aria-hidden="true" className="ml-auto" />}
                            </button>
                          </li>
                        ))
                      ) : (
                        <li className="px-5 py-4 text-center text-xs text-outline italic">No regions found.</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
              {errors.country && <p className="text-xs text-rose-400 font-medium">{errors.country}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="password" className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                  Password
                </label>
                <div className="relative">
                  <LockKey size={18} weight="bold" aria-hidden="true" className="absolute inset-y-0 left-4 my-auto text-outline" />
                  <input
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    className={`w-full bg-surface-container-highest/60 border-0 border-b-2 py-3.5 pl-11 pr-4 rounded-xl text-on-surface placeholder:text-outline/50 font-medium outline-none focus-visible:ring-2 focus-visible:ring-volt/60 transition-colors ${
                      errors.password ? 'border-rose-500/50' : 'border-outline-variant/30 focus:border-volt'
                    }`}
                    placeholder="••••••••"
                    type="password"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                  Confirm
                </label>
                <div className="relative">
                  <ShieldCheck size={18} weight="bold" aria-hidden="true" className="absolute inset-y-0 left-4 my-auto text-outline" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    autoComplete="new-password"
                    className={`w-full bg-surface-container-highest/60 border-0 border-b-2 py-3.5 pl-11 pr-4 rounded-xl text-on-surface placeholder:text-outline/50 font-medium outline-none focus-visible:ring-2 focus-visible:ring-volt/60 transition-colors ${
                      errors.confirmPassword ? 'border-rose-500/50' : 'border-outline-variant/30 focus:border-volt'
                    }`}
                    placeholder="••••••••"
                    type="password"
                    required
                  />
                </div>
              </div>
            </div>
            {errors.password && <p className="text-xs text-rose-400 font-medium">{errors.password}</p>}
            {errors.confirmPassword && <p className="text-xs text-rose-400 font-medium">{errors.confirmPassword}</p>}

            <button
              type="submit"
              disabled={isLoading}
              aria-busy={isLoading}
              className="w-full py-3.5 bg-volt text-volt-ink font-headline font-extrabold rounded-xl transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-volt/60 focus-visible:ring-offset-2 focus-visible:ring-offset-surface flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? 'Creating account…' : 'Create Account'}
              {!isLoading && <ArrowRight size={18} weight="bold" aria-hidden="true" />}
            </button>

            <p className="text-center text-on-surface-variant text-xs leading-relaxed">
              By registering, you agree to our Terms of Service and Privacy Policy.
            </p>
          </form>

          <p className="mt-8 text-center text-on-surface-variant text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-volt font-bold hover:text-volt-dim transition-colors">
              Sign In
            </Link>
          </p>
        </motion.section>
      </div>
    </main>
  );
}
