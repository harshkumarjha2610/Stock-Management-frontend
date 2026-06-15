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
    <div className={`flex h-screen overflow-hidden ${isSaas ? "bg-transparent" : "bg-background"}`}>
      <div className={`flex flex-1 overflow-hidden relative z-20 w-full ${
        isSaas 
          ? "glass-panel shadow-[0_30px_60px_rgba(0,0,0,0.12)] !rounded-none !border-none" 
          : "bg-background"
      }`}>
        <Sidebar collapsed={isSidebarCollapsed} onToggleCollapse={handleToggleSidebar} />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <Header toggleSidebar={handleToggleSidebar} />
          <main className="flex-1 overflow-y-auto px-6 py-8 sm:px-8 text-foreground">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}