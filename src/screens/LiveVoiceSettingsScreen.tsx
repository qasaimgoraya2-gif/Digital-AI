import React from 'react';
import {
  ArrowLeft,
  Mic,
  Bot,
  Camera,
  RotateCw,
  Monitor,
  Layout,
  MicOff,
  Volume2,
  ChevronRight,
} from 'lucide-react';
import { AppSettings } from '../types';

interface LiveVoiceSettingsScreenProps {
  onBack: () => void;
  settings: AppSettings;
  onUpdateSettings: (updates: Partial<AppSettings>) => void;
}

export const LiveVoiceSettingsScreen: React.FC<LiveVoiceSettingsScreenProps> = ({
  onBack,
  settings,
  onUpdateSettings,
}) => {
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

        <h2 className="text-base font-bold text-slate-900 leading-tight text-center">
          Live Voice, Camera & Screen
        </h2>

        <div className="w-8" />
      </div>

      {/* Main List */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        <div className="bg-white rounded-2xl border border-slate-100/90 shadow-xs divide-y divide-slate-100 overflow-hidden">
          {/* Voice Only Mode */}
          <button
            onClick={() => onUpdateSettings({ voiceOnlyMode: !settings.voiceOnlyMode })}
            className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Mic className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-semibold text-slate-800">Voice Only Mode</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">{settings.voiceOnlyMode ? 'On' : 'Off'}</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </button>

          {/* Animated Robot Mode */}
          <button
            onClick={() => onUpdateSettings({ animatedRobotMode: !settings.animatedRobotMode })}
            className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Bot className="w-5 h-5 text-indigo-600" />
              <span className="text-sm font-semibold text-slate-800">Animated Robot Mode</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">{settings.animatedRobotMode ? 'On' : 'Off'}</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </button>

          {/* Camera */}
          <button
            onClick={() => onUpdateSettings({ cameraEnabled: !settings.cameraEnabled })}
            className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Camera className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-semibold text-slate-800">Camera</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">{settings.cameraEnabled ? 'On' : 'Off'}</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </button>

          {/* Camera Type */}
          <button
            onClick={() => {
              onUpdateSettings({
                cameraType: settings.cameraType === 'front' ? 'back' : 'front',
              });
            }}
            className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <RotateCw className="w-5 h-5 text-cyan-600" />
              <span className="text-sm font-semibold text-slate-800">Camera Type</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 capitalize">{settings.cameraType} Camera</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </button>

          {/* Screen Sharing */}
          <button
            onClick={() => onUpdateSettings({ screenSharing: !settings.screenSharing })}
            className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Monitor className="w-5 h-5 text-amber-600" />
              <span className="text-sm font-semibold text-slate-800">Screen Sharing</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">{settings.screenSharing ? 'On' : 'Off'}</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </button>

          {/* Floating Robot Window */}
          <button
            onClick={() => onUpdateSettings({ floatingRobotWindow: !settings.floatingRobotWindow })}
            className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Layout className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-semibold text-slate-800">Floating Robot Window</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">{settings.floatingRobotWindow ? 'On' : 'Off'}</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </button>

          {/* Mic Mute */}
          <button
            onClick={() => onUpdateSettings({ micMuted: !settings.micMuted })}
            className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <MicOff className="w-5 h-5 text-rose-500" />
              <span className="text-sm font-semibold text-slate-800">Mic Mute</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">{settings.micMuted ? 'On' : 'Off'}</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </button>
        </div>

        {/* Speaker Volume Card */}
        <div className="bg-white rounded-2xl border border-slate-100/90 p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-slate-800">Speaker Volume</span>
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
              {settings.speakerVolume}%
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            value={settings.speakerVolume}
            onChange={(e) => onUpdateSettings({ speakerVolume: parseInt(e.target.value, 10) })}
            className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg appearance-none"
          />
        </div>
      </div>
    </div>
  );
};
