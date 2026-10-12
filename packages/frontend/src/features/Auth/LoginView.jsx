import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { User, LockKey, ArrowRight } from '@phosphor-icons/react';
import { useLogin } from './authHooks';
import AuthBrandPanel from '../../shared/components/auth/AuthBrandPanel';

export default function LoginView() {
  const { formData, errors, message, isSuccess, isLoading, handleChange, handleSubmit } = useLogin();
  const prefersReducedMotion = useReducedMotion();

  return (
    <main className="min-h-dvh bg-surface text-on-surface flex flex-col lg:grid lg:grid-cols-2">
      <div className="lg:hidden">
        <AuthBrandPanel compact />
      </div>
      <div className="hidden lg:block">
        <AuthBrandPanel />
      </div>

      <div className="flex flex-col lg:items-center lg:justify-center px-6 py-10 lg:py-16">
        <motion.section
          initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-sm"
        >
          <div className="mb-8">
            <h2 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface mb-2">Welcome back</h2>
            <p className="text-on-surface-variant text-sm">Sign in to queue up a match.</p>
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
              <label htmlFor="identifier" className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                Username or email
              </label>
              <div className="relative">
                <User size={18} weight="bold" aria-hidden="true" className="absolute inset-y-0 left-4 my-auto text-outline" />
                <input
                  id="identifier"
                  name="identifier"
                  value={formData.identifier}
                  onChange={handleChange}
                  autoComplete="username"
                  spellCheck={false}
                  className={`w-full bg-surface-container-highest/60 border-0 border-b-2 py-3.5 pl-11 pr-4 rounded-xl text-on-surface placeholder:text-outline/50 font-medium outline-none focus-visible:ring-2 focus-visible:ring-volt/60 transition-colors ${
                    errors.identifier ? 'border-rose-500/50' : 'border-outline-variant/30 focus:border-volt'
                  }`}
                  placeholder="your-alias"
                  type="text"
                  required
                />
              </div>
              {errors.identifier && <p className="text-xs text-rose-400 font-medium">{errors.identifier}</p>}
            </div>

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
                  autoComplete="current-password"
                  className={`w-full bg-surface-container-highest/60 border-0 border-b-2 py-3.5 pl-11 pr-4 rounded-xl text-on-surface placeholder:text-outline/50 font-medium outline-none focus-visible:ring-2 focus-visible:ring-volt/60 transition-colors ${
                    errors.password ? 'border-rose-500/50' : 'border-outline-variant/30 focus:border-volt'
                  }`}
                  placeholder="••••••••"
                  type="password"
                  required
                />
              </div>
              {errors.password && <p className="text-xs text-rose-400 font-medium">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              aria-busy={isLoading}
              className="w-full py-3.5 bg-volt text-volt-ink font-headline font-extrabold rounded-xl transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-volt/60 focus-visible:ring-offset-2 focus-visible:ring-offset-surface flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? 'Signing in…' : 'Sign In'}
              {!isLoading && <ArrowRight size={18} weight="bold" aria-hidden="true" />}
            </button>
          </form>

          <p className="mt-8 text-center text-on-surface-variant text-sm">
            New here?{' '}
            <Link to="/register" className="text-volt font-bold hover:text-volt-dim transition-colors">
              Create an account
            </Link>
          </p>
        </motion.section>
      </div>
    </main>
  );
}
