"use client";

import Link from "next/link";
import { ArrowLeft, Gavel, ShieldCheck, UserCheck, AlertTriangle } from "lucide-react";
import Footer from "@/components/Footer";

export default function TOSPage() {
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
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-500 mb-6">
            <Gavel className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-black text-white mb-4 tracking-tight uppercase">
            Terms of <span className="text-amber-500">Service</span>
          </h1>
          <p className="text-[var(--text-muted)] text-sm max-w-lg mx-auto leading-relaxed">
            Peraturan dan ketentuan penggunaan layanan di Vanness Store. Mohon baca dengan seksama.
          </p>
        </div>

        <div className="space-y-8">
          <section className="glass-card p-8 border-white/5">
            <div className="flex items-center gap-3 mb-4">
              <UserCheck className="w-5 h-5 text-[var(--accent)]" />
              <h2 className="text-lg font-bold text-white">1. Akun Pengguna</h2>
            </div>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              Pengguna bertanggung jawab penuh atas keamanan akun dan password mereka. Segala aktivitas yang terjadi di bawah akun pengguna adalah tanggung jawab pemilik akun. Kami berhak menangguhkan akun yang terindikasi melakukan pelanggaran atau penipuan.
            </p>
          </section>

          <section className="glass-card p-8 border-white/5">
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-bold text-white">2. Penggunaan Layanan</h2>
            </div>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-4">
              Layanan infrastruktur (VPS/Panel) tidak diperbolehkan digunakan untuk kegiatan ilegal, termasuk namun tidak terbatas pada:
            </p>
            <ul className="list-disc list-inside text-sm text-[var(--text-muted)] space-y-2 ml-4">
              <li>Serangan DDoS atau aktivitas hacking lainnya.</li>
              <li>Penyebaran konten pornografi atau judi online.</li>
              <li>Aktivitas mining cryptocurrency tanpa izin khusus.</li>
              <li>Pelanggaran hak kekayaan intelektual (Copyright).</li>
            </ul>
          </section>

          <section className="glass-card p-8 border-white/5">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <h2 className="text-lg font-bold text-white">3. Kebijakan Pembayaran</h2>
            </div>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              Seluruh transaksi yang telah berhasil dilakukan tidak dapat dibatalkan atau dikembalikan saldo-nya, kecuali terdapat kegagalan sistem pada sisi Vanness Store yang menyebabkan layanan tidak dapat diaktifkan. Pastikan nominal dan produk yang dipilih sudah benar sebelum melakukan pembayaran.
            </p>
          </section>

          <section className="glass-card p-8 border-white/5">
            <div className="flex items-center gap-3 mb-4">
              <Gavel className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-bold text-white">4. Perubahan Ketentuan</h2>
            </div>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              Vanness Store berhak untuk mengubah Syarat & Ketentuan ini sewaktu-waktu tanpa pemberitahuan sebelumnya. Pengguna disarankan untuk memeriksa halaman ini secara berkala untuk tetap mendapatkan informasi terbaru.
            </p>
          </section>
        </div>

        <div className="mt-12 p-6 rounded-2xl bg-amber-500/5 border border-amber-500/10 text-center">
            <p className="text-xs text-amber-500/80 font-medium italic">
                Dengan menggunakan layanan kami, Anda dianggap telah menyetujui seluruh butir Syarat & Ketentuan di atas tanpa paksaan.
            </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
