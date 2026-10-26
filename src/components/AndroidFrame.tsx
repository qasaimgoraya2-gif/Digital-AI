import React from 'react';
import { Wifi, Battery, Signal } from 'lucide-react';

interface AndroidFrameProps {
  children: React.ReactNode;
  darkStatusBar?: boolean;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  children,
  darkStatusBar = false,
}) => {
  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden select-none">
      {/* Android Status Bar */}
      <div
        className={`w-full flex items-center justify-between px-6 pt-3 pb-1 text-xs font-semibold z-40 transition-colors duration-200 ${
          darkStatusBar
            ? 'bg-transparent text-white'
            : 'bg-transparent text-slate-900'
        }`}
      >
        <span className="tracking-tight text-[13px] font-bold">9:41</span>

        {/* Subtle camera punch hole */}
        <div className="w-3.5 h-3.5 rounded-full bg-black/80 ring-1 ring-white/10 hidden sm:block" />

        <div className="flex items-center gap-1.5 opacity-90">
          <Signal className="w-3.5 h-3.5 stroke-[2.5]" />
          <Wifi className="w-3.5 h-3.5 stroke-[2.5]" />
          <Battery className="w-4 h-4 fill-current stroke-[2.5]" />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative overflow-hidden flex flex-col">
        {children}
      </div>

      {/* Android Bottom Navigation Pill Indicator */}
      <div className="w-full flex justify-center py-1.5 pointer-events-none z-30">
        <div
          className={`w-32 h-1 rounded-full transition-colors ${
            darkStatusBar ? 'bg-white/30' : 'bg-slate-300'
          }`}
        />
      </div>
    </div>
  );
};
