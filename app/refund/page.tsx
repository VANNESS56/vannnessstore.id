"use client";

import Link from "next/link";
import { ArrowLeft, Clock, AlertCircle, CheckCircle2, RefreshCcw } from "lucide-react";
import Footer from "@/components/Footer";

export default function RefundPage() {
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
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-red-500/10 border border-red-500/20 text-red-500 mb-6">
            <RefreshCcw className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-black text-white mb-4 tracking-tight uppercase">
            Refund <span className="text-red-500">Policy</span>
          </h1>
          <p className="text-[var(--text-muted)] text-sm max-w-lg mx-auto leading-relaxed">
            Kebijakan pengembalian dana dan saldo di Vanness Store.
          </p>
        </div>

        <div className="space-y-8">
          <section className="glass-card p-8 border-white/5">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <h2 className="text-lg font-bold text-white">1. Kondisi Umum</h2>
            </div>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              Karena sifat layanan kami yang merupakan produk digital instan (VPS, Panel, Kode), secara umum kami tidak melayani pengembalian dana (*No Refund*) setelah produk berhasil dikirimkan atau saldo berhasil ditambahkan ke akun Anda.
            </p>
          </section>

          <section className="glass-card p-8 border-white/5">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-white">2. Pengecualian Refund</h2>
            </div>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-4">
              Refund atau pengembalian saldo hanya dapat dilakukan jika:
            </p>
            <ul className="list-disc list-inside text-sm text-[var(--text-muted)] space-y-2 ml-4">
              <li>Stok produk habis namun pembayaran sudah berhasil dilakukan.</li>
              <li>Terjadi gangguan teknis pada sistem kami yang menyebabkan layanan tidak dapat diaktifkan dalam waktu 3x24 jam.</li>
              <li>Terdapat kesalahan pencatatan nominal deposit akibat gangguan gateway pembayaran.</li>
            </ul>
          </section>

          <section className="glass-card p-8 border-white/5">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-bold text-white">3. Proses Pengajuan</h2>
            </div>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              Untuk mengajukan keluhan terkait pembayaran atau permintaan refund (pada poin pengecualian), pengguna diwajibkan menyertakan bukti transfer dan ID Transaksi melalui sistem **Tiket Bantuan** atau WhatsApp Admin. Proses peninjauan klaim memakan waktu maksimal 2x24 jam.
            </p>
          </section>
        </div>

        <div className="mt-12 p-6 rounded-2xl bg-red-500/5 border border-red-500/10 text-center">
            <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest leading-relaxed">
                PENTING: Melakukan chargeback ilegal atau sengketa pembayaran tanpa konfirmasi akan menyebabkan akun Anda dinonaktifkan secara permanen.
            </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
