import React, { useState } from 'react';
import {
  Menu,
  Search,
  User,
  Globe,
  Mic2,
  Bot,
  MessageSquare,
  Video,
  Palette,
  Shield,
  ChevronRight,
} from 'lucide-react';
import { BottomTabBar } from '../components/BottomTabBar';
import { Screen, Language, VoiceType } from '../types';

interface SettingsScreenProps {
  onNavigate: (screen: Screen) => void;
  onOpenDrawer: () => void;
  selectedLanguage: Language;
  selectedVoice: VoiceType;
  themeMode: string;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  onNavigate,
  onOpenDrawer,
  selectedLanguage,
  selectedVoice,
  themeMode,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const settingsItems = [
    {
      id: 'profile',
      icon: User,
      iconBg: 'bg-blue-50 text-blue-600',
      title: 'Account & Profile',
      subtitle: 'Manage your account',
      target: 'profile' as Screen,
    },
    {
      id: 'language',
      icon: Globe,
      iconBg: 'bg-indigo-50 text-indigo-600',
      title: 'Language & Region',
      subtitle: `${selectedLanguage} (Auto)`,
      target: 'settings_voice' as Screen,
    },
    {
      id: 'voice',
      icon: Mic2,
      iconBg: 'bg-cyan-50 text-cyan-600',
      title: 'Voice & Speech',
      subtitle: `${selectedVoice}`,
      target: 'settings_voice' as Screen,
    },
    {
      id: 'robot',
      icon: Bot,
      iconBg: 'bg-purple-50 text-purple-600',
      title: 'AI Robot & Appearance',
      subtitle: 'Customize your robot',
      target: 'settings_robot' as Screen,
    },
    {
      id: 'chat',
      icon: MessageSquare,
      iconBg: 'bg-sky-50 text-sky-600',
      title: 'Chat & Editing',
      subtitle: 'Chat style, font, etc.',
      target: 'settings_chat' as Screen,
    },
    {
      id: 'live_voice',
      icon: Video,
      iconBg: 'bg-emerald-50 text-emerald-600',
      title: 'Live Voice, Camera & Screen',
      subtitle: 'Voice, camera, sharing',
      target: 'settings_live_voice' as Screen,
    },
    {
      id: 'theme',
      icon: Palette,
      iconBg: 'bg-amber-50 text-amber-600',
      title: 'Theme & Appearance',
      subtitle: `${themeMode === 'light' ? 'Light mode' : themeMode === 'dark' ? 'Dark mode' : 'Auto'}`,
      target: 'settings_theme' as Screen,
    },
    {
      id: 'privacy',
      icon: Shield,
      iconBg: 'bg-rose-50 text-rose-600',
      title: 'Privacy & Security',
      subtitle: 'Permissions, history & lock',
      target: 'settings_privacy' as Screen,
    },
  ];

  const filteredItems = settingsItems.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full h-full bg-[#F8FAFC] flex flex-col justify-between select-none">
      {/* Top Header */}
      <div className="w-full px-5 py-3.5 flex items-center justify-between bg-white border-b border-slate-100">
        <button
          onClick={onOpenDrawer}
          className="p-1.5 -ml-1 rounded-xl text-slate-700 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
        >
          <Menu className="w-5 h-5 stroke-[2.2]" />
        </button>

        <h2 className="text-base font-bold text-slate-900">Settings</h2>

        <div className="w-8" />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search settings..."
            className="w-full bg-white text-slate-800 text-sm pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200/80 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all placeholder:text-slate-400 shadow-xs"
          />
        </div>

        {/* Settings List */}
        <div className="space-y-2.5">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.target)}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white border border-slate-100/90 hover:border-blue-200 shadow-xs hover:shadow-sm transition-all active:scale-[0.99] cursor-pointer text-left group"
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.iconBg} group-hover:scale-105 transition-transform`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">{item.subtitle}</p>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Tab Bar */}
      <BottomTabBar currentScreen="settings" onNavigate={onNavigate} />
    </div>
  );
};
