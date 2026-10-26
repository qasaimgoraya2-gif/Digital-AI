import React from 'react';
import {
  ArrowLeft,
  Volume2,
  CheckCircle2,
  Circle,
  Sparkles,
} from 'lucide-react';
import { BottomTabBar } from '../components/BottomTabBar';
import { Screen, Language, VoiceType } from '../types';

interface VoiceSpeechSettingsScreenProps {
  onBack: () => void;
  onNavigate: (screen: Screen) => void;
  selectedLanguage: Language;
  onSelectLanguage: (lang: Language) => void;
  selectedVoice: VoiceType;
  onSelectVoice: (voice: VoiceType) => void;
  speechSpeed: number;
  onSpeechSpeedChange: (speed: number) => void;
  voiceVolume: number;
  onVoiceVolumeChange: (vol: number) => void;
  autoDetect: boolean;
  onAutoDetectToggle: () => void;
  captionsEnabled: boolean;
  onCaptionsToggle: () => void;
}

export const VoiceSpeechSettingsScreen: React.FC<VoiceSpeechSettingsScreenProps> = ({
  onBack,
  onNavigate,
  selectedLanguage,
  onSelectLanguage,
  selectedVoice,
  onSelectVoice,
  speechSpeed,
  onSpeechSpeedChange,
  voiceVolume,
  onVoiceVolumeChange,
  autoDetect,
  onAutoDetectToggle,
  captionsEnabled,
  onCaptionsToggle,
}) => {
  const languages: Array<{ id: Language; label: string; nativeName: string; flag: string }> = [
    { id: 'English', label: 'English', nativeName: 'English (US)', flag: '🇺🇸' },
    { id: 'Urdu', label: 'Urdu', nativeName: 'اردو', flag: '🇵🇰' },
    { id: 'Hindi', label: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
    { id: 'Pashto', label: 'Pashto', nativeName: 'پښتو', flag: '🇦🇫' },
  ];

  const voiceOptions: Array<{
    id: VoiceType;
    label: string;
    avatar: string;
    description: string;
  }> = [
    {
      id: 'Female (Soft)',
      label: 'Female (Soft)',
      avatar: '👩',
      description: 'Gentle, clear, and friendly voice',
    },
    {
      id: 'Male (Deep)',
      label: 'Male (Deep)',
      avatar: '👨',
      description: 'Rich, confident, and professional voice',
    },
    {
      id: 'Female (Energetic)',
      label: 'Female (Energetic)',
      avatar: '👩',
      description: 'Bright, lively, and enthusiastic voice',
    },
    {
      id: 'Male (Calm)',
      label: 'Male (Calm)',
      avatar: '👨',
      description: 'Relaxed, smooth, and patient voice',
    },
  ];

  return (
    <div className="w-full h-full bg-[#F8FAFC] flex flex-col justify-between select-none">
      {/* Top Header */}
      <div className="w-full px-5 py-3.5 flex items-center justify-between bg-white border-b border-slate-100">
        <button
          onClick={onBack}
          className="p-1.5 -ml-1 rounded-xl text-slate-700 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
        </button>

        <h2 className="text-base font-bold text-slate-900">Voice & Speech</h2>

        <div className="w-8" />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
        {/* Section 1: Language */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Language
            </h3>
            <span className="text-[11px] text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-full">
              4 Supported
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100/90 shadow-xs divide-y divide-slate-100 overflow-hidden">
            {languages.map((lang) => {
              const isSelected = selectedLanguage === lang.id;
              return (
                <button
                  key={lang.id}
                  onClick={() => onSelectLanguage(lang.id)}
                  className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{lang.flag}</span>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{lang.label}</p>
                      <p className="text-xs text-slate-400">{lang.nativeName}</p>
                    </div>
                  </div>

                  {isSelected ? (
                    <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 2: Voice Type */}
        <div>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
            Voice Type
          </h3>

          <div className="bg-white rounded-2xl border border-slate-100/90 shadow-xs divide-y divide-slate-100 overflow-hidden">
            {voiceOptions.map((voice) => {
              const isSelected = selectedVoice === voice.id;
              return (
                <button
                  key={voice.id}
                  onClick={() => onSelectVoice(voice.id)}
                  className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-lg">
                      {voice.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{voice.label}</p>
                      <p className="text-xs text-slate-400">{voice.description}</p>
                    </div>
                  </div>

                  {isSelected ? (
                    <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 3: Speech Speed Slider */}
        <div className="bg-white rounded-2xl border border-slate-100/90 p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-bold text-slate-800">Speech Speed</h4>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
              {speechSpeed.toFixed(1)}x
            </span>
          </div>

          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={speechSpeed}
            onChange={(e) => onSpeechSpeedChange(parseFloat(e.target.value))}
            className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg appearance-none"
          />

          <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-semibold">
            <span>0.5x Slow</span>
            <span>1.0x Normal</span>
            <span>2.0x Fast</span>
          </div>
        </div>

        {/* Section 4: Voice Volume Slider */}
        <div className="bg-white rounded-2xl border border-slate-100/90 p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-blue-600" />
              <h4 className="text-sm font-bold text-slate-800">Voice Volume</h4>
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
              {voiceVolume}%
            </span>
          </div>

          <input
            type="range"
            min="10"
            max="100"
            step="5"
            value={voiceVolume}
            onChange={(e) => onVoiceVolumeChange(parseInt(e.target.value, 10))}
            className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg appearance-none"
          />
        </div>

        {/* Section 5: Toggles */}
        <div className="bg-white rounded-2xl border border-slate-100/90 shadow-xs divide-y divide-slate-100 overflow-hidden">
          <div className="flex items-center justify-between p-4">
            <div>
              <h4 className="text-sm font-bold text-slate-800">Automatic Language Detection</h4>
              <p className="text-xs text-slate-400 mt-0.5">Detect Urdu, Hindi or English speech dynamically</p>
            </div>
            <button
              onClick={onAutoDetectToggle}
              className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                autoDetect ? 'bg-blue-600' : 'bg-slate-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  autoDetect ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4">
            <div>
              <h4 className="text-sm font-bold text-slate-800">Live Captions & Text</h4>
              <p className="text-xs text-slate-400 mt-0.5">Show real-time speech subtitles during voice calls</p>
            </div>
            <button
              onClick={onCaptionsToggle}
              className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                captionsEnabled ? 'bg-blue-600' : 'bg-slate-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  captionsEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Tab Bar */}
      <BottomTabBar currentScreen="settings" onNavigate={onNavigate} />
    </div>
  );
};
