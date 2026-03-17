"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, User, Shield, Wallet, CheckCircle2, 
  Lock, Settings, Key, ChevronDown, ShieldCheck, 
  Smartphone, Bell, Phone, LogOut, Globe, Receipt,
  X, Send, Loader2
} from "lucide-react";
import { config } from "@/lib/config";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showPinForm, setShowPinForm] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [whatsappInput, setWhatsappInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/auth");
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/auth");
  };

  const handleConnectWhatsApp = () => {
    setWhatsappInput(user.whatsapp || "");
    setShowWhatsAppModal(true);
  };

  const submitWhatsApp = async () => {
    if (!whatsappInput.trim() || whatsappInput.length < 10) {
      alert("Masukkan nomor WhatsApp yang valid (minimal 10 digit).");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/me/whatsapp", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-User-Id": user.id
        },
        body: JSON.stringify({ whatsapp: whatsappInput }),
      });

      const data = await res.json();
      if (data.success) {
        const updatedUser = { ...user, whatsapp: data.user.whatsapp };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setShowWhatsAppModal(false);
      } else {
        alert(data.error || "Gagal menghubungkan WhatsApp.");
      }
    } catch (err) {
      alert("Terjadi kesalahan koneksi.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[var(--bg-dark)]">
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
                <User className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-white leading-none">Profil & Keamanan</h1>
                <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest">{config.site.name}</p>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-5 py-8 space-y-8">
        {/* Profile Header Card */}
        <div className="glass-card p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent)]/5 rounded-full -mr-32 -mt-32 blur-3xl transition-all group-hover:bg-[var(--accent)]/10"></div>
          
          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            <div className="relative">
              <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-[var(--accent)] to-emerald-600 p-1 shadow-2xl">
                <div className="w-full h-full rounded-[2.3rem] bg-[var(--bg-dark)] flex items-center justify-center text-[var(--accent)] overflow-hidden">
                  <User className="w-16 h-16" />
                </div>
              </div>
              <button className="absolute bottom-0 right-0 p-2.5 rounded-2xl bg-[var(--accent)] text-white shadow-lg hover:scale-110 active:scale-95 transition-all border-4 border-[var(--bg-card)]">
                <Settings className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                <h2 className="text-3xl font-black text-[var(--text-white)] tracking-tight">{user.username}</h2>
                <span className="px-3 py-1 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-[10px] font-bold text-[var(--accent)] uppercase tracking-widest">
                  {user.role} Account
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.2em] font-black mb-4 flex items-center justify-center md:justify-start gap-2">
                <Shield className="w-3 h-3" /> ID Member Resmi: {user.id}
              </p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <div className="bg-white/5 border border-white/5 px-4 py-2 rounded-xl flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-[var(--accent)]" />
                  <span className="text-xs font-bold text-[var(--text-white)]">Rp {(user.balance || 0).toLocaleString('id-ID')}</span>
                </div>
                <div className="bg-white/5 border border-white/5 px-4 py-2 rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-bold text-[var(--text-white)]">Verified Account</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Security Settings */}
          <div className="space-y-6">
            <h3 className="text-sm font-black text-[var(--text-white)] uppercase tracking-widest flex items-center gap-2 px-2">
              <Lock className="w-4 h-4 text-[var(--accent)]" /> Keamanan Akun
            </h3>
            
            <div className="glass-card p-6 space-y-4">
              {/* Change Password Section */}
              <div>
                <button 
                  onClick={() => setShowPasswordForm(!showPasswordForm)}
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-[var(--accent)]/30 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] group-hover:scale-110 transition-transform">
                      <Key className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-[var(--text-white)]">Kata Sandi</p>
                      <p className="text-[10px] text-[var(--text-muted)]">Perbarui kata sandi secara berkala</p>
                    </div>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-[var(--text-muted)] transition-transform ${showPasswordForm ? 'rotate-180' : ''}`} />
                </button>
                
                {showPasswordForm && (
                  <div className="mt-4 p-4 border border-white/5 rounded-2xl bg-black/20 space-y-3 animate-in slide-in-from-top-2">
                    <input 
                      type="password" 
                      placeholder="Kata Sandi Saat Ini"
                      className="w-full bg-[var(--bg-dark)] border border-white/5 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:border-[var(--accent)]/50"
                    />
                    <input 
                      type="password" 
                      placeholder="Kata Sandi Baru"
                      className="w-full bg-[var(--bg-dark)] border border-white/5 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:border-[var(--accent)]/50"
                    />
                    <button className="w-full py-2.5 bg-[var(--accent)] text-white rounded-xl text-xs font-bold shadow-lg shadow-[var(--accent)]/10 hover:opacity-90 transition-opacity">
                      Simpan Kata Sandi
                    </button>
                  </div>
                )}
              </div>

              {/* Transaction PIN Section */}
              <div>
                <button 
                  onClick={() => setShowPinForm(!showPinForm)}
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-[var(--accent)]/30 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] group-hover:scale-110 transition-transform">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-[var(--text-white)]">PIN Transaksi</p>
                      <p className="text-[10px] text-[var(--text-muted)]">Keamanan tambahan untuk pembayaran</p>
                    </div>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-[var(--text-muted)] transition-transform ${showPinForm ? 'rotate-180' : ''}`} />
                </button>
                
                {showPinForm && (
                  <div className="mt-4 p-4 border border-white/5 rounded-2xl bg-black/20 space-y-3 animate-in slide-in-from-top-2">
                    <p className="text-[10px] text-[var(--accent)] font-bold uppercase tracking-widest text-center mb-2">Setel 6 Digit PIN Baru</p>
                    <div className="flex justify-center gap-2">
                      {[1,2,3,4,5,6].map(i => (
                        <input key={i} type="password" maxLength={1} className="w-10 h-10 bg-[var(--bg-dark)] border border-white/10 rounded-lg text-center font-bold text-white focus:border-[var(--accent)]/50" />
                      ))}
                    </div>
                    <button className="w-full mt-4 py-2.5 bg-[var(--accent)] text-white rounded-xl text-xs font-bold shadow-lg shadow-[var(--accent)]/10 hover:opacity-90 transition-opacity">
                      Simpan PIN Baru
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Sessions / Activity */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Sesi Login Aktif</p>
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              </div>
              <div className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/10">
                <Smartphone className="w-5 h-5 text-[var(--text-muted)]" />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-[var(--text-white)] truncate">Chrome pada Windows 11</p>
                  <p className="text-[9px] text-[var(--text-muted)]">Sedang aktif sekarang • Indonesia</p>
                </div>
              </div>
            </div>
          </div>

          {/* Preferences & Misc */}
          <div className="space-y-6">
            <h3 className="text-sm font-black text-[var(--text-white)] uppercase tracking-widest flex items-center gap-2 px-2">
              <Settings className="w-4 h-4 text-[var(--accent)]" /> Preferensi & Data
            </h3>
            
            <div className="glass-card p-6 space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[var(--text-white)]">Notifikasi Push</p>
                    <p className="text-[10px] text-[var(--text-muted)]">Informasi promo & produk</p>
                  </div>
                </div>
                <div className="w-10 h-5 bg-[var(--accent)] rounded-full relative cursor-pointer shadow-inner">
                  <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[var(--text-white)]">
                      {user.whatsapp ? `WA: ${user.whatsapp}` : "Status WhatsApp"}
                    </p>
                    <p className="text-[10px] text-[var(--text-muted)]">
                      {user.whatsapp ? "Sudah terhubung dengan akun" : "Hubungkan nomor WA aktif"}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={handleConnectWhatsApp}
                  disabled={isLoading}
                  className="text-[10px] font-bold text-[var(--accent)] hover:underline uppercase disabled:opacity-50"
                >
                  {user.whatsapp ? "Ubah" : "Hubungkan"}
                </button>
              </div>
            </div>

          </div>
        </div>
      </main>

      <footer className="py-12 border-t border-[var(--border-color)]">
        <div className="max-w-5xl mx-auto px-5 text-center">
          <p className="text-xs text-[var(--text-muted)] font-medium">
            &copy; {new Date().getFullYear()} {config.site.name}. All rights reserved.
          </p>
        </div>
      </footer>

      {/* WhatsApp Modal */}
      {showWhatsAppModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="glass-card w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-5 border-b border-[var(--border-color)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <Phone className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white uppercase tracking-widest">Hubungkan WhatsApp</h3>
              </div>
              <button
                onClick={() => setShowWhatsAppModal(false)}
                className="p-1.5 rounded-lg hover:bg-white/5 text-[var(--text-muted)] hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">
                  Nomor WhatsApp Aktif
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={whatsappInput}
                    onChange={(e) => setWhatsappInput(e.target.value)}
                    placeholder="Contoh: 08123456789"
                    className="w-full bg-[var(--bg-dark)] border border-[var(--border-color)] rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-smooth"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <CheckCircle2 className={`w-4 h-4 transition-colors ${whatsappInput.length >= 10 ? 'text-emerald-500' : 'text-white/10'}`} />
                  </div>
                </div>
                <p className="text-[10px] text-[var(--text-muted)] leading-relaxed">
                  Gunakan format angka tanpa spasi atau karakter spesial (contoh: 08123456789 atau 628123456789).
                </p>
              </div>

              <button
                onClick={submitWhatsApp}
                disabled={isLoading || whatsappInput.length < 10}
                className="w-full py-3.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-500 transition-smooth disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Menyambungkan...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Hubungkan Sekarang
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
