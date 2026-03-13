"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Package, Users, Plus, Pencil, Trash2, X, Save,
  ArrowLeft, Shield, ShoppingBag, LayoutDashboard, User, Phone, Receipt, Clock,
  MessageCircle, Send, Loader2, ChevronRight, CheckCircle2, AlertCircle, Tag, Bell, Megaphone
} from "lucide-react";

type Product = {
  id: string; name: string; description: string;
  price: number; category: string; image: string;
};

type UserType = {
  id: string; username: string; whatsapp: string;
  balance: number; role: string; createdAt: string;
};

type Transaction = {
  id: string; orderId: string; productId: string; productName: string;
  customerName: string; amount: number; status: string;
  paymentMethod: string; createdAt: string; completedAt?: string;
};

type Ticket = {
  id: string; user_id: string; username: string; subject: string;
  category: string; status: string; priority: string;
  created_at: string; updated_at: string;
};

type TicketMessage = {
  id: string; ticket_id: string; sender_id: string; sender_name: string;
  sender_role: string; message: string; created_at: string;
};

const TICKET_STATUS: Record<string, { label: string; color: string; bg: string; border: string }> = {
  open: { label: "Open", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  in_progress: { label: "Diproses", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  resolved: { label: "Selesai", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  closed: { label: "Ditutup", color: "text-gray-400", bg: "bg-gray-500/10", border: "border-gray-500/20" },
};

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"products" | "users" | "transactions" | "tickets">("products");
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [ticketMessages, setTicketMessages] = useState<TicketMessage[]>([]);
  const [ticketReply, setTicketReply] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [ticketFilter, setTicketFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: "", description: "", price: "", category: "Panel", image: "" });
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcastSending, setBroadcastSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) { router.push("/auth"); return; }
    const u = JSON.parse(stored);
    if (u.role !== "admin") { router.push("/"); return; }
    setCurrentUser(u);
    fetchProducts(u.id);
    fetchUsers(u.id);
    fetchTransactions(u.id);
    fetchTickets(u.id);
  }, [router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ticketMessages]);

  const fetchProducts = (uid?: string) => {
    const userId = uid || currentUser?.id;
    if (!userId) return;
    fetch("/api/admin/products", {
      headers: { "X-User-Id": userId }
    }).then(r => r.json()).then(data => {
      if (Array.isArray(data)) setProducts(data);
      else if (data.error) console.error("Products error:", data.error);
    });
  };

  const fetchUsers = (uid?: string) => {
    const userId = uid || currentUser?.id;
    if (!userId) return;
    fetch("/api/admin/users", {
      headers: { "X-User-Id": userId }
    }).then(r => r.json()).then(data => {
      if (Array.isArray(data)) setUsers(data);
      else if (data.error) console.error("Users error:", data.error);
    });
  };

  const fetchTransactions = (uid?: string) => {
    const userId = uid || currentUser?.id;
    if (!userId) return;
    fetch("/api/admin/transactions", {
      headers: { "X-User-Id": userId }
    }).then(r => r.json()).then(data => {
      if (Array.isArray(data)) setTransactions(data);
      else if (data.error) console.error("Transactions error:", data.error);
    });
  };

  const fetchTickets = (uid?: string) => {
    const userId = uid || currentUser?.id;
    if (!userId) return;
    fetch(`/api/admin/tickets?status=${ticketFilter}`, {
      headers: { "X-User-Id": userId }
    }).then(r => r.json()).then(data => {
      if (Array.isArray(data)) setTickets(data);
      else if (data.error) console.error("Tickets error:", data.error);
    });
  };

  const fetchTicketMessages = async (ticketId: string) => {
    const res = await fetch(`/api/tickets/${ticketId}`);
    const data = await res.json();
    if (Array.isArray(data)) setTicketMessages(data);
  };

  const openTicketDetail = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    fetchTicketMessages(ticket.id);
  };

  const handleSendTicketReply = async () => {
    if (!ticketReply.trim() || !selectedTicket || !currentUser) return;
    setSendingReply(true);
    try {
      await fetch(`/api/tickets/${selectedTicket.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: currentUser.id,
          senderName: currentUser.username,
          senderRole: "admin",
          message: ticketReply,
        }),
      });
      setTicketReply("");
      fetchTicketMessages(selectedTicket.id);
      fetchTickets();
    } catch (err) {
      console.error(err);
    } finally {
      setSendingReply(false);
    }
  };

  const handleUpdateTicketStatus = async (ticketId: string, newStatus: string) => {
    try {
      await fetch(`/api/tickets/${ticketId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchTickets();
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ===== PRODUCT CRUD =====
  const openAddForm = () => {
    setEditingProduct(null);
    setForm({ name: "", description: "", price: "", category: "Panel", image: "" });
    setShowForm(true);
  };

  const openEditForm = (p: Product) => {
    setEditingProduct(p);
    setForm({ name: p.name, description: p.description, price: String(p.price), category: p.category, image: p.image });
    setShowForm(true);
  };

  const handleSaveProduct = async () => {
    if (!form.name || !form.price) return alert("Nama dan harga wajib diisi.");

    if (editingProduct) {
      await fetch(`/api/admin/products/${editingProduct.id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "X-User-Id": currentUser.id
        },
        body: JSON.stringify({ ...form, price: Number(form.price) }),
      });
    } else {
      await fetch("/api/admin/products", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-User-Id": currentUser.id
        },
        body: JSON.stringify({ ...form, price: Number(form.price) }),
      });
    }

    setShowForm(false);
    fetchProducts();
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Yakin ingin menghapus produk ini?")) return;
    await fetch(`/api/admin/products/${id}`, { 
      method: "DELETE",
      headers: { "X-User-Id": currentUser.id }
    });
    fetchProducts();
  };

  // ===== USER ACTIONS =====
  const handleToggleRole = async (user: UserType) => {
    const newRole = user.role === "admin" ? "member" : "admin";
    if (!confirm(`Ubah role ${user.username} menjadi ${newRole}?`)) return;
    await fetch(`/api/admin/users/${user.id}`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        "X-User-Id": currentUser.id
      },
      body: JSON.stringify({ role: newRole }),
    });
    fetchUsers();
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Yakin ingin menghapus user ini?")) return;
    await fetch(`/api/admin/users/${id}`, { 
      method: "DELETE",
      headers: { "X-User-Id": currentUser.id }
    });
    fetchUsers();
  };

  const handleBroadcastNotification = async () => {
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) {
      alert("Judul dan pesan wajib diisi.");
      return;
    }
    setBroadcastSending(true);
    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-User-Id': currentUser.id },
        body: JSON.stringify({ title: broadcastTitle, message: broadcastMessage })
      });
      const data = await res.json();
      if (data.success) {
        alert('Notifikasi berhasil dikirim ke semua user!');
        setShowBroadcast(false);
        setBroadcastTitle("");
        setBroadcastMessage("");
      } else {
        alert('Gagal: ' + (data.error || 'Unknown'));
      }
    } catch (err) {
      alert('Error mengirim notifikasi.');
    } finally {
      setBroadcastSending(false);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <nav className="sticky top-0 z-50 bg-[var(--bg-dark)]/80 backdrop-blur-md border-b border-[var(--border-color)]">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push("/")} className="p-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-white transition-smooth">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[var(--accent)] flex items-center justify-center text-white">
                <LayoutDashboard className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-white leading-none">Admin Panel</h1>
                <p className="text-[10px] text-[var(--text-muted)]">VANNESS STORE</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <button
              onClick={() => setShowBroadcast(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-smooth text-[10px] font-bold uppercase tracking-wider"
            >
              <Megaphone className="w-3.5 h-3.5" /> Broadcast
            </button>
            <Shield className="w-3.5 h-3.5 text-[var(--accent)]" />
            {currentUser.username}
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-5 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setActiveTab("products")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-smooth ${
              activeTab === "products"
                ? "bg-[var(--accent)] text-white"
                : "bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-white"
            }`}
          >
            <ShoppingBag className="w-4 h-4" /> Produk ({products.length})
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-smooth ${
              activeTab === "users"
                ? "bg-[var(--accent)] text-white"
                : "bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-white"
            }`}
          >
            <Users className="w-4 h-4" /> Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab("transactions")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-smooth ${
              activeTab === "transactions"
                ? "bg-[var(--accent)] text-white"
                : "bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-white"
            }`}
          >
            <Receipt className="w-4 h-4" /> Transaksi ({transactions.length})
          </button>
          <button
            onClick={() => setActiveTab("tickets")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-smooth relative ${
              activeTab === "tickets"
                ? "bg-[var(--accent)] text-white"
                : "bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-white"
            }`}
          >
            <MessageCircle className="w-4 h-4" /> Tiket ({tickets.length})
            {tickets.filter(t => t.status === 'open').length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {tickets.filter(t => t.status === 'open').length}
              </span>
            )}
          </button>
        </div>

        {/* =================== PRODUCTS TAB =================== */}
        {activeTab === "products" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">Kelola Produk</h2>
              <button onClick={openAddForm} className="flex items-center gap-2 px-4 py-2.5 bg-[var(--accent)] text-white rounded-xl text-xs font-semibold hover:bg-[var(--accent-light)] transition-smooth">
                <Plus className="w-4 h-4" /> Tambah Produk
              </button>
            </div>

            {products.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <Package className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3 opacity-40" />
                <p className="text-sm text-[var(--text-muted)]">Belum ada produk.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {products.map((p) => (
                  <div key={p.id} className="glass-card p-4 flex items-center justify-between gap-4 group">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] shrink-0">
                        <Package className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-white truncate">{p.name}</h3>
                        <div className="flex items-center gap-3 text-[11px] text-[var(--text-muted)]">
                          <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5">{p.category}</span>
                          <span>Rp {p.price.toLocaleString("id-ID")}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditForm(p)} className="p-2 rounded-lg bg-white/5 border border-white/10 text-[var(--text-muted)] hover:text-amber-400 hover:border-amber-400/30 transition-smooth">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDeleteProduct(p.id)} className="p-2 rounded-lg bg-white/5 border border-white/10 text-[var(--text-muted)] hover:text-red-400 hover:border-red-400/30 transition-smooth">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* =================== USERS TAB =================== */}
        {activeTab === "users" && (
          <div>
            <h2 className="text-lg font-bold text-white mb-6">Kelola Users</h2>

            {users.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <Users className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3 opacity-40" />
                <p className="text-sm text-[var(--text-muted)]">Belum ada user.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {users.map((u) => (
                  <div key={u.id} className="glass-card p-4 flex items-center justify-between gap-4 group">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        u.role === "admin" ? "bg-amber-500/10 text-amber-500" : "bg-white/5 text-[var(--text-muted)]"
                      }`}>
                        {u.role === "admin" ? <Shield className="w-5 h-5" /> : <User className="w-5 h-5" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white truncate">{u.username}</h3>
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                            u.role === "admin" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : "bg-white/5 text-[var(--text-muted)] border border-white/5"
                          }`}>
                            {u.role}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-[var(--text-muted)] mt-0.5">
                          <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {u.whatsapp || '-'}</span>
                          <span>Saldo: Rp {(u.balance || 0).toLocaleString("id-ID")}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleToggleRole(u)} className="p-2 rounded-lg bg-white/5 border border-white/10 text-[var(--text-muted)] hover:text-amber-400 hover:border-amber-400/30 transition-smooth" title="Toggle Role">
                        <Shield className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDeleteUser(u.id)} className="p-2 rounded-lg bg-white/5 border border-white/10 text-[var(--text-muted)] hover:text-red-400 hover:border-red-400/30 transition-smooth" title="Hapus User">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* =================== TRANSACTIONS TAB =================== */}
        {activeTab === "transactions" && (
          <div>
            <h2 className="text-lg font-bold text-white mb-6">History Transaksi</h2>

            {transactions.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <Receipt className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3 opacity-40" />
                <p className="text-sm text-[var(--text-muted)]">Belum ada transaksi.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((t) => (
                  <div key={t.id} className="glass-card p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        t.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' : t.status === 'pending' ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-500'
                      }`}>
                        <Receipt className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white truncate">{t.productName}</h3>
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                            t.status === 'completed'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : t.status === 'pending'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}>
                            {t.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-[var(--text-muted)] mt-0.5">
                          <span>{t.orderId}</span>
                          <span>•</span>
                          <span>{t.customerName}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(t.createdAt).toLocaleString('id-ID')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-white">Rp {t.amount.toLocaleString('id-ID')}</p>
                      <p className="text-[10px] text-[var(--text-muted)]">{t.paymentMethod}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* =================== TICKETS TAB =================== */}
        {activeTab === "tickets" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">Kelola Tiket</h2>
              <div className="flex gap-2">
                {["all", "open", "in_progress", "resolved", "closed"].map((f) => (
                  <button
                    key={f}
                    onClick={() => { setTicketFilter(f); setTimeout(() => fetchTickets(), 50); }}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-smooth ${
                      ticketFilter === f
                        ? "bg-[var(--accent)] text-white"
                        : "bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-white"
                    }`}
                  >
                    {f === "all" ? "Semua" : (TICKET_STATUS[f]?.label || f)}
                  </button>
                ))}
              </div>
            </div>

            {tickets.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <MessageCircle className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3 opacity-40" />
                <p className="text-sm text-[var(--text-muted)]">Belum ada tiket.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tickets.map((ticket) => {
                  const sc = TICKET_STATUS[ticket.status] || TICKET_STATUS.open;
                  return (
                    <button
                      key={ticket.id}
                      onClick={() => openTicketDetail(ticket)}
                      className="glass-card p-4 w-full text-left flex items-center justify-between gap-4 group hover:border-[var(--accent)]/30 transition-smooth"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${sc.bg} ${sc.color}`}>
                          <MessageCircle className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-bold text-white truncate">{ticket.subject}</h3>
                            <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${sc.bg} ${sc.color} border ${sc.border} shrink-0`}>
                              {sc.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-[var(--text-muted)]">
                            <span className="flex items-center gap-1"><User className="w-3 h-3" /> {ticket.username}</span>
                            <span>•</span>
                            <span>{ticket.category}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(ticket.updated_at).toLocaleString('id-ID')}</span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors shrink-0" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* =================== TICKET DETAIL MODAL =================== */}
      {selectedTicket && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="glass-card w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="p-5 border-b border-[var(--border-color)] flex items-start justify-between gap-4 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] shrink-0">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-white truncate">{selectedTicket.subject}</h3>
                  <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest mt-0.5">
                    {selectedTicket.id} • {selectedTicket.username} • {selectedTicket.category}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {/* Status Selector */}
                <select
                  value={selectedTicket.status}
                  onChange={(e) => handleUpdateTicketStatus(selectedTicket.id, e.target.value)}
                  className="bg-[var(--bg-dark)] border border-[var(--border-color)] rounded-lg px-2.5 py-1.5 text-[10px] font-bold text-white uppercase tracking-wider focus:outline-none focus:border-[var(--accent)]/50"
                >
                  <option value="open">Open</option>
                  <option value="in_progress">Diproses</option>
                  <option value="resolved">Selesai</option>
                  <option value="closed">Ditutup</option>
                </select>
                <button
                  onClick={() => { setSelectedTicket(null); setTicketMessages([]); }}
                  className="p-1.5 rounded-lg hover:bg-white/5 text-[var(--text-muted)] hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 min-h-0">
              {ticketMessages.map((msg) => {
                const isAdminMsg = msg.sender_role === "admin";
                return (
                  <div key={msg.id} className={`flex gap-3 ${isAdminMsg ? "" : "flex-row-reverse"}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      isAdminMsg ? "bg-amber-500/10 text-amber-500" : "bg-[var(--accent)]/10 text-[var(--accent)]"
                    }`}>
                      {isAdminMsg ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </div>
                    <div className={`max-w-[75%] ${isAdminMsg ? "" : "text-right"}`}>
                      <div className={`inline-block px-4 py-3 rounded-2xl text-sm text-white leading-relaxed ${
                        isAdminMsg
                          ? "bg-amber-500/10 border border-amber-500/10 rounded-tl-none"
                          : "bg-[var(--accent)]/10 border border-[var(--accent)]/10 rounded-tr-none"
                      }`}>
                        {msg.message}
                      </div>
                      <p className="text-[9px] text-[var(--text-muted)] mt-1.5 uppercase tracking-widest">
                        {isAdminMsg && "⭐ "}{msg.sender_name} • {new Date(msg.created_at).toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply */}
            {selectedTicket.status !== "closed" ? (
              <div className="p-4 border-t border-[var(--border-color)] shrink-0">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={ticketReply}
                    onChange={(e) => setTicketReply(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendTicketReply()}
                    placeholder="Balas sebagai Admin..."
                    className="flex-1 bg-[var(--bg-dark)] border border-[var(--border-color)] rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-[var(--accent)]/50 transition-smooth"
                  />
                  <button
                    onClick={handleSendTicketReply}
                    disabled={sendingReply || !ticketReply.trim()}
                    className="px-5 py-2.5 bg-[var(--accent)] text-white rounded-xl text-sm font-semibold hover:bg-[var(--accent-light)] transition-smooth disabled:opacity-50 flex items-center gap-2"
                  >
                    {sendingReply ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 border-t border-[var(--border-color)] text-center shrink-0">
                <p className="text-xs text-[var(--text-muted)]">Tiket ini sudah ditutup.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =================== PRODUCT FORM MODAL =================== */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-[var(--border-color)] flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">
                {editingProduct ? "Edit Produk" : "Tambah Produk"}
              </h3>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-white/5 text-[var(--text-muted)] hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-1.5">Nama Produk</label>
                <input
                  value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-[var(--bg-dark)] border border-[var(--border-color)] rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-[var(--accent)]/50 transition-smooth"
                  placeholder="Contoh: Panel 4GB"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-1.5">Deskripsi</label>
                <textarea
                  value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-[var(--bg-dark)] border border-[var(--border-color)] rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-[var(--accent)]/50 transition-smooth resize-none h-20"
                  placeholder="Deskripsi singkat produk..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-1.5">Harga (Rp)</label>
                  <input
                    type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full bg-[var(--bg-dark)] border border-[var(--border-color)] rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-[var(--accent)]/50 transition-smooth"
                    placeholder="50000"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-1.5">Kategori</label>
                  <select
                    value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-[var(--bg-dark)] border border-[var(--border-color)] rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-[var(--accent)]/50 transition-smooth"
                  >
                    <option value="Panel">Panel</option>
                    <option value="VPS">VPS</option>
                    <option value="App Premium">App Premium</option>
                    <option value="Script">Script</option>
                    <option value="Bot">Bot</option>
                    <option value="Keamanan">Keamanan</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleSaveProduct}
                className="w-full py-3 bg-[var(--accent)] text-white rounded-xl text-sm font-semibold hover:bg-[var(--accent-light)] transition-smooth flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" /> {editingProduct ? "Simpan Perubahan" : "Tambah Produk"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* =================== BROADCAST NOTIFICATION MODAL =================== */}
      {showBroadcast && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="glass-card w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-5 border-b border-[var(--border-color)] flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-amber-400" /> Broadcast Notifikasi
              </h3>
              <button
                onClick={() => setShowBroadcast(false)}
                className="p-1.5 rounded-lg hover:bg-white/5 text-[var(--text-muted)] hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl">
                <p className="text-[10px] text-amber-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <Bell className="w-3 h-3" /> Kirim ke semua {users.length} user
                </p>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-1.5">
                  Judul Notifikasi
                </label>
                <input
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  className="w-full bg-[var(--bg-dark)] border border-[var(--border-color)] rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-[var(--accent)]/50 transition-smooth"
                  placeholder="Contoh: 🔥 Promo Flash Sale!"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-1.5">
                  Pesan
                </label>
                <textarea
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  className="w-full bg-[var(--bg-dark)] border border-[var(--border-color)] rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-[var(--accent)]/50 transition-smooth resize-none h-24"
                  placeholder="Isi pesan promosi Anda..."
                />
              </div>

              <button
                onClick={handleBroadcastNotification}
                disabled={broadcastSending}
                className="w-full py-3.5 bg-amber-500 text-white rounded-xl text-sm font-bold hover:bg-amber-600 transition-smooth disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {broadcastSending ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Mengirim...</>
                ) : (
                  <><Send className="w-4 h-4" /> Kirim ke Semua User</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
