import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../lib/api';
import { Order, KitchenStatus } from '../../types/api';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChefHat,
  Clock,
  CheckCircle2,
  PackageCheck,
  AlertCircle,
  RefreshCw,
  Filter,
  Sparkles,
  Flame,
  Check
} from 'lucide-react';

export const KitchenDisplaySystem: React.FC = () => {
  const { currentCafe, showToast, refreshTrigger, triggerRefresh } = useApp();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('active');

  const fetchOrders = () => {
    if (!currentCafe) return;
    setLoading(true);
    api.getStaffOrders(currentCafe.cafeId)
      .then((res) => {
        setOrders(res.orders);
      })
      .catch((err) => {
        console.error('Failed to load kitchen orders', err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 4000);
    return () => clearInterval(interval);
  }, [currentCafe?.cafeId, refreshTrigger]);

  const handleUpdateStatus = async (orderId: string, nextStatus: 'confirmed' | 'preparing' | 'ready' | 'collected') => {
    try {
      await api.updateOrderStatus(orderId, nextStatus);
      showToast(`Order #${orderId.slice(-6).toUpperCase()} marked as ${nextStatus.toUpperCase()}`);
      fetchOrders();
      triggerRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to update order status');
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (statusFilter === 'active') {
      return ['confirmed', 'preparing', 'ready'].includes(o.kitchenStatus);
    }
    if (statusFilter === 'all') return true;
    return o.kitchenStatus === statusFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* KDS Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[var(--border)]">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/25 text-amber-500 flex items-center justify-center font-black shadow-sm">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Back-Of-House Console
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[var(--foreground)] tracking-tight">
              Kitchen Display System (KDS)
            </h1>
            <p className="text-xs text-[var(--muted-foreground)] font-medium mt-0.5">
              {currentCafe?.name} • Live Barista Prep & Pass Station
            </p>
          </div>
        </div>

        {/* Filter controls & Refresh */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-[var(--card)] p-1.5 rounded-2xl border border-[var(--border)] text-xs font-bold overflow-x-auto scrollbar-none shadow-xs">
            {[
              { id: 'active', label: 'Active Pipeline' },
              { id: 'confirmed', label: 'Queued' },
              { id: 'preparing', label: 'Brewing / Prep' },
              { id: 'ready', label: 'Ready for Pass' },
              { id: 'all', label: 'History' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                  statusFilter === f.id
                    ? 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-xs font-black'
                    : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] font-semibold'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <button
            onClick={fetchOrders}
            className="p-3 rounded-2xl bg-[var(--card)] text-[var(--card-foreground)] border border-[var(--border)] hover:bg-[var(--muted)] transition-colors shadow-xs cursor-pointer"
            title="Refresh Queue"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <div className="py-24 text-center bg-[var(--card)] rounded-3xl sm:rounded-4xl border border-[var(--border)] shadow-xs">
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/15 border border-emerald-500/20 text-emerald-500 mx-auto flex items-center justify-center mb-3">
            <PackageCheck className="w-8 h-8" />
          </div>
          <h3 className="font-black text-lg text-[var(--card-foreground)]">Station All Clear!</h3>
          <p className="text-xs text-[var(--muted-foreground)] mt-1 max-w-xs mx-auto font-medium">
            No active tickets are waiting in the kitchen line right now. New table orders will sound immediately.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence>
            {filteredOrders.map((order) => {
              const isPreparing = order.kitchenStatus === 'preparing';
              const isReady = order.kitchenStatus === 'ready';
              const isConfirmed = order.kitchenStatus === 'confirmed';

              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={order.id}
                  className={`rounded-3xl border transition-all overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-md ${
                    isPreparing
                      ? 'border-amber-500 bg-[var(--card)] ring-2 ring-amber-500/20 shadow-amber-500/5'
                      : isReady
                      ? 'border-emerald-500 bg-[var(--card)] ring-2 ring-emerald-500/20 shadow-emerald-500/5'
                      : 'border-[var(--border)] bg-[var(--card)]'
                  }`}
                >
                  {/* Card Top */}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-2 pb-3.5 border-b border-[var(--border)]">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-sm text-[var(--foreground)]">
                            #{order.id.slice(-6).toUpperCase()}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-lg font-black text-xs bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/25 uppercase">
                            {order.tableId}
                          </span>
                        </div>
                        <div className="text-[11px] text-[var(--muted-foreground)] flex items-center gap-1.5 mt-1 font-medium">
                          <Clock className="w-3.5 h-3.5 text-amber-500" />
                          <span>
                            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {order.confirmationCode && (
                            <span className="font-mono text-[10px] font-bold text-orange-500 bg-orange-500/10 px-1.5 py-0.5 rounded">
                              Code: {order.confirmationCode}
                            </span>
                          )}
                        </div>
                      </div>

                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-xs ${
                          isReady
                            ? 'bg-emerald-500 text-white animate-pulse'
                            : isPreparing
                            ? 'bg-amber-500 text-white'
                            : 'bg-[var(--muted)] text-[var(--muted-foreground)]'
                        }`}
                      >
                        {order.kitchenStatus}
                      </span>
                    </div>

                    {/* Items list */}
                    <div className="py-4 space-y-3">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-start justify-between gap-2 text-xs">
                          <div>
                            <div className="font-black text-sm sm:text-base text-[var(--card-foreground)]">
                              <span className="text-amber-500 font-extrabold mr-1">{item.qty}x</span> {item.name}
                            </div>
                            {item.customizationSummary && (
                              <div className="text-[11px] text-orange-600 dark:text-orange-400 font-bold mt-0.5 bg-orange-500/10 px-2 py-0.5 rounded-md inline-block">
                                ↳ {item.customizationSummary}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Status action buttons */}
                  <div className="p-3.5 bg-[var(--muted)]/40 border-t border-[var(--border)] flex items-center gap-2">
                    {isConfirmed && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'preparing')}
                        className="w-full py-3 px-4 rounded-2xl text-xs font-black bg-amber-500 hover:bg-amber-600 active:scale-95 text-white transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                      >
                        <ChefHat className="w-4 h-4" />
                        <span>Start Station Prep</span>
                      </button>
                    )}

                    {isPreparing && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'ready')}
                        className="w-full py-3 px-4 rounded-2xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                      >
                        <PackageCheck className="w-4 h-4" />
                        <span>Move to Collection Bar</span>
                      </button>
                    )}

                    {isReady && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'collected')}
                        className="w-full py-3 px-4 rounded-2xl text-xs font-black bg-zinc-800 hover:bg-black text-white dark:bg-zinc-200 dark:text-zinc-900 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Mark Order Collected</span>
                      </button>
                    )}

                    {order.kitchenStatus === 'collected' && (
                      <div className="w-full py-2.5 text-center text-xs font-black text-emerald-600 flex items-center justify-center gap-1">
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>Served & Finalized</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
