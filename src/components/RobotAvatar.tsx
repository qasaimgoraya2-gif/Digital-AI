import React, { useEffect, useState } from 'react';
import { ConversationState } from '../types';

interface RobotAvatarProps {
  state?: ConversationState;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  eyeColor?: string;
  bodyColor?: string;
  isWaving?: boolean;
  showAura?: boolean;
  className?: string;
}

export const RobotAvatar: React.FC<RobotAvatarProps> = ({
  state = 'idle',
  size = 'md',
  eyeColor = '#00E5FF',
  bodyColor = '#FFFFFF',
  isWaving = false,
  showAura = true,
  className = '',
}) => {
  const [blink, setBlink] = useState(false);
  const [mouthStep, setMouthStep] = useState(0);

  // Periodic blinking during idle or listening
  useEffect(() => {
    const interval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 160);
    }, 3500 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, []);

  // Mouth animation during speaking
  useEffect(() => {
    if (state !== 'speaking') {
      setMouthStep(0);
      return;
    }
    const interval = setInterval(() => {
      setMouthStep((prev) => (prev + 1) % 4);
    }, 140);
    return () => clearInterval(interval);
  }, [state]);

  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-20 h-20',
    lg: 'w-32 h-32',
    xl: 'w-48 h-48',
    hero: 'w-64 h-64 sm:w-72 sm:h-72',
  }[size];

  // Colors
  const eyeGlow = eyeColor;
  const bodyHex = bodyColor || '#FFFFFF';
  const isDarkBody = bodyHex.toLowerCase() === '#1e293b' || bodyHex.toLowerCase() === '#1e40af';
  const rimColor = isDarkBody ? '#60A5FA' : '#CBD5E1';

  return (
    <div className={`relative inline-flex items-center justify-center select-none ${sizeClasses} ${className}`}>
      {/* Radiant Background Aura Glow */}
      {showAura && (
        <div
          className={`absolute inset-0 rounded-full blur-2xl transition-all duration-700 pointer-events-none ${
            state === 'speaking'
              ? 'opacity-80 scale-125 bg-radial from-cyan-400/40 via-blue-500/30 to-purple-600/20'
              : state === 'listening'
              ? 'opacity-90 scale-120 bg-radial from-cyan-400/50 via-blue-600/30 to-transparent animate-pulse'
              : state === 'thinking'
              ? 'opacity-85 scale-115 bg-radial from-purple-500/40 via-indigo-600/30 to-transparent'
              : 'opacity-50 scale-100 bg-radial from-blue-400/30 via-indigo-500/20 to-transparent'
          }`}
          style={{
            boxShadow: `0 0 60px 15px ${state === 'listening' ? '#00E5FF40' : state === 'thinking' ? '#8B5CF640' : '#3B82F630'}`,
          }}
        />
      )}

      {/* Robot SVG Graphic */}
      <svg
        viewBox="0 0 240 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full h-full relative z-10 filter drop-shadow-xl transition-transform duration-500 ${
          state === 'idle'
            ? 'animate-[bounce_4s_ease-in-out_infinite]'
            : state === 'listening'
            ? 'scale-105'
            : state === 'speaking'
            ? 'animate-[pulse_1.5s_ease-in-out_infinite]'
            : 'animate-[spin_10s_linear_infinite_paused]'
        }`}
        style={{
          transformOrigin: 'center center',
          animationDuration: state === 'idle' ? '4s' : state === 'speaking' ? '1.2s' : '3s',
        }}
      >
        <defs>
          {/* Gradients for 3D glossy robot */}
          <linearGradient id={`helmetGrad-${eyeColor}`} x1="30" y1="20" x2="210" y2="180" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={bodyHex} />
            <stop offset="70%" stopColor={isDarkBody ? '#0F172A' : '#E2E8F0'} />
            <stop offset="100%" stopColor={isDarkBody ? '#020617' : '#94A3B8'} />
          </linearGradient>

          <linearGradient id="visorGrad" x1="50" y1="50" x2="190" y2="150" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0B132B" />
            <stop offset="50%" stopColor="#070C1B" />
            <stop offset="100%" stopColor="#02040A" />
          </linearGradient>

          <linearGradient id="visorReflection" x1="60" y1="50" x2="180" y2="80" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.35" />
            <stop offset="50%" stopColor="#38BDF8" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>

          <radialGradient id="earGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={eyeGlow} stopOpacity="1" />
            <stop offset="60%" stopColor="#2563EB" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#1E3A8A" stopOpacity="0.1" />
          </radialGradient>

          <radialGradient id="chestCoreGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#E0F2FE" />
            <stop offset="35%" stopColor={eyeGlow} />
            <stop offset="80%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#1E1B4B" />
          </radialGradient>

          <filter id="eyeNeon" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Floating Shadow under robot */}
        <ellipse cx="120" cy="232" rx="48" ry="6" fill="#000000" opacity="0.25" filter="blur(3px)" />

        {/* Arms and Torso */}
        {size !== 'sm' && (
          <g id="body">
            {/* Left Arm */}
            <path
              d="M 68 155 C 50 162, 40 180, 48 198 C 52 206, 62 208, 70 200 C 76 194, 76 175, 78 162 Z"
              fill={`url(#helmetGrad-${eyeColor})`}
              stroke={rimColor}
              strokeWidth="2"
            />
            {/* Left Hand / Cuff */}
            <circle cx="54" cy="202" r="10" fill="#3B82F6" opacity="0.9" />

            {/* Right Arm (Waving if isWaving, else relaxed) */}
            {isWaving ? (
              <g
                className="animate-[wiggle_1.2s_ease-in-out_infinite]"
                style={{ transformOrigin: '175px 155px' }}
              >
                <path
                  d="M 172 155 C 190 145, 204 125, 206 105 C 206 95, 196 90, 188 98 C 178 108, 172 135, 164 150 Z"
                  fill={`url(#helmetGrad-${eyeColor})`}
                  stroke={rimColor}
                  strokeWidth="2"
                />
                {/* Waving Palm and Fingers */}
                <ellipse cx="206" cy="96" rx="14" ry="12" fill={bodyHex} stroke={rimColor} strokeWidth="2" />
                <path d="M 198 88 Q 200 80, 204 82 Q 208 84, 206 90" stroke={rimColor} strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 204 86 Q 208 78, 212 80 Q 215 83, 212 89" stroke={rimColor} strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 212 88 Q 216 82, 220 85 Q 222 89, 218 94" stroke={rimColor} strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="204" cy="98" r="4" fill={eyeGlow} />
              </g>
            ) : (
              <g>
                <path
                  d="M 172 155 C 190 162, 200 180, 192 198 C 188 206, 178 208, 170 200 C 164 194, 164 175, 162 162 Z"
                  fill={`url(#helmetGrad-${eyeColor})`}
                  stroke={rimColor}
                  strokeWidth="2"
                />
                <circle cx="186" cy="202" r="10" fill="#3B82F6" opacity="0.9" />
              </g>
            )}

            {/* Torso / Chest */}
            <path
              d="M 80 152 Q 120 146, 160 152 C 168 175, 164 212, 120 220 C 76 212, 72 175, 80 152 Z"
              fill={`url(#helmetGrad-${eyeColor})`}
              stroke={rimColor}
              strokeWidth="2.5"
            />
            {/* Torso Inner Accent */}
            <path
              d="M 96 162 Q 120 158, 144 162 C 148 185, 142 206, 120 212 C 98 206, 92 185, 96 162 Z"
              fill={isDarkBody ? '#0F172A' : '#F1F5F9'}
            />

            {/* Chest Core Reactor Ring */}
            <circle cx="120" cy="184" r="14" fill="#0B132B" stroke="#2563EB" strokeWidth="2" />
            <circle
              cx="120"
              cy="184"
              r={state === 'speaking' || state === 'listening' ? '9' : '7'}
              fill="url(#chestCoreGrad)"
              filter="url(#eyeNeon)"
              className="transition-all duration-300"
            />
            {/* Core Center Dot */}
            <circle cx="120" cy="184" r="3" fill="#FFFFFF" />

            {/* Neck Collar */}
            <path
              d="M 98 142 L 142 142 L 136 154 L 104 154 Z"
              fill="#2563EB"
              stroke="#1D4ED8"
              strokeWidth="1.5"
            />
          </g>
        )}

        {/* Robot Head Assembly */}
        <g id="head">
          {/* Left Ear Muff / Audio Sensor */}
          <g>
            <ellipse cx="42" cy="95" rx="14" ry="22" fill={bodyHex} stroke={rimColor} strokeWidth="2" />
            <ellipse cx="42" cy="95" rx="8" ry="14" fill="url(#earGlow)" filter="url(#eyeNeon)" />
            <circle cx="42" cy="95" r="4" fill="#FFFFFF" opacity="0.8" />
          </g>

          {/* Right Ear Muff / Audio Sensor */}
          <g>
            <ellipse cx="198" cy="95" rx="14" ry="22" fill={bodyHex} stroke={rimColor} strokeWidth="2" />
            <ellipse cx="198" cy="95" rx="8" ry="14" fill="url(#earGlow)" filter="url(#eyeNeon)" />
            <circle cx="198" cy="95" r="4" fill="#FFFFFF" opacity="0.8" />
          </g>

          {/* Helmet Base */}
          <rect
            x="48"
            y="32"
            width="144"
            height="115"
            rx="56"
            fill={`url(#helmetGrad-${eyeColor})`}
            stroke={rimColor}
            strokeWidth="3"
          />

          {/* Helmet Top Antenna / Sensor */}
          <rect x="115" y="18" width="10" height="16" rx="5" fill="#3B82F6" />
          <circle cx="120" cy="16" r="6" fill={eyeGlow} filter="url(#eyeNeon)" />
          <circle cx="120" cy="16" r="2.5" fill="#FFFFFF" />

          {/* Glossy Black Visor Screen */}
          <rect
            x="60"
            y="52"
            width="120"
            height="82"
            rx="36"
            fill="url(#visorGrad)"
            stroke="#1E293B"
            strokeWidth="2"
          />

          {/* Visor Specular Glass Reflection */}
          <path
            d="M 72 62 Q 120 54, 168 62 C 160 74, 80 74, 72 62 Z"
            fill="url(#visorReflection)"
          />

          {/* Eyes Container */}
          <g id="eyes" filter="url(#eyeNeon)">
            {blink ? (
              // Blinking Eyes (thin horizontal line)
              <>
                <line x1="84" y1="88" x2="108" y2="88" stroke={eyeGlow} strokeWidth="4" strokeLinecap="round" />
                <line x1="132" y1="88" x2="156" y2="88" stroke={eyeGlow} strokeWidth="4" strokeLinecap="round" />
              </>
            ) : state === 'thinking' ? (
              // Thinking Eyes (pulsing scanning shape)
              <>
                <ellipse cx="96" cy="88" rx="11" ry="13" fill={eyeGlow} />
                <ellipse cx="144" cy="88" rx="11" ry="13" fill={eyeGlow} />
                <circle cx="98" cy="86" r="3" fill="#FFFFFF" />
                <circle cx="146" cy="86" r="3" fill="#FFFFFF" />
                {/* Scanning sweep bar */}
                <line x1="74" y1="88" x2="166" y2="88" stroke="#8B5CF6" strokeWidth="1.5" strokeOpacity="0.7" strokeDasharray="6 4" />
              </>
            ) : (
              // Happy / Friendly Curved Digital Eyes
              <>
                {/* Left Eye */}
                <g>
                  <ellipse cx="96" cy="88" rx="13" ry="15" fill={eyeGlow} />
                  <ellipse cx="96" cy="88" rx="10" ry="12" fill={eyeGlow} />
                  {/* Eye pupil reflection highlight */}
                  <circle cx="99" cy="84" r="4.5" fill="#FFFFFF" />
                  <circle cx="93" cy="92" r="2" fill="#FFFFFF" opacity="0.7" />
                </g>

                {/* Right Eye */}
                <g>
                  <ellipse cx="144" cy="88" rx="13" ry="15" fill={eyeGlow} />
                  <ellipse cx="144" cy="88" rx="10" ry="12" fill={eyeGlow} />
                  {/* Eye pupil reflection highlight */}
                  <circle cx="147" cy="84" r="4.5" fill="#FFFFFF" />
                  <circle cx="141" cy="92" r="2" fill="#FFFFFF" opacity="0.7" />
                </g>
              </>
            )}
          </g>

          {/* Cute Mouth Indicator */}
          <g id="mouth">
            {state === 'speaking' ? (
              // Animated Speaking Waveform Mouth
              <g filter="url(#eyeNeon)">
                {mouthStep === 0 && (
                  <path d="M 108 114 Q 120 124, 132 114" stroke={eyeGlow} strokeWidth="3.5" strokeLinecap="round" fill="none" />
                )}
                {mouthStep === 1 && (
                  <ellipse cx="120" cy="116" rx="9" ry="6" fill={eyeGlow} />
                )}
                {mouthStep === 2 && (
                  <path d="M 106 115 Q 120 120, 134 115" stroke={eyeGlow} strokeWidth="4" strokeLinecap="round" fill="none" />
                )}
                {mouthStep === 3 && (
                  <ellipse cx="120" cy="115" rx="6" ry="4" fill={eyeGlow} />
                )}
              </g>
            ) : state === 'listening' ? (
              // Attentive slight open smile
              <path
                d="M 112 116 Q 120 120, 128 116"
                stroke={eyeGlow}
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
                filter="url(#eyeNeon)"
              />
            ) : (
              // Classic happy smile
              <path
                d="M 110 115 Q 120 123, 130 115"
                stroke={eyeGlow}
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
                filter="url(#eyeNeon)"
              />
            )}
          </g>

          {/* Rosy Digital Cheeks */}
          <ellipse cx="78" cy="108" rx="6" ry="3.5" fill="#38BDF8" opacity="0.35" />
          <ellipse cx="162" cy="108" rx="6" ry="3.5" fill="#38BDF8" opacity="0.35" />
        </g>
      </svg>
    </div>
  );
};
