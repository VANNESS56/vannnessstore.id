import { NextResponse } from 'next/server';
import { config } from '@/lib/config';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        const { productId, amount, customerName } = await request.json();
        const { slug, apiKey, apiBaseUrl, paymentBaseUrl, defaultMethod } = config.pakasir;

        if (!slug || slug === "your-slug") {
            return NextResponse.json({ error: 'Pakasir Slug belum dikonfigurasi.' }, { status: 400 });
        }

        const orderId = `INV${Date.now()}`;
        const cleanSlug = slug.trim().replace(/\s+/g, '-');

        // Cari nama produk dari Supabase
        const { data: product } = await supabase
            .from('products')
            .select('name')
            .eq('id', productId)
            .single();

        const productName = product?.name || 'Unknown Product';

        // Simpan transaksi ke Supabase
        const transaction = {
            id: `trx_${Date.now()}`,
            order_id: orderId,
            product_id: productId,
            product_name: productName,
            customer_name: customerName || 'Unknown',
            amount: Number(amount),
            status: 'pending',
            payment_method: defaultMethod,
            created_at: new Date().toISOString()
        };

        const { error: txError } = await supabase.from('transactions').insert([transaction]);
        if (txError) throw txError;

        /**
         * Integrasi Via API (C.2)
         * Mengikuti dokumentasi: project, order_id, amount, api_key
         */
        try {
            const apiBody = {
                project: cleanSlug,
                order_id: orderId,
                amount: Number(amount),
                api_key: apiKey
            };

            const apiResponse = await fetch(`${apiBaseUrl}/transactioncreate/${defaultMethod}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(apiBody)
            });

            const data = await apiResponse.json();
            
            // Log detail untuk debugging di server console
            console.log(`[Pakasir Request]:`, JSON.stringify(apiBody));
            console.log(`[Pakasir Response]:`, JSON.stringify(data));
            
            // Mencari objek payment (beberapa versi API mungkin beda struktur sedikit)
            let payment = data.payment || data.data;
            
            // Jika data.payment tidak ada, coba cek apakah root object sendiri adalah payment data
            if (!payment && data.payment_number) payment = data;

            if (payment && (payment.payment_number || payment.qr_string || payment.qr_content)) {
                // Normalisasi payment_number jika menggunakan field lain
                if (!payment.payment_number) {
                    payment.payment_number = payment.qr_string || payment.qr_content;
                }

                return NextResponse.json({ 
                    success: true,
                    payment: {
                        ...payment,
                        payment_method: payment.payment_method || defaultMethod,
                        total_payment: Number(payment.total_payment || payment.amount || amount),
                        productName,
                        productId
                    }
                });
            } else {
                // Tangani error dari API Pakasir
                const errorMessage = data.msg || data.message || data.error || data.status || 'Gagal generate QRIS otomatis.';
                console.error('Pakasir API Error:', errorMessage);
                
                // Berikan info detail kenapa gagal (misal: "API Key Salah" atau "Project Suspended")
                return NextResponse.json({ 
                    success: false, 
                    error: `Pakasir: ${errorMessage}`,
                    paymentUrl: `${paymentBaseUrl}/${cleanSlug}?amount=${amount}&order_id=${orderId}`
                });
            }
        } catch (apiError: any) {
            console.error('Pakasir Connection Exception:', apiError);
            const paymentUrl = `${paymentBaseUrl}/${cleanSlug}?amount=${amount}&order_id=${orderId}`;
            return NextResponse.json({ 
                success: false, 
                paymentUrl, 
                error: `System: ${apiError?.message || 'Gagal menghubungi server pembayaran'}` 
            });
        }

        /**
         * Fallback: Integrasi Via URL
         */
        const paymentUrl = `${paymentBaseUrl}/${cleanSlug}?amount=${amount}&order_id=${orderId}`;
        return NextResponse.json({ 
            success: false, 
            paymentUrl 
        });

    } catch (error) {
        console.error('Payment Error:', error);
        return NextResponse.json({ error: 'Gagal membuat invoice pembayaran.' }, { status: 500 });
    }
}
