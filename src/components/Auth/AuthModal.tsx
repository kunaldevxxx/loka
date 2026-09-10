import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api, getApiBaseUrl, setApiBaseUrl, isBackendConfigured } from '../../lib/api';
import { X, Lock, Mail, User as UserIcon, Shield, Check, AlertTriangle, Server, Sparkles, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, setCurrentUser, showToast, setActiveView } = useApp();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('user@example.com');
  const [password, setPassword] = useState('securePassword123');
  const [name, setName] = useState('John Doe');
  const [loading, setLoading] = useState(false);

  // Backend Connection State
  const [customBackendUrl, setCustomBackendUrl] = useState(getApiBaseUrl());
  const [showBackendConfig, setShowBackendConfig] = useState(!isBackendConfigured());
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [loginError, setLoginError] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleTestBackend = async () => {
    if (!customBackendUrl.trim()) {
      setApiBaseUrl('');
      showToast('Cleared custom backend URL. Using defaults.');
      setTestStatus('idle');
      return;
    }
    setTestStatus('testing');
    try {
      const clean = customBackendUrl.trim().replace(/\/+$/, '');
      const res = await fetch(`${clean}/health`);
      if (res.ok) {
        setApiBaseUrl(clean);
        setTestStatus('success');
        setLoginError(null);
        showToast('Backend connected successfully! 🎉');
      } else {
        setTestStatus('error');
        showToast(`Backend responded with HTTP ${res.status}`);
      }
    } catch (e: any) {
      setTestStatus('error');
      showToast('Cannot reach backend. Is your Render web service awake?');
    }
  };

  const handleDirectDemoLogin = (role: 'customer' | 'manager' | 'chef' | 'support') => {
    const demoUser = {
      userId: `demo-${role}-01`,
      email: `${role}@cafe.com`,
      name: role === 'manager' ? 'Aarav Sharma (Manager)' : role === 'chef' ? 'Chef Maria Rossi' : role === 'support' ? 'Dev Support Admin' : 'John Doe',
      role,
      cafeId: role === 'support' ? null : 'cafe-001'
    };
    localStorage.setItem('loka_auth_token', 'demo-token-' + role);
    setCurrentUser(demoUser);
    showToast(`Logged in as Demo ${role.toUpperCase()}`);
    if (role === 'chef') {
      setActiveView('kds');
    } else if (['manager', 'support'].includes(role)) {
      setActiveView('staff_dashboard');
    } else {
      setActiveView('menu');
    }
    setIsAuthModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginError(null);

    try {
      if (mode === 'login') {
        const res = await api.login({ email, password });
        localStorage.setItem('loka_auth_token', res.token);
        setCurrentUser(res.user);
        showToast(`Welcome back, ${res.user.name}!`);
        if (res.user.role === 'chef') {
          setActiveView('kds');
        } else if (['manager', 'support'].includes(res.user.role)) {
          setActiveView('staff_dashboard');
        } else {
          setActiveView('menu');
        }
        setIsAuthModalOpen(false);
      } else {
        const res = await api.register({ email, password, name });
        localStorage.setItem('loka_auth_token', res.token);
        setCurrentUser(res.user);
        showToast('Customer account created!');
        setActiveView('menu');
        setIsAuthModalOpen(false);
      }
    } catch (err: any) {
      const msg = err.message || 'Authentication failed';
      setLoginError(msg);
      showToast(msg);
      if (msg.includes('405') || msg.includes('Network Error')) {
        setShowBackendConfig(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setLoginError(null);
    try {
      const res = await api.googleLogin('mock-google-id-token-xyz123');
      localStorage.setItem('loka_auth_token', res.token);
      setCurrentUser(res.user);
      showToast(`Signed in with Google as ${res.user.name}`);
      if (res.user.role === 'chef') {
        setActiveView('kds');
      } else if (['manager', 'support'].includes(res.user.role)) {
        setActiveView('staff_dashboard');
      } else {
        setActiveView('menu');
      }
      setIsAuthModalOpen(false);
    } catch (err: any) {
      const msg = err.message || 'Google login failed';
      setLoginError(msg);
      showToast(msg);
      if (msg.includes('405')) {
        setShowBackendConfig(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (type: 'customer' | 'manager' | 'chef' | 'support') => {
    if (type === 'customer') {
      setEmail('user@example.com');
      setPassword('securePassword123');
      setName('John Doe');
    } else if (type === 'manager') {
      setEmail('manager@cafe.com');
      setPassword('managerPassword123');
      setName('Aarav Sharma');
    } else if (type === 'chef') {
      setEmail('chef@cafe.com');
      setPassword('chefPassword123');
      setName('Chef Maria Rossi');
    } else {
      setEmail('support@cafe.com');
      setPassword('supportPassword123');
      setName('Dev Support Admin');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[var(--card)] text-[var(--card-foreground)] rounded-3xl border border-[var(--border)] shadow-2xl p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
          <div>
            <h2 className="text-base font-bold">
              {mode === 'login' ? 'Sign In to Loka' : 'Create an Account'}
            </h2>
            <p className="text-[11px] text-[var(--muted-foreground)]">
              Customer loyalty or cafe staff consoles
            </p>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="p-1 text-[var(--muted-foreground)] hover:text-[var(--card-foreground)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 405 / Connection Error Notice */}
        {loginError && (
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs space-y-1.5">
            <div className="font-bold flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Backend Connection Alert</span>
            </div>
            <p className="text-[11px] leading-relaxed opacity-90">
              {loginError.includes('405')
                ? 'Your frontend is hosted on Cloudflare Pages, but VITE_API_BASE_URL is not set to your Render backend API. Connect your Render URL below, or use 1-click Demo Mode.'
                : loginError}
            </p>
          </div>
        )}

        {/* Backend URL Configuration Accordion */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--muted)]/40 p-3 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="w-3.5 h-3.5 text-[var(--primary)]" />
              <span className="font-bold text-[11px]">Backend API Target</span>
              <span
                className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
                  isBackendConfigured()
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                    : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                }`}
              >
                {isBackendConfigured() ? 'Connected' : 'Not Connected'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowBackendConfig(!showBackendConfig)}
              className="text-[11px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] flex items-center gap-0.5"
            >
              {showBackendConfig ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {showBackendConfig && (
            <div className="pt-2 border-t border-[var(--border)] space-y-2">
              <p className="text-[10px] text-[var(--muted-foreground)]">
                Render Backend URL (e.g. <code className="bg-[var(--card)] px-1 py-0.5 rounded">https://loka-cafe-backend.onrender.com</code>):
              </p>
              <div className="flex gap-1.5">
                <input
                  type="url"
                  value={customBackendUrl}
                  onChange={(e) => setCustomBackendUrl(e.target.value)}
                  placeholder="https://your-backend.onrender.com"
                  className="flex-1 px-2.5 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--card)] text-xs focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
                <button
                  type="button"
                  onClick={handleTestBackend}
                  disabled={testStatus === 'testing'}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-white shadow-2xs flex items-center gap-1 hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: 'var(--primary)' }}
                >
                  {testStatus === 'testing' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Connect'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 1-Click Instant Demo Access */}
        <div className="bg-gradient-to-br from-amber-500/10 via-[var(--primary)]/10 to-orange-500/10 rounded-2xl p-3 border border-amber-500/20 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-700 dark:text-amber-300 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              1-Click Instant Demo Login:
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => handleDirectDemoLogin('manager')}
              className="px-2.5 py-1.5 rounded-xl bg-[var(--card)] text-[11px] font-bold border border-amber-500/30 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10 transition-colors text-left"
            >
              ☕ Demo Manager
            </button>
            <button
              type="button"
              onClick={() => handleDirectDemoLogin('chef')}
              className="px-2.5 py-1.5 rounded-xl bg-[var(--card)] text-[11px] font-bold border border-orange-500/30 text-orange-700 dark:text-orange-300 hover:bg-orange-500/10 transition-colors text-left"
            >
              👨‍🍳 Demo Chef (KDS)
            </button>
            <button
              type="button"
              onClick={() => handleDirectDemoLogin('support')}
              className="px-2.5 py-1.5 rounded-xl bg-[var(--card)] text-[11px] font-bold border border-blue-500/30 text-blue-700 dark:text-blue-300 hover:bg-blue-500/10 transition-colors text-left"
            >
              🌐 Global Support
            </button>
            <button
              type="button"
              onClick={() => handleDirectDemoLogin('customer')}
              className="px-2.5 py-1.5 rounded-xl bg-[var(--card)] text-[11px] font-bold border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors text-left"
            >
              👤 Demo Customer
            </button>
          </div>
        </div>

        {/* Quick Demo Credentials Form Filler */}
        <div className="bg-[var(--muted)]/60 rounded-2xl p-2.5 border border-[var(--border)] space-y-1.5 text-xs">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--muted-foreground)]">
            Fill Credentials for Live Backend:
          </span>
          <div className="flex flex-wrap items-center gap-1">
            <button
              type="button"
              onClick={() => handleQuickFill('customer')}
              className="px-2 py-0.5 rounded-lg bg-[var(--card)] text-[10px] font-semibold border border-[var(--border)] hover:bg-[var(--muted)]"
            >
              Customer
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('manager')}
              className="px-2 py-0.5 rounded-lg bg-[var(--card)] text-[10px] font-semibold border border-[var(--border)] hover:bg-[var(--muted)]"
            >
              Manager
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('chef')}
              className="px-2 py-0.5 rounded-lg bg-[var(--card)] text-[10px] font-semibold border border-[var(--border)] hover:bg-[var(--muted)]"
            >
              Chef
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('support')}
              className="px-2 py-0.5 rounded-lg bg-[var(--card)] text-[10px] font-semibold border border-[var(--border)] text-blue-600 dark:text-blue-400 hover:bg-blue-500/10"
            >
              Support
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
