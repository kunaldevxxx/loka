import React from 'react';
import { useApp } from '../../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Plus, Minus, Trash2, ArrowRight, ArrowLeft, Sparkles, Receipt, ShieldCheck } from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    removeFromCart,
    updateCartQty,
    clearCart,
    cartSubtotal,
    cartTax,
    cartTotal,
    tableId,
    currentCafe,
    setActiveView,
    setIsPaymentModalOpen
  } = useApp();

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-5">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 rounded-3xl bg-amber-500/15 border border-amber-500/20 text-amber-500 mx-auto flex items-center justify-center shadow-lg"
        >
          <ShoppingBag className="w-9 h-9" />
        </motion.div>
        <h2 className="text-2xl font-black text-[var(--foreground)] tracking-tight">Your order is empty</h2>
        <p className="text-xs sm:text-sm text-[var(--muted-foreground)] max-w-sm mx-auto font-medium">
          Explore handcrafted specialty coffees, warm baked pastries, and brunch dishes to build your order.
        </p>
        <button
          onClick={() => setActiveView('menu')}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-xs sm:text-sm font-black transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
          style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Browse Fresh Menu</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Table {tableId} • {currentCafe?.name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--foreground)] tracking-tight">
            Order Review & Bill
          </h1>
        </div>

        <button
          onClick={clearCart}
          className="text-xs font-bold text-red-500 hover:text-red-600 dark:text-red-400 px-3 py-1.5 rounded-xl hover:bg-red-500/10 transition-all cursor-pointer"
        >
          Clear All
        </button>
      </div>

      {/* Cart Items List */}
      <div className="space-y-3.5">
        <AnimatePresence>
          {cart.map((c) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              key={c.id}
              className="p-4 rounded-3xl bg-[var(--card)] text-[var(--card-foreground)] border border-[var(--border)] shadow-xs hover:shadow-md transition-shadow flex items-center justify-between gap-3.5"
            >
              <img
                src={c.item.image}
                alt={c.item.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover flex-shrink-0 border border-[var(--border)]"
                referrerPolicy="no-referrer"
              />

              <div className="flex-1 min-w-0">
                <h3 className="font-extrabold text-sm sm:text-base truncate">{c.item.name}</h3>
                <p className="text-xs text-[var(--muted-foreground)] line-clamp-1 mt-0.5 font-medium">
                  {c.summary || 'Standard recipe'}
                </p>
                <div className="text-xs font-black text-amber-600 dark:text-amber-400 mt-1">
                  ₹{c.unitPrice} each
                </div>
              </div>

              {/* Quantity and Controls */}
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-1 sm:gap-2 bg-[var(--muted)] px-2.5 py-1.5 rounded-xl border border-[var(--border)]">
                  <button
                    onClick={() => updateCartQty(c.id, c.qty - 1)}
                    className="p-1 hover:text-red-500 transition-colors cursor-pointer active:scale-90"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-5 text-center font-black text-xs">{c.qty}</span>
                  <button
                    onClick={() => updateCartQty(c.id, c.qty + 1)}
                    className="p-1 hover:text-emerald-500 transition-colors cursor-pointer active:scale-90"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="font-black text-sm sm:text-base text-[var(--foreground)] min-w-[55px] text-right">
                  ₹{c.lineTotal}
                </div>

                <button
                  onClick={() => removeFromCart(c.id)}
                  className="p-2 text-zinc-400 hover:text-red-500 transition-colors cursor-pointer rounded-xl hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Bill Breakdown */}
      <div className="bg-gradient-to-br from-[var(--card)] via-[var(--card)] to-amber-500/5 rounded-3xl p-5 sm:p-6 border border-[var(--border)] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-wider text-[var(--muted-foreground)] flex items-center gap-1.5">
            <Receipt className="w-3.5 h-3.5 text-amber-500" />
            <span>Bill & Tax Breakdown</span>
          </h3>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
            <ShieldCheck className="w-3 h-3" />
            Zero Platform Fee
          </span>
        </div>

        <div className="space-y-2.5 text-xs divide-y divide-[var(--border)] font-medium">
          <div className="flex justify-between py-1 text-[var(--muted-foreground)]">
            <span>Item Subtotal</span>
            <span className="font-bold text-[var(--card-foreground)]">₹{cartSubtotal}</span>
          </div>

          <div className="flex justify-between py-1 text-[var(--muted-foreground)]">
            <span>Restaurant GST (5%)</span>
            <span className="font-bold text-[var(--card-foreground)]">₹{cartTax}</span>
          </div>

          <div className="flex justify-between py-1 text-[var(--muted-foreground)]">
            <span>VIP Rewards Applied</span>
            <span className="font-black text-emerald-500">₹0.00 (Level 2 Gold Member)</span>
          </div>

          <div className="flex justify-between pt-3 text-base font-black text-[var(--foreground)]">
            <span>Total Payable Amount</span>
            <span className="text-lg text-amber-600 dark:text-amber-400">₹{cartTotal}</span>
          </div>
        </div>

        <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between text-[11px] text-[var(--muted-foreground)] font-medium">
          <span>Barista prep starts instantly upon checkout confirmation</span>
          <span className="font-black text-amber-500">+{Math.floor(cartTotal / 10)} pts</span>
        </div>
      </div>

      {/* Checkout Action Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setActiveView('menu')}
          className="py-3.5 px-5 rounded-2xl border border-[var(--border)] text-xs sm:text-sm font-bold bg-[var(--card)] text-[var(--card-foreground)] hover:bg-[var(--muted)] transition-all cursor-pointer"
        >
          Add More Items
        </button>

        <button
          onClick={() => setIsPaymentModalOpen(true)}
          className="flex-1 py-4 px-6 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-between transition-all shadow-md hover:shadow-xl hover:scale-[1.01] active:scale-95 cursor-pointer"
          style={{
            backgroundColor: 'var(--primary)',
            color: 'var(--primary-foreground)'
          }}
        >
          <span>Proceed to Instant Pay</span>
          <span className="flex items-center gap-1.5 font-black text-base">
            ₹{cartTotal} <ArrowRight className="w-4 h-4" />
          </span>
        </button>
      </div>
    </div>
  );
};
