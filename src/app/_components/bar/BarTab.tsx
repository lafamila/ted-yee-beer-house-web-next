"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { WeatherData } from "./useWeather";

interface BarTabProps {
  weather: WeatherData;
}

const TAB_MESSAGES = [
  { threshold: 0, message: "Just walked in. 🚶", drinks: 0 },
  { threshold: 30, message: "Checking out the menu... 👀", drinks: 0 },
  { threshold: 120, message: "1 beer down. Getting comfortable. 🍺", drinks: 1 },
  { threshold: 300, message: "The bartender knows your name now. 🤝", drinks: 2 },
  { threshold: 600, message: "You live here now. Congrats. 🏠", drinks: 4 },
  { threshold: 1800, message: "Tab's getting expensive. Should we call you a cab? 🚕", drinks: 7 },
];

const BARTENDER_MESSAGES: Record<string, string> = {
  morning_clear: "Morning! ☀️ Early bird gets the cold brew. Coding before coffee? Respect.",
  morning_rain: "Rainy morning? Perfect excuse to stay inside and refactor. ☔",
  morning_snow: "Snow day! Hot chocolate's on the house while you debug. 🍫",
  morning_cloudy: "Overcast morning. Great lighting for your monitor. ☁️",
  afternoon_clear: "Sunny afternoon — you're coding instead of going outside? I respect that. 🫡",
  afternoon_rain: "비 오는 오후엔 여기가 제일이죠. 따뜻한 코드 한 잔 하실래요? ☔",
  afternoon_snow: "밖에 눈 오네요. 여기서 핫초코 마시면서 코딩하세요. ❄️",
  afternoon_cloudy: "Cloudy afternoon. The kind of day that makes you want to refactor everything.",
  evening_clear: "Golden hour! The best time to deploy... said no one ever. 🌅",
  evening_rain: "Rainy evening. The sound of rain + keyboard clicks = ASMR for developers. 🌧️",
  evening_snow: "Snowy evening. The world is frozen, but your code is hot. 🔥",
  evening_cloudy: "Cozy evening. Pull up a chair, the beer's cold and the WiFi's fast.",
  night_clear: "야근이세요? 여기 커피 무한리필입니다. 🌙",
  night_rain: "Coding in the rain, at night? You're either passionate or have a deadline. Probably both.",
  night_snow: "Late night, snow falling... poetic. Now fix that null pointer. ❄️",
  night_cloudy: "Night owl, huh? The bar never closes for those who code after midnight. 🦉",
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s}s`;
}

export default function BarTab({ weather }: BarTabProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const currentTab =
    [...TAB_MESSAGES].reverse().find((t) => elapsed >= t.threshold) ??
    TAB_MESSAGES[0];

  const weatherKey = `${weather.timeOfDay}_${weather.weather}`;
  const bartenderMessage =
    BARTENDER_MESSAGES[weatherKey] ?? BARTENDER_MESSAGES.night_clear;

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
          <span className="text-2xl flex-shrink-0">🧑‍🍳</span>
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

      {/* Bar tab */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="flex items-center justify-between bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm">🔔</span>
          <span className="text-xs text-gray-400 font-mono">Bar Tab:</span>
          <span className="text-xs text-white font-mono">
            {formatTime(elapsed)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{currentTab.message}</span>
          {currentTab.drinks > 0 && (
            <span className="text-xs">
              {"🍺".repeat(Math.min(currentTab.drinks, 5))}
            </span>
          )}
        </div>
      </motion.div>
    </div>
  );
}
