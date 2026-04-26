"use client";

import { usePathname } from "next/navigation";
import { Bell, Search } from "lucide-react";

function getPageTitle(pathname: string): string {
  const segment = pathname.split("/").filter(Boolean)[0];
  if (!segment) return "Dashboard";
  return segment.charAt(0).toUpperCase() + segment.slice(1);
}

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 h-16 shrink-0">

      {/* Page Title */}
      <div>
        <h2 className="text-base font-semibold text-slate-900">
          {getPageTitle(pathname)}
        </h2>
        <p className="text-xs text-slate-400 leading-tight">
          Stock Management System
        </p>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-3">

        {/* Search */}
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            className="h-9 w-56 rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
          />
        </div>

        {/* Notifications */}
        <button
          className="relative flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4 text-slate-500" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 border-2 border-white" />
        </button>

        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold select-none">
          AD
        </div>

      </div>
    </header>
  );
}