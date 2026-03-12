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
         */
        try {
            const apiResponse = await fetch(`${apiBaseUrl}/transactioncreate/${defaultMethod}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    project: cleanSlug,
                    order_id: orderId,
                    amount: Number(amount),
                    api_key: apiKey,
                    customer_name: customerName || 'Vanness Customer',
                    method: defaultMethod
                })
            });

            const data = await apiResponse.json();
            
            // Log for debugging (visible in server logs)
            console.log('Pakasir API Response:', JSON.stringify(data));

            // Pakasir API might return payment data in different structures
            // Some versions return it in data.payment, some in data.data, some in the root
            let payment = data.payment || data.data || (data.status === 'success' ? data : null);

            // If it's the root but doesn't have payment_number, it might be an error or different format
            if (payment && !payment.payment_number && !payment.qr_string && !payment.qr_content) {
                if (data.payment) payment = data.payment;
                else if (data.data) payment = data.data;
                else payment = null;
            }

            if (payment && (payment.payment_number || payment.qr_string || payment.qr_content)) {
                // Normalize fields for frontend
                if (!payment.payment_number) {
                    payment.payment_number = payment.qr_string || payment.qr_content;
                }
                
                if (!payment.payment_method) {
                    payment.payment_method = defaultMethod;
                }

                // Ensure numeric amount/fee
                payment.amount = Number(payment.amount || amount);
                payment.fee = Number(payment.fee || 0);
                payment.total_payment = Number(payment.total_payment || payment.amount + payment.fee);

                return NextResponse.json({ 
                    success: true,
                    payment: payment 
                });
            } else {
                // If API integration fails, we go to fallback but return the reason
                const errorMessage = data.msg || data.error || data.message || 'Gagal generate QRIS otomatis.';
                console.error('Pakasir Integration Failed:', errorMessage, data);
                
                return NextResponse.json({ 
                    success: false, 
                    error: errorMessage,
                    paymentUrl: `${paymentBaseUrl}/${cleanSlug}?amount=${amount}&order_id=${orderId}`
                });
            }
        } catch (apiError) {
            console.error('Pakasir API Fetch Error:', apiError);
            const paymentUrl = `${paymentBaseUrl}/${cleanSlug}?amount=${amount}&order_id=${orderId}`;
            return NextResponse.json({ success: false, paymentUrl, error: 'Koneksi ke API Pembayaran bermasalah.' });
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
