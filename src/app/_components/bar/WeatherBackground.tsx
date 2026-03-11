"use client";

import { useMemo } from "react";
import { WeatherData } from "./useWeather";

interface WeatherBackgroundProps {
  weather: WeatherData;
}

interface ParticleStyle {
  left: string;
  top: string;
  width?: string;
  height: string;
  animationDelay: string;
  animationDuration: string;
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

function generateRainParticles(count: number): ParticleStyle[] {
  return Array.from({ length: count }, (_, i) => ({
    left: `${seededRandom(i * 7 + 1) * 100}%`,
    top: `-${seededRandom(i * 7 + 2) * 20}%`,
    height: `${12 + seededRandom(i * 7 + 3) * 18}px`,
    animationDelay: `${seededRandom(i * 7 + 4) * 2}s`,
    animationDuration: `${0.6 + seededRandom(i * 7 + 5) * 0.4}s`,
  }));
}

function generateSnowParticles(count: number): ParticleStyle[] {
  return Array.from({ length: count }, (_, i) => {
    const size = `${2 + seededRandom(i * 7 + 101) * 4}px`;
    return {
      left: `${seededRandom(i * 7 + 102) * 100}%`,
      top: `-5%`,
      width: size,
      height: size,
      animationDelay: `${seededRandom(i * 7 + 103) * 5}s`,
      animationDuration: `${3 + seededRandom(i * 7 + 104) * 4}s`,
    };
  });
}

function generateStarParticles(count: number): ParticleStyle[] {
  return Array.from({ length: count }, (_, i) => {
    const size = `${1 + seededRandom(i * 7 + 201) * 2}px`;
    return {
      left: `${seededRandom(i * 7 + 202) * 100}%`,
      top: `${seededRandom(i * 7 + 203) * 40}%`,
      width: size,
      height: size,
      animationDelay: `${seededRandom(i * 7 + 204) * 3}s`,
      animationDuration: `${2 + seededRandom(i * 7 + 205) * 3}s`,
    };
  });
}

function RainEffect({ particles }: { particles: ParticleStyle[] }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-[1]">
      {particles.map((style, i) => (
        <div
          key={i}
          className="absolute w-[1px] bg-blue-300/40 animate-rain"
          style={style}
        />
      ))}
    </div>
  );
}

function SnowEffect({ particles }: { particles: ParticleStyle[] }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-[1]">
      {particles.map((style, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white/60 animate-snow"
          style={style}
        />
      ))}
      {/* Frost overlay on edges */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-white/5 pointer-events-none" />
    </div>
  );
}

function StarEffect({ particles }: { particles: ParticleStyle[] }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-[1]">
      {particles.map((style, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white animate-twinkle"
          style={style}
        />
      ))}
    </div>
  );
}

const THEME_CONFIGS = {
  morning_clear: {
    orb1: "bg-amber-400/20",
    orb2: "bg-yellow-300/15",
    windowGlow: "from-amber-500/10 via-yellow-200/5 to-transparent",
  },
  afternoon_clear: {
    orb1: "bg-orange-400/20",
    orb2: "bg-pink-400/15",
    windowGlow: "from-orange-500/15 via-pink-300/5 to-transparent",
  },
  evening_clear: {
    orb1: "bg-indigo-500/20",
    orb2: "bg-purple-600/15",
    windowGlow: "from-indigo-500/10 via-purple-400/5 to-transparent",
  },
  night_clear: {
    orb1: "bg-[#3994ef]/25",
    orb2: "bg-purple-500/20",
    windowGlow: "from-[#3994ef]/10 via-purple-500/5 to-transparent",
  },
  morning_rain: {
    orb1: "bg-blue-400/15",
    orb2: "bg-gray-400/10",
    windowGlow: "from-blue-400/10 via-gray-300/5 to-transparent",
  },
  afternoon_rain: {
    orb1: "bg-blue-500/15",
    orb2: "bg-gray-500/10",
    windowGlow: "from-blue-500/10 via-gray-400/5 to-transparent",
  },
  evening_rain: {
    orb1: "bg-blue-600/20",
    orb2: "bg-gray-600/15",
    windowGlow: "from-blue-600/10 via-gray-500/5 to-transparent",
  },
  night_rain: {
    orb1: "bg-blue-700/20",
    orb2: "bg-gray-700/15",
    windowGlow: "from-blue-700/10 via-gray-600/5 to-transparent",
  },
  morning_snow: {
    orb1: "bg-cyan-300/15",
    orb2: "bg-white/10",
    windowGlow: "from-cyan-300/10 via-white/5 to-transparent",
  },
  afternoon_snow: {
    orb1: "bg-cyan-400/15",
    orb2: "bg-blue-200/10",
    windowGlow: "from-cyan-400/10 via-blue-200/5 to-transparent",
  },
  evening_snow: {
    orb1: "bg-indigo-400/15",
    orb2: "bg-cyan-500/10",
    windowGlow: "from-indigo-400/10 via-cyan-400/5 to-transparent",
  },
  night_snow: {
    orb1: "bg-blue-500/20",
    orb2: "bg-cyan-400/15",
    windowGlow: "from-blue-500/10 via-cyan-400/5 to-transparent",
  },
  morning_cloudy: {
    orb1: "bg-amber-300/10",
    orb2: "bg-gray-400/10",
    windowGlow: "from-amber-300/8 via-gray-300/5 to-transparent",
  },
  afternoon_cloudy: {
    orb1: "bg-orange-300/10",
    orb2: "bg-gray-400/10",
    windowGlow: "from-orange-300/8 via-gray-300/5 to-transparent",
  },
  evening_cloudy: {
    orb1: "bg-indigo-400/10",
    orb2: "bg-gray-500/10",
    windowGlow: "from-indigo-400/8 via-gray-400/5 to-transparent",
  },
  night_cloudy: {
    orb1: "bg-gray-600/15",
    orb2: "bg-gray-500/10",
    windowGlow: "from-gray-600/8 via-gray-500/5 to-transparent",
  },
} as const;

type ThemeKey = keyof typeof THEME_CONFIGS;

export default function WeatherBackground({ weather }: WeatherBackgroundProps) {
  const key = `${weather.timeOfDay}_${weather.weather}` as ThemeKey;
  const theme = THEME_CONFIGS[key] ?? THEME_CONFIGS.night_clear;

  const rainParticles = useMemo(() => generateRainParticles(40), []);
  const snowParticles = useMemo(() => generateSnowParticles(50), []);
  const starParticles = useMemo(() => generateStarParticles(30), []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      {/* Base grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]" />

      {/* Glowing orbs */}
      <div
        className={`absolute top-0 left-0 w-96 h-96 rounded-full mix-blend-screen filter blur-[128px] ${theme.orb1} transition-colors duration-[3000ms]`}
      />
      <div
        className={`absolute bottom-0 right-0 w-96 h-96 rounded-full mix-blend-screen filter blur-[128px] ${theme.orb2} transition-colors duration-[3000ms]`}
      />

      {/* Window glow */}
      <div
        className={`absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-gradient-to-b ${theme.windowGlow} transition-colors duration-[3000ms]`}
      />

      {/* Indoor warm glow for rain/snow */}
      {(weather.weather === "rain" || weather.weather === "snow") && (
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-1/3 bg-amber-500/5 rounded-full filter blur-[100px]" />
      )}

      {/* Weather effects */}
      {weather.weather === "rain" && <RainEffect particles={rainParticles} />}
      {weather.weather === "snow" && <SnowEffect particles={snowParticles} />}
      {weather.timeOfDay === "night" && weather.weather === "clear" && (
        <StarEffect particles={starParticles} />
      )}
    </div>
  );
}
