import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../lib/api';
import { X, QrCode, CreditCard, Banknote, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const PaymentModal: React.FC = () => {
  const {
    isPaymentModalOpen,
    setIsPaymentModalOpen,
    cart,
    cartTotal,
    currentCafe,
    tableId,
    deviceId,
    clearCart,
    setActiveOrderId,
    setActiveOrder,
    setActiveView,
    showToast,
    addLoyaltyPoints
  } = useApp();

  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'cash'>('upi');
  const [loading, setLoading] = useState(false);

  if (!isPaymentModalOpen) return null;

  const handleProcessPayment = async () => {
    if (!currentCafe) return;
    setLoading(true);

    try {
      // 1. Create order
      const orderPayload = {
        cafeId: currentCafe.cafeId,
        deviceId,
        tableId,
        items: cart.map((c) => ({
          itemId: c.item.itemId,
          qty: c.qty,
          customization: c.customization
        }))
      };

      const createdOrder = await api.createOrder(orderPayload);

      // 2. Process Payment
      await api.payOrder(createdOrder.id, paymentMethod);

      // 3. Update order state
      createdOrder.paymentMethod = paymentMethod;
      createdOrder.paymentStatus = 'paid';
      createdOrder.kitchenStatus = 'confirmed';

      setActiveOrderId(createdOrder.id);
      setActiveOrder(createdOrder);
      addLoyaltyPoints(createdOrder.pointsEarned);

      clearCart();
      setIsPaymentModalOpen(false);
      setActiveView('order_status');
      showToast(`Payment successful! Order ${createdOrder.confirmationCode} confirmed.`);
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Payment processing failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[var(--card)] text-[var(--card-foreground)] rounded-3xl border border-[var(--border)] shadow-2xl overflow-hidden p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
          <div>
            <h2 className="text-lg font-black tracking-tight">Select Payment Method</h2>
            <p className="text-xs text-[var(--muted-foreground)]">
              Amount Due: <span className="font-extrabold text-[var(--foreground)] text-sm">₹{cartTotal}</span>
            </p>
          </div>

          <button
            onClick={() => setIsPaymentModalOpen(false)}
            className="p-1 rounded-full text-[var(--muted-foreground)] hover:text-[var(--card-foreground)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Payment Methods */}
        <div className="space-y-3">
          {/* UPI */}
          <button
            type="button"
            onClick={() => setPaymentMethod('upi')}
            className={`w-full p-4 rounded-2xl border text-left flex items-start justify-between transition-all ${
              paymentMethod === 'upi'
                ? 'border-[var(--primary)] bg-[var(--primary)]/10 ring-1 ring-[var(--primary)]'
                : 'border-[var(--border)] bg-[var(--card)] hover:bg-[var(--muted)]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-xs text-[var(--card-foreground)]">Instant UPI / QR</div>
                <div className="text-[11px] text-[var(--muted-foreground)]">GPay, PhonePe, Paytm, BHIM</div>
              </div>
            </div>
            {paymentMethod === 'upi' && <CheckCircle2 className="w-4 h-4 text-[var(--primary)]" />}
          </button>

          {/* Card */}
          <button
            type="button"
            onClick={() => setPaymentMethod('card')}
            className={`w-full p-4 rounded-2xl border text-left flex items-start justify-between transition-all ${
              paymentMethod === 'card'
                ? 'border-[var(--primary)] bg-[var(--primary)]/10 ring-1 ring-[var(--primary)]'
                : 'border-[var(--border)] bg-[var(--card)] hover:bg-[var(--muted)]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-xs text-[var(--card-foreground)]">Credit / Debit Card</div>
                <div className="text-[11px] text-[var(--muted-foreground)]">Visa, Mastercard, RuPay</div>
              </div>
            </div>
            {paymentMethod === 'card' && <CheckCircle2 className="w-4 h-4 text-[var(--primary)]" />}
          </button>

          {/* Cash */}
          <button
            type="button"
            onClick={() => setPaymentMethod('cash')}
            className={`w-full p-4 rounded-2xl border text-left flex items-start justify-between transition-all ${
              paymentMethod === 'cash'
                ? 'border-[var(--primary)] bg-[var(--primary)]/10 ring-1 ring-[var(--primary)]'
                : 'border-[var(--border)] bg-[var(--card)] hover:bg-[var(--muted)]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                <Banknote className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-xs text-[var(--card-foreground)]">Pay at Counter / Cash</div>
                <div className="text-[11px] text-[var(--muted-foreground)]">Pay staff when collecting order</div>
              </div>
            </div>
            {paymentMethod === 'cash' && <CheckCircle2 className="w-4 h-4 text-[var(--primary)]" />}
          </button>
        </div>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-[var(--muted-foreground)]">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>256-bit Encrypted Payment Gateway</span>
        </div>

        {/* Confirm Pay Button */}
        <button
          onClick={handleProcessPayment}
          disabled={loading}
          className="w-full py-3.5 px-4 rounded-2xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 hover:opacity-95 disabled:opacity-50"
          style={{
            backgroundColor: 'var(--primary)',
            color: 'var(--primary-foreground)'
          }}
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <span>Authorize & Pay ₹{cartTotal}</span>
          )}
        </button>
      </div>
    </div>
  );
};
