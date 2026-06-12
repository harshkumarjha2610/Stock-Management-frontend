"use client";

import { createContext, useContext, useMemo } from "react";

export type ThemeId = "luxury";

export type ThemeOption = {
  id: ThemeId;
  label: string;
};

const themes: ThemeOption[] = [
  { id: "luxury", label: "Luxury Dark" },
];

type ThemeContextValue = {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
  themes: ThemeOption[];
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Theme is locked to luxury
  const theme: ThemeId = "luxury";

  const value = useMemo(
    () => ({ theme, setTheme: () => {}, themes }),
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
