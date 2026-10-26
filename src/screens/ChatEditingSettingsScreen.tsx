import React from 'react';
import {
  ArrowLeft,
  Type,
  Palette,
  AlignLeft,
  Image as ImageIcon,
  Code2,
  Volume2,
  CornerDownLeft,
  FileText,
  ChevronRight,
} from 'lucide-react';
import { AppSettings } from '../types';

interface ChatEditingSettingsScreenProps {
  onBack: () => void;
  settings: AppSettings;
  onUpdateSettings: (updates: Partial<AppSettings>) => void;
}

export const ChatEditingSettingsScreen: React.FC<ChatEditingSettingsScreenProps> = ({
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

        <h2 className="text-base font-bold text-slate-900">Chat & Editing</h2>

        <div className="w-8" />
      </div>

      {/* Main List */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2.5">
        <div className="bg-white rounded-2xl border border-slate-100/90 shadow-xs divide-y divide-slate-100 overflow-hidden">
          {/* Font Size */}
          <button
            onClick={() => {
              const sizes: Array<AppSettings['fontSize']> = ['small', 'medium', 'large'];
              const next = sizes[(sizes.indexOf(settings.fontSize) + 1) % sizes.length];
              onUpdateSettings({ fontSize: next });
            }}
            className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Type className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-semibold text-slate-800">Font Size</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 capitalize">{settings.fontSize}</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </button>

          {/* Chat Bubble Colors */}
          <div className="w-full flex items-center justify-between p-3.5">
            <div className="flex items-center gap-3">
              <Palette className="w-5 h-5 text-indigo-600" />
              <span className="text-sm font-semibold text-slate-800">Chat Bubble Colors</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-blue-600 ring-2 ring-blue-200" />
              <span className="w-4 h-4 rounded-full bg-indigo-600" />
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </div>

          {/* Text Direction */}
          <button
            onClick={() => {
              onUpdateSettings({
                textDirection: settings.textDirection === 'ltr' ? 'rtl' : 'ltr',
              });
            }}
            className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <AlignLeft className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-semibold text-slate-800">Text Direction</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">
                {settings.textDirection === 'ltr' ? 'Left to Right' : 'Right to Left'}
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </button>

          {/* Image Preview */}
          <div className="w-full flex items-center justify-between p-3.5">
            <div className="flex items-center gap-3">
              <ImageIcon className="w-5 h-5 text-rose-500" />
              <span className="text-sm font-semibold text-slate-800">Image Preview</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">{settings.imagePreview ? 'On' : 'Off'}</span>
              <button
                onClick={() => onUpdateSettings({ imagePreview: !settings.imagePreview })}
                className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                  settings.imagePreview ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform ${
                    settings.imagePreview ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Code Display */}
          <div className="w-full flex items-center justify-between p-3.5">
            <div className="flex items-center gap-3">
              <Code2 className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-semibold text-slate-800">Code Display</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">{settings.codeDisplay ? 'On' : 'Off'}</span>
              <button
                onClick={() => onUpdateSettings({ codeDisplay: !settings.codeDisplay })}
                className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                  settings.codeDisplay ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform ${
                    settings.codeDisplay ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Read Aloud */}
          <div className="w-full flex items-center justify-between p-3.5">
            <div className="flex items-center gap-3">
              <Volume2 className="w-5 h-5 text-cyan-600" />
              <span className="text-sm font-semibold text-slate-800">Read Aloud</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">{settings.readAloud ? 'On' : 'Off'}</span>
              <button
                onClick={() => onUpdateSettings({ readAloud: !settings.readAloud })}
                className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                  settings.readAloud ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform ${
                    settings.readAloud ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Enter Key Behavior */}
          <button
            onClick={() => {
              onUpdateSettings({
                enterKeyBehavior: settings.enterKeyBehavior === 'send' ? 'newline' : 'send',
              });
            }}
            className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <CornerDownLeft className="w-5 h-5 text-amber-600" />
              <span className="text-sm font-semibold text-slate-800">Enter Key Behavior</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">
                {settings.enterKeyBehavior === 'send' ? 'Send message' : 'New line'}
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </button>

          {/* Export Chat */}
          <button
            onClick={() => alert('Exporting conversation transcript as PDF / Text...')}
            className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-semibold text-slate-800">Export Chat</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">PDF / Text</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
