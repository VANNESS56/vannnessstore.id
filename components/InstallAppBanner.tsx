"use client";

import { useState, useEffect } from "react";
import { Download, X, Smartphone, Wifi, Zap, RefreshCw, ChevronRight, Share2, MoreVertical } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallAppBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    // Check if dismissed recently
    const dismissed = localStorage.getItem("pwa-banner-dismissed");
    if (dismissed) {
      const dismissedAt = parseInt(dismissed);
      const hoursSince = (Date.now() - dismissedAt) / (1000 * 60 * 60);
      if (hoursSince < 24) return; // Don't show for 24 hours after dismissal
    }

    // Detect iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    // Listen for install prompt (Android/Desktop Chrome)
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // If iOS, show banner after delay
    if (isIOSDevice) {
      setTimeout(() => setShowBanner(true), 3000);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      setIsInstalled(true);
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem("pwa-banner-dismissed", Date.now().toString());
  };

  if (isInstalled || !showBanner) return null;

  // iOS Guide Modal
  if (isIOS && showIOSGuide) {
    return (
      <div className="fixed inset-0 z-[200] flex items-end justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="glass-card w-full max-w-sm overflow-hidden animate-in slide-in-from-bottom duration-500 mb-4">
          <div className="p-5 border-b border-[var(--border-color)] flex items-center justify-between">
            <h3 className="text-sm font-bold text-[var(--text-white)] flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-[var(--accent)]" /> Cara Install di iPhone
            </h3>
            <button onClick={() => setShowIOSGuide(false)} className="p-1 text-[var(--text-muted)] hover:text-[var(--text-white)]">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] shrink-0 text-sm font-black">1</div>
              <div>
                <p className="text-xs font-bold text-[var(--text-white)]">Ketuk tombol Share</p>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5 flex items-center gap-1">
                  Ketuk ikon <Share2 className="w-3 h-3 inline" /> di bawah layar Safari
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] shrink-0 text-sm font-black">2</div>
              <div>
                <p className="text-xs font-bold text-[var(--text-white)]">Scroll ke bawah & pilih</p>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5">"Add to Home Screen" / "Tambahkan ke Layar Utama"</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] shrink-0 text-sm font-black">3</div>
              <div>
                <p className="text-xs font-bold text-[var(--text-white)]">Ketuk "Add" / "Tambah"</p>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Aplikasi akan muncul di Home Screen Anda!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-[90] animate-in slide-in-from-bottom fade-in duration-700 md:left-auto md:right-6 md:max-w-sm">
      <div className="glass-card overflow-hidden shadow-2xl shadow-black/30 border-[var(--accent)]/20">
        {/* Gradient accent line */}
        <div className="h-1 bg-gradient-to-r from-[var(--accent)] via-emerald-400 to-[var(--accent)]"></div>
        
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-dark)] flex items-center justify-center text-white shrink-0 shadow-lg shadow-[var(--accent)]/30">
              <Download className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-[var(--text-white)] leading-tight">Install Aplikasi</h4>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Akses lebih cepat tanpa buka browser</p>
            </div>
            <button 
              onClick={handleDismiss}
              className="p-1 text-[var(--text-muted)] hover:text-[var(--text-white)] transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Features */}
          <div className="flex items-center gap-4 mt-3 mb-4">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-amber-400" />
              <span className="text-[10px] text-[var(--text-muted)] font-medium">Cepat</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Wifi className="w-3 h-3 text-emerald-400" />
              <span className="text-[10px] text-[var(--text-muted)] font-medium">Offline</span>
            </div>
            <div className="flex items-center gap-1.5">
              <RefreshCw className="w-3 h-3 text-blue-400" />
              <span className="text-[10px] text-[var(--text-muted)] font-medium">Auto Update</span>
            </div>
          </div>

          {/* Install Button */}
          {isIOS ? (
            <button
              onClick={() => setShowIOSGuide(true)}
              className="w-full py-2.5 bg-[var(--accent)] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-[var(--accent-light)] transition-smooth active:scale-[0.98] shadow-lg shadow-[var(--accent)]/20"
            >
              <Smartphone className="w-3.5 h-3.5" /> Cara Install di iPhone
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleInstall}
              className="w-full py-2.5 bg-[var(--accent)] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-[var(--accent-light)] transition-smooth active:scale-[0.98] shadow-lg shadow-[var(--accent)]/20"
            >
              <Download className="w-3.5 h-3.5" /> Install Sekarang
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
