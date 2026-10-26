import React, { useState } from 'react';
import { ArrowLeft, RotateCcw, Check, Sparkles } from 'lucide-react';
import { RobotAvatar } from '../components/RobotAvatar';
import { RobotConfig } from '../types';

interface RobotAppearanceScreenProps {
  onBack: () => void;
  robotConfig: RobotConfig;
  onUpdateRobotConfig: (updates: Partial<RobotConfig>) => void;
  onResetDefault: () => void;
}

export const RobotAppearanceScreen: React.FC<RobotAppearanceScreenProps> = ({
  onBack,
  robotConfig,
  onUpdateRobotConfig,
  onResetDefault,
}) => {
  const [activeTab, setActiveTab] = useState<'Robot' | 'Background' | 'Effects'>('Robot');

  const eyeColors = [
    { label: 'Cyan', hex: '#00E5FF' },
    { label: 'Blue', hex: '#3B82F6' },
    { label: 'Green', hex: '#10B981' },
    { label: 'Orange', hex: '#F97316' },
    { label: 'Pink', hex: '#EC4899' },
  ];

  const bodyColors = [
    { label: 'White', hex: '#FFFFFF', border: 'border-slate-300' },
    { label: 'Light Blue', hex: '#93C5FD', border: 'border-blue-300' },
    { label: 'Deep Blue', hex: '#1E40AF', border: 'border-blue-800' },
    { label: 'Dark Slate', hex: '#1E293B', border: 'border-slate-700' },
  ];

  const styles = [
    { id: 'classic', label: 'Classic Q' },
    { id: 'modern', label: 'Modern Gloss' },
    { id: 'cyber', label: 'Cyber Tech' },
    { id: 'cute', label: 'Chibi Bot' },
    { id: 'minimal', label: 'Minimalist' },
  ] as const;

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

        <h2 className="text-base font-bold text-slate-900">AI Robot & Appearance</h2>

        <div className="w-8" />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        {/* Segmented Tabs: Robot | Background | Effects */}
        <div className="flex items-center p-1 bg-slate-200/80 rounded-xl">
          {(['Robot', 'Background', 'Effects'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === tab
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Center Robot Preview Card */}
        <div className="w-full bg-gradient-to-b from-blue-50/60 to-white rounded-3xl border border-blue-100 p-6 flex flex-col items-center justify-center relative shadow-xs">
          <RobotAvatar
            state="idle"
            size="xl"
            eyeColor={robotConfig.eyeColor}
            bodyColor={robotConfig.bodyColor}
            showAura={true}
          />
          <div className="mt-2 text-center">
            <span className="text-xs font-bold text-slate-800 tracking-wide uppercase">
              {robotConfig.style} AI Model
            </span>
            <p className="text-[11px] text-slate-400">Interactive live preview</p>
          </div>
        </div>

        {activeTab === 'Robot' ? (
          <>
            {/* Robot Style Selection */}
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                Robot Style
              </h3>
              <div className="grid grid-cols-5 gap-2">
                {styles.map((st) => {
                  const isSelected = robotConfig.style === st.id;
                  return (
                    <button
                      key={st.id}
                      onClick={() => onUpdateRobotConfig({ style: st.id })}
                      className={`p-2 rounded-2xl border flex flex-col items-center transition-all cursor-pointer ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50 shadow-xs ring-2 ring-blue-500/20'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden mb-1">
                        <RobotAvatar
                          state="idle"
                          size="sm"
                          eyeColor={robotConfig.eyeColor}
                          bodyColor={robotConfig.bodyColor}
                          showAura={false}
                        />
                      </div>
                      <span className="text-[10px] font-semibold text-slate-700 truncate w-full text-center">
                        {st.label.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Eye Color Swatches */}
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                Eye Color
              </h3>
              <div className="flex items-center gap-3 bg-white p-3.5 rounded-2xl border border-slate-100 shadow-xs">
                {eyeColors.map((color) => {
                  const isSelected = robotConfig.eyeColor === color.hex;
                  return (
                    <button
                      key={color.hex}
                      onClick={() => onUpdateRobotConfig({ eyeColor: color.hex })}
                      className="relative w-10 h-10 rounded-full flex items-center justify-center shadow-sm cursor-pointer transition-transform active:scale-95"
                      style={{ backgroundColor: color.hex }}
                      title={color.label}
                    >
                      {isSelected && (
                        <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center text-slate-900 shadow-xs">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Body Color Swatches */}
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                Body Color
              </h3>
              <div className="flex items-center gap-3 bg-white p-3.5 rounded-2xl border border-slate-100 shadow-xs">
                {bodyColors.map((color) => {
                  const isSelected = robotConfig.bodyColor === color.hex;
                  return (
                    <button
                      key={color.hex}
                      onClick={() => onUpdateRobotConfig({ bodyColor: color.hex })}
                      className={`relative w-10 h-10 rounded-full border-2 flex items-center justify-center shadow-sm cursor-pointer transition-transform active:scale-95 ${color.border}`}
                      style={{ backgroundColor: color.hex }}
                      title={color.label}
                    >
                      {isSelected && (
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center shadow-xs ${color.hex === '#FFFFFF' ? 'bg-blue-600 text-white' : 'bg-white text-slate-900'}`}>
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        ) : activeTab === 'Background' ? (
          <div className="bg-white p-4 rounded-2xl border border-slate-100 space-y-3">
            <h4 className="text-sm font-bold text-slate-800">Robot Stage Background</h4>
            <div className="grid grid-cols-3 gap-2.5">
              {['Deep Cosmic', 'Royal Blue', 'Midnight Glow'].map((bgName, i) => (
                <div
                  key={bgName}
                  className={`h-20 rounded-xl cursor-pointer p-2 flex flex-col justify-end text-[11px] font-bold text-white shadow-xs ${
                    i === 0 ? 'bg-gradient-to-b from-[#0A0F24] to-[#1E1B4B] ring-2 ring-blue-500' : i === 1 ? 'bg-gradient-to-b from-blue-900 to-indigo-950' : 'bg-slate-900'
                  }`}
                >
                  {bgName}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white p-4 rounded-2xl border border-slate-100 space-y-3">
            <h4 className="text-sm font-bold text-slate-800">Visual Effects & Particle Halo</h4>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-slate-700">Audio Reactive Aura</span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Active</span>
            </div>
          </div>
        )}

        {/* Reset to Default Button */}
        <div className="pt-2">
          <button
            onClick={onResetDefault}
            className="w-full py-3.5 rounded-2xl bg-white border border-slate-200 text-blue-600 font-bold text-sm shadow-xs hover:bg-blue-50 hover:border-blue-300 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset to Default</span>
          </button>
        </div>
      </div>
    </div>
  );
};
