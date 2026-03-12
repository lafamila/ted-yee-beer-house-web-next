"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { AppTheme } from "./types";
import { barTheme } from "./barTheme";
// import { cafeTheme } from "./cafeTheme";

const ThemeContext = createContext<AppTheme>(barTheme);

// const THEMES = [barTheme, cafeTheme] as const;

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Cafe theme is hidden for now — always use bar theme.
  // To re-enable random theme selection, uncomment the THEMES array above
  // and restore the sessionStorage-based random pick logic.
  const [theme] = useState<AppTheme>(() => barTheme);

  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): AppTheme {
  return useContext(ThemeContext);
}
