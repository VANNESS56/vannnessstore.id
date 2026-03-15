"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Terminal, Code2, Database, Key, CheckCircle2, Copy, Check, ChevronRight, Server, Zap, Globe } from "lucide-react";
import { config } from "@/lib/config";

// Komponen Card Endpoint
const ApiEndpoint = ({ 
  method, 
  path, 
  title, 
  description, 
  headers, 
  body, 
  response 
}: any) => {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedRes, setCopiedRes] = useState(false);
  const fullUrl = `https://vannessstore.id${path}`;

  const methodColors: any = {
    GET: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    POST: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    PUT: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    DELETE: "bg-red-500/10 text-red-400 border-red-500/20",
  };

  return (
    <div className="glass-card overflow-hidden mb-6 border border-[var(--border-color)]">
      {/* Header */}
      <div className="p-5 border-b border-[var(--border-color)] bg-white/[0.02]">
        <div className="flex items-center gap-3 mb-2">
          <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md border ${methodColors[method]}`}>
            {method}
          </span>
          <h3 className="text-sm font-bold text-white">{title}</h3>
        </div>
        <p className="text-xs text-[var(--text-muted)] line-clamp-2">{description}</p>
        
        {/* URL Display */}
        <div className="mt-4 flex items-center gap-2 bg-[var(--bg-dark)] border border-white/5 rounded-xl p-2 relative pr-10">
          <Globe className="w-3.5 h-3.5 text-[var(--text-muted)] ml-1 shrink-0" />
          <code className="text-[11px] text-white font-mono truncate">{fullUrl}</code>
          <button 
            onClick={() => {
              navigator.clipboard.writeText(fullUrl);
              setCopiedUrl(true);
              setTimeout(() => setCopiedUrl(false), 2000);
            }}
            className="absolute right-2 p-1.5 rounded-lg hover:bg-white/5 text-[var(--text-muted)] transition-colors"
          >
            {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-[var(--border-color)]">
        {/* Request Side */}
        <div className="p-5 space-y-5">
          {headers && headers.length > 0 && (
            <div>
              <h4 className="text-[10px] uppercase tracking-widest font-bold text-[var(--text-muted)] mb-3 flex items-center gap-2">
                <Key className="w-3 h-3" /> Headers
              </h4>
              <div className="space-y-2">
                {headers.map((h: any, i: number) => (
                  <div key={i} className="flex items-start justify-between gap-4 text-xs">
                    <code className="text-amber-400 font-mono bg-amber-400/10 px-1.5 py-0.5 rounded">{h.name}</code>
                    <span className="text-[var(--text-muted)] text-right">{h.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {body && (
            <div>
              <h4 className="text-[10px] uppercase tracking-widest font-bold text-[var(--text-muted)] mb-3 flex items-center gap-2">
                <Database className="w-3 h-3" /> Request Body
              </h4>
              <div className="bg-[var(--bg-dark)] rounded-xl border border-white/5 p-3 overflow-x-auto">
                <pre className="text-[11px] text-emerald-300 font-mono leading-relaxed">
                  {JSON.stringify(body, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Response Side */}
        <div className="p-5 bg-white/[0.01]">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-[10px] uppercase tracking-widest font-bold text-[var(--text-muted)] flex items-center gap-2">
              <Server className="w-3 h-3" /> Response (200 OK)
            </h4>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(response, null, 2));
                setCopiedRes(true);
                setTimeout(() => setCopiedRes(false), 2000);
              }}
              className="p-1 rounded hover:bg-white/5 text-[var(--text-muted)] transition-colors"
            >
              {copiedRes ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <div className="bg-[var(--bg-dark)] rounded-xl border border-white/5 p-3 overflow-x-auto h-[calc(100%-2rem)]">
            <pre className="text-[11px] text-blue-300 font-mono leading-relaxed">
              {JSON.stringify(response, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ApiDocs() {
  const [activeTab, setActiveTab] = useState("getting-started");

  const endpoints = [
    {
      id: "get-products",
      group: "Products",
      method: "GET",
      path: "/api/products",
      title: "Daftar Produk",
      description: "Mengambil semua daftar produk yang tersedia di toko, termasuk harga dan kategori.",
      response: [
        {
          "id": "prod_123",
          "name": "Alight Motion Pro",
          "description": "Unlock all premium features",
          "price": 15000,
          "category": "App Premium",
          "image": "https://example.com/image.png"
        }
      ]
    },
    {
      id: "check-transaction",
      group: "Transactions",
      method: "GET",
      path: "/api/user/transactions?username={username}",
      title: "Riwayat Transaksi User",
      description: "Melihat riwayat transaksi sukses/gagal dari seorang spesifik pengguna.",
      headers: [
        { name: "Authorization", desc: "Bearer Token (jika diperlukan di masa depan)" }
      ],
      response: [
        {
          "id": 1,
          "orderId": "INV1773401188845",
          "productName": "Alight Motion Pro",
          "amount": 15000,
          "status": "completed",
          "paymentMethod": "qris",
          "deliveredData": "email@yopmail.com",
          "deliveryType": "auto",
          "createdAt": "2026-03-13T11:26:28.000Z"
        }
      ]
    },
    {
      id: "create-payment",
      group: "Payments",
      method: "POST",
      path: "/api/payments/create",
      title: "Buat Invoice Pembayaran",
      description: "Membuat tagihan baru dan mengembalikan link pembayaran atau QRIS.",
      headers: [
        { name: "Content-Type", desc: "application/json" }
      ],
      body: {
        "productId": "prod_123",
        "amount": 15000,
        "customerName": "johndoe"
      },
      response: {
        "success": true,
        "payment": {
          "order_id": "INV123456789",
          "status": "pending",
          "payment_method": "qris",
          "qr_string": "00020101021126670014ID...",
          "total_payment": 15000,
          "productName": "Alight Motion Pro",
          "productId": "prod_123"
        }
      }
    },
    {
      id: "pay-balance",
      group: "Payments",
      method: "POST",
      path: "/api/payments/pay-balance",
      title: "Bayar dengan Saldo",
      description: "Melakukan pembelian produk menggunakan saldo akun user. Saldo akan otomatis terpotong.",
      headers: [
        { name: "Content-Type", desc: "application/json" }
      ],
      body: {
        "productId": "prod_123",
        "amount": 15000,
        "userId": "1773401188845"
      },
      response: {
        "success": true,
        "status": "completed",
        "deliveredData": "Detail Akun Digital / Serial Key",
        "deliveryType": "auto",
        "newBalance": 35000,
        "orderId": "INV-BAL-1773401188845"
      }
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-dark)] pb-20">
      {/* Navbar Minimalis */}
      <nav className="sticky top-0 z-50 bg-[var(--bg-dark)]/80 backdrop-blur-md border-b border-[var(--border-color)]">
        <div className="max-w-7xl mx-auto px-5 h-16 flex items-center gap-4">
          <Link href="/" className="p-2 rounded-xl bg-white/5 border border-white/10 text-[var(--text-muted)] hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white leading-none mb-1">Developer API</h1>
              <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-bold">Dokumentasi Integrasi</p>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-5 pt-8 grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Sidebar Navigation */}
        <div className="md:col-span-3 lg:col-span-2 space-y-6">
          <div>
            <h4 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3 px-3">Overview</h4>
            <div className="space-y-1">
              <button 
                onClick={() => setActiveTab('getting-started')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === 'getting-started' ? 'bg-[var(--accent)]/10 text-[var(--accent)]' : 'text-[var(--text-muted)] hover:bg-white/5 hover:text-white'
                }`}
              >
                <Code2 className="w-4 h-4" /> Getting Started
              </button>
              <button 
                onClick={() => setActiveTab('authentication')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === 'authentication' ? 'bg-[var(--accent)]/10 text-[var(--accent)]' : 'text-[var(--text-muted)] hover:bg-white/5 hover:text-white'
                }`}
              >
                <Key className="w-4 h-4" /> Authentication
              </button>
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3 px-3">Endpoints</h4>
            <div className="space-y-1">
              {endpoints.map(ep => (
                <button 
                  key={ep.id}
                  onClick={() => setActiveTab(ep.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    activeTab === ep.id ? 'bg-white/10 text-white' : 'text-[var(--text-muted)] hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {ep.title}
                  <ChevronRight className="w-3 h-3 opacity-50" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="md:col-span-9 lg:col-span-10">
          {activeTab === 'getting-started' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-8">
                <h2 className="text-2xl font-black text-white mb-2">Getting Started</h2>
                <p className="text-[var(--text-muted)] text-sm leading-relaxed">
                  Selamat datang di dokumentasi API {config.site.name}. API ini dirancang dengan arsitektur RESTful, 
                  memberikan Anda akses programatik ke data produk, pengguna, dan sistem transaksi otomatis toko kami.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="glass-card p-5 border border-[var(--border-color)]">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-4">
                    <Globe className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-2">Base URL</h3>
                  <code className="text-xs bg-[var(--bg-dark)] px-2 py-1 rounded text-[var(--text-muted)] block border border-white/5">
                    https://vannessstore.id
                  </code>
                </div>
                <div className="glass-card p-5 border border-[var(--border-color)]">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-4">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-2">Format</h3>
                  <p className="text-xs text-[var(--text-muted)]">Semua request dan response menggunakan format <code className="text-emerald-400">application/json</code>.</p>
                </div>
                <div className="glass-card p-5 border border-[var(--border-color)]">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 mb-4">
                    <Zap className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-2">Rate Limit</h3>
                  <p className="text-xs text-[var(--text-muted)]">Maksimal 60 request per menit per IP address.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'authentication' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-8">
                <h2 className="text-2xl font-black text-white mb-2">Authentication</h2>
                <p className="text-[var(--text-muted)] text-sm leading-relaxed mb-6">
                  Beberapa endpoint publik (seperti mengambil produk statis) tidak memerlukan autentikasi. 
                  Namun, endpoint yang berurusan dengan data spesifik pengguna atau aksi administratif mewajibkan autentikasi.
                </p>
                
                <div className="glass-card p-6 border border-[var(--border-color)] border-l-4 border-l-[var(--accent)]">
                  <h3 className="text-white font-bold mb-2">X-User-Id Header</h3>
                  <p className="text-sm text-[var(--text-muted)] mb-4">
                    Sistem saat ini menggunakan verifikasi sederhana berbasis User ID yang dikirimkan melalui header.
                  </p>
                  <pre className="bg-[var(--bg-dark)] p-4 rounded-xl text-xs text-white border border-white/5 overflow-x-auto">
                    <code>
<span className="text-pink-400">fetch</span>(<span className="text-amber-300">"https://vannessstore.id/api/admin/products"</span>, {'{'}
  <span className="text-blue-300">headers:</span> {'{'}
    <span className="text-amber-300">"Content-Type"</span>: <span className="text-emerald-300">"application/json"</span>,
    <span className="text-amber-300">"X-User-Id"</span>: <span className="text-emerald-300">"1773401188845"</span> <span className="text-gray-500">// Ganti dengan User ID Anda</span>
  {'}'}
{'}'})
                    </code>
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* Render Active Endpoint */}
          {endpoints.map(ep => (
            activeTab === ep.id && (
              <div key={ep.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-6">
                  <h2 className="text-2xl font-black text-white mb-2">Endpoint Details</h2>
                  <p className="text-[var(--text-muted)] text-sm">Referensi teknis untuk endpoint <strong className="text-white">{ep.title}</strong>.</p>
                </div>
                <ApiEndpoint {...ep} />
              </div>
            )
          ))}
        </div>
      </div>
    </div>
  );
}
