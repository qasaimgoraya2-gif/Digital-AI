import { Language, VoiceType } from '../types';

export interface ChatResponse {
  reply: string;
  error?: string;
}

export interface TTSResponse {
  audioBase64?: string;
  mimeType?: string;
  fallbackToSpeechSynthesis?: boolean;
  text?: string;
  error?: string;
}

// Request AI response from server with ultra-low latency
export async function sendChatMessage(
  messages: Array<{ role: 'user' | 'model'; content: string }>,
  userMessage: string,
  language: Language = 'English',
  voiceType: VoiceType = 'Female (Soft)',
  isVoiceMode: boolean = false,
  imageBase64?: string
): Promise<string> {
  try {
    const res = await fetch('/api/gemini/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages,
        userMessage,
        language,
        voiceType,
        isVoiceMode,
        imageBase64,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Server responded with ${res.status}`);
    }

    const data = await res.json();
    return data.reply || 'I am ready to help you with anything!';
  } catch (error: any) {
    console.error('sendChatMessage failed:', error);
    // Offline / fallback response
    if (language === 'Urdu') {
      return 'جی ہاں! میں آپ کی بات سن رہا ہوں۔ بتائیے میں آپ کی کس طرح مدد کروں؟';
    } else if (language === 'Hindi') {
      return 'हाँ! मैं आपकी बात सुन रहा हूँ। बताइए, आज मैं आपकी क्या सहायता कर सकता हूँ?';
    } else if (language === 'Pashto') {
      return 'هو! زه ستاسو خبرې اورم. مهرباني وکړئ ووایاست چې زه څنګه مرسته کولی شم؟';
    }
    return "I'm listening! How can I help you today?";
  }
}

// Request Text-to-Speech audio from server
export async function getTTSAudio(
  text: string,
  voiceType: VoiceType = 'Female (Soft)',
  language: Language = 'English'
): Promise<TTSResponse> {
  try {
    const res = await fetch('/api/gemini/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voiceType, language }),
    });

    if (!res.ok) {
      return { fallbackToSpeechSynthesis: true, text };
    }

    return await res.json();
  } catch (err) {
    console.warn('TTS request failed, fallback to client synthesis:', err);
    return { fallbackToSpeechSynthesis: true, text };
  }
}

// Transcribe audio base64 via server
export async function transcribeAudioBlob(
  audioBlob: Blob
): Promise<string> {
  try {
    const reader = new FileReader();
    const base64Promise = new Promise<string>((resolve, reject) => {
      reader.onloadend = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
    });
    reader.readAsDataURL(audioBlob);
    const audioBase64 = await base64Promise;

    const res = await fetch('/api/gemini/transcribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        audioBase64,
        mimeType: audioBlob.type || 'audio/webm',
      }),
    });

    if (!res.ok) {
      throw new Error('Transcription failed');
    }

    const data = await res.json();
    return data.transcription || '';
  } catch (err) {
    console.error('Audio transcription error:', err);
    return '';
  }
}

// Speak directly using Web Speech Synthesis with natural parameters and zero lag
export function speakDirectly(
  text: string,
  options: {
    speechSpeed?: number;
    voiceVolume?: number;
    language?: Language;
    voiceType?: VoiceType;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (err: any) => void;
  }
): () => void {
  const {
    speechSpeed = 1.0,
    voiceVolume = 85,
    language = 'English',
    voiceType = 'Female (Soft)',
    onStart,
    onEnd,
    onError,
  } = options;

  if (!('speechSynthesis' in window)) {
    console.warn('SpeechSynthesis not supported');
    onStart?.();
    setTimeout(() => onEnd?.(), 1500);
    return () => {};
  }

  try {
    window.speechSynthesis.cancel();

    // Ensure audio context is resumed on mobile browsers
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = Math.max(0.7, Math.min(1.8, speechSpeed));
    utterance.volume = Math.max(0.1, Math.min(1, voiceVolume / 100));
    utterance.pitch = voiceType.includes('Female') ? 1.15 : 0.9;

    const langCodes: Record<Language, string> = {
      English: 'en-US',
      Urdu: 'ur-PK',
      Hindi: 'hi-IN',
      Pashto: 'ps-AF',
    };

    const targetLang = langCodes[language] || 'en-US';
    utterance.lang = targetLang;

    // Pick best matching voice
    const voices = window.speechSynthesis.getVoices();
    const isMale = voiceType.includes('Male');

    let matchedVoice = voices.find((v) => v.lang.startsWith(targetLang.split('-')[0]));

    // If Urdu or Pashto voice not found locally, use Hindi or fallback which handles South Asian phonetics smoothly
    if (!matchedVoice && (language === 'Urdu' || language === 'Pashto')) {
      matchedVoice = voices.find((v) => v.lang.startsWith('hi'));
    }

    if (matchedVoice) {
      utterance.voice = matchedVoice;
    } else {
      // Pick generic gender match
      const genderMatch = voices.find((v) =>
        isMale ? /male|david|george|mark/i.test(v.name) : /female|zira|samantha|karen|soft/i.test(v.name)
      );
      if (genderMatch) utterance.voice = genderMatch;
    }

    utterance.onstart = () => {
      onStart?.();
    };

    utterance.onend = () => {
      onEnd?.();
    };

    utterance.onerror = (e) => {
      console.warn('Utterance error:', e);
      onError?.(e);
      onEnd?.();
    };

    window.speechSynthesis.speak(utterance);

    return () => {
      window.speechSynthesis.cancel();
    };
  } catch (err) {
    console.error('speakDirectly failed:', err);
    onStart?.();
    setTimeout(() => onEnd?.(), 1500);
    return () => {};
  }
}

// Play audio using Gemini TTS WAV or Web Speech Synthesis
export function playSpokenResponse(
  ttsResult: TTSResponse,
  options: {
    speechSpeed?: number;
    voiceVolume?: number;
    language?: Language;
    voiceType?: VoiceType;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (err: any) => void;
  }
): () => void {
  const {
    speechSpeed = 1.0,
    voiceVolume = 85,
    language = 'English',
    voiceType = 'Female (Soft)',
    onStart,
    onEnd,
    onError,
  } = options;

  // If we have Gemini WAV audio base64, play it
  if (ttsResult.audioBase64 && !ttsResult.fallbackToSpeechSynthesis) {
    try {
      const audio = new Audio(`data:audio/wav;base64,${ttsResult.audioBase64}`);
      audio.playbackRate = speechSpeed;
      audio.volume = Math.max(0.1, Math.min(1, voiceVolume / 100));

      audio.onplay = () => onStart?.();
      audio.onended = () => onEnd?.();
      audio.onerror = (e) => {
        console.warn('Audio playback error, fallback to speech synthesis:', e);
        speakDirectly(ttsResult.text || '', options);
      };

      audio.play().catch((err) => {
        console.warn('Audio play() rejected, fallback to speech synthesis:', err);
        speakDirectly(ttsResult.text || '', options);
      });

      return () => {
        audio.pause();
        audio.currentTime = 0;
      };
    } catch (e) {
      console.warn('WAV playback initialization failed:', e);
    }
  }

  // Instant zero-lag browser speech synthesis
  return speakDirectly(ttsResult.text || '', options);
}
