"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Bell, CheckCheck, Trash2, Search, Loader2,
  Info, Megaphone, Zap, Gift, Filter, RefreshCw, ArrowLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";

// ─── Base URL ──────────────────────────────────────────────────────────────────
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// ─── Types ─────────────────────────────────────────────────────────────────────
type NotifType = "SYSTEM" | "ANNOUNCEMENT" | "INVESTMENT" | "REWARD";

type Notification = {
  id: string;
  type: NotifType;
  priority: "HIGH" | "URGENT";
  title: string;
  message: string;
  actionUrl?: string | null;
  status: string;
  isRead: boolean;
  sentAt?: string | null;
  createdAt: string;
  broadcastId?: string | null;
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

// ─── Type Config ───────────────────────────────────────────────────────────────
const TYPE_CONFIG: Record<NotifType, {
  label: string;
  color: string;
  bg: string;
  border: string;
  Icon: React.ElementType;
}> = {
  SYSTEM:       { label: "System",       color: "text-blue-400",   bg: "bg-blue-400/10",   border: "border-blue-400/20",   Icon: Info },
  ANNOUNCEMENT: { label: "Announcement", color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/20", Icon: Megaphone },
  INVESTMENT:   { label: "Investment",   color: "text-green-400",  bg: "bg-green-400/10",  border: "border-green-400/20",  Icon: Zap },
  REWARD:       { label: "Reward",       color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/20", Icon: Gift },
};

// ─── Time Ago Helper ───────────────────────────────────────────────────────────
function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return "just now";
  if (mins < 60) return `${mins} minute${mins > 1 ? "s" : ""} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

// ─── Filter Tabs ───────────────────────────────────────────────────────────────
type FilterType = "ALL" | "UNREAD" | NotifType;

const FILTER_TABS: { key: FilterType; label: string }[] = [
  { key: "ALL",          label: "All" },
  { key: "UNREAD",       label: "Unread" },
  { key: "SYSTEM",       label: "System" },
  { key: "ANNOUNCEMENT", label: "Announcements" },
  { key: "INVESTMENT",   label: "Investments" },
  { key: "REWARD",       label: "Rewards" },
];

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function MyNotificationsPage() {
  const router = useRouter();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [search,        setSearch]        = useState("");
  const [filter,        setFilter]        = useState<FilterType>("ALL");
  const [deletingId,    setDeletingId]    = useState<string | null>(null);
  const [markingAll,    setMarkingAll]    = useState(false);

  // ── Fetch ────────────────────────────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const { accessToken } = getTokens();
      if (!accessToken) return;

      const url =
        filter === "UNREAD"
          ? `${API_BASE_URL}/notifications?unreadOnly=true`
          : `${API_BASE_URL}/notifications`;

      const res  = await fetchWithAuth(url);
      const data = await res.json();
      setNotifications(data.data ?? []);
    } catch {
      console.error("Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // ── Mark single as read ───────────────────────────────────────────────────
  const handleMarkRead = async (id: string) => {
    try {
      await fetchWithAuth(`${API_BASE_URL}/notifications/${id}/read`, {
        method: "PATCH",
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch {
      console.error("Failed to mark as read");
    }
  };

  // ── Mark all as read ──────────────────────────────────────────────────────
  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      await fetchWithAuth(`${API_BASE_URL}/notifications/read-all`, {
        method: "PATCH",
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      console.error("Failed to mark all as read");
    } finally {
      setMarkingAll(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await fetchWithAuth(`${API_BASE_URL}/notifications/${id}`, {
        method: "DELETE",
      });
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch {
      console.error("Failed to delete notification");
    } finally {
      setDeletingId(null);
    }
  };

  // ── Derived ───────────────────────────────────────────────────────────────
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filtered = notifications.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.message.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === "ALL"    ||
      filter === "UNREAD" ||          // already filtered from API
      n.type === filter;

    return matchesSearch && matchesFilter;
  });

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-black text-white">

      {/* ── Background Glow ──────────────────────────────────────────────── */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#ef6b23]/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#2c3a7c]/20 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-8">

        {/* ── Page Header ──────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            {/* Back button */}
            <button
              onClick={() => router.back()}
              className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"
            >
              <ArrowLeft className="w-4 h-4 text-white" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#ef6b23]/20 to-[#ef6b23]/5 rounded-xl flex items-center justify-center border border-[#ef6b23]/20">
                <Bell className="w-5 h-5 text-[#ef6b23]" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white leading-tight">
                  Notifications
                </h1>
                <p className="text-xs text-gray-500">
                  {unreadCount > 0
                    ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
                    : "You're all caught up!"}
                </p>
              </div>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={fetchNotifications}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-all hover:bg-white/10"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={markingAll}
                className="flex items-center gap-1.5 px-3 py-2 bg-white/5 border border-white/10 hover:border-[#ef6b23]/30 text-gray-300 hover:text-white text-xs font-medium rounded-lg transition-all disabled:opacity-50"
              >
                {markingAll
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : <CheckCheck className="w-3.5 h-3.5 text-[#ef6b23]" />
                }
                Mark all read
              </button>
            )}
          </div>
        </div>

        {/* ── Stats Row ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Total",  value: notifications.length,                        color: "text-white" },
            { label: "Unread", value: unreadCount,                                 color: "text-[#ef6b23]" },
            { label: "Read",   value: notifications.length - unreadCount,          color: "text-green-400" },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white/5 border border-white/10 rounded-xl p-3 text-center backdrop-blur-sm"
            >
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-[11px] text-gray-500 mt-0.5 uppercase tracking-widest">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Search ───────────────────────────────────────────────────────── */}
        <div className="relative mb-4">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search notifications..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#ef6b23]/50 transition-colors backdrop-blur-sm"
          />
        </div>

        {/* ── Filter Tabs ──────────────────────────────────────────────────── */}
        <div
          className="flex items-center gap-2 mb-6 overflow-x-auto pb-1"
          style={{ scrollbarWidth: "none" }}
        >
          <Filter className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                filter === tab.key
                  ? "bg-[#ef6b23] text-white shadow-lg shadow-[#ef6b23]/20"
                  : "bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10"
              }`}
            >
              {tab.key === "UNREAD"
                ? `Unread${unreadCount > 0 ? ` (${unreadCount})` : ""}`
                : tab.label}
            </button>
          ))}
        </div>

        {/* ── Notification List ─────────────────────────────────────────────── */}
        {loading ? (
          // Skeleton
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10 animate-pulse"
              >
                <div className="w-9 h-9 rounded-lg bg-white/10 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-white/10 rounded w-2/3" />
                  <div className="h-2.5 bg-white/5 rounded w-full" />
                  <div className="h-2 bg-white/5 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
              <Bell className="w-7 h-7 text-gray-600" />
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm font-medium">No notifications found</p>
              <p className="text-gray-600 text-xs mt-1">
                {search ? "Try a different search term" : "You're all caught up!"}
              </p>
            </div>
            {search && (
              <button
                onClick={() => setSearch("")}
                className="text-[#ef6b23] text-xs hover:underline"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2.5">
            {filtered.map((n) => {
              const tc      = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.SYSTEM;
              const TypeIcon = tc.Icon;

              return (
                <div
                  key={n.id}
                  className={`group relative flex items-start gap-3 p-4 rounded-xl border transition-all duration-200 ${
                    n.isRead
                      ? "bg-white/[0.03] border-white/5 hover:border-white/10 hover:bg-white/5"
                      : "bg-white/[0.06] border-white/10 hover:border-white/20"
                  }`}
                >
                  {/* Unread left accent bar */}
                  {!n.isRead && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-10 bg-[#ef6b23] rounded-r-full" />
                  )}

                  {/* Type Icon */}
                  <div
                    className={`w-9 h-9 ${tc.bg} rounded-lg flex items-center justify-center flex-shrink-0 border ${tc.border} mt-0.5`}
                  >
                    <TypeIcon className={`w-4 h-4 ${tc.color}`} />
                  </div>

                  {/* Content */}
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => !n.isRead && handleMarkRead(n.id)}
                  >
                    {/* Title row */}
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className={`text-sm font-semibold ${n.isRead ? "text-gray-300" : "text-white"}`}>
                        {n.title}
                      </p>

                      {/* Unread dot */}
                      {!n.isRead && (
                        <span className="w-2 h-2 bg-[#ef6b23] rounded-full flex-shrink-0" />
                      )}

                      {/* Type badge */}
                      <span className={`ml-auto px-2 py-0.5 ${tc.bg} ${tc.color} text-[10px] font-medium rounded-full border ${tc.border} flex-shrink-0`}>
                        {tc.label}
                      </span>

                      {/* Priority badge */}
                      {n.priority === "URGENT" && (
                        <span className="px-2 py-0.5 bg-red-400/10 text-red-400 text-[10px] font-semibold rounded-full border border-red-400/20">
                          URGENT
                        </span>
                      )}
                    </div>

                    {/* Message */}
                    <p className={`text-xs leading-relaxed line-clamp-2 ${n.isRead ? "text-gray-500" : "text-gray-400"}`}>
                      {n.message}
                    </p>

                    {/* Meta row */}
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <span className="text-[11px] text-gray-600">
                        {timeAgo(n.createdAt)}
                      </span>
                      <span className={`text-[11px] font-medium ${
                        n.status === "SENT" ? "text-green-500/70" : "text-gray-600"
                      }`}>
                        {n.status}
                      </span>
                      {n.broadcastId && (
                        <span className="text-[10px] text-yellow-500/60 font-medium">
                          Broadcast
                        </span>
                      )}
                      {!n.isRead && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleMarkRead(n.id); }}
                          className="text-[11px] text-[#ef6b23] hover:underline ml-auto"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDelete(n.id)}
                    disabled={deletingId === n.id}
                    className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-400/10 transition-all opacity-0 group-hover:opacity-100 flex-shrink-0 self-start disabled:opacity-40 mt-0.5"
                    title="Delete notification"
                  >
                    {deletingId === n.id
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      : <Trash2  className="w-3.5 h-3.5" />
                    }
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
