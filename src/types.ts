export type Screen =
  | 'welcome'
  | 'home'
  | 'chat'
  | 'live_voice'
  | 'settings'
  | 'settings_voice'
  | 'settings_robot'
  | 'settings_chat'
  | 'settings_live_voice'
  | 'settings_theme'
  | 'settings_privacy'
  | 'profile';

export type Language = 'English' | 'Urdu' | 'Hindi' | 'Pashto';

export type VoiceType =
  | 'Female (Soft)'
  | 'Male (Deep)'
  | 'Female (Energetic)'
  | 'Male (Calm)';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
}

export interface RobotConfig {
  style: 'classic' | 'modern' | 'cyber' | 'cute' | 'minimal';
  eyeColor: string; // hex
  bodyColor: string; // hex
  animationIntensity: number; // 0 to 100
}

export interface AppSettings {
  language: Language;
  voiceType: VoiceType;
  speechSpeed: number; // 0.5 to 2.0
  voiceVolume: number; // 0 to 100
  autoLanguageDetect: boolean;
  captionsEnabled: boolean;
  themeMode: 'light' | 'dark' | 'auto';
  colorTheme: string;
  backgroundWallpaper: string;
  fontSize: 'small' | 'medium' | 'large';
  textDirection: 'ltr' | 'rtl';
  imagePreview: boolean;
  codeDisplay: boolean;
  readAloud: boolean;
  enterKeyBehavior: 'send' | 'newline';
  voiceOnlyMode: boolean;
  animatedRobotMode: boolean;
  cameraEnabled: boolean;
  cameraType: 'front' | 'back';
  screenSharing: boolean;
  floatingRobotWindow: boolean;
  micMuted: boolean;
  speakerVolume: number;
  appLock: boolean;
  biometricLogin: boolean;
  micPermissionGranted: boolean;
  cameraPermissionGranted: boolean;
}

export type ConversationState = 'idle' | 'listening' | 'thinking' | 'speaking';
