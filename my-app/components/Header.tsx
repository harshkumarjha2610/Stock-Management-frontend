"use client";

import { usePathname } from "next/navigation";
import { Bell, Search } from "lucide-react";

function getPageTitle(pathname: string): string {
  const segment = pathname.split("/").filter(Boolean)[0];
  if (!segment) return "Dashboard";
  // Convert dashes to spaces and capitalize
  return segment.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="flex items-center justify-between border-b border-border bg-surface px-6 py-4 h-16 shrink-0 sticky top-0 z-20">
      <div>
        <h2 className="text-lg font-bold text-foreground tracking-tight">
          {getPageTitle(pathname)}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search..."
            className="h-9 w-64 rounded-full border border-border bg-background pl-10 pr-4 text-sm text-foreground placeholder:text-muted outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
          />
        </div>

        <button
          className="relative flex items-center justify-center w-9 h-9 rounded-full border border-border bg-background hover:bg-gray-50 transition-colors group"
          aria-label="Notifications"
        >
          <Bell className="w-4.5 h-4.5 text-muted group-hover:text-primary transition-colors" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-primary border-2 border-surface" />
        </button>

        <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold select-none shadow-sm">
          AD
        </div>
      </div>
    </header>
  );
}
