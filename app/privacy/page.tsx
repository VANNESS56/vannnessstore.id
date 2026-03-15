"use client";

import Link from "next/link";
import { ArrowLeft, ShieldCheck, Eye, Lock, Globe } from "lucide-react";
import Footer from "@/components/Footer";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-dark)] flex flex-col pt-20">
      <div className="max-w-4xl mx-auto px-5 w-full pb-20">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[var(--text-muted)] hover:text-white hover:bg-white/10 transition-smooth mb-10 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-bold uppercase tracking-widest">Kembali</span>
        </Link>

        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-6">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-black text-white mb-4 tracking-tight uppercase">
            Privacy <span className="text-blue-400">Policy</span>
          </h1>
          <p className="text-[var(--text-muted)] text-sm max-w-lg mx-auto leading-relaxed">
            Bagaimana kami mengelola dan melindungi data pribadi Anda di Vanness Store.
          </p>
        </div>

        <div className="space-y-8">
          <section className="glass-card p-8 border-white/5">
            <div className="flex items-center gap-3 mb-4">
              <Eye className="w-5 h-5 text-[var(--accent)]" />
              <h2 className="text-lg font-bold text-white">1. Data yang Kami Kumpulkan</h2>
            </div>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-4">
              Kami mengumpulkan informasi minimal yang diperlukan untuk memproses layanan Anda:
            </p>
            <ul className="list-disc list-inside text-sm text-[var(--text-muted)] space-y-2 ml-4">
              <li>Informasi Akun (Username, Email, WhatsApp).</li>
              <li>Data Transaksi dan Riwayat Pembelian.</li>
              <li>Log Aktivitas Teknis (untuk troubleshooting server).</li>
            </ul>
          </section>

          <section className="glass-card p-8 border-white/5">
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-white">2. Penggunaan Informasi</h2>
            </div>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              Data Anda hanya digunakan untuk kepentingan verifikasi pembayaran, pengiriman layanan otomatis, dan komunikasi dukungan pelanggan. Kami menjamin bahwa kami **tidak akan pernah** menjual atau memberikan data pribadi Anda kepada pihak ketiga untuk kepentingan iklan atau lainnya.
            </p>
          </section>

          <section className="glass-card p-8 border-white/5">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-bold text-white">3. Keamanan Data</h2>
            </div>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              Kami menggunakan enkripsi SSL/TLS pada situs kami dan menyimpan password Anda menggunakan algoritma hashing yang aman. Namun, perlu diingat bahwa tidak ada metode transmisi data melalui internet yang 100% aman, meskipun kami berupaya semaksimal mungkin melindunginya.
            </p>
          </section>

          <section className="glass-card p-8 border-white/5">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-bold text-white">4. Cookies</h2>
            </div>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              Situs kami menggunakan cookies hanya untuk menyimpan sesi login Anda (agar Anda tidak perlu login berulang kali) dan untuk menyimpan preferensi tampilan web Anda.
            </p>
          </section>
        </div>

        <div className="mt-12 p-6 rounded-2xl bg-blue-500/5 border border-blue-500/10 text-center">
            <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">
                Data Anda adalah privasi Anda. Kami ada untuk melayani, bukan mengawasi.
            </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
