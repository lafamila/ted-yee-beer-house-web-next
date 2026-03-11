"use client";

import { useState, useEffect } from "react";

export type TimeOfDay = "morning" | "afternoon" | "evening" | "night";
export type WeatherCondition = "clear" | "rain" | "snow" | "cloudy";

export interface WeatherData {
  timeOfDay: TimeOfDay;
  weather: WeatherCondition;
  temperature: number | null;
  location: string | null;
  isLoaded: boolean;
}

function getTimeOfDay(hour: number): TimeOfDay {
  if (hour >= 6 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
}

function mapWeatherCode(code: number): WeatherCondition {
  // Open-Meteo WMO weather interpretation codes
  if (code <= 3) return "clear";
  if (code <= 48) return "cloudy";
  if (code <= 67) return "rain";
  if (code <= 77) return "snow";
  if (code <= 82) return "rain";
  if (code <= 86) return "snow";
  return "rain";
}

export function useWeather(): WeatherData {
  const [data, setData] = useState<WeatherData>({
    timeOfDay: getTimeOfDay(new Date().getHours()),
    weather: "clear",
    temperature: null,
    location: null,
    isLoaded: false,
  });

  useEffect(() => {
    let cancelled = false;

    async function fetchWeather() {
      try {
        const geoRes = await fetch("http://ip-api.com/json/?fields=lat,lon,city,timezone");
        if (cancelled) return;
        const geo = await geoRes.json();

        const localTime = new Date(
          new Date().toLocaleString("en-US", { timeZone: geo.timezone })
        );
        const timeOfDay = getTimeOfDay(localTime.getHours());

        const weatherRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${geo.lat}&longitude=${geo.lon}&current=temperature_2m,weather_code`
        );
        if (cancelled) return;
        const weatherJson = await weatherRes.json();
        const current = weatherJson.current;

        setData({
          timeOfDay,
          weather: mapWeatherCode(current.weather_code),
          temperature: Math.round(current.temperature_2m),
          location: geo.city,
          isLoaded: true,
        });
      } catch {
        setData((prev) => ({
          ...prev,
          timeOfDay: getTimeOfDay(new Date().getHours()),
          isLoaded: true,
        }));
      }
    }

    fetchWeather();
    return () => {
      cancelled = true;
    };
  }, []);

  return data;
}
