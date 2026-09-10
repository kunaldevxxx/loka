import { createClient, RealtimeChannel } from '@supabase/supabase-js';

// Fallback project URL based on user's Supabase instance
const DEFAULT_SUPABASE_URL = 'https://wrbnmtzxapodewxhcxkn.supabase.co';

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_ANON_KEY.length > 20);
};

export const supabase = isSupabaseConfigured()
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null;

/**
 * Synthesizes a pleasant artisanal cafe service chime using the Web Audio API.
 * High-fidelity 2-tone chime: D5 (587 Hz) followed by A5 (880 Hz).
 * Works 100% offline without needing external audio assets.
 */
export const playKitchenChime = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const playTone = (freq: number, startTime: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      // Smooth attack and pleasant exponential decay
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.28, startTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    const now = ctx.currentTime;
    playTone(587.33, now, 0.45); // D5
    playTone(880.0, now + 0.12, 0.7); // A5 (higher harmonic sparkle)
  } catch (err) {
    // Audio contexts may be blocked by autoplay policies until user interaction
    console.warn('[KitchenChime] Audio playback suppressed:', err);
  }
};

/**
 * Subscribes to Supabase Realtime changes on the 'orders' table for a specific cafe.
 * Automatically handles INSERT (new ticket) and UPDATE (status change).
 */
export const subscribeToKitchenOrders = (
  cafeId: string,
  callbacks: {
    onInsert?: (orderRow: any) => void;
    onUpdate?: (orderRow: any) => void;
    onStatusChange?: (status: string) => void;
  }
): { unsubscribe: () => void } => {
  if (!supabase) {
    if (callbacks.onStatusChange) {
      callbacks.onStatusChange('UNCONFIGURED');
    }
    return { unsubscribe: () => {} };
  }

  const channelName = `kds-orders-${cafeId}-${Date.now()}`;
  const channel: RealtimeChannel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'orders',
        filter: `cafe_id=eq.${cafeId}`,
      },
      (payload) => {
        if (payload.eventType === 'INSERT') {
          playKitchenChime();
          callbacks.onInsert?.(payload.new);
        } else if (payload.eventType === 'UPDATE') {
          callbacks.onUpdate?.(payload.new);
        }
      }
    )
    .subscribe((status) => {
      callbacks.onStatusChange?.(status);
    });

  return {
    unsubscribe: () => {
      supabase.removeChannel(channel);
    },
  };
};
