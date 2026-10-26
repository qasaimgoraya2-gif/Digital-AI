import React from 'react';
import {
  User,
  PlusSquare,
  Clock,
  Search,
  Mic,
  Settings,
  HelpCircle,
  LogOut,
  X,
} from 'lucide-react';
import { Screen } from '../types';

interface DrawerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (screen: Screen) => void;
  onNewChat: () => void;
  onShowHistory: () => void;
  onShowSearch: () => void;
}

export const DrawerMenu: React.FC<DrawerMenuProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onNewChat,
  onShowHistory,
  onShowSearch,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Content */}
      <div className="relative w-[80%] max-w-xs bg-[#0F172A] text-white h-full flex flex-col z-10 shadow-2xl p-6 border-r border-slate-800 animate-in slide-in-from-left duration-300">
        {/* Header with Q AI Logo and close button */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              Q
            </span>
            <span className="text-2xl font-bold tracking-tight text-white">AI</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Profile Card */}
        <div
          onClick={() => {
            onClose();
            onNavigate('profile');
          }}
          className="flex items-center gap-3 p-3 rounded-2xl bg-slate-800/60 hover:bg-slate-800 cursor-pointer border border-slate-700/60 mb-6 transition-colors"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg">
            <User className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold truncate text-white">User Name</h4>
            <p className="text-xs text-slate-400 truncate">user@example.com</p>
          </div>
        </div>

        {/* Nav Links */}
        <div className="flex-1 space-y-1.5 overflow-y-auto">
          <button
            onClick={() => {
              onClose();
              onNewChat();
            }}
            className="w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors text-sm font-medium"
          >
            <PlusSquare className="w-5 h-5 text-blue-400" />
            <span>New Chat</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onShowHistory();
            }}
            className="w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors text-sm font-medium"
          >
            <Clock className="w-5 h-5 text-cyan-400" />
            <span>Chat History</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onShowSearch();
            }}
            className="w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors text-sm font-medium"
          >
            <Search className="w-5 h-5 text-purple-400" />
            <span>Search Chats</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onNavigate('live_voice');
            }}
            className="w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors text-sm font-medium group"
          >
            <div className="p-1 rounded-lg bg-blue-500/20 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
              <Mic className="w-4 h-4" />
            </div>
            <span>Live Voice</span>
            <span className="ml-auto text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-500/30 text-blue-300">
              Live
            </span>
          </button>

          <div className="my-4 border-t border-slate-800" />

          <button
            onClick={() => {
              onClose();
              onNavigate('settings');
            }}
            className="w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors text-sm font-medium"
          >
            <Settings className="w-5 h-5 text-slate-400" />
            <span>Settings</span>
          </button>

          <button
            onClick={() => {
              alert('Q AI Help & Support\n\n- Tap microphone in Chat for voice-to-text typing.\n- Tap Live Voice for two-way spoken conversation.\n- Visit Settings > Voice & Speech for multilingual options (Urdu, Hindi, Pashto, English).');
            }}
            className="w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors text-sm font-medium"
          >
            <HelpCircle className="w-5 h-5 text-slate-400" />
            <span>Help & Support</span>
          </button>
        </div>

        {/* Logout */}
        <div className="pt-4 border-t border-slate-800">
          <button
            onClick={() => {
              onClose();
              onNavigate('welcome');
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors text-sm font-medium"
          >
            <LogOut className="w-5 h-5 stroke-[2.2]" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};
