"use client";

import Link from "next/link";
import { config } from "@/lib/config";
import { 
  Instagram, 
  Send as Telegram, 
  Phone as WhatsApp, 
  ExternalLink, 
  ShieldCheck, 
  Server, 
  Zap, 
  ShoppingBag, 
  HelpCircle,
  Clock,
  Heart,
  Smartphone,
  Download
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-[var(--border-color)] bg-[var(--bg-dark)] pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-16">
          
          {/* Column 1: Brand & Desc */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-dark)] p-2 flex items-center justify-center shadow-lg shadow-[var(--shadow-color)]/20 group-hover:scale-105 transition-transform">
                <img src={config.site.logo} alt="Logo" className="w-full h-full object-contain" />
              </div>
              <span className="text-xl font-black text-[var(--text-white)] tracking-tighter uppercase">{config.site.name}</span>
            </Link>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed max-w-xs">
              Platform infrastruktur digital terdepan di Indonesia. Menyediakan layanan VPS, Panel Game, dan Lisensi Software dengan kualitas tier-1 dan dukungan teknis 24/7.
            </p>
            <div className="flex items-center gap-3">
              <a 
                href={`https://wa.me/${config.admin.whatsapp}`} 
                target="_blank" 
                className="w-9 h-9 rounded-lg bg-[var(--bg-hover)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] hover:text-emerald-400 hover:border-emerald-500/30 transition-smooth group"
                title="WhatsApp Support"
              >
                <WhatsApp className="w-4 h-4" />
              </a>
              <a 
                href={`https://t.me/${config.admin.telegram}`} 
                target="_blank" 
                className="w-9 h-9 rounded-lg bg-[var(--bg-hover)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] hover:text-blue-400 hover:border-blue-500/30 transition-smooth"
                title="Telegram Channel"
              >
                <Telegram className="w-4 h-4" />
              </a>
              <a 
                href={`https://instagram.com/${config.admin.instagram}`} 
                target="_blank" 
                className="w-9 h-9 rounded-lg bg-[var(--bg-hover)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] hover:text-pink-400 hover:border-pink-500/30 transition-smooth"
                title="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Navigation */}
          <div>
            <h4 className="text-xs font-bold text-[var(--text-white)] uppercase tracking-[0.2em] mb-6">Navigasi Utama</h4>
            <ul className="space-y-4">
              <li>
                <Link href="/" className="text-xs text-[var(--text-muted)] hover:text-[var(--accent)] flex items-center gap-2 transition-colors">
                  <ShoppingBag className="w-3.5 h-3.5" /> Marketplace
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-xs text-[var(--text-muted)] hover:text-[var(--accent)] flex items-center gap-2 transition-colors">
                  <HelpCircle className="w-3.5 h-3.5" /> Pertanyaan Umum (FAQ)
                </Link>
              </li>
              <li>
                <Link href="/tickets" className="text-xs text-[var(--text-muted)] hover:text-[var(--accent)] flex items-center gap-2 transition-colors">
                  <Zap className="w-3.5 h-3.5" /> Layanan Tiket Bantuan
                </Link>
              </li>
              <li>
                <Link href="/docs" className="text-xs text-[var(--text-muted)] hover:text-[var(--accent)] flex items-center gap-2 transition-colors">
                  <ExternalLink className="w-3.5 h-3.5" /> Dokumentasi API
                </Link>
              </li>
              <li>
                <button 
                  onClick={() => {
                    localStorage.removeItem("pwa-banner-dismissed");
                    window.location.reload();
                  }}
                  className="text-xs text-[var(--accent)] hover:text-[var(--accent-light)] flex items-center gap-2 transition-colors font-bold mt-2"
                >
                  <Smartphone className="w-3.5 h-3.5" /> Download App (PWA)
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal & Policy */}
          <div>
             <h4 className="text-xs font-bold text-[var(--text-white)] uppercase tracking-[0.2em] mb-6">Ketentuan Layanan</h4>
             <ul className="space-y-4">
               <li>
                 <Link href="/tos" className="text-xs text-[var(--text-muted)] hover:text-[var(--text-white)] flex items-center gap-2 transition-colors">
                   <ShieldCheck className="w-3.5 h-3.5 text-amber-500/70" /> Terms of Service
                 </Link>
               </li>
               <li>
                 <Link href="/privacy" className="text-xs text-[var(--text-muted)] hover:text-[var(--text-white)] flex items-center gap-2 transition-colors">
                   <Server className="w-3.5 h-3.5 text-blue-500/70" /> Privacy Policy
                 </Link>
               </li>
               <li>
                 <Link href="/refund" className="text-xs text-[var(--text-muted)] hover:text-[var(--text-white)] flex items-center gap-2 transition-colors">
                   <Clock className="w-3.5 h-3.5 text-red-500/70" /> Refund Policy
                 </Link>
               </li>
             </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[var(--border-color)] flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest">
            &copy; {currentYear} {config.site.name}. All Rights Reserved.
          </p>
          <div className="flex items-center gap-1 text-[10px] text-[var(--text-muted)]">
            Built with <Heart className="w-2.5 h-2.5 text-red-500 animate-bounce" /> for the Digital Community
          </div>
        </div>
      </div>
    </footer>
  );
}
