"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, HelpCircle, ChevronDown, MessageCircle, Wallet, Zap, ShieldCheck, Clock, ShoppingBag } from "lucide-react";
import { config } from "@/lib/config";
import Footer from "@/components/Footer";

const FAQItem = ({ question, answer, isOpen, onToggle }: { question: string, answer: string, isOpen: boolean, onToggle: () => void }) => {
  return (
    <div className={`glass-card overflow-hidden transition-all duration-300 border ${isOpen ? 'border-[var(--accent)]/40 shadow-xl shadow-[var(--accent)]/5' : 'border-[var(--border-color)]'}`}>
      <button 
        onClick={onToggle}
        className="w-full p-5 flex items-center justify-between text-left transition-colors hover:bg-white/[0.02]"
      >
        <span className={`text-sm font-bold tracking-tight ${isOpen ? 'text-[var(--accent)]' : 'text-white'}`}>
          {question}
        </span>
        <ChevronDown className={`w-4 h-4 text-[var(--text-muted)] transition-transform duration-300 ${isOpen ? 'rotate-180 text-[var(--accent)]' : ''}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="p-5 pt-0 text-xs text-[var(--text-muted)] leading-relaxed border-t border-[var(--border-color)]/30">
          {answer}
        </div>
      </div>
    </div>
  );
};

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "Apa itu Vanness Store?",
      answer: "Vanness Store adalah platform penyedia layanan digital infrastruktur terpercaya yang menyediakan berbagai produk seperti VPS, Panel Pterodactyl, dan produk digital lainnya dengan harga kompetitif dan kualitas premium."
    },
    {
      question: "Bagaimana cara membeli produk?",
      answer: "Caranya sangat mudah: Pilih produk yang Anda inginkan di halaman utama, klik tombol 'Beli', pilih metode pembayaran (QRIS atau Saldo), lalu lakukan konfirmasi. Produk akan segera diproses setelah pembayaran berhasil."
    },
    {
      question: "Metode pembayaran apa saja yang tersedia?",
      answer: "Saat ini kami mendukung pembayaran otomatis via QRIS (mendukung semua E-Wallet & Mobile Banking) dan juga sistem Saldo/Deposit untuk transaksi yang lebih cepat."
    },
    {
      question: "Apa itu sistem Auto Delivery?",
      answer: "Auto Delivery adalah fitur pengiriman produk secara otomatis dan instan. Jika produk yang Anda beli mendukung Auto Delivery, Anda akan langsung menerima data produk (seperti akun atau lisensi) di riwayat transaksi sesaat setelah pembayaran berhasil tanpa menunggu admin."
    },
    {
        question: "Berapa lama proses pengiriman produk manual?",
        answer: "Untuk produk manual, admin kami akan memproses pesanan Anda dalam waktu maksimal 1x24 jam. Namun, biasanya pesanan selesai diproses dalam waktu kurang dari 1 jam pada jam kerja."
    },
    {
      question: "Bagaimana cara kerja sistem saldo/deposit?",
      answer: "Anda dapat mengisi saldo akun melalui menu 'Top Up Saldo'. Minimal deposit adalah Rp 10.000. Setelah memiliki saldo, Anda dapat membeli produk apa pun secara instan dengan memilih opsi 'Bayar pakai Saldo' saat checkout."
    },
    {
      question: "Apakah data saya aman di sini?",
      answer: "Kami sangat menjaga privasi dan keamanan data pengguna. Seluruh data transaksi dan informasi akun dilindungi dengan sistem enkripsi dan kami tidak akan pernah memberikan data Anda kepada pihak ketiga."
    },
    {
      question: "Bagaimana jika saya mengalami kendala?",
      answer: "Jika Anda mengalami kendala atau memiliki pertanyaan lebih lanjut, Anda dapat menghubungi Customer Service kami melalui widget Live Chat di pojok kanan bawah atau melalui sistem Tiket Bantuan di dashboard member."
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-dark)] flex flex-col pt-20 pb-20">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--accent)]/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[var(--accent)]/5 rounded-full blur-[120px]"></div>
      </div>

      <div className="max-w-3xl mx-auto px-5 w-full relative z-10">
        {/* Header Navigation */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[var(--text-muted)] hover:text-white hover:bg-white/10 transition-smooth mb-10 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-bold uppercase tracking-widest">Kembali ke Beranda</span>
        </Link>

        {/* Title Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-[var(--accent)] mb-6">
            <HelpCircle className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-black text-white mb-4 tracking-tight uppercase">
            Frequently Asked <span className="text-[var(--accent)]">Questions</span>
          </h1>
          <p className="text-[var(--text-muted)] text-sm max-w-lg mx-auto leading-relaxed">
            Punya pertanyaan? Temukan jawaban untuk masalah yang sering ditanyakan mengenai layanan, pembayaran, dan operasional kami.
          </p>
        </div>

        {/* FAQ Grid */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <FAQItem 
              key={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onToggle={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </div>

        {/* Help Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12">
          <div className="glass-card p-6 border border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4">
              <MessageCircle className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white mb-2">Masih bimbang?</h4>
            <p className="text-[11px] text-[var(--text-muted)] leading-relaxed mb-4">
              Hubungi layanan pelanggan kami melalui WhatsApp untuk respon yang lebih pribadi dan cepat.
            </p>
            <a 
              href={`https://wa.me/${config.admin.whatsapp}`}
              className="text-[10px] font-bold text-blue-400 uppercase tracking-widest hover:underline flex items-center gap-1.5"
            >
              Hubungi Kami <ChevronDown className="-rotate-90 w-3 h-3" />
            </a>
          </div>

          <div className="glass-card p-6 border border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white mb-2">Buka Tiket</h4>
            <p className="text-[11px] text-[var(--text-muted)] leading-relaxed mb-4">
              Untuk keluhan teknis, silakan buka tiket bantuan melalui dashboard Anda agar terpantau sistem.
            </p>
            <Link 
              href="/tickets"
              className="text-[10px] font-bold text-purple-400 uppercase tracking-widest hover:underline flex items-center gap-1.5"
            >
              Layanan Tiket <ChevronDown className="-rotate-90 w-3 h-3" />
            </Link>
          </div>
        </div>

      </div>
      <Footer />
    </div>
  );
}
