import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { config } from '@/lib/config';
import { isAdmin, unauthorizedResponse } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        if (!await isAdmin(request)) return unauthorizedResponse();

        const { margin } = await request.json();
        const profitMargin = margin ? (Number(margin) / 100) + 1 : 1.15;

        // Fetch services from Buzzerpanel
        const response = await fetch(config.buzzerpanel.apiBaseUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                api_key: config.buzzerpanel.apiKey,
                secret_key: config.buzzerpanel.secretKey,
                action: 'services'
            })
        });

        const result = await response.json();

        if (!result.status) {
            return NextResponse.json({ error: result.data?.msg || 'Gagal mengambil data dari Buzzerpanel' }, { status: 500 });
        }

        const services = result.data;
        const productsToUpsert = services.map((s: any) => ({
            id: `smm_${s.id}`,
            name: s.name,
            description: s.note || `Layanan SMM untuk ${s.category}`,
            price: Math.ceil(s.price * profitMargin),
            category: s.category,
            image: "https://files.catbox.moe/k8yobw.png",
            smm_service_id: s.id.toString(),
            provider: 'buzzerpanel',
            min_qty: s.min,
            max_qty: s.max,
            updated_at: new Date().toISOString()
        }));

        // Chunking for Supabase limits (approx 50-100 items per request is safe)
        const chunkSize = 100;
        let successCount = 0;
        
        for (let i = 0; i < productsToUpsert.length; i += chunkSize) {
            const chunk = productsToUpsert.slice(i, i + chunkSize);
            const { error } = await supabase.from('products').upsert(chunk);
            if (!error) successCount += chunk.length;
        }

        return NextResponse.json({ 
            success: true, 
            message: `Berhasil sinkronisasi ${successCount} layanan dengan margin ${((profitMargin - 1) * 100).toFixed(0)}%.` 
        });

    } catch (error: any) {
        console.error('SMM Sync API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
