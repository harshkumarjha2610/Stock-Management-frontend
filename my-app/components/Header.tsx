"use client";

import { usePathname } from "next/navigation";
import { Bell, Search, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/components/ThemeProvider";

function getPageTitle(pathname: string): string {
  const segment = pathname.split("/").filter(Boolean)[0];
  if (!segment) return "Dashboard";
  return segment.charAt(0).toUpperCase() + segment.slice(1);
}

export default function Header() {
  const pathname = usePathname();
  const { theme, setTheme, themes } = useTheme();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (open && menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const selectedTheme = themes.find((item) => item.id === theme) ?? themes[0];

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 h-16 shrink-0">
      <div>
        <h2 className="text-base font-semibold text-slate-900">
          {getPageTitle(pathname)}
        </h2>
        <p className="text-xs text-slate-400 leading-tight">
          Stock Management System
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div ref={menuRef} className="relative hidden sm:block">
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="inline-flex items-center gap-2 h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-linear-to-r from-rose-500 via-amber-400 to-violet-600" />
            {selectedTheme.label}
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </button>
          {open && (
            <div className="absolute left-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
              {themes.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setTheme(item.id);
                    setOpen(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                    item.id === theme
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            className="h-9 w-56 rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm placeholder:text-slate-400 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-colors"
          />
        </div>

        <button
          className="relative flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4 text-slate-500" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-600 border-2 border-white" />
        </button>

        <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center text-white text-xs font-bold select-none">
          AD
        </div>
      </div>
    </header>
  );
}
