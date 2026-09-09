import React from 'react';
import { useApp } from '../../context/AppContext';
import { Coffee, Store, Clock, ShoppingBag } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeView, setActiveView, cartCount, activeOrderId } = useApp();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 px-3 pb-2 pt-1.5 backdrop-blur-2xl bg-[var(--card)]/90 border-t border-[var(--border)] transition-colors duration-300 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] dark:shadow-[0_-8px_30px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-around max-w-md mx-auto">
        <button
          onClick={() => setActiveView('menu')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 px-2 rounded-2xl transition-all duration-200 ${
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
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 px-2 rounded-2xl transition-all duration-200 ${
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
          className={`relative flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 px-2 rounded-2xl transition-all duration-200 ${
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
            className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 px-2 rounded-2xl transition-all duration-200 ${
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
