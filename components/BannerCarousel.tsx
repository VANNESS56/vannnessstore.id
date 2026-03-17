"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Zap, Server, Shield, ArrowRight } from "lucide-react";

const slides = [
  {
    title: "Panel Pterodactyl",
    desc: "Kelola server game dengan panel Pterodactyl. Performa tinggi, uptime 24/7.",
    cta: "Lihat Paket",
    icon: <Zap className="w-5 h-5" />,
  },
  {
    title: "Server VPS Premium",
    desc: "VPS dengan SSD NVMe dan dedicated resources untuk website & aplikasi Anda.",
    cta: "Mulai Sekarang",
    icon: <Server className="w-5 h-5" />,
  },
  {
    title: "Script & Bot Automasi",
    desc: "Koleksi bot WhatsApp, tools automasi, dan solusi digital siap pakai.",
    cta: "Eksplorasi",
    icon: <Shield className="w-5 h-5" />,
  },
];

export default function BannerCarousel() {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => setCurrent((c) => (c + 1) % slides.length), []);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + slides.length) % slides.length), []);

  useEffect(() => {
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [next]);

  const slide = slides[current];

  return (
    <section className="mb-8">
      <div className="relative overflow-hidden rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)]">
        <div className="p-8 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          {/* Content */}
          <div className="flex items-start gap-4 max-w-xl" key={current}>
            <div className="shrink-0 w-11 h-11 rounded-xl bg-[var(--accent)] flex items-center justify-center text-[var(--text-white)] mt-0.5">
              {slide.icon}
            </div>
            <div>
              <h2 className="text-xl font-bold text-[var(--text-white)] mb-1.5 animate-[fadeIn_0.4s_ease]">
                {slide.title}
              </h2>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed animate-[fadeIn_0.4s_0.05s_ease_both]">
                {slide.desc}
              </p>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3 shrink-0">
            <button className="px-5 py-2.5 bg-[var(--accent)] text-[var(--text-white)] rounded-xl text-sm font-semibold hover:bg-[var(--accent-light)] transition-smooth flex items-center gap-2">
              {slide.cta} <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex gap-1.5 ml-2">
              <button onClick={prev} className="w-9 h-9 rounded-lg border border-[var(--border-light)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-white)] hover:border-[var(--accent)] transition-smooth">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={next} className="w-9 h-9 rounded-lg border border-[var(--border-light)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-white)] hover:border-[var(--accent)] transition-smooth">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex gap-1.5 px-10 pb-5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1 rounded-full transition-all duration-300 ${i === current ? 'w-8 bg-[var(--accent)]' : 'w-4 bg-[var(--border-light)] hover:bg-[var(--text-muted)]'}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
