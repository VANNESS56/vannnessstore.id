"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Plus, Send, X, Clock, CheckCircle2,
  MessageCircle, AlertCircle, Loader2, Tag, User,
  Shield, ChevronRight, Inbox, HelpCircle, Bug,
  CreditCard, Package, Settings
} from "lucide-react";

type Ticket = {
  id: string;
  user_id: string;
  username: string;
  subject: string;
  category: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
};

type Message = {
  id: string;
  ticket_id: string;
  sender_id: string;
  sender_name: string;
  sender_role: string;
  message: string;
  created_at: string;
};

const CATEGORIES = [
  { value: "general", label: "Pertanyaan Umum", icon: <HelpCircle className="w-4 h-4" /> },
  { value: "payment", label: "Masalah Pembayaran", icon: <CreditCard className="w-4 h-4" /> },
  { value: "product", label: "Masalah Produk", icon: <Package className="w-4 h-4" /> },
  { value: "bug", label: "Laporan Bug", icon: <Bug className="w-4 h-4" /> },
  { value: "account", label: "Masalah Akun", icon: <Settings className="w-4 h-4" /> },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  open: { label: "Open", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  in_progress: { label: "Diproses", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  resolved: { label: "Selesai", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  closed: { label: "Ditutup", color: "text-gray-400", bg: "bg-gray-500/10", border: "border-gray-500/20" },
};

export default function TicketsPage() {
  const [user, setUser] = useState<any>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [newCategory, setNewCategory] = useState("general");
  const [newMessage, setNewMessage] = useState("");
  const [replyMessage, setReplyMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) { router.push("/auth"); return; }
    const u = JSON.parse(stored);
    setUser(u);
    fetchTickets(u.id);
  }, [router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchTickets = async (userId: string) => {
    try {
      const res = await fetch(`/api/tickets?user_id=${userId}`);
      const data = await res.json();
      if (Array.isArray(data)) setTickets(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMessages = async (ticketId: string) => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}`);
      const data = await res.json();
      if (Array.isArray(data)) setMessages(data);
    } catch (err) {
      console.error(err);
    }
  };

  const openTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    fetchMessages(ticket.id);
  };

  const handleCreateTicket = async () => {
    if (!newSubject.trim() || !newMessage.trim()) {
      alert("Subjek dan pesan wajib diisi.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          username: user.username,
          subject: newSubject,
          category: newCategory,
          message: newMessage,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setShowNewForm(false);
        setNewSubject("");
        setNewCategory("general");
        setNewMessage("");
        fetchTickets(user.id);
      } else {
        alert("Gagal membuat tiket: " + (data.error || "Unknown"));
      }
    } catch (err) {
      alert("Error creating ticket.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async () => {
    if (!replyMessage.trim() || !selectedTicket) return;

    setSending(true);
    try {
      const res = await fetch(`/api/tickets/${selectedTicket.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: user.id,
          senderName: user.username,
          senderRole: user.role || "member",
          message: replyMessage,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setReplyMessage("");
        fetchMessages(selectedTicket.id);
        fetchTickets(user.id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const getCategoryIcon = (cat: string) => {
    const found = CATEGORIES.find((c) => c.value === cat);
    return found?.icon || <Tag className="w-4 h-4" />;
  };

  const getCategoryLabel = (cat: string) => {
    const found = CATEGORIES.find((c) => c.value === cat);
    return found?.label || cat;
  };

  if (!user) return null;

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-[var(--bg-dark)]/80 backdrop-blur-md border-b border-[var(--border-color)]">
        <div className="max-w-5xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/")}
              className="p-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-white transition-smooth"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[var(--accent)] flex items-center justify-center text-white">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-white leading-none">Pusat Bantuan</h1>
                <p className="text-[10px] text-[var(--text-muted)]">VANNESS STORE</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowNewForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[var(--accent)] text-white rounded-xl text-xs font-semibold hover:bg-[var(--accent-light)] transition-smooth"
          >
            <Plus className="w-4 h-4" /> Buat Tiket
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-5 py-8">
        {/* Ticket Detail View */}
        {selectedTicket ? (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Back button & ticket info */}
            <button
              onClick={() => { setSelectedTicket(null); setMessages([]); }}
              className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Kembali ke daftar tiket
            </button>

            <div className="glass-card p-5 mb-6">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
                    {getCategoryIcon(selectedTicket.category)}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">{selectedTicket.subject}</h2>
                    <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest mt-0.5">
                      {selectedTicket.id} • {getCategoryLabel(selectedTicket.category)}
                    </p>
                  </div>
                </div>
                {(() => {
                  const sc = STATUS_CONFIG[selectedTicket.status] || STATUS_CONFIG.open;
                  return (
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg ${sc.bg} ${sc.color} border ${sc.border}`}>
                      {sc.label}
                    </span>
                  );
                })()}
              </div>
            </div>

            {/* Messages */}
            <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {messages.map((msg) => {
                const isAdmin = msg.sender_role === "admin";
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${isAdmin ? "" : "flex-row-reverse"}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      isAdmin ? "bg-amber-500/10 text-amber-500" : "bg-[var(--accent)]/10 text-[var(--accent)]"
                    }`}>
                      {isAdmin ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </div>
                    <div className={`max-w-[75%] ${isAdmin ? "" : "text-right"}`}>
                      <div className={`inline-block px-4 py-3 rounded-2xl text-sm text-white leading-relaxed ${
                        isAdmin
                          ? "bg-amber-500/10 border border-amber-500/10 rounded-tl-none"
                          : "bg-[var(--accent)]/10 border border-[var(--accent)]/10 rounded-tr-none"
                      }`}>
                        {msg.message}
                      </div>
                      <p className="text-[9px] text-[var(--text-muted)] mt-1.5 flex items-center gap-1.5 uppercase tracking-widest">
                        {isAdmin && <Shield className="w-2.5 h-2.5 text-amber-500" />}
                        {msg.sender_name} • {new Date(msg.created_at).toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply Input */}
            {selectedTicket.status !== "closed" ? (
              <div className="glass-card p-4">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendReply()}
                    placeholder="Ketik balasan..."
                    className="flex-1 bg-[var(--bg-dark)] border border-[var(--border-color)] rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-[var(--accent)]/50 transition-smooth"
                  />
                  <button
                    onClick={handleSendReply}
                    disabled={sending || !replyMessage.trim()}
                    className="px-5 py-2.5 bg-[var(--accent)] text-white rounded-xl text-sm font-semibold hover:bg-[var(--accent-light)] transition-smooth disabled:opacity-50 flex items-center gap-2"
                  >
                    {sending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="glass-card p-4 text-center">
                <p className="text-sm text-[var(--text-muted)]">Tiket ini sudah ditutup.</p>
              </div>
            )}
          </div>
        ) : (
          /* Ticket List View */
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            {tickets.length > 0 ? (
              <div className="space-y-3">
                {tickets.map((ticket) => {
                  const sc = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open;
                  return (
                    <button
                      key={ticket.id}
                      onClick={() => openTicket(ticket)}
                      className="glass-card p-4 w-full text-left flex items-center justify-between gap-4 group hover:border-[var(--accent)]/30 transition-smooth"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${sc.bg} ${sc.color}`}>
                          {getCategoryIcon(ticket.category)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-bold text-white truncate">{ticket.subject}</h3>
                            <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${sc.bg} ${sc.color} border ${sc.border} shrink-0`}>
                              {sc.label}
                            </span>
                          </div>
                          <p className="text-[10px] text-[var(--text-muted)] flex items-center gap-1.5 uppercase tracking-widest font-medium">
                            {ticket.id} • {getCategoryLabel(ticket.category)} •{" "}
                            <Clock className="w-3 h-3" />{" "}
                            {new Date(ticket.updated_at).toLocaleString("id-ID")}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors shrink-0" />
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20 bg-[var(--bg-card)] rounded-3xl border border-dashed border-[var(--border-color)]">
                <Inbox className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4 opacity-20" />
                <p className="text-white font-semibold mb-1">Belum ada tiket</p>
                <p className="text-sm text-[var(--text-muted)] mb-6">Butuh bantuan? Buat tiket baru untuk memulai percakapan dengan tim kami.</p>
                <button
                  onClick={() => setShowNewForm(true)}
                  className="px-6 py-3 bg-[var(--accent)] text-white rounded-xl text-sm font-semibold hover:bg-[var(--accent-light)] transition-smooth inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Buat Tiket Pertama
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* New Ticket Modal */}
      {showNewForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="glass-card w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-5 border-b border-[var(--border-color)] flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest">Buat Tiket Baru</h3>
              <button
                onClick={() => setShowNewForm(false)}
                className="p-1.5 rounded-lg hover:bg-white/5 text-[var(--text-muted)] hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Kategori */}
              <div>
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-2">
                  Kategori Masalah
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => setNewCategory(cat.value)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-smooth ${
                        newCategory === cat.value
                          ? "bg-[var(--accent)] text-white"
                          : "bg-[var(--bg-dark)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-white hover:border-white/20"
                      }`}
                    >
                      {cat.icon}
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subjek */}
              <div>
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-1.5">
                  Subjek
                </label>
                <input
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full bg-[var(--bg-dark)] border border-[var(--border-color)] rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-[var(--accent)]/50 transition-smooth"
                  placeholder="Contoh: Pembayaran QRIS tidak terdeteksi"
                />
              </div>

              {/* Pesan */}
              <div>
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-1.5">
                  Pesan
                </label>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="w-full bg-[var(--bg-dark)] border border-[var(--border-color)] rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-[var(--accent)]/50 transition-smooth resize-none h-28"
                  placeholder="Jelaskan masalah Anda secara detail..."
                />
              </div>

              <button
                onClick={handleCreateTicket}
                disabled={loading}
                className="w-full py-3.5 bg-[var(--accent)] text-white rounded-xl text-sm font-bold hover:bg-[var(--accent-light)] transition-smooth disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Mengirim...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Kirim Tiket
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
