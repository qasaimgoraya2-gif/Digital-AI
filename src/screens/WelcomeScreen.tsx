import React from 'react';
import { RobotAvatar } from '../components/RobotAvatar';
import { RobotConfig } from '../types';

interface WelcomeScreenProps {
  onGetStarted: () => void;
  onSignIn: () => void;
  robotConfig: RobotConfig;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onGetStarted,
  onSignIn,
  robotConfig,
}) => {
  return (
    <div className="w-full h-full bg-[#0B1021] text-white flex flex-col justify-between px-6 py-6 overflow-y-auto select-none">
      {/* Top Branding */}
      <div className="flex flex-col items-center mt-4">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400 tracking-tight">
            Q
          </span>
          <span className="text-4xl font-extrabold tracking-tight text-white">AI</span>
        </div>
        <p className="text-slate-400 text-sm font-medium tracking-wide">
          Your Personal AI Assistant
        </p>
      </div>

      {/* Center 3D Waving Robot */}
      <div className="flex flex-col items-center justify-center my-auto py-4">
        <RobotAvatar
          state="idle"
          size="hero"
          eyeColor={robotConfig.eyeColor}
          bodyColor={robotConfig.bodyColor}
          isWaving={true}
          showAura={true}
        />
      </div>

      {/* Action Buttons & Features */}
      <div className="w-full flex flex-col items-center space-y-3.5 mb-2">
        <button
          onClick={onGetStarted}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-base shadow-[0_10px_25px_rgba(59,130,246,0.35)] active:scale-[0.98] transition-all cursor-pointer"
        >
          Get Started
        </button>

        <button
          onClick={onSignIn}
          className="w-full py-3.5 px-6 rounded-2xl bg-[#141C38] hover:bg-[#1C274E] text-slate-200 border border-slate-700/60 font-semibold text-sm active:scale-[0.98] transition-all cursor-pointer"
        >
          Sign In
        </button>

        {/* Feature Highlights */}
        <div className="flex items-center justify-center gap-3 pt-3 text-xs text-slate-400 font-medium">
          <span className="text-slate-300">Smart</span>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          <span className="text-slate-300">Fast</span>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          <span className="text-slate-300">Helpful</span>
        </div>
      </div>
    </div>
  );
};
