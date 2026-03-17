import { Layout, Package, Cpu, ShoppingCart, Tv, ShieldCheck, Zap, Crown, CheckCircle2 } from "lucide-react";

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    image?: string;
}

export default function ProductCard({ product, onBuy }: { product: Product, onBuy: (id: string) => void }) {
    const isPremium = ["app premium", "vps", "server vps", "script", "keamanan", "security"].includes(product.category.toLowerCase());

    const getIcon = (category: string) => {
        const cat = category.toLowerCase();
        if (cat.includes('vps') || cat.includes('server')) return <Cpu className="w-5 h-5" />;
        if (cat.includes('panel') || cat.includes('pterodactyl')) return <Layout className="w-5 h-5" />;
        if (cat.includes('app') || cat.includes('premium') || cat.includes('netflix') || cat.includes('youtube')) return <Tv className="w-5 h-5" />;
        if (cat.includes('security') || cat.includes('keamanan')) return <ShieldCheck className="w-5 h-5" />;
        if (cat.includes('script')) return <Crown className="w-5 h-5" />;
        return <Package className="w-5 h-5" />;
    };

    const getColor = (category: string) => {
        const cat = category.toLowerCase();
        if (cat.includes('vps')) return "text-indigo-400 bg-indigo-500/10 border-indigo-500/20";
        if (cat.includes('app') || cat.includes('premium')) return "text-pink-400 bg-pink-500/10 border-pink-500/20";
        if (cat.includes('security')) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
        if (cat.includes('script')) return "text-amber-400 bg-amber-500/10 border-amber-500/20";
        return "text-[var(--accent)] bg-[var(--accent)]/10 border-[var(--accent)]/20";
    };

    if (isPremium) {
        return (
            <div className="relative group perspective-1000 h-full">
                {/* Glow Effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[var(--accent)] to-indigo-500 rounded-3xl blur opacity-0 group-hover:opacity-30 transition-all duration-500"></div>
                
                <div className="relative glass-card flex flex-col h-full overflow-hidden border border-white/5 group-hover:border-[var(--accent)]/30 transition-all duration-500 bg-gradient-to-b from-white/[0.03] to-transparent">
                    {/* Top Section / Image Placeholder */}
                    <div className="h-24 relative overflow-hidden flex items-center justify-center bg-gradient-to-br from-[var(--bg-dark)] to-transparent">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${getColor(product.category)} border shadow-xl relative z-10 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                            {getIcon(product.category)}
                        </div>
                        {/* Shimmer line */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none"></div>
                        
                        {/* Premium Badge */}
                        <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/30 flex items-center gap-1">
                            <Crown className="w-2.5 h-2.5 text-amber-500" />
                            <span className="text-[8px] font-black uppercase tracking-widest text-amber-500">Premium</span>
                        </div>
                    </div>

                    <div className="p-5 flex flex-col flex-grow relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getColor(product.category)}`}>
                                {product.category}
                            </span>
                            <div className="flex items-center gap-1 text-emerald-400 text-[9px] font-bold uppercase">
                                <CheckCircle2 className="w-2.5 h-2.5" /> Ready
                            </div>
                        </div>

                        <h3 className="text-sm font-black text-[var(--text-white)] mb-1.5 leading-tight group-hover:text-[var(--accent)] transition-colors">
                            {product.name}
                        </h3>
                        
                        <p className="text-[11px] text-[var(--text-muted)] leading-relaxed mb-6 line-clamp-3">
                            {product.description}
                        </p>

                        <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                            <div>
                                <span className="text-[9px] text-[var(--text-muted)] block font-bold uppercase tracking-wider opacity-60">Harga</span>
                                <span className="text-base font-black text-[var(--text-white)] group-hover:text-[var(--accent)] transition-colors">
                                    Rp {product.price.toLocaleString('id-ID')}
                                </span>
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); onBuy(product.id); }}
                                className="w-10 h-10 rounded-xl bg-[var(--accent)] text-[var(--text-white)] flex items-center justify-center hover:scale-110 active:scale-90 transition-all shadow-lg shadow-[var(--accent)]/20 group-hover:shadow-[var(--accent)]/40 overflow-hidden relative"
                            >
                                <ShoppingCart className="w-4 h-4 relative z-10" />
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    {/* Default / Basic Model */}
    return (
        <div className="glass-card flex flex-col h-full group border border-white/5 hover:border-[var(--accent)]/20 transition-all duration-300">
            <div className="p-5 flex flex-col flex-grow">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-[var(--text-muted)]">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${getColor(product.category)}`}>
                            {getIcon(product.category)}
                        </div>
                        <span className="text-[11px] font-bold uppercase tracking-wider">{product.category}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    </div>
                </div>

                <h3 className="text-sm font-bold text-[var(--text-white)] mb-2 group-hover:text-[var(--accent)] transition-colors line-clamp-2 leading-snug">
                    {product.name}
                </h3>
                <p className="text-[11px] text-[var(--text-muted)] leading-relaxed mb-5 flex-grow line-clamp-2 opacity-80">
                    {product.description}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div>
                        <span className="text-lg font-black text-[var(--text-white)]">
                            Rp {product.price.toLocaleString('id-ID')}
                        </span>
                    </div>
                    <button
                        onClick={(e) => { e.stopPropagation(); onBuy(product.id); }}
                        className="w-9 h-9 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center hover:bg-[var(--accent)] hover:text-white transition-all active:scale-90 border border-[var(--accent)]/20"
                    >
                        <ShoppingCart className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
