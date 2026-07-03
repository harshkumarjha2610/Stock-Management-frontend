"use client";

import { useState, useEffect } from "react";
import { Palette, Check, Moon, Sun, Monitor } from "lucide-react";

type ColorTheme = "Default" | "Purple" | "Teal" | "Blue" | "Orange" | "Pink" | "Green" | "Indigo";

const COLOR_THEMES = [
  { name: "Default" as ColorTheme, primary: "#ef4444", bg: "bg-red-500", ring: "ring-red-500" },
  { name: "Purple" as ColorTheme, primary: "#A05AFF", bg: "bg-[#A05AFF]", ring: "ring-[#A05AFF]" },
  { name: "Teal" as ColorTheme, primary: "#1BCFB4", bg: "bg-[#1BCFB4]", ring: "ring-[#1BCFB4]" },
  { name: "Blue" as ColorTheme, primary: "#4BCBEB", bg: "bg-[#4BCBEB]", ring: "ring-[#4BCBEB]" },
  { name: "Orange" as ColorTheme, primary: "#f97316", bg: "bg-orange-500", ring: "ring-orange-500" },
  { name: "Pink" as ColorTheme, primary: "#ec4899", bg: "bg-pink-500", ring: "ring-pink-500" },
  { name: "Green" as ColorTheme, primary: "#22c55e", bg: "bg-green-500", ring: "ring-green-500" },
  { name: "Indigo" as ColorTheme, primary: "#6366f1", bg: "bg-indigo-500", ring: "ring-indigo-500" },
];

const MODE_OPTIONS = [
  { label: "Light", icon: Sun, value: "light" },
  { label: "Dark", icon: Moon, value: "dark" },
  { label: "System", icon: Monitor, value: "system" },
];

export default function SettingsPage() {
  const [activeMode, setActiveMode] = useState("light");
  const [activeColor, setActiveColor] = useState<ColorTheme>("Default");

  useEffect(() => {
    const savedMode = localStorage.getItem("theme");
    const savedColor = localStorage.getItem("colorTheme") as ColorTheme;
    if (savedMode) setActiveMode(savedMode);
    if (savedColor) setActiveColor(savedColor);
  }, []);

  const handleModeChange = (mode: string) => {
    setActiveMode(mode);
    localStorage.setItem("theme", mode);
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    if (mode === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(mode);
    }
  };

  const handleColorChange = (colorName: ColorTheme) => {
    setActiveColor(colorName);
    localStorage.setItem("colorTheme", colorName);
    const color = COLOR_THEMES.find((c) => c.name === colorName)?.primary || "#ef4444";
    document.documentElement.style.setProperty("--primary", color);
  };

  // Page is intentionally empty — only sidebar and top navbar from layout are shown
  return (
    <div className="h-full" />
  );
}