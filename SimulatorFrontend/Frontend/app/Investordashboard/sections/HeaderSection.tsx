'use client';
import { BellIcon, SettingsIcon, UserIcon, Menu, X, Languages, CheckCheck } from "lucide-react";
import React, { JSX, useState, useRef, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import { Button } from "../../components/button";

// ─── Base URL ──────────────────────────────────────────────────────────────────
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// ─── Types ─────────────────────────────────────────────────────────────────────
type Notification = {
  id: string;
  userId: string;
  type: "SYSTEM" | "ANNOUNCEMENT" | "INVESTMENT" | "REWARD";
  priority: "HIGH" | "URGENT";
  title: string;
  message: string;
  actionUrl?: string | null;
  status: string;
  scheduledFor?: string | null;
  sentAt?: string | null;
  isRead: boolean;
  readAt?: string | null;
  broadcastId?: string | null;
  createdAt: string;
  updatedAt: string;
};

// ─── Token Helpers (matches Wallet page keys exactly) ─────────────────────────
function getTokens() {
  return {
    accessToken:  localStorage.getItem("accessToken"),
    refreshToken: localStorage.getItem("refreshToken"),
  };
}

function saveTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem("accessToken",  accessToken);
  localStorage.setItem("refreshToken", refreshToken);
}

function clearTokens() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
}

// ─── Refresh Access Token ──────────────────────────────────────────────────────
async function refreshAccessToken(): Promise<string | null> {
  const { refreshToken } = getTokens();
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${API_BASE_URL}/user/auth/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      clearTokens();
      return null;
    }

    const data = await res.json();

    const newAccess =
      data.data?.accessToken ??
      data.data?.token ??
      data.accessToken ??
      data.token;

    const newRefresh =
      data.data?.refreshToken ??
      data.refreshToken;

    if (!newAccess) return null;

    saveTokens(newAccess, newRefresh ?? refreshToken);
    return newAccess;
  } catch {
    return null;
  }
}

// ─── Authenticated Fetch with Auto Refresh ─────────────────────────────────────
async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const { accessToken } = getTokens();

  const makeRequest = (token: string | null) =>
    fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers ?? {}),
      },
    });

  let res = await makeRequest(accessToken);

  if (res.status === 401) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      res = await makeRequest(newToken);
    } else {
      clearTokens();
      if (typeof window !== "undefined") window.location.href = "/LoginPage";
    }
  }

  return res;
}

// ─── Static Data ───────────────────────────────────────────────────────────────
const navigationItems = [
  { label: "Investor Dashboard", route: "/Investordashboard" },
  { label: "Wallet",             route: "/Wallet" },
  { label: "Projects",           route: "/Projects" },
];

const languages = [
  { code: 'en', name: 'English',  flag: '🇺🇸' },
  { code: 'es', name: 'Español',  flag: '🇪🇸' },
  { code: 'de', name: 'Deutsch',  flag: '🇩🇪' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'zh', name: '中文',     flag: '🇨🇳' },
  { code: 'ja', name: '日本語',   flag: '🇯🇵' },
];

const TYPE_DOT: Record<string, string> = {
  SYSTEM:       "bg-blue-400",
  ANNOUNCEMENT: "bg-yellow-400",
  INVESTMENT:   "bg-green-400",
  REWARD:       "bg-purple-400",
};

// ─── Language Dropdown ─────────────────────────────────────────────────────────
const LanguageDropdown = ({
  isOpen, position, currentLanguage, onClose, onLanguageChange,
}: {
  isOpen: boolean;
  position: { top: number; left: number; width: number };
  currentLanguage: string;
  onClose: () => void;
  onLanguageChange: (code: string) => void;
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) onClose();
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      ref={dropdownRef}
      style={{ position: 'fixed', top: `${position.top}px`, left: `${position.left}px`, zIndex: 9999 }}
      className="w-[280px] bg-[#2a2a2a] rounded-lg shadow-lg border border-white/10 overflow-hidden"
    >
      <div className="px-4 py-3 border-b border-white/10">
        <h3 className="text-white font-semibold text-base">Select Language</h3>
      </div>
      <div className="max-h-[350px] overflow-y-auto">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => { onLanguageChange(lang.code); onClose(); }}
            className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-[#3a3a3a] transition-colors ${
              currentLanguage === lang.code ? 'bg-[#3a3a3a]' : ''
            }`}
          >
            <span className="text-2xl">{lang.flag}</span>
            <span className="text-white text-sm font-medium">{lang.name}</span>
            {currentLanguage === lang.code && (
              <span className="ml-auto text-[#ef6b23] text-xs">✓</span>
            )}
          </button>
        ))}
      </div>
    </div>,
    document.body
  );
};

// ─── Notification Dropdown ─────────────────────────────────────────────────────
const NotificationDropdown = ({
  isOpen, position, notifications, unreadCount,
  onClose, onMarkRead, onMarkAllRead, onViewAll,
}: {
  isOpen: boolean;
  position: { top: number; left: number; width: number };
  notifications: Notification[];
  unreadCount: number;
  onClose: () => void;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onViewAll: () => void;
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) onClose();
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1)  return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)  return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  return createPortal(
    <div
      ref={dropdownRef}
      style={{ position: 'fixed', top: `${position.top}px`, left: `${position.left}px`, zIndex: 9999 }}
      className="w-[350px] sm:w-[400px] bg-[#2a2a2a] rounded-lg shadow-lg border border-white/10 max-h-[500px] overflow-hidden flex flex-col"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between flex-shrink-0">
        <div>
          <h3 className="text-white font-semibold text-base">Notifications</h3>
          {unreadCount > 0 && (
            <p className="text-gray-400 text-xs">{unreadCount} unread</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllRead}
            className="flex items-center gap-1.5 text-[#ef6b23] text-xs font-medium hover:text-[#d95e1f] transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all read
          </button>
        )}
      </div>

      {/* List */}
      <div className="overflow-y-auto flex-1">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2">
            <BellIcon className="w-8 h-8 text-gray-600" />
            <p className="text-gray-500 text-sm">No notifications</p>
          </div>
        ) : (
          notifications.slice(0, 6).map((n) => (
            <div
              key={n.id}
              onClick={() => !n.isRead && onMarkRead(n.id)}
              className={`px-4 py-3 border-b border-white/10 hover:bg-[#3a3a3a] cursor-pointer transition-colors ${
                !n.isRead ? 'bg-[#3a3a3a]/50' : ''
              }`}
            >
              <div className="flex items-start gap-2.5">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${TYPE_DOT[n.type] ?? 'bg-gray-400'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className={`text-sm font-medium truncate ${n.isRead ? 'text-gray-300' : 'text-white'}`}>
                      {n.title}
                    </h4>
                    {!n.isRead && (
                      <span className="w-2 h-2 bg-[#ef6b23] rounded-full flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-gray-400 text-xs mt-0.5 line-clamp-2">{n.message}</p>
                  <span className="text-gray-500 text-[10px] mt-1 block">
                    {timeAgo(n.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-white/10 text-center flex-shrink-0">
        <button
          onClick={() => { onViewAll(); onClose(); }}
          className="text-[#ef6b23] hover:text-[#d95e1f] text-sm font-medium transition-colors"
        >
          View all notifications
        </button>
      </div>
    </div>,
    document.body
  );
};

// ─── Main Header ───────────────────────────────────────────────────────────────
export const HeaderSection = (): JSX.Element => {
  const [isMobileMenuOpen,     setIsMobileMenuOpen]     = useState(false);
  const [isNotificationOpen,   setIsNotificationOpen]   = useState(false);
  const [isLanguageOpen,       setIsLanguageOpen]       = useState(false);
  const [currentLanguage,      setCurrentLanguage]      = useState('en');
  const [notificationPosition, setNotificationPosition] = useState({ top: 0, left: 0, width: 0 });
  const [languagePosition,     setLanguagePosition]     = useState({ top: 0, left: 0, width: 0 });
  const [notifications,        setNotifications]        = useState<Notification[]>([]);
  const [unreadCount,          setUnreadCount]          = useState(0);

  const bellButtonRef     = useRef<HTMLButtonElement>(null);
  const languageButtonRef = useRef<HTMLButtonElement>(null);
  const router   = useRouter();
  const pathname = usePathname();

  // ── Fetch unread count (badge) ────────────────────────────────────────────
  const fetchUnreadCount = useCallback(async () => {
    try {
      const { accessToken } = getTokens();
      if (!accessToken) return;

      const res  = await fetchWithAuth(`${API_BASE_URL}/notifications/unread-count`);
      const data = await res.json();
      setUnreadCount(data.data?.count ?? 0);
    } catch {
      console.error("Failed to fetch unread count");
    }
  }, []);

  // ── Fetch notifications list (dropdown) ───────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    try {
      const { accessToken } = getTokens();
      if (!accessToken) return;

      const res  = await fetchWithAuth(`${API_BASE_URL}/notifications`);
      const data = await res.json();
      setNotifications(data.data ?? []);
    } catch {
      console.error("Failed to fetch notifications");
    }
  }, []);

  // ── Poll badge every 30s ──────────────────────────────────────────────────
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  // ── Mark single as read ───────────────────────────────────────────────────
  const handleMarkRead = async (id: string) => {
    try {
      await fetchWithAuth(`${API_BASE_URL}/notifications/${id}/read`, {
        method: "PATCH",
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      console.error("Failed to mark as read");
    }
  };

  // ── Mark all as read ──────────────────────────────────────────────────────
  const handleMarkAllRead = async () => {
    try {
      await fetchWithAuth(`${API_BASE_URL}/notifications/read-all`, {
        method: "PATCH",
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      console.error("Failed to mark all as read");
    }
  };

  const isActiveRoute = (route: string) => {
    if (route === '/Investordashboard') {
      return pathname === '/Investordashboard' || pathname?.startsWith('/Investordashboard/');
    }
    return pathname === route || pathname?.startsWith(`${route}/`);
  };

  const handleNotificationClick = () => {
    if (!isNotificationOpen && bellButtonRef.current) {
      const rect = bellButtonRef.current.getBoundingClientRect();
      setNotificationPosition({
        top:   rect.bottom + 8,
        left:  rect.right - 400,
        width: rect.width,
      });
      fetchNotifications();
    }
    setIsNotificationOpen(!isNotificationOpen);
    setIsLanguageOpen(false);
  };

  const handleLanguageClick = () => {
    if (!isLanguageOpen && languageButtonRef.current) {
      const rect = languageButtonRef.current.getBoundingClientRect();
      setLanguagePosition({
        top:   rect.bottom + 8,
        left:  rect.right - 280,
        width: rect.width,
      });
    }
    setIsLanguageOpen(!isLanguageOpen);
    setIsNotificationOpen(false);
  };

  const currentLang = languages.find((l) => l.code === currentLanguage);

  return (
    <>
      <div className="w-full h-4 sm:h-5 lg:h-6 bg-black" />

      <header className="w-full max-w-[98vw] sm:max-w-[97vw] md:max-w-[96vw] lg:max-w-[1230px] xl:max-w-[1600px] 2xl:max-w-[1850px] mx-auto bg-[#3a3a3a] rounded-[15px] sm:rounded-[20px] lg:rounded-[30px] overflow-hidden relative mt-1 sm:mt-2 lg:mt-2">
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-[26px] py-3 sm:py-4 lg:py-5 gap-2 sm:gap-4">

          {/* Logo */}
          <div className="flex-shrink-0 w-[120px] sm:w-[160px] lg:w-[200px] xl:w-[237px]">
            <img
              className="w-full h-[30px] sm:h-[40px] lg:h-[50px] object-contain"
              alt="Co build logo"
              src="/co-build-logo-01-1.png"
            />
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-3 ml-4">
            {navigationItems.map((item, index) => {
              const isActive = isActiveRoute(item.route);
              return (
                <Button
                  key={index}
                  variant="ghost"
                  onClick={() => { router.push(item.route); setIsMobileMenuOpen(false); }}
                  className={`h-[60px] px-8 py-4 rounded-[22px] transition-all duration-300 ${
                    isActive
                      ? "bg-[#ef6b23] hover:bg-[#d95e1f] text-white"
                      : "bg-transparent hover:bg-[#4a4a4a] text-white/80 hover:text-white"
                  }`}
                >
                  <span className="font-normal text-base whitespace-nowrap">{item.label}</span>
                </Button>
              );
            })}
          </nav>

          {/* Desktop Icons */}
          <div className="hidden md:flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">

            {/* Language */}
            <Button
              ref={languageButtonRef}
              variant="ghost"
              size="icon"
              className="w-[40px] h-[40px] sm:w-[45px] sm:h-[45px] lg:w-[50px] lg:h-[50px] rounded-full hover:bg-[#4a4a4a] relative"
              onClick={handleLanguageClick}
            >
              <Languages className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              <span className="absolute -bottom-1 -right-1 text-xs bg-[#ef6b23] text-white px-1.5 py-0.5 rounded-full font-semibold">
                {currentLang?.code.toUpperCase()}
              </span>
            </Button>

            {/* Bell */}
            <Button
              ref={bellButtonRef}
              variant="ghost"
              size="icon"
              className="w-[40px] h-[40px] sm:w-[45px] sm:h-[45px] lg:w-[50px] lg:h-[50px] rounded-full hover:bg-[#4a4a4a] relative"
              onClick={handleNotificationClick}
            >
              <BellIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 bg-[#ef6b23] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Button>

            {/* Profile */}
            <Button
              variant="ghost"
              size="icon"
              className="w-[40px] h-[40px] sm:w-[45px] sm:h-[45px] lg:w-[50px] lg:h-[50px] rounded-full hover:bg-[#4a4a4a]"
              onClick={() => router.push('/userprofile')}
            >
              <UserIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </Button>

            {/* Settings */}
            <Button
              variant="ghost"
              size="icon"
              className="w-[40px] h-[40px] sm:w-[45px] sm:h-[45px] lg:w-[50px] lg:h-[50px] rounded-full hover:bg-[#4a4a4a]"
              onClick={() => router.push('/Editprofile')}
            >
              <SettingsIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden w-[40px] h-[40px] sm:w-[45px] sm:h-[45px] rounded-full hover:bg-[#4a4a4a]"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen
              ? <X    className="w-5 h-5 text-white" />
              : <Menu className="w-5 h-5 text-white" />
            }
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-[#2a2a2a] border-t border-white/10">
            <div className="px-4 py-3 space-y-2">
              {navigationItems.map((item, index) => {
                const isActive = isActiveRoute(item.route);
                return (
                  <button
                    key={index}
                    onClick={() => { router.push(item.route); setIsMobileMenuOpen(false); }}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 ${
                      isActive ? "bg-[#ef6b23] text-white" : "hover:bg-[#4a4a4a] text-white/80"
                    }`}
                  >
                    <span className="font-normal text-sm sm:text-base">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Mobile Icons Row */}
            <div className="md:hidden flex items-center justify-center gap-3 px-4 py-3 border-t border-white/10">
              <Button variant="ghost" size="icon"
                className="w-[45px] h-[45px] rounded-full hover:bg-[#4a4a4a] relative"
                onClick={handleLanguageClick}
              >
                <Languages className="w-5 h-5 text-white" />
                <span className="absolute -bottom-1 -right-1 text-xs bg-[#ef6b23] text-white px-1.5 py-0.5 rounded-full font-semibold">
                  {currentLang?.code.toUpperCase()}
                </span>
              </Button>

              <Button variant="ghost" size="icon"
                className="w-[45px] h-[45px] rounded-full hover:bg-[#4a4a4a] relative"
                onClick={handleNotificationClick}
              >
                <BellIcon className="w-5 h-5 text-white" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 bg-[#ef6b23] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Button>

              <Button variant="ghost" size="icon"
                className="w-[45px] h-[45px] rounded-full hover:bg-[#4a4a4a]"
                onClick={() => router.push('/userprofile')}
              >
                <UserIcon className="w-5 h-5 text-white" />
              </Button>

              <Button variant="ghost" size="icon"
                className="w-[45px] h-[45px] rounded-full hover:bg-[#4a4a4a]"
                onClick={() => router.push('/Editprofile')}
              >
                <SettingsIcon className="w-5 h-5 text-white" />
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Portal Dropdowns */}
      <LanguageDropdown
        isOpen={isLanguageOpen}
        position={languagePosition}
        currentLanguage={currentLanguage}
        onClose={() => setIsLanguageOpen(false)}
        onLanguageChange={(code) => setCurrentLanguage(code)}
      />

      <NotificationDropdown
        isOpen={isNotificationOpen}
        position={notificationPosition}
        notifications={notifications}
        unreadCount={unreadCount}
        onClose={() => setIsNotificationOpen(false)}
        onMarkRead={handleMarkRead}
        onMarkAllRead={handleMarkAllRead}
        onViewAll={() => router.push('/my-notifications')}
      />
    </>
  );
};
