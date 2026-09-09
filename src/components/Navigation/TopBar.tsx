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
  Store,
  MapPin,
  Sparkles,
  LayoutDashboard,
  TrendingUp,
  AlertTriangle,
  Plus
} from 'lucide-react';

export const TopBar: React.FC = () => {
  const {
    currentCafe,
    allCafes,
    setCurrentCafe,
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
    isVenueOnboardingOpen,
    setIsVenueOnboardingOpen,
    currentUser,
    isStaffUser,
    isManager,
    isVenueManager,
    isSupport,
    isChef,
    isCustomer,
    logout,
    activeOrderId
  } = useApp();

  const isStaffView = [
    'staff_dashboard',
    'kds',
    'order_management',
    'analytics',
    'complaints',
    'menu_management'
  ].includes(activeView);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[var(--card)]/85 border-b border-[var(--border)] transition-colors duration-300 shadow-sm">
      {/* Subtle top ambient gradient line */}
      <div className="h-0.5 w-full bg-gradient-to-r from-amber-500 via-[var(--primary)] to-orange-500 opacity-80" />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2">
        {/* Left: Brand / Cafe info & Scoped Venue Status */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          {/* 1. Global Support: Multi-Venue Switcher */}
          {isSupport ? (
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center font-bold text-lg sm:text-xl shadow-md border border-[var(--border)]"
                style={{
                  backgroundColor: 'var(--primary)',
                  color: 'var(--primary-foreground)'
                }}
              >
                {currentCafe?.icon || '☕'}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 font-black border border-blue-500/20 uppercase tracking-wider">
                    Global Support
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <select
                    value={currentCafe?.cafeId}
                    onChange={(e) => {
                      const selected = allCafes.find((c) => c.cafeId === e.target.value);
                      if (selected) setCurrentCafe(selected);
                    }}
                    className="bg-transparent font-extrabold text-xs text-[var(--card-foreground)] focus:outline-none cursor-pointer pr-1 hover:text-blue-500"
                    title="Switch active cafe to manage"
                  >
                    {allCafes.map((c) => (
                      <option key={c.cafeId} value={c.cafeId} className="bg-[var(--card)] text-[var(--card-foreground)]">
                        {c.name} ({c.venueType})
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => setIsVenueOnboardingOpen(true)}
                    className="px-2 py-0.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black transition-all flex items-center gap-1 cursor-pointer shadow-2xs whitespace-nowrap"
                    title="Onboard or create new venue"
                  >
                    <Plus className="w-3 h-3" />
                    <span className="hidden sm:inline">Onboard Venue</span>
                  </button>
                </div>
              </div>
            </div>
          ) : isVenueManager ? (
            /* 2. Manager: Strictly locked to assigned venue */
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center font-bold text-lg sm:text-xl shadow-md border border-[var(--border)]"
                style={{
                  backgroundColor: 'var(--primary)',
                  color: 'var(--primary-foreground)'
                }}
              >
                {currentCafe?.icon || '☕'}
              </div>
              <div className="truncate">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-sm text-[var(--card-foreground)] truncate max-w-[130px] sm:max-w-[180px]">
                    {currentCafe?.name}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/20">
                    Manager
                  </span>
                </div>
                <div className="text-xs text-[var(--muted-foreground)] flex items-center gap-1 truncate font-medium">
                  <MapPin className="w-3 h-3 flex-shrink-0 text-amber-500" />
                  <span className="truncate max-w-[150px]">{currentCafe?.location}</span>
                </div>
              </div>
            </div>
          ) : isChef ? (
            /* 3. Chef: Strictly locked to assigned kitchen */
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center font-bold text-lg sm:text-xl shadow-md border border-[var(--border)]"
                style={{
                  backgroundColor: 'var(--primary)',
                  color: 'var(--primary-foreground)'
                }}
              >
                {currentCafe?.icon || '☕'}
              </div>
              <div className="truncate">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-sm text-[var(--card-foreground)] truncate max-w-[130px] sm:max-w-[180px]">
                    {currentCafe?.name}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-600 dark:text-orange-400 font-bold border border-orange-500/20">
                    Kitchen Pass
                  </span>
                </div>
                <div className="text-xs text-[var(--muted-foreground)] flex items-center gap-1 truncate font-medium">
                  <MapPin className="w-3 h-3 flex-shrink-0 text-amber-500" />
                  <span className="truncate max-w-[150px]">{currentCafe?.location}</span>
                </div>
              </div>
            </div>
          ) : (
            /* 4. Customer: Interactive Cafe Header & Table Selector */
            <>
              <button
                onClick={() => setActiveView('discovery')}
                className="flex items-center gap-2 sm:gap-2.5 text-left focus:outline-none group"
                title="Browse Cafes & Dish Recommendations"
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
            </>
          )}
        </div>

        {/* Center / Navigation mode tabs (Desktop) */}
        <nav className="hidden md:flex items-center gap-1 p-1 bg-[var(--muted)]/80 rounded-full border border-[var(--border)] text-xs font-semibold backdrop-blur-md shadow-inner">
          {/* Chef View: Only Kitchen Requests */}
          {isChef && (
            <div className="px-4 py-1.5 rounded-full bg-[var(--accent)] text-[var(--accent-foreground)] shadow-md font-bold flex items-center gap-2">
              <ChefHat className="w-4 h-4" />
              <span>Kitchen Requests</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
            </div>
          )}

          {/* Manager & Support View: Dashboard, Requests, Analytics, Complaints, Menu & Stock */}
          {isManager && (
            <>
              <button
                onClick={() => setActiveView('staff_dashboard')}
                className={`px-3 py-1.5 rounded-full transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                  activeView === 'staff_dashboard'
                    ? 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-md font-bold'
                    : 'text-[var(--muted-foreground)] hover:text-[var(--card-foreground)] hover:bg-[var(--card)]/50'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </button>
              <button
                onClick={() => setActiveView('kds')}
                className={`px-3 py-1.5 rounded-full transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                  activeView === 'kds'
                    ? 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-md font-bold'
                    : 'text-[var(--muted-foreground)] hover:text-[var(--card-foreground)] hover:bg-[var(--card)]/50'
                }`}
              >
                <ChefHat className="w-3.5 h-3.5" />
                <span>Requests</span>
              </button>
              <button
                onClick={() => setActiveView('analytics')}
                className={`px-3 py-1.5 rounded-full transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                  activeView === 'analytics'
                    ? 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-md font-bold'
                    : 'text-[var(--muted-foreground)] hover:text-[var(--card-foreground)] hover:bg-[var(--card)]/50'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Analytics</span>
              </button>
              <button
                onClick={() => setActiveView('complaints')}
                className={`px-3 py-1.5 rounded-full transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                  activeView === 'complaints'
                    ? 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-md font-bold'
                    : 'text-[var(--muted-foreground)] hover:text-[var(--card-foreground)] hover:bg-[var(--card)]/50'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Complaints</span>
              </button>
              <button
                onClick={() => setActiveView('menu_management')}
                className={`px-3 py-1.5 rounded-full transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                  activeView === 'menu_management'
                    ? 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-md font-bold'
                    : 'text-[var(--muted-foreground)] hover:text-[var(--card-foreground)] hover:bg-[var(--card)]/50'
                }`}
              >
                <Coffee className="w-3.5 h-3.5" />
                <span>Stock / Menu</span>
              </button>

              {isSupport && (
                <button
                  onClick={() => setActiveView('discovery')}
                  className={`px-2.5 py-1 rounded-full text-[11px] transition-all duration-200 flex items-center gap-1 cursor-pointer ${
                    activeView === 'discovery'
                      ? 'bg-blue-600 text-white font-bold shadow-sm'
                      : 'text-blue-500 hover:text-blue-400'
                  }`}
                  title="Dish & Venue Finder (Network View)"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Dish Finder</span>
                </button>
              )}

              <button
                onClick={() => setActiveView('menu')}
                className={`px-2.5 py-1 rounded-full text-[11px] transition-all duration-200 flex items-center gap-1 cursor-pointer ${
                  activeView === 'menu'
                    ? 'bg-[var(--muted)] text-[var(--card-foreground)] font-bold border border-[var(--border)]'
                    : 'text-[var(--muted-foreground)] hover:text-[var(--card-foreground)]'
                }`}
                title="Preview Customer Menu for this Venue"
              >
                <Store className="w-3 h-3" />
                <span>Customer View</span>
              </button>
            </>
          )}

          {/* Normal Customer View: Menu, Dish & Venue Finder, Live Order (NO staff tools) */}
          {isCustomer && (
            <>
              <button
                onClick={() => setActiveView('menu')}
                className={`px-3.5 py-1.5 rounded-full transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
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
                className={`px-3.5 py-1.5 rounded-full transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                  activeView === 'discovery'
                    ? 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-md font-bold'
                    : 'text-[var(--muted-foreground)] hover:text-[var(--card-foreground)] hover:bg-[var(--card)]/50'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Dish & Venue Finder</span>
              </button>
              {activeOrderId && (
                <button
                  onClick={() => setActiveView('order_status')}
                  className={`px-3.5 py-1.5 rounded-full transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                    activeView === 'order_status'
                      ? 'bg-emerald-600 text-white shadow-md font-bold'
                      : 'text-emerald-500 hover:text-emerald-400 bg-emerald-500/10'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                  <span>Live Order</span>
                </button>
              )}
            </>
          )}
        </nav>

        {/* Right Action Icons */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Customer Voice Assistant Trigger (Customer only) */}
          {isCustomer && (
            <button
              onClick={() => setIsVoiceModalOpen(true)}
              className="p-2 sm:p-2.5 rounded-2xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 dark:text-orange-400 transition-all relative border border-orange-500/20 active:scale-95 cursor-pointer"
              title="Voice Assistant Order (Multilingual AI)"
            >
              <Mic className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-orange-500 animate-ping" />
            </button>
          )}

          {/* QR Scanner / Generator (Customer & Manager) */}
          {!isChef && (
            <button
              onClick={() => setIsQRModalOpen(true)}
              className="p-2 sm:p-2.5 rounded-2xl hover:bg-[var(--muted)] text-[var(--card-foreground)] transition-all border border-transparent hover:border-[var(--border)] active:scale-95 cursor-pointer"
              title="QR Code & Table Scanner"
            >
              <QrCode className="w-4 h-4" />
            </button>
          )}

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 sm:p-2.5 rounded-2xl hover:bg-[var(--muted)] text-[var(--card-foreground)] transition-all border border-transparent hover:border-[var(--border)] active:scale-95 group cursor-pointer"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
            ) : (
              <Moon className="w-4 h-4 text-zinc-700 group-hover:-rotate-12 transition-transform duration-300" />
            )}
          </button>

          {/* Cart Trigger (Customer and Manager preview; hidden for Chef) */}
          {!isChef && (
            <button
              onClick={() => setActiveView('cart')}
              className="relative px-3 sm:px-4 py-2 rounded-2xl flex items-center gap-1.5 transition-all duration-200 text-xs font-bold border border-transparent shadow-md hover:scale-105 active:scale-95 cursor-pointer"
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
          )}

          {/* User Profile / Role Badging / Login */}
          {currentUser ? (
            <div className="flex items-center gap-2 pl-1">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs font-bold text-[var(--card-foreground)] leading-none">
                  {currentUser?.name || currentUser?.email || 'User'}
                </span>
                <span className={`text-[10px] font-black uppercase tracking-wider ${
                  currentUser?.role === 'chef'
                    ? 'text-amber-500'
                    : currentUser?.role === 'manager' || currentUser?.role === 'support'
                    ? 'text-blue-500'
                    : 'text-[var(--muted-foreground)]'
                }`}>
                  {currentUser?.role === 'chef' ? 'Chef' : currentUser?.role === 'manager' ? 'Manager' : currentUser?.role === 'support' ? 'Support Admin' : 'Customer'}
                </span>
              </div>
              <button
                onClick={logout}
                className="w-8 h-8 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center font-bold text-xs shadow-sm hover:ring-2 hover:ring-amber-400 transition-all cursor-pointer"
                title={`Logged in as ${currentUser?.name || currentUser?.email || 'User'} (${currentUser?.role || 'user'}). Click to log out.`}
              >
                {(currentUser?.name || currentUser?.email || 'U').charAt(0).toUpperCase()}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="p-2 sm:p-2.5 rounded-2xl hover:bg-[var(--muted)] text-[var(--card-foreground)] transition-all border border-transparent hover:border-[var(--border)] cursor-pointer"
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
