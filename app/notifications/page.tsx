"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Bell, CheckCircle2, Clock, MessageCircle,
  Zap, Trash2, Check, ExternalLink
} from "lucide-react";

type Notification = {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  link: string | null;
  created_at: string;
};

const ICON_MAP: Record<string, { icon: any; color: string; bg: string }> = {
  payment_success: { icon: <CheckCircle2 className="w-5 h-5" />, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  payment_expired: { icon: <Clock className="w-5 h-5" />, color: "text-red-400", bg: "bg-red-500/10" },
  ticket_reply: { icon: <MessageCircle className="w-5 h-5" />, color: "text-blue-400", bg: "bg-blue-500/10" },
  promo: { icon: <Zap className="w-5 h-5" />, color: "text-amber-400", bg: "bg-amber-500/10" },
  info: { icon: <Bell className="w-5 h-5" />, color: "text-[var(--accent)]", bg: "bg-[var(--accent)]/10" },
  welcome: { icon: <CheckCircle2 className="w-5 h-5" />, color: "text-[var(--accent)]", bg: "bg-[var(--accent)]/10" },
};

export default function NotificationsPage() {
  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) { router.push("/auth"); return; }
    const u = JSON.parse(stored);
    setUser(u);
    fetchNotifications(u.id);
  }, [router]);

  const fetchNotifications = async (userId: string) => {
    try {
      const unread = filter === "unread" ? "&unread=true" : "";
      const res = await fetch(`/api/notifications?user_id=${userId}&limit=50${unread}`);
      const data = await res.json();
      if (data.notifications) setNotifications(data.notifications);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user) fetchNotifications(user.id);
  }, [filter]);

  const markAsRead = async (notifId: string) => {
    await fetch("/api/notifications/read", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, notificationId: notifId }),
    });
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, is_read: true } : n))
    );
  };

  const markAllAsRead = async () => {
    await fetch("/api/notifications/read", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, markAll: true }),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const handleClick = async (notif: Notification) => {
    if (!notif.is_read) await markAsRead(notif.id);
    if (notif.link) router.push(notif.link);
  };

  // Group by date
  const groupByDate = (notifs: Notification[]) => {
    const groups: Record<string, Notification[]> = {};
    notifs.forEach((n) => {
      const date = new Date(n.created_at).toLocaleDateString("id-ID", {
        day: "numeric", month: "long", year: "numeric",
      });
      if (!groups[date]) groups[date] = [];
      groups[date].push(n);
    });
    return groups;
  };

  if (!user) return null;

  const grouped = groupByDate(notifications);
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-[var(--bg-dark)]/80 backdrop-blur-md border-b border-[var(--border-color)]">
        <div className="max-w-3xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/")}
              className="p-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-white transition-smooth"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[var(--accent)] flex items-center justify-center text-white">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-white leading-none">Notifikasi</h1>
                <p className="text-[10px] text-[var(--text-muted)]">
                  {unreadCount > 0 ? `${unreadCount} belum dibaca` : "Semua sudah dibaca"}
                </p>
              </div>
            </div>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)]/10 text-[var(--accent)] rounded-xl text-xs font-semibold hover:bg-[var(--accent)]/20 transition-smooth"
            >
              <Check className="w-3.5 h-3.5" /> Tandai Semua Dibaca
            </button>
          )}
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-5 py-8">
        {/* Filter */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-smooth ${
              filter === "all"
                ? "bg-[var(--accent)] text-white"
                : "bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-white"
            }`}
          >
            Semua ({notifications.length})
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-smooth ${
              filter === "unread"
                ? "bg-[var(--accent)] text-white"
                : "bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-white"
            }`}
          >
            Belum Dibaca
          </button>
        </div>

        {/* Notifications Grouped by Date */}
        {Object.keys(grouped).length > 0 ? (
          <div className="space-y-6">
            {Object.entries(grouped).map(([date, notifs]) => (
              <div key={date}>
                <h3 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3 px-1">
                  {date}
                </h3>
                <div className="space-y-2">
                  {notifs.map((notif) => {
                    const style = ICON_MAP[notif.type] || ICON_MAP.info;
                    return (
                      <div
                        key={notif.id}
                        onClick={() => handleClick(notif)}
                        className={`glass-card p-4 flex items-start gap-4 cursor-pointer hover:border-[var(--accent)]/20 transition-smooth group ${
                          !notif.is_read ? "border-l-2 border-l-[var(--accent)]" : ""
                        }`}
                      >
                        <div
                          className={`w-11 h-11 rounded-xl ${style.bg} ${style.color} flex items-center justify-center shrink-0`}
                        >
                          {style.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4
                              className={`text-sm font-bold truncate ${
                                !notif.is_read ? "text-white" : "text-[var(--text-muted)]"
                              }`}
                            >
                              {notif.title}
                            </h4>
                            {!notif.is_read && (
                              <div className="w-2 h-2 rounded-full bg-[var(--accent)] shrink-0 animate-pulse" />
                            )}
                          </div>
                          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                            {notif.message}
                          </p>
                          <p className="text-[9px] text-[var(--text-muted)]/50 mt-2 uppercase tracking-widest flex items-center gap-1.5">
                            <Clock className="w-3 h-3" />
                            {new Date(notif.created_at).toLocaleTimeString("id-ID", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                            {notif.link && (
                              <>
                                <span className="mx-1">•</span>
                                <ExternalLink className="w-3 h-3" /> Klik untuk detail
                              </>
                            )}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-[var(--bg-card)] rounded-3xl border border-dashed border-[var(--border-color)]">
            <Bell className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4 opacity-20" />
            <p className="text-white font-semibold mb-1">Belum ada notifikasi</p>
            <p className="text-sm text-[var(--text-muted)]">
              Notifikasi akan muncul saat ada pembayaran, balasan tiket, atau promo baru.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
