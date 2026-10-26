import React, { useState } from 'react';
import {
  Menu,
  SquarePen,
  GraduationCap,
  Code2,
  Image as ImageIcon,
  Mic,
  Plus,
  Send,
  Sparkles,
} from 'lucide-react';
import { RobotAvatar } from '../components/RobotAvatar';
import { BottomTabBar } from '../components/BottomTabBar';
import { Screen, RobotConfig, Language } from '../types';

interface HomeScreenProps {
  onNavigate: (screen: Screen) => void;
  onOpenDrawer: () => void;
  onSendMessage: (text: string) => void;
  onStartVoiceInput: () => void;
  robotConfig: RobotConfig;
  selectedLanguage: Language;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigate,
  onOpenDrawer,
  onSendMessage,
  onStartVoiceInput,
  robotConfig,
  selectedLanguage,
}) => {
  const [inputText, setInputText] = useState('');

  const handleSend = () => {
    if (inputText.trim()) {
      onSendMessage(inputText.trim());
      setInputText('');
      onNavigate('chat');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const handleFeatureClick = (prompt: string, targetScreen: Screen = 'chat') => {
    if (targetScreen === 'live_voice') {
      onNavigate('live_voice');
    } else {
      onSendMessage(prompt);
      onNavigate('chat');
    }
  };

  return (
    <div className="w-full h-full bg-[#F8FAFC] flex flex-col justify-between select-none">
      {/* Top Header */}
      <div className="w-full px-5 py-3 flex items-center justify-between bg-white border-b border-slate-100/80">
        <button
          onClick={onOpenDrawer}
          className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5 stroke-[2.2]" />
        </button>

        <div className="flex items-center gap-1">
          <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            Q
          </span>
          <span className="text-xl font-bold tracking-tight text-slate-800">AI</span>
        </div>

        <button
          onClick={() => onNavigate('chat')}
          className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
          aria-label="New chat"
        >
          <SquarePen className="w-5 h-5 stroke-[2.2]" />
        </button>
      </div>

      {/* Main Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col items-center">
        {/* Robot Portrait with soft glowing halo */}
        <div className="relative mt-2 mb-3">
          <RobotAvatar
            state="idle"
            size="lg"
            eyeColor={robotConfig.eyeColor}
            bodyColor={robotConfig.bodyColor}
            showAura={true}
          />
        </div>

        {/* Greeting Heading */}
        <div className="text-center mb-6">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            How can I help you today?
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Ask anything, get instant answers.
          </p>
          {selectedLanguage !== 'English' && (
            <span className="inline-block mt-2 text-[11px] font-semibold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              Language: {selectedLanguage}
            </span>
          )}
        </div>

        {/* 4 Feature Cards (2x2 Grid) */}
        <div className="w-full max-w-sm grid grid-cols-2 gap-3 mb-6">
          {/* Card 1: Study & Learn */}
          <button
            onClick={() => handleFeatureClick('Can you help me understand a study topic step-by-step?')}
            className="flex flex-col items-start p-3.5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all text-left active:scale-[0.98] cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2.5">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">Study & Learn</h4>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
              Get help with your studies
            </p>
          </button>

          {/* Card 2: Coding Help */}
          <button
            onClick={() => handleFeatureClick('Write and debug clean code for my project.')}
            className="flex flex-col items-start p-3.5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all text-left active:scale-[0.98] cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-2.5">
              <Code2 className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">Coding Help</h4>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
              Write and debug code
            </p>
          </button>

          {/* Card 3: Create Images */}
          <button
            onClick={() => handleFeatureClick('Generate a creative visual prompt idea.')}
            className="flex flex-col items-start p-3.5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all text-left active:scale-[0.98] cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center mb-2.5">
              <ImageIcon className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">Create Images</h4>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
              Turn your ideas into images
            </p>
          </button>

          {/* Card 4: Live Voice (PROMINENT LIVE VOICE BUTTON) */}
          <button
            onClick={() => onNavigate('live_voice')}
            className="flex flex-col items-start p-3.5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/80 shadow-sm hover:shadow-md hover:border-blue-300 transition-all text-left active:scale-[0.98] cursor-pointer relative overflow-hidden group"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-2.5 shadow-md shadow-blue-500/30 group-hover:scale-105 transition-transform">
              <Mic className="w-5 h-5 animate-pulse" />
            </div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-sm font-bold text-blue-900">Live Voice</h4>
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
            </div>
            <p className="text-[11px] text-blue-700/80 mt-0.5 leading-snug font-medium">
              Talk with your AI
            </p>
          </button>
        </div>

        {/* Live Voice Hero Banner Shortcut */}
        <div
          onClick={() => onNavigate('live_voice')}
          className="w-full max-w-sm p-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex items-center justify-between shadow-lg shadow-blue-600/20 cursor-pointer active:scale-[0.98] transition-transform mb-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-1.5 py-0.5 rounded text-white">
                  Real-time
                </span>
                <span className="text-sm font-bold">Start Live Voice</span>
              </div>
              <p className="text-[11px] text-blue-100">Tap to start two-way spoken conversation</p>
            </div>
          </div>
          <Sparkles className="w-5 h-5 text-cyan-300 mr-1" />
        </div>
      </div>

      {/* Chat Message Input Bar */}
      <div className="w-full bg-white px-4 py-2 border-t border-slate-100 flex items-center gap-2">
        {/* Plus Button */}
        <button
          onClick={() => onNavigate('chat')}
          className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 active:scale-95 transition-transform cursor-pointer"
          aria-label="Add attachment"
        >
          <Plus className="w-5 h-5" />
        </button>

        {/* Text Input */}
        <div className="flex-1 relative flex items-center">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="w-full bg-slate-100/90 text-slate-800 text-sm px-4 py-2.5 rounded-full pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all placeholder:text-slate-400"
          />

          {/* Voice-to-Text Microphone Button in Input Bar */}
          <button
            onClick={() => {
              onNavigate('chat');
              setTimeout(() => {
                onStartVoiceInput();
              }, 150);
            }}
            className="absolute right-2.5 p-1 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
            title="Speak message into text"
            aria-label="Voice input"
          >
            <Mic className="w-5 h-5" />
          </button>
        </div>

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={!inputText.trim()}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
            inputText.trim()
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 active:scale-95'
              : 'bg-blue-600 text-white opacity-90'
          }`}
          aria-label="Send message"
        >
          <Send className="w-4 h-4 -rotate-45 ml-0.5" />
        </button>
      </div>

      {/* Bottom Tab Bar */}
      <BottomTabBar currentScreen="home" onNavigate={onNavigate} />
    </div>
  );
};
