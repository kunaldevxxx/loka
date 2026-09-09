import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../lib/api';
import { X, Lock, Mail, User as UserIcon, Shield, Check } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, setCurrentUser, showToast } = useApp();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('user@example.com');
  const [password, setPassword] = useState('securePassword123');
  const [name, setName] = useState('John Doe');
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await api.login({ email, password });
        localStorage.setItem('loka_auth_token', res.token);
        setCurrentUser(res.user);
        showToast(`Welcome back, ${res.user.name}!`);
        setIsAuthModalOpen(false);
      } else {
        const res = await api.register({ email, password, name });
        localStorage.setItem('loka_auth_token', res.token);
        setCurrentUser(res.user);
        showToast('Customer account created!');
        setIsAuthModalOpen(false);
      }
    } catch (err: any) {
      showToast(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const res = await api.googleLogin('mock-google-id-token-xyz123');
      localStorage.setItem('loka_auth_token', res.token);
      setCurrentUser(res.user);
      showToast(`Signed in with Google as ${res.user.name}`);
      setIsAuthModalOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Google login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (type: 'customer' | 'manager' | 'chef') => {
    if (type === 'customer') {
      setEmail('user@example.com');
      setPassword('securePassword123');
      setName('John Doe');
    } else if (type === 'manager') {
      setEmail('manager@cafe.com');
      setPassword('managerPassword123');
      setName('Aarav Sharma');
    } else {
      setEmail('chef@cafe.com');
      setPassword('chefPassword123');
      setName('Chef Maria Rossi');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[var(--card)] text-[var(--card-foreground)] rounded-3xl border border-[var(--border)] shadow-2xl p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
          <div>
            <h2 className="text-base font-bold">
              {mode === 'login' ? 'Sign In to Loka' : 'Create an Account'}
            </h2>
            <p className="text-[11px] text-[var(--muted-foreground)]">
              Customer rewards or cafe staff management
            </p>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="p-1 text-[var(--muted-foreground)] hover:text-[var(--card-foreground)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Demo Credentials */}
        <div className="bg-[var(--muted)]/60 rounded-2xl p-3 border border-[var(--border)] space-y-1.5 text-xs">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--muted-foreground)]">
            Quick Fill Demo Accounts:
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickFill('customer')}
              className="px-2.5 py-1 rounded-lg bg-[var(--card)] text-[11px] font-bold border border-[var(--border)] hover:bg-[var(--muted)]"
            >
              Customer
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('manager')}
              className="px-2.5 py-1 rounded-lg bg-[var(--card)] text-[11px] font-bold border border-[var(--border)] hover:bg-[var(--muted)]"
            >
              Manager
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('chef')}
              className="px-2.5 py-1 rounded-lg bg-[var(--card)] text-[11px] font-bold border border-[var(--border)] hover:bg-[var(--muted)]"
            >
              Chef / Barista
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {mode === 'register' && (
            <>
              <div>
                <label className="block font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-[var(--muted-foreground)] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--muted)]/50 focus:outline-none focus:ring-1 focus:ring-[var(--primary)] text-xs"
                  />
                </div>
              </div>

            </>
          )}

          <div>
            <label className="block font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[var(--muted-foreground)] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--muted)]/50 focus:outline-none focus:ring-1 focus:ring-[var(--primary)] text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[var(--muted-foreground)] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--muted)]/50 focus:outline-none focus:ring-1 focus:ring-[var(--primary)] text-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white shadow-xs flex items-center justify-center gap-2 hover:opacity-95 disabled:opacity-50"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-[var(--border)] w-full" />
          <span className="bg-[var(--card)] px-2 text-[10px] uppercase tracking-wider text-[var(--muted-foreground)] font-bold absolute">
            Or
          </span>
        </div>

        {/* Google OAuth Login button */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-xl text-xs font-bold border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--muted)] transition-colors flex items-center justify-center gap-2 shadow-2xs"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.94 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Toggle Mode */}
        <div className="text-center text-xs text-[var(--muted-foreground)]">
          {mode === 'login' ? "Don't have an account?" : 'Already registered?'}{' '}
          <button
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="font-bold text-[var(--primary)] hover:underline"
          >
            {mode === 'login' ? 'Register here' : 'Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
};
