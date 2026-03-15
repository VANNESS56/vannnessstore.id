import { NextResponse } from 'next/server';
import { config } from '@/lib/config';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        const { productId, amount, customerName, userId, smmTarget, smmQuantity } = await request.json();
        const { slug, apiKey, apiBaseUrl, paymentBaseUrl, defaultMethod } = config.pakasir;

        if (!productId || amount === undefined || amount === null) {
            return NextResponse.json({ error: 'Data produk atau nominal tidak valid.' }, { status: 400 });
        }

        if (isNaN(Number(amount)) || Number(amount) <= 0) {
            return NextResponse.json({ error: 'Nominal pembayaran tidak valid.' }, { status: 400 });
        }

        // Validasi minimal deposit
        if (productId === 'deposit' && Number(amount) < 10000) {
            return NextResponse.json({ error: 'Minimal top up saldo adalah Rp 10.000' }, { status: 400 });
        }

        if (!slug || slug === "your-slug") {
            return NextResponse.json({ error: 'Pakasir Slug belum dikonfigurasi.' }, { status: 400 });
        }

        const orderId = `INV${Date.now()}`;
        const cleanSlug = slug.trim().replace(/\s+/g, '-');

        let productName = 'Unknown Product';
        if (productId === 'deposit') {
            productName = 'Top Up Saldo';
        } else {
            // Cari nama produk dari Supabase
            const { data: product } = await supabase
                .from('products')
                .select('name')
                .eq('id', productId)
                .single();

            productName = product?.name || 'Unknown Product';
        }

        // Simpan transaksi ke Supabase
        const transaction: any = {
            id: `trx_${Date.now()}`,
            order_id: orderId,
            product_id: productId,
            product_name: productName,
            customer_name: customerName || 'Unknown',
            amount: Number(amount),
            status: 'pending',
            payment_method: defaultMethod,
            smm_target: smmTarget,
            smm_qty: Number(smmQuantity) || null,
            created_at: new Date().toISOString()
        };

        if (userId) {
            transaction.user_id = userId;
        }

        const { error: txError } = await supabase.from('transactions').insert([transaction]);
        if (txError) {
            console.error('Supabase Transaction Insert Error:', txError);
            
            // Defensive: Handle variant error messages for missing column
            const isMissingUserColumn = userId && (
                txError.message?.includes('column "user_id"') || 
                txError.message?.includes("'user_id' column") ||
                txError.message?.includes('user_id')
            );

            if (isMissingUserColumn) {
                delete transaction.user_id;
                const { error: txErrorRetry } = await supabase.from('transactions').insert([transaction]);
                if (txErrorRetry) throw new Error(`Database Error: ${txErrorRetry.message}`);
            } else {
                throw new Error(`Gagal menyimpan transaksi ke database: ${txError.message}`);
            }
        }

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
                error: `System (API): ${apiError?.message || 'Gagal menghubungi server pembayaran'}` 
            }, { status: 500 }); // Status 500 to trigger generic error handling if needed, but with details
        }

        /**
         * Fallback: Integrasi Via URL
         */
        const paymentUrl = `${paymentBaseUrl}/${cleanSlug}?amount=${amount}&order_id=${orderId}`;
        return NextResponse.json({ 
            success: false, 
            paymentUrl,
            info: 'Mengalihkan ke gateway pembayaran (Fallback Mode)'
        });

    } catch (error: any) {
        console.error('Payment Root Error:', error);
        return NextResponse.json({ 
            error: 'Gagal membuat invoice pembayaran.', 
            details: error.message || 'Unknown error',
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
        }, { status: 500 });
    }
}
