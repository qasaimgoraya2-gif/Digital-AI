import React from 'react';
import {
  ArrowLeft,
  Lock,
  Fingerprint,
  Mic,
  Camera,
  Monitor,
  History,
  Download,
  Trash2,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { AppSettings } from '../types';

interface PrivacySecurityScreenProps {
  onBack: () => void;
  settings: AppSettings;
  onUpdateSettings: (updates: Partial<AppSettings>) => void;
}

export const PrivacySecurityScreen: React.FC<PrivacySecurityScreenProps> = ({
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

        <h2 className="text-base font-bold text-slate-900">Privacy & Security</h2>

        <div className="w-8" />
      </div>

      {/* Main List */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        <div className="bg-white rounded-2xl border border-slate-100/90 shadow-xs divide-y divide-slate-100 overflow-hidden">
          {/* App Lock */}
          <button
            onClick={() => onUpdateSettings({ appLock: !settings.appLock })}
            className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-semibold text-slate-800">App Lock</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">{settings.appLock ? 'On' : 'Off'}</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </button>

          {/* Biometric Login */}
          <button
            onClick={() => onUpdateSettings({ biometricLogin: !settings.biometricLogin })}
            className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Fingerprint className="w-5 h-5 text-indigo-600" />
              <span className="text-sm font-semibold text-slate-800">Biometric Login</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">{settings.biometricLogin ? 'On' : 'Off'}</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </button>

          {/* Microphone Permission */}
          <button
            onClick={async () => {
              try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                stream.getTracks().forEach((t) => t.stop());
                onUpdateSettings({ micPermissionGranted: true });
                alert('Microphone permission granted successfully!');
              } catch (e) {
                alert('Microphone permission was denied by browser.');
              }
            }}
            className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Mic className="w-5 h-5 text-cyan-600" />
              <span className="text-sm font-semibold text-slate-800">Microphone Permission</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">{settings.micPermissionGranted ? 'On' : 'Off'}</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </button>

          {/* Camera Permission */}
          <button
            onClick={() => onUpdateSettings({ cameraPermissionGranted: !settings.cameraPermissionGranted })}
            className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Camera className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-semibold text-slate-800">Camera Permission</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">{settings.cameraPermissionGranted ? 'On' : 'Off'}</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </button>

          {/* Screen Sharing Permission */}
          <button
            onClick={() => onUpdateSettings({ screenSharing: !settings.screenSharing })}
            className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Monitor className="w-5 h-5 text-amber-600" />
              <span className="text-sm font-semibold text-slate-800">Screen Sharing Permission</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">{settings.screenSharing ? 'On' : 'Off'}</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </button>

          {/* Chat History */}
          <div className="w-full flex items-center justify-between p-3.5">
            <div className="flex items-center gap-3">
              <History className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-semibold text-slate-800">Chat History</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">On</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </div>

          {/* Data Export Button */}
          <div className="w-full flex items-center justify-between p-3.5">
            <div className="flex items-center gap-3">
              <Download className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-semibold text-slate-800">Data Export</span>
            </div>
            <button
              onClick={() => alert('Your Q AI chat data export has been prepared.')}
              className="px-3 py-1 bg-blue-50 text-blue-600 font-bold text-xs rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
            >
              Export
            </button>
          </div>

          {/* Delete Account Button */}
          <div className="w-full flex items-center justify-between p-3.5">
            <div className="flex items-center gap-3">
              <Trash2 className="w-5 h-5 text-rose-500" />
              <span className="text-sm font-semibold text-slate-800">Delete Account</span>
            </div>
            <button
              onClick={() => {
                if (confirm('Are you sure you want to delete your Q AI data and reset?')) {
                  localStorage.clear();
                  window.location.reload();
                }
              }}
              className="px-3 py-1 bg-rose-50 text-rose-600 font-bold text-xs rounded-lg hover:bg-rose-100 transition-colors cursor-pointer"
            >
              Delete
            </button>
          </div>
        </div>

        {/* Privacy Note */}
        <div className="text-center pt-2 pb-4">
          <ShieldCheck className="w-5 h-5 text-blue-600 mx-auto mb-1 opacity-80" />
          <p className="text-[11px] text-slate-400 leading-tight">
            Your privacy is important to us.
          </p>
          <p className="text-[11px] text-slate-400 leading-tight">
            We never share your data.
          </p>
        </div>
      </div>
    </div>
  );
};
