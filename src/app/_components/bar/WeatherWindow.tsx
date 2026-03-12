"use client";

import { WeatherData } from "./useWeather";

interface WeatherWindowProps {
  weather: WeatherData;
}

export default function WeatherWindow({ weather }: WeatherWindowProps) {
  const { timeOfDay, weather: condition, temperature, location, isLoaded } = weather;

  // Determine sky background based on time of day and weather
  const getSkyBackground = () => {
    if (condition === "cloudy") {
      return "bg-gradient-to-b from-gray-600 to-gray-400";
    }
    
    switch (timeOfDay) {
      case "morning":
        return "bg-gradient-to-b from-blue-300 to-amber-200";
      case "afternoon":
        return "bg-gradient-to-b from-blue-400 to-blue-200";
      case "evening":
        return "bg-gradient-to-b from-indigo-800 to-purple-400";
      case "night":
        return "bg-gradient-to-b from-gray-900 to-black";
      default:
        return "bg-gradient-to-b from-blue-400 to-blue-200";
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col items-center">
      <h2 className="text-sm font-bold text-gray-400 mb-3 self-start uppercase tracking-wider">
        Outside
      </h2>
      
      {/* Window Frame */}
      <div className="relative w-full aspect-video sm:aspect-[4/3] rounded-lg border-8 border-gray-800 shadow-inner overflow-hidden bg-black">
        {/* Window Pane Divider (Cross) */}
        <div className="absolute inset-0 z-20 pointer-events-none flex flex-col">
          <div className="h-1/2 border-b-4 border-gray-800 w-full"></div>
          <div className="absolute inset-0 flex justify-center">
            <div className="w-1 h-full bg-gray-800"></div>
          </div>
        </div>

        {/* Sky Background */}
        <div className={`absolute inset-0 transition-colors duration-1000 ${getSkyBackground()}`}>
          
          {/* Sun/Moon based on time */}
          {condition !== "cloudy" && condition !== "rain" && condition !== "snow" && (
            <>
              {timeOfDay === "morning" && (
                <div className="absolute top-4 right-8 w-12 h-12 rounded-full bg-yellow-200 blur-[2px] shadow-[0_0_20px_rgba(253,224,71,0.8)]" />
              )}
              {timeOfDay === "afternoon" && (
                <div className="absolute top-8 right-12 w-16 h-16 rounded-full bg-yellow-100 blur-[1px] shadow-[0_0_30px_rgba(253,224,71,1)]" />
              )}
              {timeOfDay === "evening" && (
                <div className="absolute bottom-4 right-10 w-14 h-14 rounded-full bg-orange-400 blur-[2px] shadow-[0_0_20px_rgba(251,146,60,0.8)]" />
              )}
              {timeOfDay === "night" && (
                <div className="absolute top-6 right-10 w-10 h-10 rounded-full bg-gray-100 blur-[1px] shadow-[0_0_15px_rgba(255,255,255,0.6)]" />
              )}
            </>
          )}

          {/* Stars for night */}
          {timeOfDay === "night" && condition === "clear" && (
            <div className="absolute inset-0">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
                  style={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 3}s`,
                  }}
                />
              ))}
            </div>
          )}

          {/* Clouds */}
          {condition === "cloudy" && (
            <div className="absolute inset-0 opacity-80">
              <div className="absolute top-4 left-4 w-20 h-8 bg-gray-300 rounded-full blur-sm" />
              <div className="absolute top-10 right-8 w-24 h-10 bg-gray-400 rounded-full blur-sm" />
              <div className="absolute top-20 left-1/3 w-32 h-12 bg-gray-300 rounded-full blur-sm" />
            </div>
          )}

          {/* Rain */}
          {condition === "rain" && (
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-gray-800/40 z-10" />
              {[...Array(30)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-[2px] h-4 bg-blue-300/60 animate-rain z-10"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `-${Math.random() * 20}px`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${0.5 + Math.random() * 0.5}s`,
                  }}
                />
              ))}
            </div>
          )}

          {/* Snow */}
          {condition === "snow" && (
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-gray-400/20 z-10" />
              {[...Array(40)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1.5 h-1.5 bg-white rounded-full animate-snow z-10"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `-${Math.random() * 20}px`,
                    animationDelay: `${Math.random() * 5}s`,
                    animationDuration: `${3 + Math.random() * 4}s`,
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Glass Reflection */}
        <div className="absolute inset-0 z-30 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
        <div className="absolute -inset-full top-0 left-[-100%] w-[200%] h-full bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 pointer-events-none" />
      </div>

      {/* Info Bar */}
      <div className="w-full mt-3 flex justify-between items-center text-xs text-gray-400 font-mono">
        <div className="flex items-center gap-1">
          <span className="text-lg">
            {condition === "clear" && timeOfDay === "night" ? "🌙" : ""}
            {condition === "clear" && timeOfDay !== "night" ? "☀️" : ""}
            {condition === "rain" ? "🌧️" : ""}
            {condition === "snow" ? "❄️" : ""}
            {condition === "cloudy" ? "☁️" : ""}
          </span>
          {isLoaded && temperature !== null ? `${temperature}°C` : "--°C"}
        </div>
        <div className="truncate max-w-[120px] text-right">
          {isLoaded && location ? location : "Unknown"}
        </div>
      </div>
    </div>
  );
}
