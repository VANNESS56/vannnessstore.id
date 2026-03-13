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
            console.log(`[Pakasir] Requesting ${defaultMethod} for ${orderId} (${amount})`);
            
            // Mencari objek payment sesuai dokumentasi
            const payment = data.payment;

            if (payment && payment.payment_number) {
                // Sangat penting: Dokumentasi menyatakan QR string ada di payment_number
                return NextResponse.json({ 
                    success: true,
                    payment: {
                        ...payment,
                        payment_method: payment.payment_method || defaultMethod,
                        total_payment: Number(payment.total_payment || payment.amount)
                    }
                });
            } else {
                // Tangani error dari API Pakasir
                const errorMessage = data.msg || data.message || data.error || 'Gagal generate QRIS otomatis.';
                console.error('Pakasir API Error Response:', JSON.stringify(data));
                
                // Jika nominal > 10jt, QRIS biasanya gagal. 
                // Kita beri info ke log tapi tetap fallback ke URL agar user bisa pilih metode lain di web Pakasir
                return NextResponse.json({ 
                    success: false, 
                    error: errorMessage,
                    paymentUrl: `${paymentBaseUrl}/${cleanSlug}?amount=${amount}&order_id=${orderId}`
                });
            }
        } catch (apiError) {
            console.error('Pakasir Connection/Fetch Error:', apiError);
            const paymentUrl = `${paymentBaseUrl}/${cleanSlug}?amount=${amount}&order_id=${orderId}`;
            return NextResponse.json({ 
                success: false, 
                paymentUrl, 
                error: 'Terjadi gangguan koneksi ke sistem pembayaran.' 
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
