import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Coffee,
  Store,
  Clock,
  ShoppingBag,
  ChefHat,
  LayoutDashboard,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeView, setActiveView, cartCount, activeOrderId, isManager, isChef } = useApp();

  // 1. Chef mobile view: Dedicated live kitchen requests bar
  if (isChef) {
    return (
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 px-3 pb-3 pt-2 backdrop-blur-2xl bg-[var(--card)]/90 border-t border-[var(--border)] transition-colors duration-300 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] dark:shadow-[0_-8px_30px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-center max-w-md mx-auto">
          <button
            onClick={() => setActiveView('kds')}
            className="w-full py-2.5 px-4 rounded-2xl bg-[var(--accent)] text-[var(--accent-foreground)] font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer"
          >
            <ChefHat className="w-4 h-4" />
            <span>Kitchen Requests Live Station</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </button>
        </div>
      </nav>
    );
  }

  // 2. Manager mobile view: Dashboard, Requests, Analytics, Complaints, Menu
  if (isManager) {
    return (
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 px-2 pb-2 pt-1.5 backdrop-blur-2xl bg-[var(--card)]/90 border-t border-[var(--border)] transition-colors duration-300 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] dark:shadow-[0_-8px_30px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-around max-w-md mx-auto">
          <button
            onClick={() => setActiveView('staff_dashboard')}
            className={`flex flex-col items-center justify-center min-w-[50px] min-h-[46px] py-1 px-1.5 rounded-2xl transition-all duration-200 cursor-pointer ${
              activeView === 'staff_dashboard'
                ? 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-md font-bold scale-105'
                : 'text-[var(--muted-foreground)] hover:text-[var(--card-foreground)]'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span className="text-[9px] font-bold mt-0.5">Overview</span>
          </button>

          <button
            onClick={() => setActiveView('kds')}
            className={`flex flex-col items-center justify-center min-w-[50px] min-h-[46px] py-1 px-1.5 rounded-2xl transition-all duration-200 cursor-pointer ${
              activeView === 'kds'
                ? 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-md font-bold scale-105'
                : 'text-[var(--muted-foreground)] hover:text-[var(--card-foreground)]'
            }`}
          >
            <ChefHat className="w-4 h-4" />
            <span className="text-[9px] font-bold mt-0.5">Requests</span>
          </button>

          <button
            onClick={() => setActiveView('analytics')}
            className={`flex flex-col items-center justify-center min-w-[50px] min-h-[46px] py-1 px-1.5 rounded-2xl transition-all duration-200 cursor-pointer ${
              activeView === 'analytics'
                ? 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-md font-bold scale-105'
                : 'text-[var(--muted-foreground)] hover:text-[var(--card-foreground)]'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span className="text-[9px] font-bold mt-0.5">Analytics</span>
          </button>

          <button
            onClick={() => setActiveView('complaints')}
            className={`flex flex-col items-center justify-center min-w-[50px] min-h-[46px] py-1 px-1.5 rounded-2xl transition-all duration-200 cursor-pointer ${
              activeView === 'complaints'
                ? 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-md font-bold scale-105'
                : 'text-[var(--muted-foreground)] hover:text-[var(--card-foreground)]'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span className="text-[9px] font-bold mt-0.5">Complaints</span>
          </button>

          <button
            onClick={() => setActiveView('menu')}
            className={`flex flex-col items-center justify-center min-w-[50px] min-h-[46px] py-1 px-1.5 rounded-2xl transition-all duration-200 cursor-pointer ${
              activeView === 'menu'
                ? 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-md font-bold scale-105'
                : 'text-[var(--muted-foreground)] hover:text-[var(--card-foreground)]'
            }`}
          >
            <Coffee className="w-4 h-4" />
            <span className="text-[9px] font-bold mt-0.5">Menu</span>
          </button>
        </div>
      </nav>
    );
  }

  // 3. Normal Customer view: Menu, Venues, Cart, Live Order
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 px-3 pb-2 pt-1.5 backdrop-blur-2xl bg-[var(--card)]/90 border-t border-[var(--border)] transition-colors duration-300 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] dark:shadow-[0_-8px_30px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-around max-w-md mx-auto">
        <button
          onClick={() => setActiveView('menu')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 px-2 rounded-2xl transition-all duration-200 cursor-pointer ${
            activeView === 'menu'
              ? 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-md font-bold scale-105'
              : 'text-[var(--muted-foreground)] hover:text-[var(--card-foreground)]'
          }`}
        >
          <Coffee className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-0.5">Menu</span>
        </button>

        <button
          onClick={() => setActiveView('discovery')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 px-2 rounded-2xl transition-all duration-200 cursor-pointer ${
            activeView === 'discovery'
              ? 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-md font-bold scale-105'
              : 'text-[var(--muted-foreground)] hover:text-[var(--card-foreground)]'
          }`}
        >
          <Store className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-0.5">Venues</span>
        </button>

        <button
          onClick={() => setActiveView('cart')}
          className={`relative flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 px-2 rounded-2xl transition-all duration-200 cursor-pointer ${
            activeView === 'cart'
              ? 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-md font-bold scale-105'
              : 'text-[var(--muted-foreground)] hover:text-[var(--card-foreground)]'
          }`}
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 px-1.5 py-0.2 rounded-full bg-[var(--accent)] text-[var(--accent-foreground)] text-[9px] font-black shadow-sm">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold mt-0.5">Cart</span>
        </button>

        {activeOrderId && (
          <button
            onClick={() => setActiveView('order_status')}
            className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 px-2 rounded-2xl transition-all duration-200 cursor-pointer ${
              activeView === 'order_status'
                ? 'bg-emerald-600 text-white shadow-md font-bold scale-105'
                : 'text-emerald-500 bg-emerald-500/10'
            }`}
          >
            <Clock className="w-5 h-5 animate-pulse text-emerald-400" />
            <span className="text-[10px] font-bold mt-0.5">Live</span>
          </button>
        )}
      </div>
    </nav>
  );
};
