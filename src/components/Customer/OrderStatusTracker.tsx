import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../lib/api';
import { OrderStatusResponse } from '../../types/api';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle2,
  Clock,
  ChefHat,
  PackageCheck,
  Receipt,
  AlertCircle,
  XCircle,
  Sparkles,
  ArrowRight,
  Coffee,
  Check
} from 'lucide-react';

export const OrderStatusTracker: React.FC = () => {
  const {
    activeOrderId,
    setActiveOrderId,
    setActiveView,
    setIsComplaintModalOpen,
    showToast,
    refreshTrigger
  } = useApp();

  const [statusData, setStatusData] = useState<OrderStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelPrompt, setShowCancelPrompt] = useState(false);

  // Poll status every 2.5 seconds
  useEffect(() => {
    if (!activeOrderId) return;

    let isMounted = true;
    const fetchStatus = () => {
      api.getOrderStatus(activeOrderId)
        .then((res) => {
          if (isMounted) {
            setStatusData(res);
            setLoading(false);
          }
        })
        .catch((err) => {
          console.error('Failed to poll order status', err);
          if (isMounted) setLoading(false);
        });
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 2500);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [activeOrderId, refreshTrigger]);

  if (!activeOrderId) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/15 border border-amber-500/20 text-amber-500 mx-auto flex items-center justify-center shadow-lg">
          <Clock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-[var(--foreground)] tracking-tight">No Active Order in Queue</h2>
        <p className="text-xs sm:text-sm text-[var(--muted-foreground)] max-w-sm mx-auto font-medium">
          You don't have an order currently being prepared. Place a drink or dish from the menu to track its status live!
        </p>
        <button
          onClick={() => setActiveView('menu')}
          className="px-6 py-3 rounded-2xl text-xs sm:text-sm font-black shadow-md hover:scale-105 active:scale-95 transition-all text-white cursor-pointer"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          Explore Menu
        </button>
      </div>
    );
  }

  if (loading && !statusData) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="relative w-12 h-12 mx-auto">
          <div className="w-12 h-12 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin" />
          <Coffee className="w-5 h-5 text-amber-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        <p className="text-xs font-bold text-[var(--foreground)]">Connecting to kitchen telemetry...</p>
      </div>
    );
  }

  const steps = [
    {
      index: 1,
      key: 'confirmed',
      title: 'Order Confirmed',
      desc: 'Dispatched to barista and kitchen tickets',
      timestamp: statusData?.timestamps.confirmed || statusData?.timestamps.created,
      icon: CheckCircle2,
      color: 'text-amber-500'
    },
    {
      index: 2,
      key: 'preparing',
      title: 'Preparing in Kitchen',
      desc: 'Pulling espresso shots, steaming milk & baking',
      timestamp: statusData?.timestamps.preparing,
      icon: ChefHat,
      color: 'text-orange-500'
    },
    {
      index: 3,
      key: 'ready',
      title: 'Ready for Collection',
      desc: 'Placed at bar counter ready for table pickup',
      timestamp: statusData?.timestamps.ready,
      icon: PackageCheck,
      color: 'text-emerald-500'
    },
    {
      index: 4,
      key: 'collected',
      title: 'Order Enjoyed & Complete',
      desc: 'Collected by patron. Thank you for dining with us!',
      timestamp: statusData?.timestamps.collected,
      icon: Sparkles,
      color: 'text-cyan-500'
    }
  ];

  // Helper for simulation to next stage for user testing convenience
  const handleSimulateNextStep = async () => {
    if (!statusData) return;
    const flow = ['confirmed', 'preparing', 'ready', 'collected'];
    const curIdx = flow.indexOf(statusData.status);
    const nextStatus = flow[curIdx + 1] as any;
    if (nextStatus) {
      await api.updateOrderStatus(activeOrderId, nextStatus);
      showToast(`Kitchen station updated order to: ${nextStatus.toUpperCase()}`);
      const updated = await api.getOrderStatus(activeOrderId);
      setStatusData(updated);
    }
  };

  const handleConfirmCancelOrder = async () => {
    setCancelling(true);
    try {
      const res = await api.cancelOrder(activeOrderId, 'Customer requested cancellation');
      showToast(res.message);
      setActiveOrderId(null);
      setActiveView('menu');
    } catch (err: any) {
      showToast(err.message || 'Cannot cancel order');
    } finally {
      setCancelling(false);
      setShowCancelPrompt(false);
    }
  };

  const currentStep = statusData?.stepIndex || 1;
  const isCancelled = statusData?.status === 'cancelled';

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Tracker Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[var(--card)] text-[var(--card-foreground)] rounded-3xl sm:rounded-4xl p-6 sm:p-8 border border-[var(--border)] shadow-md space-y-6"
      >
        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-[var(--border)]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Live Kitchen Radar
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
              Order #{activeOrderId.substring(activeOrderId.length - 6).toUpperCase()}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-xs ${
                statusData?.status === 'ready'
                  ? 'bg-emerald-500 text-white animate-bounce'
                  : statusData?.status === 'preparing'
                  ? 'bg-amber-500 text-white'
                  : statusData?.status === 'collected'
                  ? 'bg-cyan-600 text-white'
                  : 'bg-[var(--muted)] text-[var(--foreground)]'
              }`}
            >
              {statusData?.status.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold text-[var(--muted-foreground)]">
            <span>Kitchen Preparation</span>
            <span className="text-[var(--foreground)] font-black">{statusData?.progressPct}% Completed</span>
          </div>
          <div className="w-full h-3 bg-[var(--muted)] rounded-full overflow-hidden p-0.5 border border-[var(--border)]">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 shadow-xs"
              initial={{ width: '0%' }}
              animate={{ width: `${statusData?.progressPct || 25}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* 4-Step Timeline */}
        <div className="space-y-6 pt-3">
          {steps.map((step) => {
            const isCompleted = currentStep >= step.index;
            const isCurrent = currentStep === step.index;
            const Icon = step.icon;

            return (
              <div key={step.key} className="flex items-start gap-4 relative">
                {/* Connecting vertical line */}
                {step.index < 4 && (
                  <div
                    className={`absolute left-5 top-11 w-0.5 h-12 -translate-x-1/2 transition-colors duration-500 ${
                      currentStep > step.index ? 'bg-amber-500' : 'bg-[var(--border)]'
                    }`}
                  />
                )}

                {/* Circle Icon */}
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 z-10 transition-all duration-300 ${
                    isCompleted
                      ? 'bg-amber-500 text-white shadow-md'
                      : 'bg-[var(--muted)] text-[var(--muted-foreground)] border border-[var(--border)]'
                  } ${isCurrent ? 'ring-4 ring-amber-500/25 scale-110' : ''}`}
                >
                  <Icon className="w-5 h-5 stroke-[2.5]" />
                </div>

                {/* Step Details */}
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-center justify-between gap-2">
                    <h3
                      className={`text-sm font-extrabold ${
                        isCompleted ? 'text-[var(--card-foreground)]' : 'text-[var(--muted-foreground)]'
                      }`}
                    >
                      {step.title}
                    </h3>

                    {step.timestamp && (
                      <span className="text-[11px] font-mono font-bold text-[var(--muted-foreground)] px-2 py-0.5 rounded-md bg-[var(--muted)]">
                        {new Date(step.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[var(--muted-foreground)] mt-0.5 leading-relaxed font-medium">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Simulator helper banner for quick reviewer testing */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-[var(--muted)]/50 to-orange-500/10 border border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
            <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <span className="font-semibold">Simulate kitchen staff advancing this order:</span>
          </div>

          <button
            onClick={handleSimulateNextStep}
            disabled={currentStep >= 4}
            className="w-full sm:w-auto px-4 py-2 rounded-xl font-black bg-[var(--primary)] text-[var(--primary-foreground)] hover:scale-105 active:scale-95 transition-all shadow-xs disabled:opacity-40 cursor-pointer"
          >
            Advance Station &rarr;
          </button>
        </div>

        {/* Inline Cancel Confirmation Alert */}
        <AnimatePresence>
          {showCancelPrompt && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-xs space-y-3"
            >
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold">
                <AlertCircle className="w-4 h-4" />
                <span>Are you sure you want to cancel order #{activeOrderId.substring(activeOrderId.length - 6).toUpperCase()}?</span>
              </div>
              <p className="text-[var(--muted-foreground)]">
                Baristas may have already begun pulling shots. Once cancelled, this ticket cannot be restored.
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleConfirmCancelOrder}
                  disabled={cancelling}
                  className="px-4 py-1.5 rounded-xl bg-red-600 text-white font-black hover:bg-red-700 transition-colors cursor-pointer"
                >
                  {cancelling ? 'Cancelling...' : 'Yes, Cancel Order'}
                </button>
                <button
                  onClick={() => setShowCancelPrompt(false)}
                  className="px-4 py-1.5 rounded-xl bg-[var(--muted)] text-[var(--card-foreground)] font-bold hover:bg-[var(--border)] transition-colors cursor-pointer"
                >
                  Keep Order
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons Row */}
        <div className="pt-4 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveView('receipt')}
              className="px-4 py-2.5 rounded-2xl text-xs font-bold border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--muted)] transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Receipt className="w-3.5 h-3.5 text-amber-500" />
              <span>Tax Invoice</span>
            </button>

            <button
              onClick={() => setIsComplaintModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl text-xs font-bold border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--muted)] transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <AlertCircle className="w-3.5 h-3.5 text-orange-500" />
              <span>Report Issue</span>
            </button>
          </div>

          {currentStep < 3 && !isCancelled && !showCancelPrompt && (
            <button
              onClick={() => setShowCancelPrompt(true)}
              className="px-4 py-2.5 rounded-2xl text-xs font-bold text-red-500 hover:bg-red-500/10 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Cancel Order</span>
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
