"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type ThemeId =
  | "classic"
  | "sunrise"
  | "ocean"
  | "mint"
  | "aurora"
  | "violet"
  | "earth"
  | "midnight";

export type ThemeOption = {
  id: ThemeId;
  label: string;
};

const themes: ThemeOption[] = [
  { id: "classic", label: "Classic" },
  { id: "sunrise", label: "Sunrise" },
  { id: "ocean", label: "Ocean" },
  { id: "mint", label: "Mint" },
  { id: "aurora", label: "Aurora" },
  { id: "violet", label: "Violet" },
  { id: "earth", label: "Earth" },
  { id: "midnight", label: "Midnight" },
];

type ThemeContextValue = {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
  themes: ThemeOption[];
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);
const STORAGE_KEY = "shopadmin-theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeId>("classic");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as ThemeId | null;
    if (stored && themes.some((t) => t.id === stored)) {
      setTheme(stored);
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    themes.forEach((item) => root.classList.remove(`theme-${item.id}`));
    root.classList.add(`theme-${theme}`);
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const value = useMemo(
    () => ({ theme, setTheme, themes }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}

export default ThemeProvider;
