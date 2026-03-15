"use client";

import { Search, LogOut, Zap, ShieldCheck, Headphones, Globe, User, Cpu, Package, X, Copy, Check, Clock, QrCode, CreditCard, CheckCircle2, Users, ShoppingBag, Receipt, Layout, Send, Phone, MessageCircle, Headset, HelpCircle, CalendarDays, Wallet, ChevronDown, LayoutDashboard, Shield, Bell, ExternalLink, Terminal, Key, Eye, EyeOff, AlertCircle, Megaphone } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import BannerCarousel from "@/components/BannerCarousel";
import Footer from "@/components/Footer";
import { config } from "@/lib/config";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [stats, setStats] = useState({ memberCount: 0, transactionCount: 0 });
  const [userTransactions, setUserTransactions] = useState<any[]>([]);
  const [activeHomeTab, setActiveHomeTab] = useState<"market" | "history" | "smm">("market");
  const [smmCategory, setSmmCategory] = useState("");
  const [smmService, setSmmService] = useState<any>(null);
  const [smmCategories, setSmmCategories] = useState<string[]>([]);
  const [smmServices, setSmmServices] = useState<any[]>([]);
  const [isLoadingSmm, setIsLoadingSmm] = useState(false);
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [fakeNotification, setFakeNotification] = useState<{visible: boolean, user: string, product: string} | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [isConfirmingPurchase, setIsConfirmingPurchase] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"qris" | "balance">("qris");
  const [smmTarget, setSmmTarget] = useState("");
  const [smmQuantity, setSmmQuantity] = useState<number | "">("");
  const [isCheckingSmm, setIsCheckingSmm] = useState(false);
  const [buzzerBalance, setBuzzerBalance] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/auth");
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [router]);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProducts(data);
        } else {
          setProducts([]);
        }
      });

    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => setStats(data));

    // Fetch SMM Categories
    fetch("/api/smm/categories")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setSmmCategories(data);
      })
      .catch(err => console.error("SMM Categories Error:", err));
  }, []);

  useEffect(() => {
    // Fetch Admin Balance if user is admin
    if (user?.role === 'admin') {
      fetch("/api/admin/smm/balance")
        .then(res => res.json())
        .then(data => {
          if (!data.error) setBuzzerBalance(data);
        })
        .catch(() => {});
    }
  }, [user?.role]);

  // Fetch notifications + polling
  useEffect(() => {
    if (!user) return;

    const fetchNotifications = () => {
      fetch(`/api/notifications?user_id=${user.id}&limit=10`)
        .then(r => r.json())
        .then(data => {
          if (data.notifications) setNotifications(data.notifications);
          if (typeof data.unreadCount === 'number') setUnreadCount(data.unreadCount);
        })
        .catch(() => {});
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll setiap 30 detik
    return () => clearInterval(interval);
  }, [user]);

  // Polling Status (Section E)
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (paymentData && paymentData.status !== 'completed') {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/payments/status?order_id=${paymentData.order_id}&amount=${paymentData.amount}`);
          const data = await res.json();

          if (data.status === 'completed') {
            clearInterval(interval);
            setCopied(false);
            
            // Jika ini adalah deposit, update saldo user di state dan local storage
            if (data.isDeposit && data.newBalance !== undefined && user) {
              const updatedUser = { ...user, balance: data.newBalance };
              setUser(updatedUser);
              localStorage.setItem("user", JSON.stringify(updatedUser));
            }

            // Tampilkan modal detail pembelian custom (lebih premium daripada alert)
            setSelectedTransaction({
              orderId: paymentData.order_id,
              productName: paymentData.name || paymentData.productName || 'Produk',
              amount: paymentData.amount || paymentData.total_payment,
              deliveredData: data.deliveredData,
              deliveryType: data.deliveryType,
              status: 'completed',
              paymentMethod: data.details?.payment_method || paymentData.payment_method
            });
            
            setPaymentData(null);
            fetch("/api/stats").then(r => r.json()).then(setStats);
            if (activeHomeTab === "history") fetchUserTransactions();
          } else if (data.status === 'expired') {
            clearInterval(interval);
            alert("Sesi pembayaran telah berakhir (Expired). Silakan buat pesanan baru.");
            setPaymentData(null);
            if (activeHomeTab === "history") fetchUserTransactions();
          }
        } catch (err) {
          console.error("Polling error:", err);
        }
      }, 5000); // Cek setiap 5 detik
    }

    return () => clearInterval(interval);
  }, [paymentData, activeHomeTab]);
 
  const handleCheckSmmStatus = async (trxId: string) => {
    if (isCheckingSmm) return;
    setIsCheckingSmm(true);
    try {
      const res = await fetch(`/api/smm/status?trx_id=${trxId}`);
      const data = await res.json();
      
      if (data.error) {
        alert(`Gagal cek status: ${data.error}`);
      } else {
        // Refresh transactions to show updated status
        fetchUserTransactions();
        
        // Update current selectedTransaction data to show updated status
        if (selectedTransaction?.id === trxId) {
          setSelectedTransaction({
            ...selectedTransaction,
            status: data.local_status,
            deliveredData: JSON.stringify(data)
          });
        }
        
        alert(`Status terbaru: ${data.provider_status}\nSisa: ${data.remains}`);
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat memeriksa status.');
    } finally {
      setIsCheckingSmm(false);
    }
  };

  const fetchUserTransactions = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/user/transactions?username=${user.username}`);
      const data = await res.json();
      setUserTransactions(data);
    } catch (err) {
      console.error(err);
    }
  }, [user]);

  useEffect(() => {
    if (activeHomeTab === "history") {
      fetchUserTransactions();
    }
  }, [activeHomeTab, fetchUserTransactions]);

  // Fake Purchase Notifications
  useEffect(() => {
    const usernames = ["Dimas", "Rian", "Sari", "Budi", "Putra", "Dewi", "Fajar", "Kevin", "Intan", "Yoga", "Ahmad", "Nisa"];
    
    const showRandomNotification = () => {
      if (products.length === 0) return;
      
      const randomUser = usernames[Math.floor(Math.random() * usernames.length)];
      const randomProduct = products[Math.floor(Math.random() * products.length)];
      const maskedUser = randomUser.substring(0, 2) + "***" + randomUser.substring(randomUser.length - 1);

      setFakeNotification({
        visible: true,
        user: maskedUser,
        product: randomProduct.name
      });

      // Hide after 5 seconds
      setTimeout(() => {
        setFakeNotification(prev => prev ? { ...prev, visible: false } : null);
      }, 5000);
    };

    // Initial delay
    const initialDelay = setTimeout(showRandomNotification, 5000);

    const interval = setInterval(() => {
      showRandomNotification();
    }, Math.random() * (25000 - 10000) + 10000); // 10-25 seconds

    return () => {
      clearTimeout(initialDelay);
      clearInterval(interval);
    };
  }, [products]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/auth");
  };

  const handleBuy = (product: any) => {
    setSelectedProduct(product);
    setSmmTarget("");
    setSmmQuantity(product.min_qty || 1);
  };

  const confirmPurchase = async () => {
    if (!selectedProduct || !user) return;
    
    const isSmm = selectedProduct.provider === 'buzzerpanel';
    const finalQuantity = isSmm ? Number(smmQuantity) : 1;
    const finalPrice = isSmm ? Math.ceil((selectedProduct.price / 1000) * finalQuantity) : selectedProduct.price;

    if (isSmm && !smmTarget) {
      alert("Silakan masukkan Username / Link target.");
      setIsConfirmingPurchase(false);
      return;
    }

    try {
      if (paymentMethod === "balance") {
        const res = await fetch("/api/payments/pay-balance", {
          method: "POST",
          body: JSON.stringify({
            productId: selectedProduct.id,
            amount: finalPrice,
            userId: user.id,
            smmTarget,
            smmQuantity: finalQuantity
          }),
        });

        const data = await res.json();
        if (data.success) {
          // Success with Balance
          setSelectedTransaction({
            orderId: data.orderId,
            productName: selectedProduct.name,
            amount: selectedProduct.price,
            deliveredData: data.deliveredData,
            deliveryType: data.deliveryType,
            status: 'completed',
            paymentMethod: 'Saldo'
          });
          
          // Update Local User Balance
          const updatedUser = { ...user, balance: data.newBalance };
          setUser(updatedUser);
          localStorage.setItem("user", JSON.stringify(updatedUser));
          
          setSelectedProduct(null);
          fetch("/api/stats").then(r => r.json()).then(setStats);
          if (activeHomeTab === "history") fetchUserTransactions();
        } else {
          alert(`Gagal membuat pembayaran: ${data.error || 'Unknown error'}${data.details ? `\n\nDetail: ${data.details}` : ''}`);
        }
      } else {
        const res = await fetch("/api/payments/create", {
          method: "POST",
          body: JSON.stringify({
            productId: selectedProduct.id,
            amount: finalPrice,
            customerName: user.username,
            userId: user.id,
            smmTarget,
            smmQuantity: finalQuantity
          }),
        });

        const data = await res.json();
        
        if (data.success && data.payment) {
          setPaymentData(data.payment);
          setSelectedProduct(null); // Close confirmation modal
        } else if (data.paymentUrl) {
          // Jika ada error tapi ada fallback URL, tampilkan error dulu baru redirect
          if (data.error) {
              alert(`Info: ${data.error}\n\nMenuju halaman pembayaran manual...`);
          }
          window.location.href = data.paymentUrl;
        } else {
          alert(`Gagal membuat pembayaran: ${data.error || 'Unknown error'}${data.details ? `\n\nDetail: ${data.details}` : ''}`);
        }
      }
    } catch (err) {
      console.error(err);
      alert("Error initiating payment.");
    } finally {
      setIsConfirmingPurchase(false);
    }
  };

  const handleDeposit = async () => {
    if (!depositAmount || Number(depositAmount) < 10000) {
      alert("Minimal top up adalah Rp 10.000");
      return;
    }

    setIsConfirmingPurchase(true);
    try {
      const res = await fetch("/api/payments/create", {
        method: "POST",
        body: JSON.stringify({
          productId: "deposit",
          amount: Number(depositAmount),
          customerName: user.username,
          userId: user.id,
        }),
      });

      const data = await res.json();
      if (data.success && data.payment) {
        setPaymentData(data.payment);
        setShowDepositModal(false);
        setDepositAmount("");
      } else {
        alert(`Gagal membuat invoice top up: ${data.error || 'Unknown error'}${data.details ? `\n\nDetail: ${data.details}` : ''}`);
      }
    } catch (err) {
      console.error(err);
      alert("Error initiating deposit.");
    } finally {
      setIsConfirmingPurchase(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-[var(--bg-dark)]/80 backdrop-blur-md border-b border-[var(--border-color)]">
        <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between gap-6">
          <Link href="/" className="shrink-0 flex items-center gap-2.5">
            <img src={config.site.logo} alt="Logo" className="w-10 h-10 object-contain" />
            <span className="text-xl font-bold text-white tracking-tight">{config.site.name}</span>
          </Link>

          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <input
                type="text"
                placeholder="Cari produk..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]/50 transition-smooth"
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
                className="p-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--accent)] hover:border-[var(--accent)]/30 transition-smooth relative"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-bounce">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-[60]" onClick={() => setShowNotifications(false)} />
                  <div className="absolute right-0 top-full mt-2 w-[360px] z-[70] glass-card overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 shadow-2xl shadow-black/40">
                    {/* Header */}
                    <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Bell className="w-4 h-4 text-[var(--accent)]" /> Notifikasi
                      </h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={async () => {
                            await fetch('/api/notifications/read', {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ userId: user.id, markAll: true })
                            });
                            setUnreadCount(0);
                            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
                          }}
                          className="text-[10px] font-bold text-[var(--accent)] hover:underline uppercase tracking-wider"
                        >
                          Tandai Semua Dibaca
                        </button>
                      )}
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-[360px] overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.slice(0, 8).map((notif) => {
                          const iconMap: Record<string, { icon: any; color: string; bg: string }> = {
                            payment_success: { icon: <CheckCircle2 className="w-4 h-4" />, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                            payment_expired: { icon: <Clock className="w-4 h-4" />, color: 'text-red-400', bg: 'bg-red-500/10' },
                            ticket_reply: { icon: <MessageCircle className="w-4 h-4" />, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                            promo: { icon: <Zap className="w-4 h-4" />, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                            info: { icon: <Bell className="w-4 h-4" />, color: 'text-[var(--accent)]', bg: 'bg-[var(--accent)]/10' },
                            welcome: { icon: <CheckCircle2 className="w-4 h-4" />, color: 'text-[var(--accent)]', bg: 'bg-[var(--accent)]/10' },
                          };
                          const style = iconMap[notif.type] || iconMap.info;

                          return (
                            <div
                              key={notif.id}
                              onClick={async () => {
                                if (!notif.is_read) {
                                  await fetch('/api/notifications/read', {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ userId: user.id, notificationId: notif.id })
                                  });
                                  setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
                                  setUnreadCount(prev => Math.max(0, prev - 1));
                                }
                                if (notif.link) {
                                  setShowNotifications(false);
                                  router.push(notif.link);
                                }
                              }}
                              className={`p-3.5 flex items-start gap-3 border-b border-[var(--border-color)]/50 cursor-pointer hover:bg-white/[0.02] transition-colors ${
                                !notif.is_read ? 'bg-[var(--accent)]/[0.03]' : ''
                              }`}
                            >
                              <div className={`w-9 h-9 rounded-xl ${style.bg} ${style.color} flex items-center justify-center shrink-0 mt-0.5`}>
                                {style.icon}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <p className={`text-xs font-bold truncate ${!notif.is_read ? 'text-white' : 'text-[var(--text-muted)]'}`}>
                                    {notif.title}
                                  </p>
                                  {!notif.is_read && (
                                    <div className="w-2 h-2 rounded-full bg-[var(--accent)] shrink-0" />
                                  )}
                                </div>
                                <p className="text-[11px] text-[var(--text-muted)] line-clamp-2 leading-relaxed">{notif.message}</p>
                                <p className="text-[9px] text-[var(--text-muted)]/60 mt-1 uppercase tracking-widest">
                                  {new Date(notif.created_at).toLocaleString('id-ID')}
                                </p>
                              </div>
                              {notif.link && (
                                <ExternalLink className="w-3 h-3 text-[var(--text-muted)] shrink-0 mt-1" />
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-8 text-center">
                          <Bell className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2 opacity-20" />
                          <p className="text-xs text-[var(--text-muted)]">Belum ada notifikasi</p>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                      <Link
                        href="/notifications"
                        onClick={() => setShowNotifications(false)}
                        className="block p-3 text-center text-[10px] font-bold text-[var(--accent)] uppercase tracking-widest border-t border-[var(--border-color)] hover:bg-[var(--accent)]/5 transition-colors"
                      >
                        Lihat Semua Notifikasi
                      </Link>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Profile Button */}
            <div className="relative">
              <button
                onClick={() => setShowProfile(!showProfile)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--accent)]/30 transition-smooth group"
              >
                <div className="w-7 h-7 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
                  <User className="w-3.5 h-3.5" />
                </div>
                <span className="text-sm font-medium text-white hidden lg:inline">{user.username}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-[var(--text-muted)] hidden lg:block transition-transform duration-200 ${showProfile ? 'rotate-180' : ''}`} />
              </button>

              {/* Profile Dropdown */}
              {showProfile && (
                <>
                  {/* Backdrop */}
                  <div className="fixed inset-0 z-[60]" onClick={() => setShowProfile(false)} />

                  <div className="absolute right-0 top-full mt-2 w-[320px] z-[70] glass-card overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 shadow-2xl shadow-black/40">
                    {/* Profile Header */}
                    <div className="p-5 bg-gradient-to-br from-[var(--accent)]/10 to-transparent border-b border-[var(--border-color)]">
                      <div className="flex items-center gap-3.5 mb-4">
                        <div className="w-14 h-14 rounded-2xl bg-[var(--accent)]/15 flex items-center justify-center text-[var(--accent)] border border-[var(--accent)]/20">
                          <User className="w-7 h-7" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-white leading-tight">{user.username}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                              user.role === 'admin'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20'
                            }`}>
                              {user.role === 'admin' ? '⭐ Admin' : '👤 Member'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Stats Row */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-[var(--bg-dark)]/60 rounded-xl p-3 border border-white/5 relative group/balance">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Wallet className="w-3 h-3 text-emerald-400" />
                            <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-widest font-bold">Saldo</span>
                          </div>
                          <p className="text-sm font-bold text-white">Rp {(user.balance || 0).toLocaleString('id-ID')}</p>
                          <button 
                            onClick={() => { setShowProfile(false); setShowDepositModal(true); }}
                            className="absolute -top-1 -right-1 bg-[var(--accent)] text-white p-1 rounded-lg opacity-0 group-hover/balance:opacity-100 transition-all hover:scale-110"
                            title="Top Up Saldo"
                          >
                            <Zap className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="bg-[var(--bg-dark)]/60 rounded-xl p-3 border border-white/5">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Receipt className="w-3 h-3 text-blue-400" />
                            <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-widest font-bold">Transaksi</span>
                          </div>
                          <p className="text-sm font-bold text-white">{userTransactions.length}</p>
                        </div>
                      </div>
                    </div>

                    {/* Info Section */}
                    <div className="p-4 space-y-3 border-b border-[var(--border-color)]">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[var(--text-muted)]">
                          <Key className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[9px] text-[var(--text-muted)] uppercase tracking-widest font-bold">API Key / User ID</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-xs text-white font-mono truncate">
                              {showApiKey ? user.id : '••••••••••••••••••••'}
                            </p>
                            <div className="flex items-center space-x-1 shrink-0">
                              <button 
                                onClick={(e) => { e.stopPropagation(); setShowApiKey(!showApiKey); }} 
                                className="p-1 rounded bg-[var(--bg-dark)] border border-white/5 hover:bg-white/10 text-[var(--text-muted)] hover:text-white transition-colors"
                                title={showApiKey ? "Sembunyikan" : "Tampilkan"}
                              >
                                {showApiKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); copyToClipboard(user.id); }} 
                                className="p-1 rounded bg-[var(--bg-dark)] border border-white/5 hover:bg-white/10 text-[var(--text-muted)] hover:text-white transition-colors"
                                title="Salin User ID"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[var(--text-muted)]">
                          <Phone className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="text-[9px] text-[var(--text-muted)] uppercase tracking-widest font-bold">WhatsApp</p>
                          <p className="text-xs text-white font-medium">{user.whatsapp || 'Belum diatur'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[var(--text-muted)]">
                          <CalendarDays className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="text-[9px] text-[var(--text-muted)] uppercase tracking-widest font-bold">Bergabung</p>
                          <p className="text-xs text-white font-medium">
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Quick Links */}
                    <div className="p-2">
                      {user.role === 'admin' && (
                        <>
                          <Link
                            href="/admin"
                            onClick={() => setShowProfile(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[var(--text-muted)] hover:text-amber-400 hover:bg-amber-500/5 transition-smooth"
                          >
                            <LayoutDashboard className="w-4 h-4" />
                            <span className="font-medium">Admin Panel</span>
                            <Shield className="w-3.5 h-3.5 text-amber-500 ml-auto" />
                          </Link>
                          {buzzerBalance && (
                            <div className="mx-3 mt-1 mb-2 p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl">
                              <p className="text-[9px] font-bold text-blue-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                 <Globe className="w-3 h-3" /> Saldo Buzzerpanel
                              </p>
                              <div className="flex items-center justify-between">
                                 <p className="text-xs font-bold text-white">Rp {Number(buzzerBalance.balance).toLocaleString('id-ID')}</p>
                                 <span className="text-[8px] font-bold text-[var(--text-muted)]">@{buzzerBalance.username}</span>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                      <Link
                        href="/tickets"
                        onClick={() => setShowProfile(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/5 transition-smooth"
                      >
                        <HelpCircle className="w-4 h-4" />
                        <span className="font-medium">Pusat Bantuan</span>
                      </Link>
                      <Link
                        href="/faq"
                        onClick={() => setShowProfile(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/5 transition-smooth"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span className="font-medium">Pertanyaan Umum (FAQ)</span>
                      </Link>
                      <button
                        onClick={() => { setShowProfile(false); handleLogout(); }}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/5 transition-smooth w-full text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="font-medium">Keluar</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-5 pt-6 pb-16">
        {/* Banner */}
        <BannerCarousel />

        {/* Info Bar - Redesigned to 2-column grid for better balance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          <div className="glass-card p-5 flex items-center gap-4 hover:border-[var(--accent)]/30 transition-smooth group">
            <div className="w-12 h-12 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] group-hover:scale-110 transition-smooth">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.15em] mb-1">Transaksi Berhasil</p>
              <h3 className="text-2xl font-black text-white leading-none">
                {stats.transactionCount.toLocaleString()}
              </h3>
            </div>
          </div>

          <div className="glass-card p-5 flex items-center gap-4 hover:border-amber-500/30 transition-smooth group">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-smooth">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.15em] mb-1">Jumlah Member</p>
              <h3 className="text-2xl font-black text-white leading-none">
                {stats.memberCount.toLocaleString()}
              </h3>
            </div>
          </div>
        </div>

        {/* Papan Informasi Terbaru */}
        <div className="glass-card mb-10 overflow-hidden border-none shadow-2xl shadow-black/20">
          <div className="bg-gradient-to-r from-[var(--accent)]/10 to-transparent p-4 flex items-center gap-3 border-b border-white/5">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/20 flex items-center justify-center text-[var(--accent)]">
              <Megaphone className="w-4 h-4 animate-bounce" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-widest">Informasi Terbaru</h3>
              <p className="text-[9px] text-[var(--text-muted)] font-medium">Pengumuman & Update Sistem dari Admin</p>
            </div>
          </div>
          <div className="p-5 space-y-4 max-h-[320px] overflow-y-auto custom-scrollbar">
            <div className="flex items-start gap-4 p-3 rounded-xl bg-[var(--accent)]/5 border border-[var(--accent)]/10 hover:bg-[var(--accent)]/10 transition-colors">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] mt-1.5 shrink-0 animate-pulse"></div>
              <div>
                <p className="text-xs text-white font-bold mb-1">Layanan SMM Panel Resmi Hadir! 🌐</p>
                <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                  Optimalkan media sosial Anda dengan layanan SMM terlengkap. Followers, Likes, Views, dan lainnya kini tersedia dengan harga termurah di tab SMM Panel!
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] mt-1.5 shrink-0"></div>
              <div>
                <p className="text-xs text-white font-bold mb-1">Update Sistem Pembayaran QRIS ✅</p>
                <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                  Kami baru saja meningkatkan performa sistem QRIS. Sekarang saldo deposit otomatis masuk ke akun Anda dalam hitungan detik setelah scan berhasil!
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></div>
              <div>
                <p className="text-xs text-white font-bold mb-1">Produk VPS NVMe Kembali Tersedia! 🚀</p>
                <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                  Stok VPS dengan SSD NVMe batch terbaru sudah tersedia. Nikmati kecepatan baca-tulis 5x lebih cepat untuk server Anda.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0"></div>
              <div>
                <p className="text-xs text-white font-bold mb-1">Minimal Deposit Kini Hanya Rp 10.000 💳</p>
                <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                  Mendengarkan masukan Anda, kami menurunkan batas minimal top-up saldo menjadi Rp 10.000 saja. Cek menu profil untuk melakukan top-up.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Home Tabs */}
        <div className="flex gap-4 mb-8 border-b border-[var(--border-color)]">
          <button
            onClick={() => setActiveHomeTab("market")}
            className={`pb-4 px-2 text-sm font-bold transition-all relative ${
              activeHomeTab === "market" ? "text-white" : "text-[var(--text-muted)] hover:text-white"
            }`}
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" /> Marketplace
            </div>
            {activeHomeTab === "market" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent)] rounded-full animate-in fade-in zoom-in duration-300"></div>
            )}
          </button>
          <button
            onClick={() => setActiveHomeTab("history")}
            className={`pb-4 px-2 text-sm font-bold transition-all relative ${
              activeHomeTab === "history" ? "text-white" : "text-[var(--text-muted)] hover:text-white"
            }`}
          >
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4" /> Riwayat Saya
            </div>
            {activeHomeTab === "history" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent)] rounded-full animate-in fade-in zoom-in duration-300"></div>
            )}
          </button>
          <button
            onClick={() => setActiveHomeTab("smm")}
            className={`pb-4 px-2 text-sm font-bold transition-all relative ${
              activeHomeTab === "smm" ? "text-white" : "text-[var(--text-muted)] hover:text-white"
            }`}
          >
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[var(--accent)]" /> Produk SMM
            </div>
            {activeHomeTab === "smm" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent)] rounded-full animate-in fade-in zoom-in duration-300"></div>
            )}
          </button>
        </div>

        {/* Tab Content */}
        {activeHomeTab === "market" ? (
          <>
            {/* Categories */}
            <section className="mb-8">
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {[
                  { name: "Semua", icon: <Globe className="w-4 h-4" /> },
                  { name: "Pterodactyl", icon: <Zap className="w-4 h-4" /> },
                  { name: "VPS", icon: <Cpu className="w-4 h-4" /> },
                  { name: "App Premium", icon: <Layout className="w-4 h-4" /> },
                  { name: "Bot & Script", icon: <Headphones className="w-4 h-4" /> },
                  { name: "Keamanan", icon: <ShieldCheck className="w-4 h-4" /> }
                ].map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => setActiveCategory(cat.name)}
                    className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-smooth ${
                      activeCategory === cat.name
                        ? "bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/20" 
                        : "bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-white hover:border-white/20"
                    }`}
                  >
                    {cat.icon}
                    {cat.name}
                  </button>
                ))}
              </div>
            </section>

            {/* Products Grid */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  {activeCategory === "Semua" ? "Produk Tersedia" : `Produk ${activeCategory}`}
                </h2>
                <span className="text-xs text-[var(--text-muted)] font-medium bg-[var(--bg-card)] px-3 py-1 rounded-full border border-[var(--border-color)]">
                  {products.filter(p => 
                    p.provider !== 'buzzerpanel' &&
                    (activeCategory === "Semua" || p.category === activeCategory) &&
                    (p.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  ).length} produk
                </span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {products
                  .filter(p => 
                    p.provider !== 'buzzerpanel' &&
                    (activeCategory === "Semua" || p.category === activeCategory) &&
                    (p.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  )
                  .map((product: any) => (
                    <ProductCard key={product.id} product={product} onBuy={() => handleBuy(product)} />
                  ))}
              </div>

              {products.length > 0 && products.filter(p => 
                (activeCategory === "Semua" || p.category === activeCategory) &&
                (p.name.toLowerCase().includes(searchQuery.toLowerCase()))
              ).length === 0 && (
                <div className="text-center py-20 bg-[var(--bg-card)] rounded-3xl border border-dashed border-[var(--border-color)]">
                  <Package className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3 opacity-20" />
                  <p className="text-[var(--text-muted)] text-sm">Tidak ada produk yang cocok dengan pencarian Anda.</p>
                </div>
              )}
              
              {products.length === 0 && (
                <div className="text-center py-20 bg-[var(--bg-card)] rounded-3xl border border-dashed border-[var(--border-color)]">
                  <Package className="w-10 h-10 text-[var(--accent)] mx-auto mb-3 opacity-50" />
                  <p className="text-[var(--text-muted)] text-sm">Memuat produk...</p>
                </div>
              )}
            </section>
          </>
        ) : activeHomeTab === "history" ? (
          /* User History Tab */
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-bold text-white mb-6">Riwayat Transaksi</h2>
            {userTransactions.length > 0 ? (
              <div className="space-y-4">
                {userTransactions.map((trx) => (
                  <div key={trx.id} className="glass-card p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        trx.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' : trx.status === 'pending' ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-500'
                      }`}>
                        <Receipt className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-bold text-white">{trx.productName}</h3>
                          {trx.deliveryType === 'auto' && trx.status === 'completed' && (
                            <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                              <Zap className="w-2.5 h-2.5" /> Auto
                            </span>
                          )}
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                            trx.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : trx.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}>
                            {trx.status === 'completed' ? 'Berhasil' : trx.status === 'pending' ? 'Menunggu' : 'Gagal'}
                          </span>
                        </div>
                        <p className="text-[10px] text-[var(--text-muted)] flex items-center gap-1.5 uppercase tracking-widest font-bold">
                          {trx.orderId} • <Clock className="w-3 h-3" /> {new Date(trx.createdAt).toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-white">Rp {trx.amount.toLocaleString('id-ID')}</p>
                      <p className="text-[10px] text-[var(--text-muted)] mb-2">{trx.paymentMethod || 'QRIS'}</p>
                      {trx.status === 'completed' && (
                        <button 
                          onClick={() => setSelectedTransaction(trx)}
                          className="text-[10px] font-bold text-[var(--accent)] hover:underline flex items-center gap-1 ml-auto"
                        >
                          View Detail <CheckCircle2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-[var(--bg-card)] rounded-3xl border border-dashed border-[var(--border-color)]">
                <Receipt className="w-10 h-10 text-[var(--accent)] mx-auto mb-3 opacity-30" />
                <p className="text-[var(--text-muted)] text-sm">Belum ada transaksi.</p>
              </div>
            )}
          </section>
        ) : activeHomeTab === "smm" ? (
          /* SMM Form Section */
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
             <div className="glass-card p-8 border-none shadow-2xl">
                <div className="flex items-center gap-4 mb-8">
                   <div className="w-12 h-12 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
                      <Zap className="w-6 h-6" />
                   </div>
                   <div>
                      <h2 className="text-xl font-bold text-white tracking-tight uppercase">Produk SMM</h2>
                      <p className="text-xs text-[var(--text-muted)]">Pesan layanan social media secara otomatis & instan.</p>
                   </div>
                </div>

                <div className="space-y-6">

                   {/* Category Selection */}
                   <div>
                      <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest block mb-2.5">Pilih Kategori</label>
                      <select 
                        value={smmCategory}
                        onChange={(e) => {
                          const cat = e.target.value;
                          setSmmCategory(cat);
                          setSmmService(null);
                          setSmmServices([]);
                          if (cat) {
                            setIsLoadingSmm(true);
                            fetch(`/api/smm/services?category=${encodeURIComponent(cat)}`)
                              .then(res => res.json())
                              .then(data => {
                                if (Array.isArray(data)) setSmmServices(data);
                                setIsLoadingSmm(false);
                              })
                              .catch(() => setIsLoadingSmm(false));
                          }
                        }}
                        className="w-full bg-[var(--bg-dark)] border border-[var(--border-color)] rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-[var(--accent)]/50 transition-smooth appearance-none select-custom"
                      >
                        <option value="">-- Pilih Kategori --</option>
                        {smmCategories.map(cat => (
                           <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                   </div>

                   {/* Service Selection */}
                   {smmCategory && (
                     <div className="animate-in fade-in slide-in-from-top-2">
                        <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest block mb-2.5">
                          {isLoadingSmm ? "Memuat Layanan..." : "Pilih Layanan"}
                        </label>
                        <select 
                          value={smmService?.id || ""}
                          onChange={(e) => {
                             const service = smmServices.find(p => p.id === e.target.value);
                             setSmmService(service);
                             setSmmQuantity(service?.min_qty || 100);
                          }}
                          disabled={isLoadingSmm}
                          className="w-full bg-[var(--bg-dark)] border border-[var(--border-color)] rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-[var(--accent)]/50 transition-smooth appearance-none select-custom disabled:opacity-50"
                        >
                          <option value="">{isLoadingSmm ? "Mohon tunggu..." : "-- Pilih Layanan --"}</option>
                          {smmServices.map(s => (
                             <option key={s.id} value={s.id}>{s.name} - Rp {(s.price/1000).toFixed(2)} /1k</option>
                          ))}
                        </select>
                     </div>
                   )}

                   {/* Target & Qty */}
                   {smmService && (
                      <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
                         <div className="p-4 bg-[var(--accent)]/5 border border-[var(--accent)]/10 rounded-2xl">
                            <p className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                               <AlertCircle className="w-3 h-3" /> Informasi Layanan
                            </p>
                            <p className="text-[11px] text-[var(--text-muted)] leading-relaxed italic">
                               {smmService.description || "Tidak ada catatan tambahan."}
                            </p>
                         </div>

                         <div>
                            <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest block mb-2.5">Target (Username / Link)</label>
                            <input 
                               type="text" 
                               placeholder="https://instagram.com/p/..."
                               value={smmTarget}
                               onChange={(e) => setSmmTarget(e.target.value)}
                               className="w-full bg-[var(--bg-dark)] border border-[var(--border-color)] rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-[var(--accent)]/50 transition-smooth"
                            />
                         </div>

                         <div>
                            <div className="flex justify-between items-center mb-2.5">
                               <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest block">Jumlah Pesanan</label>
                               <span className="text-[9px] font-bold text-[var(--text-muted)]">Min: {smmService.min_qty} - Max: {smmService.max_qty}</span>
                            </div>
                            <input 
                               type="number" 
                               value={smmQuantity}
                               onChange={(e) => setSmmQuantity(e.target.value === "" ? "" : Number(e.target.value))}
                               className="w-full bg-[var(--bg-dark)] border border-[var(--border-color)] rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-[var(--accent)]/50 transition-smooth"
                            />
                         </div>

                         <div className="pt-6 flex items-center justify-between border-t border-[var(--border-color)]">
                            <div>
                               <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">Total Pembayaran</p>
                               <h3 className="text-3xl font-black text-white tracking-tighter">
                                  Rp {Math.ceil((smmService.price / 1000) * (Number(smmQuantity) || 0)).toLocaleString('id-ID')}
                               </h3>
                            </div>
                            <button 
                               onClick={() => handleBuy(smmService)}
                               className="px-8 py-4 bg-[var(--accent)] text-white rounded-2xl font-bold text-sm shadow-xl shadow-[var(--accent)]/20 hover:scale-105 active:scale-95 transition-smooth"
                            >
                               Pesan Sekarang
                            </button>
                         </div>
                      </div>
                   )}
                </div>
             </div>
          </section>
        ) : null}
      </main>

      <Footer />

      {/* Payment Modal */}
      {paymentData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="glass-card w-full max-w-md overflow-hidden relative animate-in slide-in-from-bottom-4 duration-300">
            {/* Header */}
            <div className="p-5 border-b border-[var(--border-color)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
                  {paymentData.payment_method?.toLowerCase() === 'qris' ? <QrCode className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
                </div>
                <h3 className="font-bold text-white uppercase tracking-wider text-sm">Pembayaran</h3>
              </div>
              <button 
                onClick={() => setPaymentData(null)}
                className="p-1.5 rounded-lg hover:bg-white/5 text-[var(--text-muted)] hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="text-center mb-6">
                <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-1">Total Bayar</p>
                <h2 className="text-3xl font-black text-[var(--accent)]">
                  Rp {(paymentData.total_payment || paymentData.amount).toLocaleString('id-ID')}
                </h2>
                {paymentData.fee > 0 && (
                  <p className="text-[10px] text-[var(--text-muted)] mt-1">
                    Termasuk biaya layanan Rp {paymentData.fee.toLocaleString('id-ID')}
                  </p>
                )}
              </div>

              {/* QRIS / VA Section */}
              <div className="bg-[var(--bg-dark)] rounded-2xl p-6 border border-white/5 flex flex-col items-center">
                {paymentData.payment_method?.toLowerCase() === 'qris' ? (
                  <>
                    <div className="bg-white p-3 rounded-xl mb-4">
                      {/* Using QRServer API for QR Code display */}
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(paymentData.payment_number)}`} 
                        alt="QRIS Code"
                        className="w-48 h-48"
                      />
                    </div>
                    <p className="text-[10px] text-[var(--text-muted)] text-center uppercase tracking-widest">
                      Scan QRIS diatas menggunakan Dana, OVO, GoPay, LinkAja, atau Mobile Banking
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-xs text-[var(--text-muted)] mb-3">Nomor Virtual Account</p>
                    <div className="flex items-center gap-3 bg-white/5 px-4 py-3 rounded-xl border border-white/10 w-full justify-between">
                      <span className="text-xl font-mono font-bold text-white tracking-widest">
                        {paymentData.payment_number}
                      </span>
                      <button 
                        onClick={() => copyToClipboard(paymentData.payment_number)}
                        className="p-2 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white transition-all active:scale-90"
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-[10px] text-[var(--text-muted)] mt-3 text-center uppercase tracking-widest">
                      Metode: {paymentData.payment_method.replace('_va', '').toUpperCase()} VA
                    </p>
                  </>
                )}
              </div>

              {/* Details */}
              <div className="mt-6 space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--text-muted)]">Order ID</span>
                  <span className="text-white font-medium">{paymentData.order_id}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--text-muted)]">Kadaluarsa</span>
                  <span className="text-orange-400 font-medium flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> 60 Menit
                  </span>
                </div>
              </div>

              {/* Instructions */}
              <div className="mt-8">
                <button 
                  onClick={() => setPaymentData(null)}
                  className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-semibold text-white hover:bg-white/10 transition-colors"
                >
                  Tutup dan Cek Status Otomatis
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Claim Product Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="glass-card w-full max-w-sm overflow-hidden relative animate-in zoom-in-95 duration-300">
            <div className="p-5 border-b border-[var(--border-color)] flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Detail Pembelian
              </h3>
              <button 
                onClick={() => setSelectedTransaction(null)}
                className="p-1.5 rounded-lg hover:bg-white/5 text-[var(--text-muted)] hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <p className="text-xs text-[var(--text-muted)] mb-1">Nama Produk:</p>
                <p className="text-sm font-bold text-white">{selectedTransaction.productName}</p>
                <p className="text-[10px] text-[var(--text-muted)] mt-1">{selectedTransaction.orderId}</p>
              </div>

              <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-4 mb-6">
                {selectedTransaction.deliveredData ? (
                  <>
                    <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Zap className="w-3 h-3" /> Produk Dikirim Otomatis
                    </p>
                    <div className="bg-[var(--bg-dark)] border border-[var(--border-color)] rounded-xl p-3 relative group">
                      <pre className="text-[11px] text-white font-mono break-all whitespace-pre-wrap leading-relaxed">
                        {selectedTransaction.deliveredData}
                      </pre>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(selectedTransaction.deliveredData);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/5 border border-white/10 text-[var(--text-muted)] hover:text-white transition-colors"
                      >
                        {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                    <p className="text-[9px] text-[var(--text-muted)] mt-2 italic text-center">
                      *Klik ikon copy untuk menyalin detail akun/produk.
                    </p>
                  </>
                ) : selectedTransaction.deliveryType === 'auto_no_stock' ? (
                  <p className="text-xs text-white font-medium text-center py-2">
                    Stok otomatis sedang habis. Admin akan mengirim produk Anda secara manual. Silakan hubungi admin di bawah.
                  </p>
                ) : (
                  <p className="text-xs text-white font-medium mb-3 text-center">
                    Pembayaran Berhasil! Silakan hubungi admin untuk claim produk Anda.
                  </p>
                )}
 
               {selectedTransaction.smmTarget && (
                 <div className="space-y-4 mb-6 animate-in fade-in slide-in-from-top-2">
                   <div className="grid grid-cols-2 gap-3">
                     <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                       <p className="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-wider mb-1">Target</p>
                       <p className="text-xs font-bold text-white truncate">{selectedTransaction.smmTarget}</p>
                     </div>
                     <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                       <p className="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-wider mb-1">Jumlah</p>
                       <p className="text-xs font-bold text-white">{selectedTransaction.smmQty} Pesanan</p>
                     </div>
                   </div>
                   
                   <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[9px] text-blue-400 font-bold uppercase tracking-wider">Status Provider</p>
                        <span className="text-[10px] font-black text-white px-2 py-0.5 bg-blue-500/20 rounded">
                          {selectedTransaction.deliveredData && (() => {
                            try {
                              const d = JSON.parse(selectedTransaction.deliveredData);
                              return d.provider_status || d.status || "Processing";
                            } catch(e) { return "Processing"; }
                          })()}
                        </span>
                      </div>
                      <button 
                        onClick={() => handleCheckSmmStatus(selectedTransaction.id)}
                        disabled={isCheckingSmm}
                        className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        {isCheckingSmm ? (
                          <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                        ) : (
                          <Clock className="w-3 h-3" />
                        )}
                        Update Status Pesanan
                      </button>
                   </div>
                 </div>
               )}

                {(!selectedTransaction.deliveredData || selectedTransaction.deliveryType === 'auto_no_stock') && (
                  <div className="grid grid-cols-1 gap-2 mt-2">
                    <a 
                      href={`https://wa.me/${config.admin.whatsapp}`} 
                      target="_blank" 
                      className="flex items-center justify-center gap-2 py-2.5 bg-[#25D366] text-white rounded-xl text-xs font-bold hover:opacity-90 transition-opacity"
                    >
                      <Phone className="w-3.5 h-3.5" /> Claim via WhatsApp
                    </a>
                    <a 
                      href={`https://t.me/${config.admin.telegram}`} 
                      target="_blank" 
                      className="flex items-center justify-center gap-2 py-2.5 bg-[#0088cc] text-white rounded-xl text-xs font-bold hover:opacity-90 transition-opacity"
                    >
                      <Send className="w-3.5 h-3.5" /> Claim via Telegram
                    </a>
                  </div>
                )}
              </div>

              <button 
                onClick={() => setSelectedTransaction(null)}
                className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-semibold text-white hover:bg-white/10 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Confirmation Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="glass-card w-full max-w-md overflow-hidden relative animate-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="p-5 border-b border-[var(--border-color)] flex items-center justify-between">
              <h3 className="font-bold text-white text-sm uppercase tracking-widest">Konfirmasi Pesanan</h3>
              <button 
                onClick={() => setSelectedProduct(null)}
                className="p-1.5 rounded-lg hover:bg-white/5 text-[var(--text-muted)] hover:text-white transition-colors"
                disabled={isConfirmingPurchase}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] shrink-0 border border-[var(--accent)]/20">
                  <Package className="w-8 h-8" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-widest bg-[var(--accent)]/10 px-2 py-0.5 rounded mb-1 inline-block">
                    {selectedProduct.category}
                  </span>
                  <h4 className="text-lg font-bold text-white leading-tight mb-1">{selectedProduct.name}</h4>
                  <p className="text-2xl font-black text-white">Rp {selectedProduct.price.toLocaleString('id-ID')}</p>
                </div>
              </div>

              <div className="bg-[var(--bg-dark)]/50 rounded-2xl p-4 border border-[var(--border-color)] mb-6">
                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">Deskripsi Produk</p>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  {selectedProduct.description}
                </p>
              </div>

              {/* SMM Specific Fields */}
              {selectedProduct.provider === 'buzzerpanel' && (
                <div className="space-y-4 mb-6">
                  <div>
                    <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">Username / Link Target</p>
                    <input 
                      type="text" 
                      value={smmTarget}
                      onChange={(e) => setSmmTarget(e.target.value)}
                      placeholder="Contoh: https://instagram.com/user atau @username"
                      className="w-full bg-[var(--bg-dark)] border border-[var(--border-color)] rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-[var(--accent)]/50 transition-smooth"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                       <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Jumlah Pesanan</p>
                       <span className="text-[9px] text-[var(--text-muted)]">Min: {selectedProduct.min_qty} - Max: {selectedProduct.max_qty}</span>
                    </div>
                    <input 
                      type="number" 
                      value={smmQuantity}
                      onChange={(e) => {
                        const val = e.target.value === "" ? "" : Number(e.target.value);
                        setSmmQuantity(val);
                      }}
                      className="w-full bg-[var(--bg-dark)] border border-[var(--border-color)] rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-[var(--accent)]/50 transition-smooth"
                    />
                    <div className="mt-4 pt-4 flex justify-between items-center border-t border-[var(--border-color)]">
                      <span className="text-[10px] text-[var(--text-muted)] uppercase font-bold">Total Bayar:</span>
                      <span className="text-sm font-black text-[var(--accent)]">
                        Rp {Math.ceil((selectedProduct.price / 1000) * (Number(smmQuantity) || 0)).toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Method Selection */}
              <div className="mb-6">
                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3">Pilih Metode Pembayaran</p>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setPaymentMethod("qris")}
                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${
                      paymentMethod === "qris" 
                        ? "bg-[var(--accent)]/10 border-[var(--accent)] text-[var(--accent)]" 
                        : "bg-white/5 border-white/10 text-[var(--text-muted)] hover:border-white/20"
                    }`}
                  >
                    <QrCode className="w-5 h-5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">QRIS</span>
                  </button>
                  <button 
                    onClick={() => setPaymentMethod("balance")}
                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${
                      paymentMethod === "balance" 
                        ? "bg-emerald-500/10 border-emerald-500 text-emerald-500" 
                        : "bg-white/5 border-white/10 text-[var(--text-muted)] hover:border-white/20"
                    }`}
                  >
                    <Wallet className="w-5 h-5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Saldo</span>
                    <span className="text-[8px] opacity-70">Rp {(user.balance || 0).toLocaleString('id-ID')}</span>
                  </button>
                </div>
              </div>

              {(() => {
                const isSmm = selectedProduct.provider === 'buzzerpanel';
                const finalPrice = isSmm ? Math.ceil((selectedProduct.price / 1000) * (Number(smmQuantity) || 0)) : selectedProduct.price;
                
                if (paymentMethod === "balance" && Number(user.balance) < finalPrice) {
                  return (
                    <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
                      <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                      <p className="text-[10px] text-red-400 font-medium">Saldo Anda tidak cukup untuk melakukan pembelian ini.</p>
                    </div>
                  );
                }
                return null;
              })()}

              <button 
                onClick={confirmPurchase}
                disabled={isConfirmingPurchase}
                className="w-full py-4 bg-[var(--accent)] text-white rounded-2xl font-bold text-sm shadow-xl shadow-[var(--accent)]/20 hover:scale-[1.02] active:scale-95 transition-smooth disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
              >
                {isConfirmingPurchase ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    Memproses...
                  </>
                ) : (
                  <>Bayar Sekarang</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="glass-card w-full max-w-sm overflow-hidden relative animate-in zoom-in-95 duration-300">
            <div className="p-5 border-b border-[var(--border-color)] flex items-center justify-between">
              <h3 className="font-bold text-white text-sm uppercase tracking-widest flex items-center gap-2">
                <Wallet className="w-4 h-4 text-[var(--accent)]" /> Top Up Saldo
              </h3>
              <button 
                onClick={() => setShowDepositModal(false)}
                className="p-1.5 rounded-lg hover:bg-white/5 text-[var(--text-muted)] hover:text-white transition-colors"
                disabled={isConfirmingPurchase}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <label className="text-xs font-medium text-[var(--text-muted)] mb-2 block uppercase tracking-widest">Nominal Top Up (Rp)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 text-sm font-bold">Rp</span>
                  <input 
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="Contoh: 50000"
                    className="w-full bg-[var(--bg-dark)] border border-[var(--border-color)] rounded-xl py-3 pl-12 pr-4 text-white font-bold focus:outline-none focus:border-[var(--accent)]/50 transition-smooth"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2 mt-3">
                  {['10000', '25000', '50000', '100000', '250000', '500000'].map(amt => (
                    <button
                      key={amt}
                      onClick={() => setDepositAmount(amt)}
                      className="py-2 rounded-lg bg-white/5 border border-white/10 text-[10px] text-white font-bold hover:bg-[var(--accent)] hover:border-[var(--accent)] transition-all"
                    >
                      {Number(amt).toLocaleString('id-ID')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-[var(--bg-dark)]/50 border border-[var(--border-color)] rounded-xl mb-6">
                <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] shrink-0">
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-white uppercase tracking-widest">Metode Pembayaran</p>
                  <p className="text-[10px] text-[var(--text-muted)]">QRIS Otomatis</p>
                </div>
              </div>

              <button 
                onClick={handleDeposit}
                disabled={isConfirmingPurchase || !depositAmount}
                className="w-full py-4 bg-[var(--accent)] text-white rounded-2xl font-bold text-sm shadow-xl shadow-[var(--accent)]/20 hover:scale-[1.02] active:scale-95 transition-smooth disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
              >
                {isConfirmingPurchase ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>Buat Tagihan Top Up</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Chat Widget */}
      <div className="fixed bottom-6 right-6 z-[120]">
        {!isChatOpen ? (
          <button
            onClick={() => setIsChatOpen(true)}
            className="w-14 h-14 rounded-full bg-[var(--accent)] text-white shadow-xl shadow-[var(--accent)]/30 flex items-center justify-center hover:scale-110 transition-smooth active:scale-95 group relative"
          >
            <MessageCircle className="w-7 h-7" />
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-[var(--bg-dark)] rounded-full animate-bounce"></div>
          </button>
        ) : (
          <div className="w-[340px] glass-card overflow-hidden shadow-2xl animate-in slide-in-from-bottom-6 fade-in duration-300">
            {/* Header */}
            <div className="bg-[var(--accent)] p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white">
                  <Headset className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white leading-none mb-1">Customer Service</h4>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                    <span className="text-[10px] text-white/80 font-medium uppercase tracking-wider">Online Now</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsChatOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="p-5 bg-[var(--bg-card)]/30 h-[280px] overflow-y-auto space-y-4">
              <div className="flex gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-3 rounded-2xl rounded-tl-none text-xs text-white max-w-[85%]">
                  Halo! 👋 Selamat datang di {config.site.name}. Ada yang bisa kami bantu hari ini?
                </div>
              </div>
              <div className="flex gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] shrink-0 opacity-0"></div>
                <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-3 rounded-2xl rounded-tl-none text-xs text-white max-w-[85%]">
                  Ketik pesan Anda di bawah dan kirim untuk terhubung langsung dengan admin kami.
                </div>
              </div>
            </div>

            {/* Footer / Input */}
            <div className="p-4 bg-[var(--bg-card)] border-t border-[var(--border-color)]">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!chatMessage.trim()) return;
                  const url = `https://wa.me/${config.admin.whatsapp}?text=${encodeURIComponent(chatMessage)}`;
                  window.open(url, '_blank');
                  setChatMessage("");
                }}
                className="relative"
              >
                <input 
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Ketik pesan..."
                  className="w-full bg-[var(--bg-dark)] border border-[var(--border-color)] rounded-xl py-2.5 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-[var(--accent)]/50 transition-smooth"
                />
                <button 
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-[var(--accent)] text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-smooth"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

{/* Fake Notification Popup */}
function PurchaseNotification({ notification }: { notification: { user: string, product: string, visible: boolean } }) {
  if (!notification.visible) return null;

  return (
    <div className="fixed bottom-6 left-6 z-[100] animate-in slide-in-from-left-full fade-in duration-700 ease-out">
      <div className="glass-card p-3.5 pr-6 flex items-center gap-3.5 border-l-4 border-l-[var(--accent)] shadow-2xl shadow-black/50 overflow-hidden min-w-[280px]">
        <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] relative shrink-0">
          <ShoppingBag className="w-5 h-5" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center text-white border-2 border-[var(--bg-card)]">
            <CheckCircle2 className="w-2.5 h-2.5" />
          </div>
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-widest mb-0.5">Berhasil Membeli!</p>
          <p className="text-xs text-white leading-tight">
            <span className="font-black text-white">{notification.user}</span> 
            <span className="text-[var(--text-muted)] mx-1">baru saja membeli</span> 
            <span className="font-bold text-white">{notification.product}</span>
          </p>
          <div className="text-[9px] text-[var(--text-muted)] mt-1 flex items-center gap-1">
            <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
            Just now
          </div>
        </div>
      </div>
    </div>
  );
}
