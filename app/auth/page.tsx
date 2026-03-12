"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, MessageCircle, LockKeyhole, ArrowRight, Package, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ username: "", password: "", whatsapp: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";

        try {
            const res = await fetch(endpoint, {
                method: "POST",
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Something went wrong");
            }

            if (isLogin) {
                localStorage.setItem("user", JSON.stringify(data.user));
                router.push("/");
            } else {
                setIsLogin(true);
                setError("Akun berhasil dibuat! Silakan login.");
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const isSuccess = error.includes("berhasil");

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-sm">
                {/* Brand */}
                <div className="mb-8 text-center flex flex-col items-center gap-3">
                    <img src="/icon.png" alt="Logo" className="w-12 h-12 rounded-xl object-contain shadow-lg" />
                    <span className="text-xl font-bold text-white tracking-tight">VANNESS STORE</span>
                </div>

                {/* Card */}
                <div className="glass-card p-6">
                    <div className="mb-6">
                        <h1 className="text-xl font-bold text-white mb-1">
                            {isLogin ? "Masuk" : "Buat Akun"}
                        </h1>
                        <p className="text-sm text-[var(--text-muted)]">
                            {isLogin ? "Masuk ke akun Anda untuk melanjutkan." : "Daftar untuk mengakses layanan kami."}
                        </p>
                    </div>

                    {/* Error/Success */}
                    {error && (
                        <div className={`flex items-center gap-2.5 p-3 rounded-xl mb-5 text-sm font-medium ${
                            isSuccess 
                                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                                : 'bg-red-500/10 border border-red-500/20 text-red-400'
                        }`}>
                            {isSuccess ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Username */}
                        <div>
                            <label className="text-xs font-medium text-[var(--text-muted)] mb-1.5 block">Username</label>
                            <div className="relative">
                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-[var(--bg-dark)] border border-[var(--border-color)] rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:border-[var(--accent)]/50 transition-smooth"
                                    placeholder="Masukkan username"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* WhatsApp (register only) */}
                        {!isLogin && (
                            <div>
                                <label className="text-xs font-medium text-[var(--text-muted)] mb-1.5 block">WhatsApp</label>
                                <div className="relative">
                                    <MessageCircle className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                                    <input
                                        type="tel"
                                        required
                                        className="w-full bg-[var(--bg-dark)] border border-[var(--border-color)] rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:border-[var(--accent)]/50 transition-smooth"
                                        placeholder="08xxxxxxxxxx"
                                        value={formData.whatsapp}
                                        onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Password */}
                        <div>
                            <label className="text-xs font-medium text-[var(--text-muted)] mb-1.5 block">Password</label>
                            <div className="relative">
                                <LockKeyhole className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="w-full bg-[var(--bg-dark)] border border-[var(--border-color)] rounded-xl py-2.5 pl-10 pr-10 text-sm text-white placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:border-[var(--accent)]/50 transition-smooth"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[var(--accent)] text-white py-3 rounded-xl font-semibold text-sm transition-smooth hover:bg-[var(--accent-light)] flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-1"
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    {isLogin ? "Masuk" : "Daftar"} <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Toggle */}
                    <div className="mt-5 text-center text-sm">
                        <span className="text-[var(--text-muted)]">
                            {isLogin ? "Belum punya akun? " : "Sudah punya akun? "}
                        </span>
                        <button
                            onClick={() => { setIsLogin(!isLogin); setError(""); }}
                            className="text-[var(--accent)] font-semibold hover:text-[var(--accent-light)] transition-colors"
                        >
                            {isLogin ? "Daftar" : "Masuk"}
                        </button>
                    </div>
                </div>

                <p className="text-center text-xs text-[var(--text-muted)]/50 mt-6">
                    © 2026 Vanness Store
                </p>
            </div>
        </div>
    );
}
