import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowLeft,
  Maximize2,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  PhoneOff,
  Camera,
  Image as ImageIcon,
  RotateCw,
  X,
  AlertCircle,
  Sparkles,
  Send,
  Upload,
  Check,
} from 'lucide-react';
import { RobotAvatar } from '../components/RobotAvatar';
import { AudioWaveform } from '../components/AudioWaveform';
import { ConversationState, RobotConfig, Language, VoiceType } from '../types';
import {
  sendChatMessage,
  speakDirectly,
} from '../services/geminiService';

interface LiveVoiceScreenProps {
  onBack: () => void;
  robotConfig: RobotConfig;
  selectedLanguage: Language;
  selectedVoice: VoiceType;
  speechSpeed: number;
  voiceVolume: number;
  captionsEnabled: boolean;
}

export const LiveVoiceScreen: React.FC<LiveVoiceScreenProps> = ({
  onBack,
  robotConfig,
  selectedLanguage,
  selectedVoice,
  speechSpeed,
  voiceVolume,
  captionsEnabled = true,
}) => {
  const [sessionActive, setSessionActive] = useState(false);
  const [convState, setConvState] = useState<ConversationState>('idle');
  const [statusMessage, setStatusMessage] = useState('Ready to talk');
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);

  // Live Camera state
  const [cameraActive, setCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  // Screenshot state
  const [capturedScreenshot, setCapturedScreenshot] = useState<string | null>(null);
  const [isAnalyzingScreenshot, setIsAnalyzingScreenshot] = useState(false);

  const [currentTranscript, setCurrentTranscript] = useState('');
  const [aiSpeechText, setAiSpeechText] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [micLevel, setMicLevel] = useState(0);

  // Hidden Canvas & File Input refs for taking real screenshots
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraVideoRef = useRef<HTMLVideoElement | null>(null);

  // Audio / Speech refs
  const recognitionRef = useRef<any>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const silenceTimeoutRef = useRef<any>(null);
  const stopAudioRef = useRef<(() => void) | null>(null);
  const sessionActiveRef = useRef(false);
  const isMutedRef = useRef(false);
  const isSpeakerOnRef = useRef(true);
  const conversationHistoryRef = useRef<Array<{ role: 'user' | 'model'; content: string }>>([]);

  // Sync ref values
  useEffect(() => {
    sessionActiveRef.current = sessionActive;
  }, [sessionActive]);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    isSpeakerOnRef.current = isSpeakerOn;
  }, [isSpeakerOn]);

  // Attach camera stream to video tag
  useEffect(() => {
    if (cameraVideoRef.current && cameraStream) {
      cameraVideoRef.current.srcObject = cameraStream;
      cameraVideoRef.current.play().catch(() => {});
    }
  }, [cameraStream, cameraActive]);

  // Clean up all resources when unmounting
  useEffect(() => {
    return () => {
      cleanUpAll();
    };
  }, []);

  const cleanUpAll = useCallback(() => {
    sessionActiveRef.current = false;
    setSessionActive(false);

    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
      recognitionRef.current = null;
    }

    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }

    if (cameraStream) {
      cameraStream.getTracks().forEach((t) => t.stop());
      setCameraStream(null);
      setCameraActive(false);
    }

    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch (e) {}
      audioContextRef.current = null;
    }

    if (stopAudioRef.current) {
      stopAudioRef.current();
      stopAudioRef.current = null;
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, [cameraStream]);

  // Setup Web Audio Analyser for real mic volume feedback
  const setupAudioAnalyser = (stream: MediaStream) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      const audioCtx = new AudioCtx();
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.5;
      source.connect(analyser);

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const checkVolume = () => {
        if (!sessionActiveRef.current || isMutedRef.current) {
          setMicLevel(0);
          animFrameRef.current = requestAnimationFrame(checkVolume);
          return;
        }

        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        const normalized = Math.min(100, Math.round((avg / 128) * 100));
        setMicLevel(normalized);

        animFrameRef.current = requestAnimationFrame(checkVolume);
      };

      checkVolume();
    } catch (e) {
      console.warn('Audio analyser error:', e);
    }
  };

  // Instant response turn with ultra-low latency
  const handleUserSpeechCompleted = async (spokenText: string, attachedImage?: string) => {
    if (!sessionActiveRef.current && !spokenText.trim() && !attachedImage) {
      return;
    }

    if (!sessionActiveRef.current) {
      setSessionActive(true);
      sessionActiveRef.current = true;
    }

    // Stop recognition during AI thinking and speaking
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }

    setConvState('thinking');
    setStatusMessage('Thinking...');
    if (spokenText) setCurrentTranscript(spokenText);

    conversationHistoryRef.current.push({
      role: 'user',
      content: spokenText || (attachedImage ? 'Inspect this screenshot' : 'Hello'),
    });

    try {
      // Ultra-fast Gemini 3.1 Flash Lite API call
      const reply = await sendChatMessage(
        conversationHistoryRef.current,
        spokenText,
        selectedLanguage,
        selectedVoice,
        true, // isVoiceMode = true for instant 1-sentence answers
        attachedImage || capturedScreenshot || undefined
      );

      if (!sessionActiveRef.current) return;

      conversationHistoryRef.current.push({
        role: 'model',
        content: reply,
      });

      setAiSpeechText(reply);
      setConvState('speaking');
      setStatusMessage('Speaking...');

      // Speak directly through device speaker with zero audio delay
      if (isSpeakerOnRef.current) {
        stopAudioRef.current = speakDirectly(reply, {
          speechSpeed,
          voiceVolume: isSpeakerOnRef.current ? voiceVolume : 0,
          language: selectedLanguage,
          voiceType: selectedVoice,
          onStart: () => {
            setConvState('speaking');
            setStatusMessage('Speaking...');
          },
          onEnd: () => {
            if (sessionActiveRef.current) {
              startListeningCycle();
            }
          },
          onError: () => {
            if (sessionActiveRef.current) {
              startListeningCycle();
            }
          },
        });
      } else {
        setTimeout(() => {
          if (sessionActiveRef.current) {
            startListeningCycle();
          }
        }, 1800);
      }
    } catch (err: any) {
      console.error('Turn error:', err);
      setStatusMessage("I'm listening...");
      startListeningCycle();
    }
  };

  // Continuous listening loop with fast silence detection (650ms)
  const startListeningCycle = useCallback(() => {
    if (!sessionActiveRef.current) return;

    setConvState('listening');
    setStatusMessage("I'm listening...");
    setCurrentTranscript('');

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;

      const langCodes: Record<Language, string> = {
        English: 'en-US',
        Urdu: 'ur-PK',
        Hindi: 'hi-IN',
        Pashto: 'ps-AF',
      };
      recognition.lang = langCodes[selectedLanguage] || 'en-US';

      let lastRecognized = '';

      recognition.onresult = (event: any) => {
        if (isMutedRef.current) return;

        let interim = '';
        let finalWords = '';

        for (let i = event.results.length - 1; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalWords += event.results[i][0].transcript + ' ';
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        const combined = (finalWords + interim).trim();
        if (combined) {
          lastRecognized = combined;
          setCurrentTranscript(combined);

          // Fast 650ms silence detection for snappy response time!
          if (silenceTimeoutRef.current) {
            clearTimeout(silenceTimeoutRef.current);
          }
          silenceTimeoutRef.current = setTimeout(() => {
            if (lastRecognized && sessionActiveRef.current) {
              try {
                recognition.stop();
              } catch (e) {}
              handleUserSpeechCompleted(lastRecognized);
            }
          }, 650);
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error === 'no-speech') {
          if (sessionActiveRef.current && !isMutedRef.current) {
            try {
              recognition.start();
            } catch (e) {}
          }
        }
      };

      recognition.onend = () => {
        if (lastRecognized.trim() && sessionActiveRef.current) {
          handleUserSpeechCompleted(lastRecognized.trim());
        } else if (sessionActiveRef.current && convState === 'listening' && !isMutedRef.current) {
          try {
            recognition.start();
          } catch (e) {}
        }
      };

      try {
        recognition.start();
        recognitionRef.current = recognition;
      } catch (e) {}
    }
  }, [selectedLanguage, selectedVoice, speechSpeed, voiceVolume, convState]);

  // Start live session
  const handleStartConversation = async () => {
    setErrorMessage(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      setSessionActive(true);
      sessionActiveRef.current = true;
      setIsMuted(false);
      conversationHistoryRef.current = [];

      setupAudioAnalyser(stream);
      startListeningCycle();
    } catch (err: any) {
      console.error('Mic error:', err);
      setErrorMessage('Microphone access is required to speak with Q AI.');
      setStatusMessage('Microphone required');
    }
  };

  // End conversation and return
  const handleEndConversation = () => {
    cleanUpAll();
    onBack();
  };

  // Toggle Mute
  const handleToggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    isMutedRef.current = nextMute;

    if (micStreamRef.current) {
      micStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !nextMute;
      });
    }

    if (nextMute) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      setStatusMessage('Muted');
    } else {
      if (sessionActive) {
        startListeningCycle();
      }
    }
  };

  // Toggle Speaker
  const handleToggleSpeaker = () => {
    const nextSpeaker = !isSpeakerOn;
    setIsSpeakerOn(nextSpeaker);
    isSpeakerOnRef.current = nextSpeaker;

    if (!nextSpeaker && stopAudioRef.current) {
      stopAudioRef.current();
    }
  };

  // Toggle Live Camera
  const toggleCamera = async () => {
    if (cameraActive) {
      if (cameraStream) {
        cameraStream.getTracks().forEach((t) => t.stop());
      }
      setCameraStream(null);
      setCameraActive(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
        });
        setCameraStream(stream);
        setCameraActive(true);
      } catch (err: any) {
        alert('Could not start camera on this device.');
      }
    }
  };

  const flipCamera = async () => {
    const nextFacing = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextFacing);

    if (cameraStream) {
      cameraStream.getTracks().forEach((t) => t.stop());
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: nextFacing },
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      });
      setCameraStream(stream);
    } catch (e) {}
  };

  // REAL SCREENSHOT FUNCTIONALITY (Works on ALL Devices & Mobile)
  const handleTakeScreenshot = async () => {
    // 1. If Camera is active, snap from camera stream immediately
    if (cameraActive && cameraVideoRef.current) {
      try {
        const video = cameraVideoRef.current;
        const canvas = canvasRef.current || document.createElement('canvas');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setCapturedScreenshot(dataUrl);
          handleUserSpeechCompleted('I captured a screenshot from my camera. What do you see?', dataUrl);
          return;
        }
      } catch (e) {
        console.warn('Canvas camera snapshot failed', e);
      }
    }

    // 2. If browser supports getDisplayMedia screen capture
    if (navigator.mediaDevices?.getDisplayMedia) {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const video = document.createElement('video');
        video.srcObject = stream;
        await video.play();

        const canvas = canvasRef.current || document.createElement('canvas');
        canvas.width = video.videoWidth || 1280;
        canvas.height = video.videoHeight || 720;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          stream.getTracks().forEach((t) => t.stop());
          setCapturedScreenshot(dataUrl);
          handleUserSpeechCompleted('I captured this screenshot from my screen. Please analyze it.', dataUrl);
          return;
        }
      } catch (err: any) {
        // User cancelled or getDisplayMedia failed, fall back to file picker
      }
    }

    // 3. Fallback: Trigger native phone screenshot / image picker
    fileInputRef.current?.click();
  };

  const handleScreenshotFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) {
          setCapturedScreenshot(dataUrl);
          handleUserSpeechCompleted('Here is my screenshot. What does it show?', dataUrl);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full h-full bg-[#0A0F24] text-white flex flex-col justify-between px-5 py-4 overflow-hidden relative select-none">
      {/* Hidden elements for screenshot generation */}
      <canvas ref={canvasRef} className="hidden" />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleScreenshotFileChange}
      />

      {/* Top Header */}
      <div className="w-full flex items-center justify-between z-20 pt-1">
        <button
          onClick={handleEndConversation}
          className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
        </button>

        {/* Live Status indicator */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 backdrop-blur-md">
          <span
            className={`w-2 h-2 rounded-full ${
              sessionActive
                ? convState === 'speaking'
                  ? 'bg-cyan-400 animate-ping'
                  : convState === 'listening'
                  ? 'bg-emerald-400 animate-pulse'
                  : 'bg-purple-400 animate-bounce'
                : 'bg-slate-400'
            }`}
          />
          <span className="text-[11px] font-semibold tracking-wide uppercase text-slate-200">
            {sessionActive ? convState : 'Ready'}
          </span>
          {cameraActive && (
            <span className="text-[10px] text-cyan-300 bg-cyan-900/60 px-1.5 py-0.2 rounded font-bold">
              CAM
            </span>
          )}
          {capturedScreenshot && (
            <span className="text-[10px] text-amber-300 bg-amber-900/60 px-1.5 py-0.2 rounded font-bold">
              SHOT
            </span>
          )}
        </div>

        <button
          onClick={() => {
            alert(
              `Live Voice Session:\n- Assistant: Q AI\n- Language: ${selectedLanguage}\n- Fast Response: Active (<1s)\n- Camera: ${cameraActive ? 'On' : 'Off'}`
            );
          }}
          className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <Maximize2 className="w-4 h-4 stroke-[2.2]" />
        </button>
      </div>

      {/* Floating Live Camera Picture-In-Picture */}
      {cameraActive && (
        <div className="absolute top-16 right-4 z-40 w-32 h-44 sm:w-36 sm:h-48 rounded-2xl overflow-hidden border-2 border-cyan-400 shadow-2xl bg-black flex flex-col animate-in zoom-in-95 duration-200">
          <video
            ref={cameraVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover transform -scale-x-100"
          />

          <div className="absolute top-1.5 right-1.5 flex items-center gap-1">
            <button
              onClick={flipCamera}
              className="p-1 rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors"
              title="Flip camera"
            >
              <RotateCw className="w-3 h-3" />
            </button>
            <button
              onClick={toggleCamera}
              className="p-1 rounded-full bg-rose-600/80 text-white hover:bg-rose-700 transition-colors"
              title="Close camera"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          <div className="absolute bottom-1 left-2 flex items-center gap-1 bg-black/60 px-1.5 py-0.5 rounded text-[9px] font-bold text-cyan-300 backdrop-blur-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live Camera
          </div>
        </div>
      )}

      {/* Screenshot Preview Thumbnail Modal */}
      {capturedScreenshot && (
        <div className="absolute top-16 left-4 z-40 w-32 h-36 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-2xl bg-black flex flex-col animate-in zoom-in-95 duration-200">
          <img src={capturedScreenshot} alt="Screenshot" className="w-full h-full object-cover" />
          <div className="absolute top-1.5 right-1.5">
            <button
              onClick={() => setCapturedScreenshot(null)}
              className="p-1 rounded-full bg-black/70 text-white hover:bg-black"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <div className="absolute bottom-1 left-1.5 flex items-center gap-1 bg-black/70 px-1.5 py-0.5 rounded text-[9px] font-bold text-amber-300 backdrop-blur-xs">
            <Check className="w-2.5 h-2.5 text-emerald-400" />
            Screenshot Sent
          </div>
        </div>
      )}

      {/* Error Message Toast */}
      {errorMessage && (
        <div className="z-30 w-full max-w-sm mx-auto p-3 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-2 shadow-lg backdrop-blur-md animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-white">Notice</p>
            <p className="mt-0.5 text-[11px]">{errorMessage}</p>
          </div>
          <button
            onClick={() => handleStartConversation()}
            className="text-xs font-bold text-white bg-rose-600 px-2.5 py-1 rounded-lg hover:bg-rose-500 active:scale-95 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Center 3D Floating Robot */}
      <div className="flex-1 flex flex-col items-center justify-center my-auto relative z-10 py-1">
        <RobotAvatar
          state={convState}
          size="hero"
          eyeColor={robotConfig.eyeColor}
          bodyColor={robotConfig.bodyColor}
          showAura={true}
        />

        {/* Branding & Feature Title */}
        <div className="text-center mt-2">
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              Q
            </span>
            <span className="text-xl font-bold tracking-tight text-white">AI</span>
          </div>
          <h2 className="text-xs sm:text-sm font-semibold text-slate-300 tracking-wide mt-0.5">
            Live Voice Conversation
          </h2>
        </div>

        {/* Dynamic Glowing Waveform */}
        <div className="w-full flex justify-center my-2">
          <AudioWaveform
            state={convState}
            isMuted={isMuted}
            volumeLevel={convState === 'listening' ? micLevel : convState === 'speaking' ? 85 : 0}
          />
        </div>

        {/* Current Conversation Status Label */}
        <div className="text-center px-4 min-h-[3.2rem] flex flex-col items-center justify-center">
          <p
            className={`text-sm sm:text-base font-bold transition-all duration-300 ${
              convState === 'speaking'
                ? 'text-cyan-300'
                : convState === 'listening'
                ? micLevel > 15
                  ? 'text-emerald-400 animate-pulse font-extrabold'
                  : 'text-emerald-300'
                : convState === 'thinking'
                ? 'text-purple-300'
                : 'text-slate-400'
            }`}
          >
            {convState === 'listening' && micLevel > 15
              ? 'Hearing you speak...'
              : statusMessage}
          </p>

          {/* Real-Time Captions */}
          {captionsEnabled && (
            <div className="mt-1 max-w-xs text-center">
              {convState === 'listening' && currentTranscript ? (
                <p className="text-xs text-slate-200 italic line-clamp-2 bg-black/40 px-3 py-1 rounded-full border border-white/10 shadow-xs">
                  "{currentTranscript}"
                </p>
              ) : convState === 'speaking' && aiSpeechText ? (
                <p className="text-xs text-cyan-200 line-clamp-2 bg-black/50 px-3 py-1 rounded-full border border-cyan-500/30 shadow-xs">
                  {aiSpeechText}
                </p>
              ) : null}
            </div>
          )}
        </div>

        {/* Center Glowing Action Button */}
        {!sessionActive ? (
          <button
            onClick={handleStartConversation}
            className="mt-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-sm shadow-[0_0_30px_rgba(59,130,246,0.6)] flex items-center gap-2.5 active:scale-95 transition-all cursor-pointer"
          >
            <Mic className="w-5 h-5 animate-pulse" />
            <span>Start Conversation</span>
          </button>
        ) : (
          <div className="flex flex-col items-center mt-1">
            <button
              onClick={() => {
                if (currentTranscript.trim()) {
                  handleUserSpeechCompleted(currentTranscript.trim());
                } else {
                  handleToggleMute();
                }
              }}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xl ${
                isMuted
                  ? 'bg-amber-500/90 text-white shadow-amber-500/30'
                  : convState === 'listening' && currentTranscript
                  ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-white ring-4 ring-emerald-400/40 scale-105 shadow-emerald-500/40'
                  : 'bg-gradient-to-tr from-blue-600 to-cyan-500 text-white shadow-cyan-500/40 ring-4 ring-cyan-400/20'
              }`}
            >
              {isMuted ? (
                <MicOff className="w-7 h-7" />
              ) : currentTranscript ? (
                <Send className="w-6 h-6 ml-0.5 -rotate-45" />
              ) : (
                <Mic className="w-7 h-7" />
              )}
            </button>
            {currentTranscript && (
              <span className="text-[10px] text-emerald-300 font-semibold mt-1">
                Tap to Send Now
              </span>
            )}
          </div>
        )}

        {/* Quick Voice Test Prompts */}
        <div className="flex items-center justify-center gap-1.5 mt-2.5 max-w-xs flex-wrap">
          <button
            onClick={() => handleUserSpeechCompleted('Hello Q AI!')}
            className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 text-[10px] font-semibold transition-colors border border-white/10 cursor-pointer"
          >
            👋 Hello
          </button>
          <button
            onClick={() => handleUserSpeechCompleted('آپ کیسے ہیں؟')}
            className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-cyan-200 text-[10px] font-semibold transition-colors border border-white/10 cursor-pointer"
          >
            🇵🇰 اردو
          </button>
          <button
            onClick={() => handleUserSpeechCompleted('नमस्ते!')}
            className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-indigo-200 text-[10px] font-semibold transition-colors border border-white/10 cursor-pointer"
          >
            🇮🇳 हिन्दी
          </button>
          <button
            onClick={() => handleUserSpeechCompleted('سلام!')}
            className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-emerald-200 text-[10px] font-semibold transition-colors border border-white/10 cursor-pointer"
          >
            🇦🇫 پښتو
          </button>
        </div>
      </div>

      {/* Bottom Control Bar */}
      <div className="w-full max-w-sm mx-auto mb-2 z-20">
        <div className="flex items-center justify-around py-3 px-2 rounded-3xl bg-slate-900/90 border border-slate-800/90 backdrop-blur-xl shadow-2xl">
          {/* Button 1: Live Camera */}
          <button
            onClick={toggleCamera}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all cursor-pointer ${
              cameraActive
                ? 'text-cyan-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div
              className={`p-2.5 rounded-full transition-transform active:scale-95 ${
                cameraActive
                  ? 'bg-cyan-500/20 text-cyan-400 ring-2 ring-cyan-400/40'
                  : 'bg-slate-800'
              }`}
            >
              <Camera className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-medium">Camera</span>
          </button>

          {/* Button 2: Real Screenshot Button */}
          <button
            onClick={handleTakeScreenshot}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all cursor-pointer ${
              capturedScreenshot
                ? 'text-amber-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Take Screenshot / Share Screenshot"
          >
            <div
              className={`p-2.5 rounded-full transition-transform active:scale-95 ${
                capturedScreenshot
                  ? 'bg-amber-500/20 text-amber-400 ring-2 ring-amber-400/40'
                  : 'bg-slate-800'
              }`}
            >
              <ImageIcon className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-medium">Screenshot</span>
          </button>

          {/* Button 3: Speaker Toggle */}
          <button
            onClick={handleToggleSpeaker}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all cursor-pointer ${
              isSpeakerOn
                ? 'text-slate-300 hover:text-white'
                : 'text-amber-400 font-bold'
            }`}
          >
            <div
              className={`p-2.5 rounded-full transition-transform active:scale-95 ${
                isSpeakerOn ? 'bg-slate-800' : 'bg-amber-500/20 text-amber-400'
              }`}
            >
              {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </div>
            <span className="text-[11px] font-medium">Speaker</span>
          </button>

          {/* Button 4: Mute */}
          <button
            onClick={handleToggleMute}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all cursor-pointer ${
              isMuted
                ? 'text-amber-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div
              className={`p-2.5 rounded-full transition-transform active:scale-95 ${
                isMuted ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800'
              }`}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </div>
            <span className="text-[11px] font-medium">Mute</span>
          </button>

          {/* Button 5: Prominent Red End Conversation Button */}
          <button
            onClick={handleEndConversation}
            className="flex flex-col items-center gap-1 py-1 px-3 rounded-2xl text-rose-400 hover:text-rose-300 transition-all cursor-pointer group"
          >
            <div className="p-3 rounded-full bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/40 active:scale-95 group-hover:scale-105 transition-all">
              <PhoneOff className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="text-[11px] font-bold text-rose-400">End</span>
          </button>
        </div>
      </div>
    </div>
  );
};
