/**
 * Sarvam AI Integration Service
 * Documentation: https://docs.sarvam.ai/api/getting-started/welcome
 * 
 * - Text-to-Speech (TTS): Bulbul v3 with 30+ voices across 11 Indian languages
 * - Speech-to-Text (STT): Saaras v4 for high-accuracy Indian speech transcription
 * - Chat Completions: Sarvam-105B for Indic-aware conversational AI
 */

export interface SarvamTTSOptions {
  text: string;
  languageCode?: string;
  speaker?: string;
  pace?: number;
  speechSampleRate?: number;
  outputAudioCodec?: 'wav' | 'mp3' | 'aac' | 'flac';
}

export interface SarvamTTSResult {
  audioBase64: string;
  format: string;
  requestId?: string;
}

export interface SarvamSTTOptions {
  audioBuffer: Buffer | Uint8Array;
  mimeType?: string;
  filename?: string;
  languageCode?: string;
  mode?: 'transcribe' | 'translate' | 'verbatim' | 'translit' | 'codemix';
}

export interface SarvamSTTResult {
  transcript: string;
  languageCode?: string;
  requestId?: string;
}

export interface SarvamChatOptions {
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  model?: 'sarvam-105b' | 'sarvam-105b-conversations';
  temperature?: number;
}

// BCP-47 Language mapping for Sarvam AI
export const SARVAM_LANGUAGE_MAP: Record<string, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  kn: 'kn-IN',
  ml: 'ml-IN',
  mr: 'mr-IN',
  bn: 'bn-IN',
  gu: 'gu-IN',
  pa: 'pa-IN',
  od: 'od-IN',
  'en-IN': 'en-IN',
  'hi-IN': 'hi-IN',
  'ta-IN': 'ta-IN',
  'te-IN': 'te-IN',
  'kn-IN': 'kn-IN',
  'ml-IN': 'ml-IN',
  'mr-IN': 'mr-IN',
  'bn-IN': 'bn-IN',
  'gu-IN': 'gu-IN',
  'pa-IN': 'pa-IN',
  'od-IN': 'od-IN'
};

export const SARVAM_VOICES = {
  male: ['shubh', 'aditya', 'rahul', 'rohan', 'amit', 'dev', 'ratan', 'varun', 'manan', 'sumit', 'kabir', 'aayan', 'ashutosh', 'advait', 'anand', 'tarun', 'sunny', 'mani', 'gokul', 'vijay', 'mohit', 'rehan', 'soham'],
  female: ['priya', 'roopa', 'ritu', 'neha', 'pooja', 'simran', 'kavya', 'ishita', 'shreya', 'tanya', 'shruti', 'suhani', 'kavitha', 'rupali']
};

export function normalizeLanguageCode(code?: string): string {
  if (!code) return 'en-IN';
  return SARVAM_LANGUAGE_MAP[code] || 'en-IN';
}

export class SarvamClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey?: string, baseUrl = 'https://api.sarvam.ai') {
    this.apiKey = apiKey || process.env.SARVAM_API_KEY || '';
    this.baseUrl = baseUrl.replace(/\/+$/, '');
  }

  public isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  /**
   * Synthesize text to speech using Sarvam Bulbul v3
   * Endpoint: POST https://api.sarvam.ai/text-to-speech
   */
  public async synthesizeSpeech(options: SarvamTTSOptions): Promise<SarvamTTSResult | null> {
    const {
      text,
      languageCode = 'en-IN',
      speaker = 'shubh',
      pace = 1.0,
      speechSampleRate = 24000,
      outputAudioCodec = 'wav'
    } = options;

    if (!text || !text.trim()) {
      return null;
    }

    if (!this.isConfigured()) {
      console.warn('[Sarvam AI] SARVAM_API_KEY not set in environment. Skipping live TTS synthesis.');
      return null;
    }

    const payload = {
      text: text.slice(0, 2500),
      language_code: normalizeLanguageCode(languageCode),
      speaker: speaker.toLowerCase(),
      model: 'bulbul:v3',
      pace: Math.max(0.5, Math.min(2.0, pace)),
      speech_sample_rate: speechSampleRate,
      output_audio_codec: outputAudioCodec
    };

    try {
      const response = await fetch(`${this.baseUrl}/text-to-speech`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-subscription-key': this.apiKey
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error(`[Sarvam AI] TTS error ${response.status}:`, errText);
        if (response.status === 403) {
          console.error('[Sarvam AI] Invalid API subscription key. Please verify SARVAM_API_KEY in your .env');
        }
        return null;
      }

      const data = (await response.json()) as { request_id?: string; audios?: string[] };
      if (data && Array.isArray(data.audios) && data.audios.length > 0) {
        return {
          audioBase64: data.audios[0],
          format: outputAudioCodec,
          requestId: data.request_id
        };
      }

      return null;
    } catch (err: any) {
      console.error('[Sarvam AI] Network exception during speech synthesis:', err.message || err);
      return null;
    }
  }

  /**
   * Transcribe speech to text using Sarvam Saaras v4
   * Endpoint: POST https://api.sarvam.ai/speech-to-text
   */
  public async transcribeSpeech(options: SarvamSTTOptions): Promise<SarvamSTTResult | null> {
    const {
      audioBuffer,
      mimeType = 'audio/wav',
      filename = 'audio.wav',
      languageCode,
      mode = 'transcribe'
    } = options;

    if (!this.isConfigured()) {
      console.warn('[Sarvam AI] SARVAM_API_KEY not set. Skipping live STT transcription.');
      return null;
    }

    try {
      const formData = new FormData();
      const blob = new Blob([audioBuffer], { type: mimeType });
      formData.append('file', blob, filename);
      formData.append('model', 'saaras:v4');
      formData.append('mode', mode);

      if (languageCode) {
        formData.append('language_code', normalizeLanguageCode(languageCode));
      }

      const response = await fetch(`${this.baseUrl}/speech-to-text`, {
        method: 'POST',
        headers: {
          'api-subscription-key': this.apiKey
        },
        body: formData
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error(`[Sarvam AI] STT error ${response.status}:`, errText);
        return null;
      }

      const data = (await response.json()) as { request_id?: string; transcript?: string; language_code?: string };
      if (data && typeof data.transcript === 'string') {
        return {
          transcript: data.transcript,
          languageCode: data.language_code,
          requestId: data.request_id
        };
      }

      return null;
    } catch (err: any) {
      console.error('[Sarvam AI] Network exception during transcription:', err.message || err);
      return null;
    }
  }

  /**
   * Conversational completion using Sarvam-105B
   * Endpoint: POST https://api.sarvam.ai/v1/chat/completions
   */
  public async generateChatCompletion(options: SarvamChatOptions): Promise<string | null> {
    const {
      messages,
      model = 'sarvam-105b-conversations',
      temperature = 0.3
    } = options;

    if (!this.isConfigured()) {
      return null;
    }

    try {
      const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-subscription-key': this.apiKey
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          max_tokens: 300
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error(`[Sarvam AI] Chat error ${response.status}:`, errText);
        return null;
      }

      const data = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };

      if (data?.choices?.[0]?.message?.content) {
        return data.choices[0].message.content.trim();
      }

      return null;
    } catch (err: any) {
      console.error('[Sarvam AI] Chat completion network exception:', err.message || err);
      return null;
    }
  }
}

export const sarvamClient = new SarvamClient();

