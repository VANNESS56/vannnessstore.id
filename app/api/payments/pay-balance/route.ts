import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createNotification } from '@/lib/notifications';

export async function POST(request: Request) {
    try {
        const { productId, amount, userId } = await request.json();

        if (!productId || !amount || !userId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Ambil data user
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (userError || !user) {
            return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
        }

        // 2. Cek Saldo
        if (Number(user.balance) < Number(amount)) {
            return NextResponse.json({ error: 'Saldo tidak mencukupi' }, { status: 400 });
        }

        // 3. Ambil data produk
        const { data: product, error: prodError } = await supabase
            .from('products')
            .select('*')
            .eq('id', productId)
            .single();

        if (prodError || !product) {
            return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404 });
        }

        // 4. Proses Transaksi (Potong Saldo)
        const newBalance = Number(user.balance) - Number(amount);
        const { error: updateBalanceError } = await supabase
            .from('users')
            .update({ balance: newBalance })
            .eq('id', userId);

        if (updateBalanceError) throw updateBalanceError;

        // 5. Buat Record Transaksi Sukses
        const orderId = `INV-BAL-${Date.now()}`;
        const transaction: any = {
            id: `trx_bal_${Date.now()}`,
            order_id: orderId,
            product_id: productId,
            product_name: product.name,
            customer_name: user.username,
            amount: Number(amount),
            status: 'completed',
            payment_method: 'balance',
            completed_at: new Date().toISOString(),
            created_at: new Date().toISOString()
        };

        if (userId) {
            transaction.user_id = userId;
        }

        const { error: txError } = await supabase.from('transactions').insert([transaction]);
        if (txError) {
            console.error('Supabase Balance Transaction Insert Error:', txError);
            const isMissingUserColumn = userId && (
                txError.message?.includes('column "user_id"') || 
                txError.message?.includes("'user_id' column") ||
                txError.message?.includes('user_id')
            );

            if (isMissingUserColumn) {
                delete transaction.user_id;
                const { error: txErrorRetry } = await supabase.from('transactions').insert([transaction]);
                if (txErrorRetry) throw txErrorRetry;
            } else {
                throw txError;
            }
        }

        // 6. === AUTO DELIVERY LOGIC ===
        let deliveredData: string | null = null;
        let deliveryType = 'manual';

        if (product.auto_delivery) {
            // Ambil 1 stok yang belum terjual
            const { data: stockItem } = await supabase
                .from('product_stock')
                .select('*')
                .eq('product_id', productId)
                .eq('is_sold', false)
                .order('created_at', { ascending: true })
                .limit(1)
                .single();

            if (stockItem) {
                // Tandai stok sebagai terjual
                await supabase.from('product_stock').update({
                    is_sold: true,
                    sold_to: user.username || 'unknown',
                    sold_at: new Date().toISOString(),
                    order_id: orderId
                }).eq('id', stockItem.id);

                deliveredData = stockItem.data;
                deliveryType = 'auto';

                // Update transaksi dengan data yang dikirim
                await supabase.from('transactions').update({
                    delivered_data: deliveredData,
                    delivery_type: 'auto'
                }).eq('order_id', orderId);
            } else {
                deliveryType = 'auto_no_stock';
                await supabase.from('transactions').update({
                    delivery_type: 'auto_no_stock'
                }).eq('order_id', orderId);
            }
        }

        // 7. Notifikasi
        if (deliveredData) {
            await createNotification({
                userId: user.id,
                type: 'payment_success',
                title: 'Pembelian Berhasil (Via Saldo) 📦',
                message: `Produk "${product.name}" telah dikirim otomatis. Sisa saldo Anda: Rp ${newBalance.toLocaleString('id-ID')}`,
                link: '/?tab=history'
            });
        } else {
            await createNotification({
                userId: user.id,
                type: 'payment_success',
                title: 'Pembelian Berhasil (Via Saldo) ✅',
                message: `Pembayaran untuk "${product.name}" berhasil menggunakan saldo. Admin akan segera mengirim produk Anda.`,
                link: '/?tab=history'
            });
        }

        return NextResponse.json({ 
            success: true, 
            status: 'completed',
            deliveredData,
            deliveryType,
            newBalance,
            orderId
        });

    } catch (error: any) {
        console.error('Pay with Balance Error:', error);
        return NextResponse.json({ error: 'Gagal memproses pembayaran saldo' }, { status: 500 });
    }
}
