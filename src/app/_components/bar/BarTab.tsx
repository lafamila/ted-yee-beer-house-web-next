"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { WeatherData } from "./useWeather";
import { useTheme } from "./theme";

interface BarTabProps {
  weather: WeatherData;
  affection: number;
  affectionLabel: string;
  gameStatusText: string;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s}s`;
}

export default function BarTab({
  weather,
  affection,
  affectionLabel,
  gameStatusText,
}: BarTabProps) {
  const theme = useTheme();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const currentTab =
    [...theme.barTab.tabMessages].reverse().find((t) => elapsed >= t.threshold) ??
    theme.barTab.tabMessages[0];

  const weatherKey = `${weather.timeOfDay}_${weather.weather}`;
  const bartenderMessage =
    theme.barTab.greetingMessages[weatherKey] ?? theme.barTab.greetingMessages.night_clear;

  return (
    <div className="space-y-4">
      {/* Bartender greeting */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4"
      >
        <div className="flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">{theme.barTab.staffEmoji}</span>
          <div>
            <p className="text-sm text-gray-300 leading-relaxed">
              {bartenderMessage}
            </p>
            {weather.isLoaded && weather.location && (
              <p className="text-xs text-gray-500 mt-2 font-mono">
                📍 {weather.location}
                {weather.temperature !== null && ` · ${weather.temperature}°C`}
              </p>
            )}
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65 }}
        className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4"
      >
        <div className="flex items-center justify-between gap-3 text-xs font-mono text-gray-400">
          <span>Affinity status</span>
          <span className="text-white">{affection}/7</span>
        </div>
        <p className="text-sm text-white mt-2">{affectionLabel}</p>
        <p className="text-xs text-gray-500 mt-2 leading-relaxed">
          {gameStatusText}
        </p>
      </motion.div>

      {/* Bar tab */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="flex items-center justify-between bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm">🔔</span>
          <span className="text-xs text-gray-400 font-mono">{theme.barTab.tabLabel}</span>
          <span className="text-xs text-white font-mono">
            {formatTime(elapsed)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{currentTab.message}</span>
          {currentTab.drinks > 0 && (
            <span className="text-xs">
              {theme.barTab.drinkEmoji.repeat(Math.min(currentTab.drinks, 5))}
            </span>
          )}
        </div>
      </motion.div>
    </div>
  );
}
