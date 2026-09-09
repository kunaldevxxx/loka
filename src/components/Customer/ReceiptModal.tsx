import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../lib/api';
import { ReceiptResponse } from '../../types/api';
import { Receipt, Star, Award, ArrowLeft, Download, CheckCircle2 } from 'lucide-react';

export const ReceiptModal: React.FC = () => {
  const { activeOrderId, currentCafe, setActiveView } = useApp();
  const [receiptData, setReceiptData] = useState<ReceiptResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeOrderId) return;
    setLoading(true);
    api.getReceipt(activeOrderId)
      .then((res) => {
        setReceiptData(res);
      })
      .catch((err) => {
        console.error('Failed to get receipt', err);
      })
      .finally(() => setLoading(false));
  }, [activeOrderId]);

  if (loading) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-3">
        <div className="w-8 h-8 border-3 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-[var(--muted-foreground)]">Generating official receipt...</p>
      </div>
    );
  }

  if (!receiptData) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <Receipt className="w-12 h-12 text-[var(--muted-foreground)] mx-auto opacity-50" />
        <h2 className="text-lg font-bold text-[var(--foreground)]">Receipt Not Found</h2>
        <button
          onClick={() => setActiveView('menu')}
          className="px-4 py-2 rounded-xl text-xs font-bold text-white"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          Return to Menu
        </button>
      </div>
    );
  }

  const { order, visitCount, totalPoints, nextRewardAt, rewardUnlocked } = receiptData;
  const progressPct = Math.min(100, Math.round((totalPoints / nextRewardAt) * 100));

  return (
    <div className="max-w-md mx-auto px-4 py-8 space-y-6">
      {/* Top back button */}
      <button
        onClick={() => setActiveView('order_status')}
        className="flex items-center gap-1.5 text-xs font-bold text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Order Status</span>
      </button>

      {/* Printable Receipt Paper Card */}
      <div className="bg-[var(--card)] text-[var(--card-foreground)] rounded-3xl p-6 sm:p-7 border border-[var(--border)] shadow-xl relative overflow-hidden space-y-5">
        {/* Receipt Header */}
        <div className="text-center pb-4 border-b border-dashed border-[var(--border)]">
          <div className="w-12 h-12 rounded-2xl bg-[var(--primary)] text-[var(--primary-foreground)] flex items-center justify-center text-xl font-bold mx-auto mb-2 shadow-xs">
            {currentCafe?.icon || '☕'}
          </div>
          <h2 className="text-lg font-extrabold">{currentCafe?.name || 'Brew Haven Cafe'}</h2>
          <p className="text-xs text-[var(--muted-foreground)]">{currentCafe?.location}</p>
          <div className="inline-block mt-2 px-3 py-1 rounded-full bg-[var(--muted)] text-[11px] font-mono font-bold">
            CONFIRMATION CODE: {order.confirmationCode}
          </div>
        </div>

        {/* Invoice Info */}
        <div className="flex justify-between text-xs text-[var(--muted-foreground)] py-1">
          <span>Order ID: #{order.id.slice(-6).toUpperCase()}</span>
          <span>{new Date(order.createdAt).toLocaleDateString()}</span>
        </div>

        {/* Itemized Line Items */}
        <div className="space-y-2.5 divide-y divide-[var(--border)] py-1">
          {order.items.map((item, i) => (
            <div key={i} className="pt-2 first:pt-0 flex justify-between items-start text-xs">
              <div>
                <div className="font-bold text-[var(--card-foreground)]">
                  {item.qty}x {item.name}
                </div>
                <div className="text-[10px] text-[var(--muted-foreground)]">
                  {item.customizationSummary}
                </div>
              </div>
              <span className="font-bold">₹{item.lineTotal}</span>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="pt-3 border-t border-dashed border-[var(--border)] space-y-1.5 text-xs">
          <div className="flex justify-between text-[var(--muted-foreground)]">
            <span>Subtotal</span>
            <span>₹{order.subtotal}</span>
          </div>
          <div className="flex justify-between text-[var(--muted-foreground)]">
            <span>GST (15%)</span>
            <span>₹{order.gst}</span>
          </div>
          <div className="flex justify-between text-sm font-extrabold pt-1 border-t border-[var(--border)] text-[var(--foreground)]">
            <span>Total Paid ({order.paymentMethod ? order.paymentMethod.toUpperCase() : 'PAID'})</span>
            <span>₹{order.total}</span>
          </div>
        </div>

        {/* Loyalty Reward Section */}
        <div className="bg-[var(--muted)]/60 rounded-2xl p-4 border border-[var(--border)] space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="flex items-center gap-1.5 text-[var(--foreground)]">
              <Award className="w-4 h-4 text-amber-500" />
              Loyalty Rewards Progress
            </span>
            <span className="text-[var(--accent)] font-mono">{totalPoints} / {nextRewardAt} pts</span>
          </div>

          <div className="w-full h-2 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%`, backgroundColor: 'var(--primary)' }}
            />
          </div>

          <p className="text-[11px] text-[var(--muted-foreground)]">
            {nextRewardAt - totalPoints} points needed to unlock your free signature beverage or pastry!
          </p>
        </div>

        {/* Print / Save */}
        <button
          onClick={() => window.print()}
          className="w-full py-2.5 px-4 rounded-xl border border-[var(--border)] text-xs font-bold flex items-center justify-center gap-2 hover:bg-[var(--muted)] transition-colors shadow-2xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Save / Print Receipt</span>
        </button>
      </div>
    </div>
  );
};
