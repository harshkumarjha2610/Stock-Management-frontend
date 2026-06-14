"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Header  from "@/components/Header";
import { useTheme } from "@/components/ThemeProvider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Load state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem("sidebarCollapsed");
    if (savedState) {
      setIsSidebarCollapsed(savedState === "true");
    }
    setMounted(true);
  }, []);

  const handleToggleSidebar = () => {
    const newState = !isSidebarCollapsed;
    setIsSidebarCollapsed(newState);
    localStorage.setItem("sidebarCollapsed", String(newState));
  };

  const { theme } = useTheme();

  if (!mounted) return null; // Avoid hydration mismatch

  const isSaas = theme === "saas";

  return (
    <div className={`flex h-screen overflow-hidden ${isSaas ? "py-4 px-4 sm:py-6 sm:px-8 md:py-8 md:px-12 lg:py-8 bg-transparent" : "bg-background"}`}>
      <div className={`flex flex-1 overflow-hidden relative z-20 ${
        isSaas 
          ? "w-full max-w-[1400px] mx-auto rounded-[40px] glass-panel shadow-[0_30px_60px_rgba(0,0,0,0.12)] border border-white/60" 
          : "w-full bg-background"
      }`}>
        <Sidebar collapsed={isSidebarCollapsed} onToggleCollapse={handleToggleSidebar} />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <Header toggleSidebar={handleToggleSidebar} />
          <main className="flex-1 overflow-y-auto px-6 py-8 sm:px-8 text-foreground relative z-10">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}