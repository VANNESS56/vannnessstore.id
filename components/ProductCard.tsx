"use client";

import { Layout, Package, Cpu, ShoppingCart } from "lucide-react";

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
}

export default function ProductCard({ product, onBuy }: { product: Product, onBuy: (id: string) => void }) {
    const getIcon = (category: string) => {
        switch (category.toLowerCase()) {
            case 'vps': return <Cpu className="w-4 h-4" />;
            case 'panel': case 'pterodactyl': return <Layout className="w-4 h-4" />;
            default: return <Package className="w-4 h-4" />;
        }
    };

    return (
        <div className="glass-card flex flex-col h-full group">
            <div className="p-5 flex flex-col flex-grow">
                {/* Category */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-[var(--text-muted)]">
                        <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
                            {getIcon(product.category)}
                        </div>
                        <span className="text-xs font-medium">{product.category}</span>
                    </div>
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                </div>

                {/* Info */}
                <h3 className="text-[15px] font-semibold text-white mb-1.5 group-hover:text-[var(--accent)] transition-colors">
                    {product.name}
                </h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-5 flex-grow line-clamp-2">
                    {product.description}
                </p>

                {/* Price & Buy */}
                <div className="flex items-end justify-between pt-4 border-t border-[var(--border-color)]">
                    <div>
                        <span className="text-[10px] text-[var(--text-muted)] block mb-0.5">Harga</span>
                        <span className="text-lg font-bold text-white">
                            Rp {product.price.toLocaleString('id-ID')}
                        </span>
                    </div>
                    <button
                        onClick={(e) => { e.stopPropagation(); onBuy(product.id); }}
                        className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-[var(--accent-light)] transition-smooth active:scale-95"
                    >
                        <ShoppingCart className="w-3.5 h-3.5" /> Beli
                    </button>
                </div>
            </div>
        </div>
    );
}
