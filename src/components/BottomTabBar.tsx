import React from 'react';
import { Home, MessageSquare, Mic, Settings } from 'lucide-react';
import { Screen } from '../types';

interface BottomTabBarProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  currentScreen,
  onNavigate,
}) => {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home, target: 'home' as Screen },
    { id: 'chat', label: 'Chat', icon: MessageSquare, target: 'chat' as Screen },
    { id: 'live', label: 'Live', icon: Mic, target: 'live_voice' as Screen },
    { id: 'settings', label: 'Settings', icon: Settings, target: 'settings' as Screen },
  ];

  const getIsActive = (id: string) => {
    if (id === 'home') return currentScreen === 'home';
    if (id === 'chat') return currentScreen === 'chat';
    if (id === 'live') return currentScreen === 'live_voice';
    if (id === 'settings') {
      return (
        currentScreen === 'settings' ||
        currentScreen.startsWith('settings_') ||
        currentScreen === 'profile'
      );
    }
    return false;
  };

  return (
    <div className="w-full bg-white border-t border-slate-100 px-4 py-2 flex items-center justify-around z-20 shadow-[0_-4px_16px_rgba(0,0,0,0.03)]">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = getIsActive(tab.id);

        return (
          <button
            key={tab.id}
            onClick={() => onNavigate(tab.target)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 ${
              active
                ? 'text-blue-600 font-semibold'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className="relative">
              <Icon
                className={`w-5 h-5 transition-transform duration-200 ${
                  active ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'
                }`}
              />
              {tab.id === 'live' && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-blue-500 animate-ping" />
              )}
            </div>
            <span className="text-[11px] mt-1 font-medium">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};
