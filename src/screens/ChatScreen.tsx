import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  MoreVertical,
  Plus,
  Send,
  Mic,
  MicOff,
  Copy,
  Volume2,
  RotateCw,
  Share2,
  Check,
  CheckCheck,
  Camera,
  Monitor,
  X,
  AlertCircle,
  Square,
  Sparkles,
} from 'lucide-react';
import { RobotAvatar } from '../components/RobotAvatar';
import { ChatMessage, RobotConfig, Language, VoiceType } from '../types';
import {
  sendChatMessage,
  speakDirectly,
  getTTSAudio,
  playSpokenResponse,
  transcribeAudioBlob,
} from '../services/geminiService';

interface ChatScreenProps {
  onBack: () => void;
  onNavigateToLiveVoice: () => void;
  messages: ChatMessage[];
  onAddMessage: (msg: ChatMessage) => void;
  robotConfig: RobotConfig;
  selectedLanguage: Language;
  selectedVoice: VoiceType;
  speechSpeed: number;
  voiceVolume: number;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({
  onBack,
  onNavigateToLiveVoice,
  messages,
  onAddMessage,
  robotConfig,
  selectedLanguage,
  selectedVoice,
  speechSpeed,
  voiceVolume,
}) => {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);

  // Voice recording & Speech recognition state
  const [isRecording, setIsRecording] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);

  // Attachment Menu modal (+ button)
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);

  // Active Camera in Chat modal
  const [chatCameraActive, setChatCameraActive] = useState(false);
  const chatCameraVideoRef = useRef<HTMLVideoElement | null>(null);
  const chatCameraStreamRef = useRef<MediaStream | null>(null);

  // Active Screen Share in Chat modal
  const [chatScreenActive, setChatScreenActive] = useState(false);
  const chatScreenVideoRef = useRef<HTMLVideoElement | null>(null);
  const chatScreenStreamRef = useRef<MediaStream | null>(null);

  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const stopAudioPlaybackRef = useRef<(() => void) | null>(null);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopRecordingSession();
      stopChatCamera();
      stopChatScreen();
      if (stopAudioPlaybackRef.current) {
        stopAudioPlaybackRef.current();
      }
    };
  }, []);

  const handleSend = async (customText?: string) => {
    const text = (customText || inputText).trim();
    if (!text || isLoading) return;

    if (isRecording) {
      stopRecordingSession();
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'delivered',
    };

    onAddMessage(userMsg);
    if (!customText) setInputText('');
    setIsLoading(true);

    try {
      const chatHistory = messages.map((m) => ({ role: m.role, content: m.content }));
      const reply = await sendChatMessage(
        chatHistory,
        text,
        selectedLanguage,
        selectedVoice,
        false
      );

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'read',
      };
      onAddMessage(aiMsg);
    } catch (err: any) {
      console.error(err);
      const errMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: "I'm sorry, I encountered an issue connecting. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      onAddMessage(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Start voice input (Microphone button in input bar)
  const startVoiceInput = async () => {
    setVoiceError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      setIsRecording(true);
      setRecordingDuration(0);
      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);

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

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript + ' ';
          }
          setInputText(currentTranscript.trim());
        };

        recognition.onerror = (event: any) => {
          console.warn('SpeechRecognition event error:', event.error);
          if (event.error === 'not-allowed') {
            setVoiceError('Microphone permission denied. Please allow microphone access.');
          }
        };

        try {
          recognition.start();
          recognitionRef.current = recognition;
        } catch (e) {
          console.warn('SpeechRecognition start failed', e);
        }
      }

      // Record audio chunks for transcription fallback
      try {
        const mediaRecorder = new MediaRecorder(stream);
        audioChunksRef.current = [];
        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };
        mediaRecorder.start(250);
        mediaRecorderRef.current = mediaRecorder;
      } catch (e) {}
    } catch (permErr: any) {
      console.error('Microphone permission error:', permErr);
      setVoiceError('Microphone permission was denied. Please allow microphone access.');
      setIsRecording(false);
    }
  };

  const stopRecordingSession = async () => {
    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      } catch (e) {}
    }

    if (!inputText.trim() && audioChunksRef.current.length > 0) {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      if (audioBlob.size > 1000) {
        const transcribed = await transcribeAudioBlob(audioBlob);
        if (transcribed) {
          setInputText(transcribed);
        }
      }
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecordingSession();
    } else {
      startVoiceInput();
    }
  };

  // Listen / Speak message aloud
  const handleListen = (msg: ChatMessage) => {
    if (speakingMsgId === msg.id) {
      if (stopAudioPlaybackRef.current) {
        stopAudioPlaybackRef.current();
        stopAudioPlaybackRef.current = null;
      }
      setSpeakingMsgId(null);
      return;
    }

    if (stopAudioPlaybackRef.current) {
      stopAudioPlaybackRef.current();
    }

    setSpeakingMsgId(msg.id);

    // Speak directly with zero latency
    stopAudioPlaybackRef.current = speakDirectly(msg.content, {
      speechSpeed,
      voiceVolume,
      language: selectedLanguage,
      voiceType: selectedVoice,
      onStart: () => setSpeakingMsgId(msg.id),
      onEnd: () => setSpeakingMsgId(null),
      onError: () => setSpeakingMsgId(null),
    });
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRegenerate = async (targetMsgIndex: number) => {
    const userPrompt = messages[targetMsgIndex - 1]?.content;
    if (!userPrompt || isLoading) return;

    setIsLoading(true);
    try {
      const chatHistory = messages.slice(0, targetMsgIndex - 1).map((m) => ({
        role: m.role,
        content: m.content,
      }));
      const reply = await sendChatMessage(
        chatHistory,
        userPrompt,
        selectedLanguage,
        selectedVoice,
        false
      );

      const regeneratedMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'model',
        content: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'read',
      };
      onAddMessage(regeneratedMsg);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  // Open Chat Camera
  const openChatCamera = async () => {
    setShowAttachmentMenu(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
      });
      chatCameraStreamRef.current = stream;
      setChatCameraActive(true);
      setTimeout(() => {
        if (chatCameraVideoRef.current) {
          chatCameraVideoRef.current.srcObject = stream;
          chatCameraVideoRef.current.play().catch(() => {});
        }
      }, 100);
    } catch (err) {
      alert('Could not open camera. Please grant camera permission.');
    }
  };

  const stopChatCamera = () => {
    if (chatCameraStreamRef.current) {
      chatCameraStreamRef.current.getTracks().forEach((t) => t.stop());
      chatCameraStreamRef.current = null;
    }
    setChatCameraActive(false);
  };

  const capturePhotoAndSend = () => {
    stopChatCamera();
    handleSend('📷 [Live Camera Photo Attached]\nCan you help me analyze what is shown here?');
  };

  // Open Screen Share in Chat
  const openChatScreenShare = async () => {
    setShowAttachmentMenu(false);
    try {
      if (!navigator.mediaDevices.getDisplayMedia) {
        alert('Screen sharing is not supported by your browser.');
        return;
      }
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      chatScreenStreamRef.current = stream;
      setChatScreenActive(true);
      setTimeout(() => {
        if (chatScreenVideoRef.current) {
          chatScreenVideoRef.current.srcObject = stream;
          chatScreenVideoRef.current.play().catch(() => {});
        }
      }, 100);
      stream.getVideoTracks()[0].onended = () => {
        stopChatScreen();
      };
    } catch (e) {
      console.warn('Screen share cancelled', e);
    }
  };

  const stopChatScreen = () => {
    if (chatScreenStreamRef.current) {
      chatScreenStreamRef.current.getTracks().forEach((t) => t.stop());
      chatScreenStreamRef.current = null;
    }
    setChatScreenActive(false);
  };

  const captureScreenAndSend = () => {
    stopChatScreen();
    handleSend('🖥️ [Live Screen Capture Attached]\nCan you review my screen and provide suggestions?');
  };

  return (
    <div className="w-full h-full bg-[#F8FAFC] flex flex-col justify-between select-none relative">
      {/* Top Header */}
      <div className="w-full px-4 py-3 flex items-center justify-between bg-white border-b border-slate-100/90 z-10 shadow-xs">
        {/* Left: Back button & Robot Status */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onBack}
            className="p-1.5 -ml-1 rounded-full text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="relative">
              <RobotAvatar
                state={isLoading ? 'thinking' : speakingMsgId ? 'speaking' : 'idle'}
                size="sm"
                eyeColor={robotConfig.eyeColor}
                bodyColor={robotConfig.bodyColor}
                showAura={false}
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white ring-1 ring-emerald-300" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-slate-900 leading-tight">Q AI</h3>
              </div>
              <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 leading-tight">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Online
              </p>
            </div>
          </div>
        </div>

        {/* Right: Live Voice Shortcut Pill + More menu */}
        <div className="flex items-center gap-2">
          {/* Prominent Live Voice Button in Chat Header */}
          <button
            onClick={onNavigateToLiveVoice}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-md shadow-blue-500/20 hover:from-blue-500 hover:to-indigo-500 active:scale-95 transition-all cursor-pointer"
            title="Start real-time two-way voice conversation"
          >
            <Mic className="w-3.5 h-3.5 animate-pulse" />
            <span>Live Voice</span>
          </button>

          <button
            onClick={() => {
              alert('Chat Options:\n- Clear Conversation\n- Export as PDF\n- Switch Language');
            }}
            className="p-1.5 rounded-full text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="More options"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Voice Error Banner */}
      {voiceError && (
        <div className="mx-4 mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2 shadow-sm animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Microphone Notice</p>
            <p className="mt-0.5 text-[11px]">{voiceError}</p>
          </div>
          <button
            onClick={() => setVoiceError(null)}
            className="text-amber-600 font-bold hover:text-amber-800 text-xs ml-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Chat Camera Modal Overlay */}
      {chatCameraActive && (
        <div className="absolute inset-0 z-50 bg-black/80 flex flex-col items-center justify-center p-4">
          <div className="relative w-full max-w-sm rounded-3xl overflow-hidden bg-black border-2 border-blue-500 shadow-2xl">
            <video ref={chatCameraVideoRef} autoPlay playsInline muted className="w-full h-72 object-cover" />
            <button
              onClick={stopChatCamera}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-white hover:bg-black"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="p-4 bg-slate-900 flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-cyan-400" />
                Live Camera Active
              </span>
              <button
                onClick={capturePhotoAndSend}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md active:scale-95 transition-all"
              >
                Send to Q AI
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Screen Share Modal Overlay */}
      {chatScreenActive && (
        <div className="absolute inset-0 z-50 bg-black/80 flex flex-col items-center justify-center p-4">
          <div className="relative w-full max-w-sm rounded-3xl overflow-hidden bg-black border-2 border-indigo-500 shadow-2xl">
            <video ref={chatScreenVideoRef} autoPlay playsInline muted className="w-full h-72 object-contain bg-slate-900" />
            <button
              onClick={stopChatScreen}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-white hover:bg-black"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="p-4 bg-slate-900 flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Monitor className="w-4 h-4 text-indigo-400" />
                Screen Sharing
              </span>
              <button
                onClick={captureScreenAndSend}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md active:scale-95 transition-all"
              >
                Share with Q AI
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attachment Bottom Sheet Modal */}
      {showAttachmentMenu && (
        <div className="absolute inset-0 z-40 flex flex-col justify-end">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setShowAttachmentMenu(false)}
          />
          <div className="relative bg-white rounded-t-3xl p-5 border-t border-slate-200 shadow-2xl space-y-3 z-10 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-sm font-bold text-slate-800">Add to Conversation</h4>
              <button
                onClick={() => setShowAttachmentMenu(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {/* Option 1: Live Camera */}
              <button
                onClick={openChatCamera}
                className="flex flex-col items-center p-3 rounded-2xl bg-cyan-50 hover:bg-cyan-100 border border-cyan-100 text-cyan-800 transition-all active:scale-95 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-cyan-600 text-white flex items-center justify-center mb-1.5 shadow-sm">
                  <Camera className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold">Camera</span>
                <span className="text-[10px] text-cyan-600">Take Photo</span>
              </button>

              {/* Option 2: Live Screen Sharing */}
              <button
                onClick={openChatScreenShare}
                className="flex flex-col items-center p-3 rounded-2xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 text-indigo-800 transition-all active:scale-95 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center mb-1.5 shadow-sm">
                  <Monitor className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold">Screen Share</span>
                <span className="text-[10px] text-indigo-600">Share Display</span>
              </button>

              {/* Option 3: Live Voice */}
              <button
                onClick={() => {
                  setShowAttachmentMenu(false);
                  onNavigateToLiveVoice();
                }}
                className="flex flex-col items-center p-3 rounded-2xl bg-blue-50 hover:bg-blue-100 border border-blue-100 text-blue-800 transition-all active:scale-95 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center mb-1.5 shadow-sm">
                  <Mic className="w-5 h-5 animate-pulse" />
                </div>
                <span className="text-xs font-bold">Live Voice</span>
                <span className="text-[10px] text-blue-600">Spoken Call</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Messages List */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-full`}
            >
              <div
                className={`flex gap-2 max-w-[85%] ${
                  isUser ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                {!isUser && (
                  <div className="shrink-0 mt-0.5">
                    <RobotAvatar
                      state={speakingMsgId === msg.id ? 'speaking' : 'idle'}
                      size="sm"
                      eyeColor={robotConfig.eyeColor}
                      bodyColor={robotConfig.bodyColor}
                      showAura={false}
                    />
                  </div>
                )}

                {/* Message Bubble */}
                <div
                  className={`p-3.5 rounded-2xl text-sm leading-relaxed shadow-xs ${
                    isUser
                      ? 'bg-blue-600 text-white rounded-br-xs'
                      : 'bg-white text-slate-800 border border-slate-100 rounded-bl-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>

                  <div
                    className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                      isUser ? 'text-blue-100' : 'text-slate-400'
                    }`}
                  >
                    <span>{msg.timestamp}</span>
                    {isUser && <CheckCheck className="w-3.5 h-3.5 text-blue-200" />}
                  </div>
                </div>
              </div>

              {/* Action Buttons below AI message */}
              {!isUser && (
                <div className="flex items-center gap-3 mt-1.5 ml-11 text-xs text-slate-400">
                  <button
                    onClick={() => handleCopy(msg.content, msg.id)}
                    className="flex items-center gap-1 hover:text-slate-600 transition-colors cursor-pointer py-1"
                  >
                    {copiedId === msg.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600 font-medium">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleListen(msg)}
                    className={`flex items-center gap-1 transition-colors cursor-pointer py-1 ${
                      speakingMsgId === msg.id
                        ? 'text-blue-600 font-semibold'
                        : 'hover:text-slate-600'
                    }`}
                  >
                    <Volume2 className={`w-3.5 h-3.5 ${speakingMsgId === msg.id ? 'animate-bounce' : ''}`} />
                    <span>{speakingMsgId === msg.id ? 'Stop' : 'Listen'}</span>
                  </button>

                  <button
                    onClick={() => handleRegenerate(index)}
                    className="flex items-center gap-1 hover:text-slate-600 transition-colors cursor-pointer py-1"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Regenerate</span>
                  </button>

                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({ title: 'Q AI Answer', text: msg.content }).catch(() => {});
                      } else {
                        handleCopy(msg.content, msg.id);
                      }
                    }}
                    className="flex items-center gap-1 hover:text-slate-600 transition-colors cursor-pointer py-1"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start gap-2 max-w-[85%]">
            <RobotAvatar
              state="thinking"
              size="sm"
              eyeColor={robotConfig.eyeColor}
              bodyColor={robotConfig.bodyColor}
              showAura={false}
            />
            <div className="p-3.5 rounded-2xl bg-white border border-slate-100 rounded-bl-xs shadow-xs flex items-center gap-2 text-slate-500 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.4s]" />
              <span className="text-slate-400 ml-1">Q AI is thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Recording Indicator Bar */}
      {isRecording && (
        <div className="mx-4 mb-2 p-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between shadow-lg shadow-blue-500/30 animate-in fade-in slide-in-from-bottom duration-200">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
            <div>
              <p className="text-xs font-bold leading-tight">Listening to your voice...</p>
              <p className="text-[10px] text-blue-100 leading-tight">
                {recordingDuration}s • Speak now, text will appear in the box
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={stopRecordingSession}
              className="px-2.5 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-semibold flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
            >
              <Square className="w-3 h-3 fill-current" />
              Done
            </button>
            {inputText.trim() && (
              <button
                onClick={() => {
                  stopRecordingSession();
                  handleSend();
                }}
                className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 active:scale-95 transition-all cursor-pointer shadow-sm"
              >
                <Send className="w-3 h-3" />
                Send
              </button>
            )}
          </div>
        </div>
      )}

      {/* Message Input Bar */}
      <div className="w-full bg-white px-4 py-2.5 border-t border-slate-100 flex items-center gap-2">
        {/* Plus Button with menu */}
        <button
          onClick={() => setShowAttachmentMenu(true)}
          className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-sm shadow-blue-500/20 active:scale-95 transition-transform cursor-pointer shrink-0"
          aria-label="Add attachment"
          title="Attach Camera Photo, Screen Share, or Live Voice"
        >
          <Plus className="w-5 h-5" />
        </button>

        {/* Text Input with Microphone icon inside */}
        <div className="flex-1 relative flex items-center">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isRecording ? 'Listening...' : 'Type a message...'}
            className={`w-full text-slate-800 text-sm px-4 py-2.5 rounded-full pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all placeholder:text-slate-400 ${
              isRecording
                ? 'bg-blue-50 border border-blue-300 ring-2 ring-blue-400/30'
                : 'bg-slate-100/90'
            }`}
          />

          {/* Voice Input Microphone Button */}
          <button
            type="button"
            onClick={toggleRecording}
            className={`absolute right-2 p-1.5 rounded-full transition-all cursor-pointer ${
              isRecording
                ? 'text-white bg-rose-500 shadow-md shadow-rose-500/30 animate-pulse'
                : 'text-slate-400 hover:text-blue-600 hover:bg-slate-200/60'
            }`}
            title={isRecording ? 'Stop voice recording' : 'Dictate message using voice'}
            aria-label="Voice input"
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
        </div>

        {/* Send Button */}
        <button
          type="button"
          onClick={() => handleSend()}
          disabled={!inputText.trim() || isLoading}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 ${
            inputText.trim() && !isLoading
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 active:scale-95'
              : 'bg-blue-500/60 text-white/80 cursor-not-allowed'
          }`}
          aria-label="Send message"
        >
          <Send className="w-4 h-4 -rotate-45 ml-0.5" />
        </button>
      </div>
    </div>
  );
};
