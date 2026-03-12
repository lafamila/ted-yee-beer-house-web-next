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

interface GeoLookupResult {
  latitude: number;
  longitude: number;
  timezone: string | null;
  city: string | null;
  country: string | null;
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

function getObject(value: unknown): Record<string, unknown> | null {
  if (typeof value === "object" && value !== null) {
    return value as Record<string, unknown>;
  }
  return null;
}

function getString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function getNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function parseIpApiGeo(payload: unknown): GeoLookupResult | null {
  const data = getObject(payload);
  if (!data) return null;

  const latitude = getNumber(data.latitude);
  const longitude = getNumber(data.longitude);
  if (latitude === null || longitude === null) return null;

  return {
    latitude,
    longitude,
    timezone: getString(data.timezone),
    city: getString(data.city),
    country: getString(data.country_name) ?? getString(data.country),
  };
}

function parseIpWhoIsGeo(payload: unknown): GeoLookupResult | null {
  const data = getObject(payload);
  if (!data) return null;
  if (data.success === false) return null;

  const latitude = getNumber(data.latitude);
  const longitude = getNumber(data.longitude);
  if (latitude === null || longitude === null) return null;

  const timezoneData = getObject(data.timezone);

  return {
    latitude,
    longitude,
    timezone: getString(timezoneData?.id) ?? getString(data.timezone),
    city: getString(data.city),
    country: getString(data.country),
  };
}

function parseGeolocationDbGeo(payload: unknown): GeoLookupResult | null {
  const data = getObject(payload);
  if (!data) return null;

  const latitude = getNumber(data.latitude);
  const longitude = getNumber(data.longitude);
  if (latitude === null || longitude === null) return null;

  return {
    latitude,
    longitude,
    timezone: null,
    city: getString(data.city),
    country: getString(data.country_name) ?? getString(data.country_code),
  };
}

async function fetchGeoLookup(): Promise<GeoLookupResult> {
  const providers: Array<{
    url: string;
    parse: (payload: unknown) => GeoLookupResult | null;
  }> = [
    { url: "https://ipapi.co/json/", parse: parseIpApiGeo },
    { url: "https://ipwho.is/", parse: parseIpWhoIsGeo },
    { url: "https://geolocation-db.com/json/", parse: parseGeolocationDbGeo },
  ];

  for (const provider of providers) {
    try {
      const response = await fetch(provider.url, { cache: "no-store" });
      if (!response.ok) continue;

      const payload: unknown = await response.json();
      const parsed = provider.parse(payload);
      if (parsed) return parsed;
    } catch {
      continue;
    }
  }

  throw new Error("Unable to resolve geolocation from providers");
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
        const geo = await fetchGeoLookup();
        if (cancelled) return;

        const localTime = geo.timezone
          ? new Date(new Date().toLocaleString("en-US", { timeZone: geo.timezone }))
          : new Date();
        const timeOfDay = getTimeOfDay(localTime.getHours());

        const weatherRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${geo.latitude}&longitude=${geo.longitude}&current=temperature_2m,weather_code`
        );
        if (cancelled) return;
        const weatherJson = await weatherRes.json();
        const current = weatherJson.current;

        setData({
          timeOfDay,
          weather: mapWeatherCode(current.weather_code),
          temperature: Math.round(current.temperature_2m),
          location: geo.city ?? geo.country,
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
