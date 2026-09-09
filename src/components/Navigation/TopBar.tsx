import React from 'react';
import { useApp } from '../../context/AppContext';
import { motion } from 'motion/react';
import {
  Coffee,
  ShoppingBag,
  Mic,
  QrCode,
  Moon,
  Sun,
  User as UserIcon,
  ChefHat,
  Terminal,
  Store,
  MapPin,
  Sparkles
} from 'lucide-react';

export const TopBar: React.FC = () => {
  const {
    currentCafe,
    tableId,
    setTableId,
    cartCount,
    activeView,
    setActiveView,
    isDarkMode,
    toggleDarkMode,
    setIsVoiceModalOpen,
    setIsQRModalOpen,
    setIsAuthModalOpen,
    currentUser,
    logout,
    activeOrderId
  } = useApp();

  const isStaffView = [
    'staff_dashboard',
    'kds',
    'order_management',
    'analytics',
    'menu_management'
  ].includes(activeView);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[var(--card)]/85 border-b border-[var(--border)] transition-colors duration-300 shadow-sm">
      {/* Subtle top ambient gradient line */}
      <div className="h-0.5 w-full bg-gradient-to-r from-amber-500 via-[var(--primary)] to-orange-500 opacity-80" />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2">
        {/* Left: Brand / Cafe info */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <button
            onClick={() => setActiveView('discovery')}
            className="flex items-center gap-2 sm:gap-2.5 text-left focus:outline-none group"
            title="Browse Cafes"
          >
            <div
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center font-bold text-lg sm:text-xl shadow-md border border-[var(--border)] transition-all duration-300 group-hover:scale-105 group-hover:shadow-amber-500/20"
              style={{
                backgroundColor: 'var(--primary)',
                color: 'var(--primary-foreground)'
              }}
            >
              {currentCafe?.icon || '☕'}
            </div>
            <div className="truncate hidden sm:block">
              <div className="font-extrabold text-sm leading-tight text-[var(--card-foreground)] flex items-center gap-1.5">
                <span className="truncate">{currentCafe?.name || 'Loka Cafe'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/20">
                  {currentCafe?.venueType || 'Cafe'}
                </span>
              </div>
              <div className="text-xs text-[var(--muted-foreground)] flex items-center gap-1 truncate font-medium">
                <MapPin className="w-3 h-3 flex-shrink-0 text-amber-500" />
                <span className="truncate">{currentCafe?.location || 'Select Location'}</span>
              </div>
            </div>
          </button>

          {/* Table Selector Pill */}
          <div className="flex items-center gap-1.5 bg-[var(--muted)]/90 px-2.5 py-1 rounded-full border border-[var(--border)] text-xs shadow-inner">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
            <span className="text-[var(--muted-foreground)] font-semibold hidden xs:inline">Table:</span>
            <select
              value={tableId}
              onChange={(e) => setTableId(e.target.value)}
              className="bg-transparent font-bold text-[var(--card-foreground)] focus:outline-none cursor-pointer text-xs pr-1"
            >
              <option value="table-01">T-01 (Window)</option>
              <option value="table-02">T-02 (Bar)</option>
              <option value="table-03">T-03 (Booth)</option>
              <option value="table-05">T-05 (Outdoor)</option>
              <option value="table-07">T-07 (Lounge)</option>
              <option value="table-10">T-10 (Balcony)</option>
            </select>
          </div>
        </div>

        {/* Center / Navigation mode tabs (Desktop) */}
        <nav className="hidden md:flex items-center gap-1 p-1 bg-[var(--muted)]/80 rounded-full border border-[var(--border)] text-xs font-semibold backdrop-blur-md shadow-inner">
          <button
            onClick={() => setActiveView('menu')}
            className={`px-3.5 py-1.5 rounded-full transition-all duration-200 flex items-center gap-1.5 ${
              activeView === 'menu'
                ? 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-md font-bold'
                : 'text-[var(--muted-foreground)] hover:text-[var(--card-foreground)] hover:bg-[var(--card)]/50'
            }`}
          >
            <Coffee className="w-3.5 h-3.5" />
            <span>Menu</span>
          </button>
          <button
            onClick={() => setActiveView('discovery')}
            className={`px-3.5 py-1.5 rounded-full transition-all duration-200 flex items-center gap-1.5 ${
              activeView === 'discovery'
                ? 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-md font-bold'
                : 'text-[var(--muted-foreground)] hover:text-[var(--card-foreground)] hover:bg-[var(--card)]/50'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Venues</span>
          </button>
          {activeOrderId && (
            <button
              onClick={() => setActiveView('order_status')}
              className={`px-3.5 py-1.5 rounded-full transition-all duration-200 flex items-center gap-1.5 ${
                activeView === 'order_status'
                  ? 'bg-emerald-600 text-white shadow-md font-bold'
                  : 'text-emerald-500 hover:text-emerald-400 bg-emerald-500/10'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
              <span>Live Order</span>
            </button>
          )}
          <button
            onClick={() => setActiveView('kds')}
            className={`px-3.5 py-1.5 rounded-full transition-all duration-200 flex items-center gap-1.5 ${
              isStaffView
                ? 'bg-[var(--accent)] text-[var(--accent-foreground)] shadow-md font-bold'
                : 'text-[var(--muted-foreground)] hover:text-[var(--card-foreground)] hover:bg-[var(--card)]/50'
            }`}
          >
            <ChefHat className="w-3.5 h-3.5" />
            <span>Staff / KDS</span>
          </button>
          <button
            onClick={() => setActiveView('api_inspector')}
            className={`px-3 py-1.5 rounded-full transition-all duration-200 flex items-center gap-1 ${
              activeView === 'api_inspector'
                ? 'bg-zinc-800 text-zinc-100 shadow-md font-bold'
                : 'text-[var(--muted-foreground)] hover:text-[var(--card-foreground)] hover:bg-[var(--card)]/50'
            }`}
            title="API Endpoints Inspector"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>API Specs</span>
          </button>
        </nav>

        {/* Right Action Icons */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Voice Assistant Trigger */}
          <button
            onClick={() => setIsVoiceModalOpen(true)}
            className="p-2 sm:p-2.5 rounded-2xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 dark:text-orange-400 transition-all relative border border-orange-500/20 active:scale-95"
            title="Voice Assistant Order (Multilingual AI)"
          >
            <Mic className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-orange-500 animate-ping" />
          </button>

          {/* QR Scanner / Generator */}
          <button
            onClick={() => setIsQRModalOpen(true)}
            className="p-2 sm:p-2.5 rounded-2xl hover:bg-[var(--muted)] text-[var(--card-foreground)] transition-all border border-transparent hover:border-[var(--border)] active:scale-95"
            title="QR Code & Table Scanner"
          >
            <QrCode className="w-4 h-4" />
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 sm:p-2.5 rounded-2xl hover:bg-[var(--muted)] text-[var(--card-foreground)] transition-all border border-transparent hover:border-[var(--border)] active:scale-95 group"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
            ) : (
              <Moon className="w-4 h-4 text-zinc-700 group-hover:-rotate-12 transition-transform duration-300" />
            )}
          </button>

          {/* Cart Trigger */}
          <button
            onClick={() => setActiveView('cart')}
            className="relative px-3 sm:px-4 py-2 rounded-2xl flex items-center gap-1.5 transition-all duration-200 text-xs font-bold border border-transparent shadow-md hover:scale-105 active:scale-95"
            style={{
              backgroundColor: 'var(--primary)',
              color: 'var(--primary-foreground)'
            }}
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">Cart</span>
            {cartCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-[var(--accent)] text-[var(--accent-foreground)] text-[10px] font-black shadow-sm">
                {cartCount}
              </span>
            )}
          </button>

          {/* User Profile / Login */}
          {currentUser ? (
            <div className="flex items-center gap-1.5 pl-1">
              <button
                onClick={logout}
                className="w-8 h-8 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center font-bold text-xs shadow-sm hover:ring-2 hover:ring-amber-400 transition-all"
                title={`Logged in as ${currentUser.name} (${currentUser.role}). Click to log out.`}
              >
                {currentUser.name.charAt(0).toUpperCase()}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="p-2 sm:p-2.5 rounded-2xl hover:bg-[var(--muted)] text-[var(--card-foreground)] transition-all border border-transparent hover:border-[var(--border)]"
              title="Sign In / Register"
            >
              <UserIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
