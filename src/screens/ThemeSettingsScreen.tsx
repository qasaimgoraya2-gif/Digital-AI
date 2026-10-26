import React from 'react';
import { ArrowLeft, Sun, Moon, Sparkles, Check } from 'lucide-react';
import { AppSettings } from '../types';

interface ThemeSettingsScreenProps {
  onBack: () => void;
  settings: AppSettings;
  onUpdateSettings: (updates: Partial<AppSettings>) => void;
}

export const ThemeSettingsScreen: React.FC<ThemeSettingsScreenProps> = ({
  onBack,
  settings,
  onUpdateSettings,
}) => {
  const themeColors = [
    { id: 'blue', hex: '#2563EB' },
    { id: 'cyan', hex: '#00E5FF' },
    { id: 'mint', hex: '#10B981' },
    { id: 'orange', hex: '#F97316' },
    { id: 'pink', hex: '#EC4899' },
  ];

  const wallpapers = [
    { id: 'default', name: 'Soft Sky', class: 'bg-gradient-to-tr from-blue-300 to-indigo-200' },
    { id: 'purple', name: 'Lavender', class: 'bg-gradient-to-tr from-purple-400 to-pink-300' },
    { id: 'cosmic', name: 'Deep Space', class: 'bg-gradient-to-tr from-blue-900 to-slate-900' },
    { id: 'sunset', name: 'Sunset Glow', class: 'bg-gradient-to-tr from-orange-400 to-rose-400' },
    { id: 'dark', name: 'Midnight', class: 'bg-gradient-to-tr from-slate-900 to-black' },
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

        <h2 className="text-base font-bold text-slate-900">Theme & Appearance</h2>

        <div className="w-8" />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        {/* Theme Mode Segmented Control */}
        <div>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
            Theme Mode
          </h3>
          <div className="flex items-center p-1 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <button
              onClick={() => onUpdateSettings({ themeMode: 'light' })}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                settings.themeMode === 'light'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sun className="w-4 h-4" />
              <span>Light</span>
            </button>

            <button
              onClick={() => onUpdateSettings({ themeMode: 'dark' })}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                settings.themeMode === 'dark'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Moon className="w-4 h-4" />
              <span>Dark</span>
            </button>

            <button
              onClick={() => onUpdateSettings({ themeMode: 'auto' })}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                settings.themeMode === 'auto'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Auto</span>
            </button>
          </div>
        </div>

        {/* Color Theme */}
        <div>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
            Color Theme
          </h3>
          <div className="flex items-center gap-3 bg-white p-3.5 rounded-2xl border border-slate-100 shadow-xs">
            {themeColors.map((color) => {
              const isSelected = settings.colorTheme === color.hex;
              return (
                <button
                  key={color.id}
                  onClick={() => onUpdateSettings({ colorTheme: color.hex })}
                  className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm cursor-pointer transition-transform active:scale-95"
                  style={{ backgroundColor: color.hex }}
                >
                  {isSelected && (
                    <div className="w-4 h-4 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-xs">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Background Wallpaper Cards */}
        <div>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
            Background
          </h3>
          <div className="grid grid-cols-5 gap-2">
            {wallpapers.map((wp) => {
              const isSelected = settings.backgroundWallpaper === wp.id;
              return (
                <button
                  key={wp.id}
                  onClick={() => onUpdateSettings({ backgroundWallpaper: wp.id })}
                  className={`h-16 rounded-xl relative overflow-hidden transition-all cursor-pointer ${wp.class} ${
                    isSelected ? 'ring-2 ring-blue-600 ring-offset-2 scale-105' : 'opacity-85 hover:opacity-100'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <Check className="w-4 h-4 text-white stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Animation Intensity Slider */}
        <div className="bg-white rounded-2xl border border-slate-100/90 p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-slate-800">Animation Intensity</h4>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
              80%
            </span>
          </div>

          <input
            type="range"
            min="20"
            max="100"
            defaultValue="80"
            className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg appearance-none"
          />
        </div>
      </div>
    </div>
  );
};
