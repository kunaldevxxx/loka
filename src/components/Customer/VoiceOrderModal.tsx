import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../lib/api';
import { VoiceOrderResponse } from '../../types/api';
import { X, Mic, Volume2, Sparkles, Check, ArrowRight, RefreshCw, VolumeX, MicOff } from 'lucide-react';

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
  const [speaker, setSpeaker] = useState<'shubh' | 'priya' | 'aditya' | 'roopa'>('shubh');
  const [transcript, setTranscript] = useState('');
  const [voiceResult, setVoiceResult] = useState<VoiceOrderResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Audio & media recording refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (!isVoiceModalOpen) {
      stopAudio();
      stopRecording();
      setTranscript('');
      setVoiceResult(null);
    }
  }, [isVoiceModalOpen]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopAudio();
      stopRecording();
    };
  }, []);

  const samplePrompts = [
    'One Signature Cappuccino with oat milk and single shot',
    'Two warm Artisan Butter Croissants',
    'Chilled Espresso Martini double shot with extra vodka',
    'Iced Spanish Latte with sweet cream cold foam'
  ];

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAudio(false);
  };

  const playVoiceAudio = (audioBase64?: string | null, fallbackText?: string, format = 'wav') => {
    stopAudio();

    if (audioBase64) {
      try {
        const mime = format === 'mp3' ? 'audio/mpeg' : 'audio/wav';
        const audio = new Audio(`data:${mime};base64,${audioBase64}`);
        audioRef.current = audio;

        audio.onplay = () => setIsPlayingAudio(true);
        audio.onended = () => {
          setIsPlayingAudio(false);
          audioRef.current = null;
        };
        audio.onerror = () => {
          setIsPlayingAudio(false);
          audioRef.current = null;
          // Fallback to browser TTS if audio decoding fails
          if (fallbackText && 'speechSynthesis' in window) {
            playBrowserSpeech(fallbackText);
          }
        };

        audio.play().catch((err) => {
          console.warn('[Sarvam AI] Audio autoplay blocked:', err);
          setIsPlayingAudio(false);
        });
        return;
      } catch (err) {
        console.warn('[Sarvam AI] Error initializing audio:', err);
      }
    }

    // Fallback to browser SpeechSynthesis when no audio provided
    if (fallbackText && 'speechSynthesis' in window) {
      playBrowserSpeech(fallbackText);
    }
  };

  const playBrowserSpeech = (text: string) => {
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.lang = language === 'hi' ? 'hi-IN' : language === 'ta' ? 'ta-IN' : language === 'te' ? 'te-IN' : 'en-IN';
      utterance.onstart = () => setIsPlayingAudio(true);
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    } catch {
      setIsPlayingAudio(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const handleStartMic = async () => {
    if (isRecording) {
      stopRecording();
      return;
    }

    stopAudio();
    setVoiceResult(null);
    setIsRecording(true);

    // 1. Try real audio recording via MediaRecorder API
    if (navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function') {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          stream.getTracks().forEach((track) => track.stop());
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });

          if (audioBlob.size > 1000) {
            // Convert to Base64 and send to Sarvam STT
            const reader = new FileReader();
            reader.onloadend = async () => {
              const base64Data = (reader.result as string)?.split(',')[1];
              if (base64Data) {
                try {
                  const sttRes = await api.transcribeAudio(base64Data, language);
                  if (sttRes.transcript && sttRes.transcript.trim()) {
                    setTranscript(sttRes.transcript);
                    processVoiceQuery(sttRes.transcript);
                    return;
                  }
                } catch {
                  // Fall through if STT key or service error
                }
              }
              fallbackPromptSelection();
            };
            reader.readAsDataURL(audioBlob);
          } else {
            fallbackPromptSelection();
          }
        };

        mediaRecorder.start();

        // Auto-stop recording after 4.5s for snappy ordering flow
        setTimeout(() => {
          if (mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
            setIsRecording(false);
          }
        }, 4500);

        return;
      } catch (err: any) {
        console.warn('Microphone stream access denied or failed:', err);
      }
    }

    // 2. Try browser SpeechRecognition if MediaRecorder unavailable
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRec) {
      try {
        const recognition = new SpeechRec();
        recognition.lang = language === 'hi' ? 'hi-IN' : language === 'ta' ? 'ta-IN' : language === 'te' ? 'te-IN' : 'en-US';
        recognition.onresult = (event: any) => {
          const text = event.results[0][0].transcript;
          setTranscript(text);
          processVoiceQuery(text);
          setIsRecording(false);
        };
        recognition.onerror = () => {
          fallbackPromptSelection();
          setIsRecording(false);
        };
        recognition.start();
        return;
      } catch {
        // Continue to fallback simulation
      }
    }

    // 3. Simulated recording fallback
    setTimeout(() => {
      fallbackPromptSelection();
      setIsRecording(false);
    }, 1800);
  };

  const fallbackPromptSelection = () => {
    const chosen = samplePrompts[Math.floor(Math.random() * samplePrompts.length)];
    setTranscript(chosen);
    processVoiceQuery(chosen);
  };

  const processVoiceQuery = async (queryText: string) => {
    setLoading(true);
    stopAudio();
    try {
      const res = await api.processVoiceOrder({
        cafeId: currentCafe?.cafeId || 'cafe-001',
        deviceId,
        language,
        speaker,
        transcript: queryText
      });

      setVoiceResult(res);

      // Play back audio response using Sarvam Bulbul v3 voice
      if (res.audio) {
        playVoiceAudio(res.audio, res.speechResponse, res.format || 'wav');
      } else if (res.speechResponse) {
        playVoiceAudio(null, res.speechResponse);
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
    stopAudio();
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

  // Keep hooks and their cleanup callbacks valid even when the dialog is closed.
  // Returning earlier leaves the helpers below in the temporal dead zone while
  // the close-effect is running, which crashes the entire React tree.
  if (!isVoiceModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[var(--card)] text-[var(--card-foreground)] rounded-3xl border border-[var(--border)] shadow-2xl p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-base font-bold">AI Voice Assistant</h2>
                <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-700 font-extrabold tracking-wider">
                  Sarvam AI
                </span>
              </div>
              <p className="text-[11px] text-[var(--muted-foreground)]">Bulbul v3 TTS & Saaras STT</p>
            </div>
          </div>
          <button
            onClick={() => {
              stopAudio();
              setIsVoiceModalOpen(false);
            }}
            className="p-1.5 rounded-full hover:bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--card-foreground)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Voice & Language Settings */}
        <div className="space-y-2.5 pt-1">
          {/* Language selector */}
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[var(--muted-foreground)]">Language:</span>
            <div className="flex items-center gap-1 bg-[var(--muted)] p-1 rounded-xl border border-[var(--border)]">
              {[
                { id: 'en', label: 'English (IN)' },
                { id: 'hi', label: 'हिंदी' },
                { id: 'ta', label: 'தமிழ்' },
                { id: 'te', label: 'తెలుగు' }
              ].map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => setLanguage(lang.id as any)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                    language === lang.id
                      ? 'bg-[var(--card)] text-[var(--foreground)] shadow-xs'
                      : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          {/* Voice Speaker selector */}
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[var(--muted-foreground)]">AI Voice:</span>
            <div className="flex items-center gap-1 bg-[var(--muted)] p-1 rounded-xl border border-[var(--border)]">
              {[
                { id: 'shubh', label: 'Shubh (M)' },
                { id: 'priya', label: 'Priya (F)' },
                { id: 'aditya', label: 'Aditya (M)' },
                { id: 'roopa', label: 'Roopa (F)' }
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSpeaker(s.id as any)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                    speaker === s.id
                      ? 'bg-[var(--card)] text-[var(--foreground)] shadow-xs'
                      : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Microphone Action Zone */}
        <div className="py-3 text-center space-y-3">
          <div className="relative inline-block">
            {isRecording && (
              <div className="absolute -inset-3 rounded-full bg-rose-500/30 animate-ping" />
            )}
            <button
              onClick={handleStartMic}
              disabled={loading}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-xl ${
                isRecording
                  ? 'bg-rose-500 text-white scale-110 ring-4 ring-rose-300'
                  : 'bg-[var(--primary)] text-[var(--primary-foreground)] hover:scale-105 active:scale-95'
              }`}
            >
              {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
            </button>
          </div>

          <p className="text-xs font-semibold text-[var(--muted-foreground)]">
            {isRecording
              ? 'Listening with Sarvam Saaras v4... tap again to send'
              : loading
              ? 'Processing speech & pricing menu items...'
              : 'Tap microphone to speak your order'}
          </p>

          {/* Sample voice queries */}
          {!transcript && !loading && (
            <div className="space-y-1.5 pt-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--muted-foreground)]">
                Or try ordering:
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
              <div className="space-y-2.5 pt-2.5 border-t border-[var(--border)]">
                <div className="flex items-center justify-between text-xs font-bold text-[var(--card-foreground)]">
                  <span>Detected Order Items:</span>
                  <span className="text-emerald-600 font-extrabold text-sm">₹{voiceResult.total}</span>
                </div>

                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {voiceResult.items.map((it, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center text-xs bg-[var(--card)] p-2.5 rounded-xl border border-[var(--border)] shadow-2xs"
                    >
                      <div>
                        <span className="font-bold">{it.qty}x {it.name}</span>
                        <div className="text-[10px] text-[var(--muted-foreground)]">{it.customization}</div>
                      </div>
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    </div>
                  ))}
                </div>

                {/* Assistant Spoken Response & Replay Control */}
                <div className="flex items-center justify-between pt-2 border-t border-[var(--border)] text-xs">
                  <div className="flex items-center gap-2 text-[11px] font-medium text-[var(--foreground)]">
                    {isPlayingAudio ? (
                      <>
                        <Volume2 className="w-4 h-4 text-amber-500 animate-pulse" />
                        <span className="text-amber-600 font-semibold">Speaking ({speaker})...</span>
                      </>
                    ) : (
                      <>
                        <VolumeX className="w-4 h-4 text-[var(--muted-foreground)]" />
                        <span className="text-[var(--muted-foreground)]">Voice ready ({speaker})</span>
                      </>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      if (isPlayingAudio) {
                        stopAudio();
                      } else {
                        playVoiceAudio(voiceResult.audio, voiceResult.speechResponse, voiceResult.format || 'wav');
                      }
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--muted)] hover:bg-[var(--border)] text-[10px] font-bold text-[var(--card-foreground)] transition-colors"
                  >
                    <RefreshCw className={`w-3 h-3 ${isPlayingAudio ? 'animate-spin' : ''}`} />
                    <span>{isPlayingAudio ? 'Stop Audio' : 'Replay Voice'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Button */}
        {voiceResult && (
          <button
            onClick={handleConfirmOrder}
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 text-white shadow-md hover:opacity-95 transition-opacity"
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
