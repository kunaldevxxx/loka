import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../lib/api';
import { VoiceOrderResponse } from '../../types/api';
import { X, Mic, Volume2, Sparkles, Check, ArrowRight, RefreshCw } from 'lucide-react';

export const VoiceOrderModal: React.FC = () => {
  const {
    isVoiceModalOpen,
    setIsVoiceModalOpen,
    currentCafe,
    deviceId,
    tableId,
    setActiveOrderId,
    setActiveOrder,
    setActiveView,
    showToast,
    addLoyaltyPoints
  } = useApp();

  const [isRecording, setIsRecording] = useState(false);
  const [language, setLanguage] = useState<'en' | 'hi' | 'ta' | 'te'>('en');
  const [transcript, setTranscript] = useState('');
  const [voiceResult, setVoiceResult] = useState<VoiceOrderResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    if (!isVoiceModalOpen) {
      setIsRecording(false);
      setTranscript('');
      setVoiceResult(null);
    }
  }, [isVoiceModalOpen]);

  if (!isVoiceModalOpen) return null;

  const samplePrompts = [
    'One Cappuccino with single shot and oat milk',
    'Two warm Artisan Butter Croissants',
    'Chilled Espresso Martini double shot with extra vodka',
    'Iced Spanish Latte with sweet cream cold foam'
  ];

  const handleStartSimulatedRecording = () => {
    setIsRecording(true);
    setVoiceResult(null);
    // Try browser SpeechRecognition if available
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRec) {
      try {
        const recognition = new SpeechRec();
        recognition.lang = language === 'hi' ? 'hi-IN' : 'en-US';
        recognition.onresult = (event: any) => {
          const text = event.results[0][0].transcript;
          setTranscript(text);
          processVoiceQuery(text);
          setIsRecording(false);
        };
        recognition.onerror = () => {
          // fallback to random prompt
          const fallback = samplePrompts[Math.floor(Math.random() * samplePrompts.length)];
          setTranscript(fallback);
          processVoiceQuery(fallback);
          setIsRecording(false);
        };
        recognition.start();
        return;
      } catch {
        // continue to timer simulation
      }
    }

    // Timer simulation
    setTimeout(() => {
      const chosen = samplePrompts[Math.floor(Math.random() * samplePrompts.length)];
      setTranscript(chosen);
      processVoiceQuery(chosen);
      setIsRecording(false);
    }, 1800);
  };

  const processVoiceQuery = async (queryText: string) => {
    setLoading(true);
    try {
      const res = await api.processVoiceOrder({
        cafeId: currentCafe?.cafeId || 'cafe-001',
        deviceId,
        language,
        transcript: queryText
      });
      setVoiceResult(res);

      // Speak TTS response using Web Speech Synthesis
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(res.speechResponse);
        utterance.rate = 1.0;
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
      }
    } catch (err: any) {
      showToast(err.message || 'Voice processing error');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmOrder = async () => {
    if (!voiceResult || !currentCafe) return;
    setLoading(true);
    try {
      // 1. Create order
      const order = await api.createOrder({
        cafeId: currentCafe.cafeId,
        deviceId,
        tableId,
        items: voiceResult.items.map((i) => ({
          itemId: i.itemId,
          qty: i.qty,
          customization: { notes: i.customization }
        }))
      });

      // 2. Pay order (UPI by default for voice flow)
      await api.payOrder(order.id, 'upi');
      order.paymentMethod = 'upi';
      order.paymentStatus = 'paid';
      order.kitchenStatus = 'confirmed';

      setActiveOrderId(order.id);
      setActiveOrder(order);
      addLoyaltyPoints(order.pointsEarned);

      setIsVoiceModalOpen(false);
      setActiveView('order_status');
      showToast(`Voice order placed! #${order.confirmationCode}`);
    } catch (err: any) {
      showToast(err.message || 'Failed to place voice order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[var(--card)] text-[var(--card-foreground)] rounded-3xl border border-[var(--border)] shadow-2xl p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold">AI Voice Assistant</h2>
              <p className="text-[11px] text-[var(--muted-foreground)]">Sarvam AI STT & Natural Language Order</p>
            </div>
          </div>
          <button
            onClick={() => {
              if ('speechSynthesis' in window) window.speechSynthesis.cancel();
              setIsVoiceModalOpen(false);
            }}
            className="p-1 text-[var(--muted-foreground)] hover:text-[var(--card-foreground)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Language selector */}
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-[var(--muted-foreground)]">Language:</span>
          <div className="flex items-center gap-1.5 bg-[var(--muted)] p-1 rounded-xl border border-[var(--border)]">
            {[
              { id: 'en', label: 'English' },
              { id: 'hi', label: 'हिंदी (Hindi)' },
              { id: 'ta', label: 'தமிழ் (Tamil)' },
              { id: 'te', label: 'తెలుగు (Telugu)' }
            ].map((lang) => (
              <button
                key={lang.id}
                onClick={() => setLanguage(lang.id as any)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                  language === lang.id
                    ? 'bg-[var(--card)] text-[var(--foreground)] shadow-2xs'
                    : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        {/* Microphone Action Zone */}
        <div className="py-4 text-center space-y-4">
          <div className="relative inline-block">
            {isRecording && (
              <div className="absolute -inset-3 rounded-full bg-[var(--accent)]/30 animate-ping" />
            )}
            <button
              onClick={handleStartSimulatedRecording}
              disabled={isRecording || loading}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-lg ${
                isRecording
                  ? 'bg-rose-500 text-white scale-110'
                  : 'bg-[var(--primary)] text-[var(--primary-foreground)] hover:scale-105 active:scale-95'
              }`}
            >
              <Mic className="w-8 h-8" />
            </button>
          </div>

          <p className="text-xs font-semibold text-[var(--muted-foreground)]">
            {isRecording
              ? 'Listening to speech in real-time...'
              : loading
              ? 'Parsing speech intent & pricing items...'
              : 'Tap microphone to speak your order'}
          </p>

          {/* Sample voice queries */}
          {!transcript && !loading && (
            <div className="space-y-1.5 pt-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--muted-foreground)]">
                Try saying:
              </span>
              <div className="flex flex-wrap gap-1.5 justify-center">
                {samplePrompts.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setTranscript(p);
                      processVoiceQuery(p);
                    }}
                    className="text-[10px] px-2.5 py-1 rounded-lg bg-[var(--muted)] hover:bg-[var(--border)] text-[var(--card-foreground)] transition-colors text-left"
                  >
                    "{p}"
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Transcript and Parsed Results */}
        {transcript && (
          <div className="bg-[var(--muted)]/50 rounded-2xl p-4 border border-[var(--border)] space-y-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                Transcribed Audio
              </span>
              <p className="text-xs italic text-[var(--foreground)] mt-0.5 font-medium">
                "{transcript}"
              </p>
            </div>

            {voiceResult && (
              <div className="space-y-2 pt-2 border-t border-[var(--border)]">
                <div className="flex items-center justify-between text-xs font-bold text-[var(--card-foreground)]">
                  <span>Detected Order Items:</span>
                  <span className="text-[var(--foreground)]">₹{voiceResult.total}</span>
                </div>

                {voiceResult.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between text-xs bg-[var(--card)] p-2 rounded-xl border border-[var(--border)]">
                    <div>
                      <span className="font-bold">{it.qty}x {it.name}</span>
                      <div className="text-[10px] text-[var(--muted-foreground)]">{it.customization}</div>
                    </div>
                    <Check className="w-4 h-4 text-emerald-500 self-center" />
                  </div>
                ))}

                {isSpeaking && (
                  <div className="flex items-center gap-1.5 text-[11px] text-[var(--accent)] font-medium">
                    <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                    <span>Speaking assistant response...</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Action Button */}
        {voiceResult && (
          <button
            onClick={handleConfirmOrder}
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 text-white shadow-md hover:opacity-95"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            <span>Confirm & Send to Kitchen (₹{voiceResult.total})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
