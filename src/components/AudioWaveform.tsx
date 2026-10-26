import React, { useEffect, useState } from 'react';
import { ConversationState } from '../types';

interface AudioWaveformProps {
  state: ConversationState;
  barCount?: number;
  className?: string;
  isMuted?: boolean;
  volumeLevel?: number; // 0 to 100
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({
  state,
  barCount = 36,
  className = '',
  isMuted = false,
  volumeLevel = 0,
}) => {
  const [heights, setHeights] = useState<number[]>([]);

  useEffect(() => {
    // Generate initial symmetric heights
    const initial = Array.from({ length: barCount }, (_, i) => {
      const mid = barCount / 2;
      const dist = Math.abs(i - mid) / mid;
      return Math.max(0.15, 1 - dist * 0.85);
    });
    setHeights(initial);
  }, [barCount]);

  useEffect(() => {
    if (state === 'idle' || isMuted) {
      // Gentle calm wave
      const interval = setInterval(() => {
        setHeights((prev) =>
          prev.map((_, i) => {
            const mid = barCount / 2;
            const dist = Math.abs(i - mid) / mid;
            const base = Math.max(0.12, 0.35 - dist * 0.25);
            return base + Math.sin(Date.now() / 600 + i * 0.3) * 0.08;
          })
        );
      }, 100);
      return () => clearInterval(interval);
    }

    if (state === 'listening' || state === 'speaking') {
      // Active dynamic speech waveform with real volume level amplification
      const interval = setInterval(() => {
        const factor = volumeLevel > 5 ? volumeLevel / 60 : 0.4;
        setHeights(() =>
          Array.from({ length: barCount }, (_, i) => {
            const mid = barCount / 2;
            const dist = Math.abs(i - mid) / mid;
            const envelope = Math.max(0.2, 1 - dist * 0.65);
            const intensity = state === 'speaking' ? 0.95 : Math.min(1.0, 0.4 + factor);
            const noise = Math.random() * 0.6 + 0.4;
            return Math.min(1.0, Math.max(0.12, envelope * noise * intensity));
          })
        );
      }, 60);
      return () => clearInterval(interval);
    }

    if (state === 'thinking') {
      // Pulse scanning wave
      const interval = setInterval(() => {
        const time = Date.now() / 250;
        setHeights(() =>
          Array.from({ length: barCount }, (_, i) => {
            const sweep = Math.sin(time - i * 0.25);
            return Math.max(0.15, Math.min(0.85, 0.25 + sweep * 0.45));
          })
        );
      }, 50);
      return () => clearInterval(interval);
    }
  }, [state, barCount, isMuted, volumeLevel]);

  return (
    <div className={`flex items-center justify-center gap-[3px] sm:gap-1 h-12 w-full max-w-xs sm:max-w-sm px-4 ${className}`}>
      {heights.map((h, i) => {
        const heightPct = Math.round(h * 100);
        return (
          <div
            key={i}
            className={`w-[3px] sm:w-1 rounded-full transition-all duration-75 ${
              state === 'thinking'
                ? 'bg-gradient-to-t from-indigo-500 via-purple-400 to-pink-300 shadow-[0_0_8px_rgba(168,85,247,0.6)]'
                : state === 'speaking'
                ? 'bg-gradient-to-t from-blue-500 via-cyan-400 to-white shadow-[0_0_10px_rgba(6,182,212,0.8)]'
                : state === 'listening'
                ? 'bg-gradient-to-t from-blue-600 via-cyan-400 to-emerald-300 shadow-[0_0_8px_rgba(34,211,238,0.7)]'
                : 'bg-gradient-to-t from-slate-600 to-slate-400 opacity-40'
            }`}
            style={{
              height: `${Math.max(12, heightPct)}%`,
            }}
          />
        );
      })}
    </div>
  );
};
