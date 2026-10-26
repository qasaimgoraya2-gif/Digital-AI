/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AndroidFrame } from './components/AndroidFrame';
import { DrawerMenu } from './components/DrawerMenu';
import { WelcomeScreen } from './screens/WelcomeScreen';
import { HomeScreen } from './screens/HomeScreen';
import { ChatScreen } from './screens/ChatScreen';
import { LiveVoiceScreen } from './screens/LiveVoiceScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { VoiceSpeechSettingsScreen } from './screens/VoiceSpeechSettingsScreen';
import { RobotAppearanceScreen } from './screens/RobotAppearanceScreen';
import { ChatEditingSettingsScreen } from './screens/ChatEditingSettingsScreen';
import { LiveVoiceSettingsScreen } from './screens/LiveVoiceSettingsScreen';
import { ThemeSettingsScreen } from './screens/ThemeSettingsScreen';
import { PrivacySecurityScreen } from './screens/PrivacySecurityScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import {
  Screen,
  RobotConfig,
  AppSettings,
  ChatMessage,
  Language,
  VoiceType,
} from './types';
import { Smartphone, Monitor } from 'lucide-react';

const DEFAULT_ROBOT_CONFIG: RobotConfig = {
  style: 'classic',
  eyeColor: '#00E5FF',
  bodyColor: '#FFFFFF',
  animationIntensity: 80,
};

const DEFAULT_SETTINGS: AppSettings = {
  language: 'English',
  voiceType: 'Female (Soft)',
  speechSpeed: 1.0,
  voiceVolume: 70,
  autoLanguageDetect: true,
  captionsEnabled: true,
  themeMode: 'light',
  colorTheme: '#2563EB',
  backgroundWallpaper: 'default',
  fontSize: 'medium',
  textDirection: 'ltr',
  imagePreview: true,
  codeDisplay: true,
  readAloud: true,
  enterKeyBehavior: 'send',
  voiceOnlyMode: false,
  animatedRobotMode: true,
  cameraEnabled: false,
  cameraType: 'front',
  screenSharing: false,
  floatingRobotWindow: true,
  micMuted: false,
  speakerVolume: 70,
  appLock: false,
  biometricLogin: false,
  micPermissionGranted: false,
  cameraPermissionGranted: false,
};

// Initial messages pre-seeded matching Screen 3 from reference image
const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: '1',
    role: 'user',
    content: 'Hello, how are you?',
    timestamp: '09:41',
    status: 'read',
  },
  {
    id: '2',
    role: 'model',
    content: "I'm doing great! 😊\nThanks for asking.\nHow can I help you today?",
    timestamp: '09:41',
  },
  {
    id: '3',
    role: 'user',
    content: 'Can you explain AI in simple words?',
    timestamp: '09:42',
    status: 'read',
  },
  {
    id: '4',
    role: 'model',
    content:
      'Sure! AI (Artificial Intelligence) is technology that allows machines to think, learn and solve problems like humans. It helps in many areas like education, healthcare, and more.',
    timestamp: '09:42',
  },
];

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [previousScreen, setPreviousScreen] = useState<Screen>('home');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isPhoneFrame, setIsPhoneFrame] = useState(true);

  // Load persisted settings or use defaults
  const [robotConfig, setRobotConfig] = useState<RobotConfig>(() => {
    try {
      const saved = localStorage.getItem('q_ai_robot_config');
      return saved ? JSON.parse(saved) : DEFAULT_ROBOT_CONFIG;
    } catch {
      return DEFAULT_ROBOT_CONFIG;
    }
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('q_ai_settings');
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('q_ai_chat_messages');
      return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
    } catch {
      return INITIAL_MESSAGES;
    }
  });

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('q_ai_robot_config', JSON.stringify(robotConfig));
    } catch (e) {}
  }, [robotConfig]);

  useEffect(() => {
    try {
      localStorage.setItem('q_ai_settings', JSON.stringify(settings));
    } catch (e) {}
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem('q_ai_chat_messages', JSON.stringify(messages));
    } catch (e) {}
  }, [messages]);

  const navigateTo = (newScreen: Screen) => {
    setPreviousScreen(screen);
    setScreen(newScreen);
  };

  const handleUpdateSettings = (updates: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  const handleUpdateRobotConfig = (updates: Partial<RobotConfig>) => {
    setRobotConfig((prev) => ({ ...prev, ...updates }));
  };

  const handleResetRobotConfig = () => {
    setRobotConfig(DEFAULT_ROBOT_CONFIG);
  };

  const handleAddMessage = (msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg]);
  };

  const handleNewChat = () => {
    setMessages([
      {
        id: Date.now().toString(),
        role: 'model',
        content: `Hello! I'm Q AI. How can I assist you today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    navigateTo('chat');
  };

  const isDarkScreen = screen === 'welcome' || screen === 'live_voice';

  return (
    <div className="w-screen h-screen bg-[#070B18] flex items-center justify-center p-0 sm:p-4 overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Device frame switch toggle (top right on larger screens) */}
      <div className="fixed top-3 right-4 z-50 hidden sm:flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 text-slate-300 p-1 rounded-full text-xs shadow-xl backdrop-blur-md">
        <button
          onClick={() => setIsPhoneFrame(true)}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full transition-all cursor-pointer ${
            isPhoneFrame ? 'bg-blue-600 text-white font-bold' : 'hover:text-white'
          }`}
          title="Android Phone Mockup"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Mobile View</span>
        </button>
        <button
          onClick={() => setIsPhoneFrame(false)}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full transition-all cursor-pointer ${
            !isPhoneFrame ? 'bg-blue-600 text-white font-bold' : 'hover:text-white'
          }`}
          title="Full Screen View"
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>Expanded</span>
        </button>
      </div>

      {/* Main Container */}
      <div
        className={`relative transition-all duration-300 shadow-2xl overflow-hidden flex flex-col ${
          isPhoneFrame
            ? 'w-full max-w-[412px] h-[100dvh] sm:h-[844px] sm:rounded-[44px] sm:border-[8px] sm:border-slate-800 sm:ring-1 sm:ring-white/10'
            : 'w-full h-full max-w-2xl sm:rounded-3xl border border-slate-800'
        } ${isDarkScreen ? 'bg-[#0B1021]' : 'bg-[#F8FAFC]'}`}
      >
        <AndroidFrame darkStatusBar={isDarkScreen}>
          {screen === 'welcome' && (
            <WelcomeScreen
              onGetStarted={() => navigateTo('home')}
              onSignIn={() => navigateTo('home')}
              robotConfig={robotConfig}
            />
          )}

          {screen === 'home' && (
            <HomeScreen
              onNavigate={navigateTo}
              onOpenDrawer={() => setIsDrawerOpen(true)}
              onSendMessage={(text) => {
                handleAddMessage({
                  id: Date.now().toString(),
                  role: 'user',
                  content: text,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  status: 'delivered',
                });
              }}
              onStartVoiceInput={() => {
                navigateTo('chat');
              }}
              robotConfig={robotConfig}
              selectedLanguage={settings.language}
            />
          )}

          {screen === 'chat' && (
            <ChatScreen
              onBack={() => navigateTo('home')}
              onNavigateToLiveVoice={() => navigateTo('live_voice')}
              messages={messages}
              onAddMessage={handleAddMessage}
              robotConfig={robotConfig}
              selectedLanguage={settings.language}
              selectedVoice={settings.voiceType}
              speechSpeed={settings.speechSpeed}
              voiceVolume={settings.voiceVolume}
            />
          )}

          {screen === 'live_voice' && (
            <LiveVoiceScreen
              onBack={() => navigateTo(previousScreen === 'live_voice' ? 'home' : previousScreen)}
              robotConfig={robotConfig}
              selectedLanguage={settings.language}
              selectedVoice={settings.voiceType}
              speechSpeed={settings.speechSpeed}
              voiceVolume={settings.voiceVolume}
              captionsEnabled={settings.captionsEnabled}
            />
          )}

          {screen === 'settings' && (
            <SettingsScreen
              onNavigate={navigateTo}
              onOpenDrawer={() => setIsDrawerOpen(true)}
              selectedLanguage={settings.language}
              selectedVoice={settings.voiceType}
              themeMode={settings.themeMode}
            />
          )}

          {screen === 'settings_voice' && (
            <VoiceSpeechSettingsScreen
              onBack={() => navigateTo('settings')}
              onNavigate={navigateTo}
              selectedLanguage={settings.language}
              onSelectLanguage={(lang: Language) => handleUpdateSettings({ language: lang })}
              selectedVoice={settings.voiceType}
              onSelectVoice={(voice: VoiceType) => handleUpdateSettings({ voiceType: voice })}
              speechSpeed={settings.speechSpeed}
              onSpeechSpeedChange={(speed) => handleUpdateSettings({ speechSpeed: speed })}
              voiceVolume={settings.voiceVolume}
              onVoiceVolumeChange={(vol) => handleUpdateSettings({ voiceVolume: vol })}
              autoDetect={settings.autoLanguageDetect}
              onAutoDetectToggle={() =>
                handleUpdateSettings({ autoLanguageDetect: !settings.autoLanguageDetect })
              }
              captionsEnabled={settings.captionsEnabled}
              onCaptionsToggle={() =>
                handleUpdateSettings({ captionsEnabled: !settings.captionsEnabled })
              }
            />
          )}

          {screen === 'settings_robot' && (
            <RobotAppearanceScreen
              onBack={() => navigateTo('settings')}
              robotConfig={robotConfig}
              onUpdateRobotConfig={handleUpdateRobotConfig}
              onResetDefault={handleResetRobotConfig}
            />
          )}

          {screen === 'settings_chat' && (
            <ChatEditingSettingsScreen
              onBack={() => navigateTo('settings')}
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
            />
          )}

          {screen === 'settings_live_voice' && (
            <LiveVoiceSettingsScreen
              onBack={() => navigateTo('settings')}
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
            />
          )}

          {screen === 'settings_theme' && (
            <ThemeSettingsScreen
              onBack={() => navigateTo('settings')}
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
            />
          )}

          {screen === 'settings_privacy' && (
            <PrivacySecurityScreen
              onBack={() => navigateTo('settings')}
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
            />
          )}

          {screen === 'profile' && (
            <ProfileScreen
              onBack={() => navigateTo('settings')}
              onLogout={() => navigateTo('welcome')}
              selectedLanguage={settings.language}
            />
          )}
        </AndroidFrame>

        {/* Slide-out Navigation Drawer */}
        <DrawerMenu
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          onNavigate={navigateTo}
          onNewChat={handleNewChat}
          onShowHistory={() => {
            alert(`Chat History:\n- 4 conversations saved\n- Last active today at 09:42`);
          }}
          onShowSearch={() => {
            const query = prompt('Search chat messages:');
            if (query) {
              const matched = messages.filter((m) =>
                m.content.toLowerCase().includes(query.toLowerCase())
              );
              alert(
                matched.length > 0
                  ? `Found ${matched.length} messages matching "${query}"`
                  : `No messages found matching "${query}"`
              );
            }
          }}
        />
      </div>
    </div>
  );
}
