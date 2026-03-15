import { NextResponse } from 'next/server';
import { config } from '@/lib/config';
import { supabase } from '@/lib/supabase';
import { createNotification } from '@/lib/notifications';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const orderId = searchParams.get('order_id');
        const amount = searchParams.get('amount');

        const { slug, apiKey, apiBaseUrl } = config.pakasir;

        if (!orderId || !amount) {
            return NextResponse.json({ error: 'Missing order_id or amount' }, { status: 400 });
        }

        // Cek status ke Pakasir
        const url = `${apiBaseUrl}/transactiondetail?project=${slug}&amount=${amount}&order_id=${orderId}&api_key=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.transaction) {
            // Check status in Supabase
            const { data: dbTx } = await supabase
                .from('transactions')
                .select('*')
                .eq('order_id', orderId)
                .single();

            if (dbTx) {
                // Jika Pakasir bilang completed
                if (data.transaction.status === 'completed') {
                    // Cek apakah sudah pernah di-proses
                    if (dbTx.status === 'completed') {
                        return NextResponse.json({ status: 'completed', details: data.transaction, deliveredData: dbTx.delivered_data || null });
                    }

                    await supabase
                        .from('transactions')
                        .update({ 
                            status: 'completed',
                            completed_at: data.transaction.completed_at || new Date().toISOString(),
                            payment_method: data.transaction.payment_method
                        })
                        .eq('order_id', orderId);
                    
                    // === HANDLE DEPOSIT / TOP UP ===
                    if (dbTx.product_id === 'deposit' || dbTx.product_name === 'Top Up Saldo') {
                        // Tambah saldo ke user - Prioritaskan user_id
                        let query = supabase.from('users').select('balance, id, username');
                        
                        if (dbTx.user_id) {
                            query = query.eq('id', dbTx.user_id);
                        } else {
                            query = query.eq('username', dbTx.customer_name);
                        }

                        const { data: userToUpdate, error: findError } = await query.single();
                        
                        if (userToUpdate) {
                            const currentBalance = Number(userToUpdate.balance || 0);
                            const depositAmount = Number(dbTx.amount || 0);
                            const newBalance = currentBalance + depositAmount;

                            console.log(`[Deposit] Updating user ${userToUpdate.username} (${userToUpdate.id}): ${currentBalance} -> ${newBalance}`);

                            const { error: updateError } = await supabase
                                .from('users')
                                .update({ balance: newBalance })
                                .eq('id', userToUpdate.id);
                            
                            if (updateError) {
                                console.error('[Deposit] Balance update error:', updateError);
                            } else {
                                // Notifikasi Top Up Berhasil
                                await createNotification({
                                    userId: userToUpdate.id,
                                    type: 'payment_success',
                                    title: 'Top Up Berhasil! 💰',
                                    message: `Saldo sebesar Rp ${depositAmount.toLocaleString('id-ID')} telah ditambahkan ke akun Anda. Saldo sekarang: Rp ${newBalance.toLocaleString('id-ID')}`,
                                    link: '/'
                                });
                            }

                            return NextResponse.json({ 
                                status: 'completed', 
                                details: data.transaction,
                                isDeposit: true,
                                newBalance: newBalance
                            });
                        } else {
                            console.error('[Deposit] User not found for update:', dbTx.user_id || dbTx.customer_name, findError);
                        }
                    }

                    // === AUTO DELIVERY ===
                    let deliveredData: string | null = null;
                    let deliveryType = 'manual';

                    if (dbTx.product_id) {
                        const { data: product } = await supabase
                            .from('products')
                            .select('auto_delivery, name')
                            .eq('id', dbTx.product_id)
                            .single();

                        if (product?.auto_delivery) {
                            // Ambil 1 stok yang belum terjual
                            const { data: stockItem } = await supabase
                                .from('product_stock')
                                .select('*')
                                .eq('product_id', dbTx.product_id)
                                .eq('is_sold', false)
                                .order('created_at', { ascending: true })
                                .limit(1)
                                .single();

                            if (stockItem) {
                                // Tandai stok sebagai terjual
                                await supabase.from('product_stock').update({
                                    is_sold: true,
                                    sold_to: dbTx.customer_name || 'unknown',
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
                    }

                    // Kirim notifikasi pembayaran berhasil
                    if (dbTx.customer_name) {
                        const { data: userData } = await supabase
                            .from('users')
                            .select('id')
                            .eq('username', dbTx.customer_name)
                            .single();

                        if (userData) {
                            if (deliveredData) {
                                // Notifikasi auto-delivery berhasil
                                await createNotification({
                                    userId: userData.id,
                                    type: 'payment_success',
                                    title: 'Pembayaran Berhasil & Produk Dikirim! 📦',
                                    message: `Produk "${dbTx.product_name || 'produk'}" berhasil dikirim otomatis. Cek riwayat transaksi untuk melihat detail produk Anda.`,
                                    link: '/?tab=history'
                                });
                            } else if (deliveryType === 'auto_no_stock') {
                                await createNotification({
                                    userId: userData.id,
                                    type: 'payment_success',
                                    title: 'Pembayaran Berhasil! ✅',
                                    message: `Stok untuk "${dbTx.product_name}" sedang habis. Admin akan mengirim produk Anda secara manual. Silakan tunggu.`,
                                    link: '/?tab=history'
                                });
                            } else {
                                await createNotification({
                                    userId: userData.id,
                                    type: 'payment_success',
                                    title: 'Pembayaran Berhasil! ✅',
                                    message: `Pembayaran untuk ${dbTx.product_name || 'produk'} sebesar Rp ${Number(dbTx.amount).toLocaleString('id-ID')} berhasil. Admin akan mengirim produk Anda.`,
                                    link: '/?tab=history'
                                });
                            }
                        }
                    }

                    return NextResponse.json({ 
                        status: 'completed', 
                        details: data.transaction,
                        deliveredData,
                        deliveryType
                    });
                }
                
                // Cek Expiry Lokal (60 Menit)
                const createdAt = new Date(dbTx.created_at).getTime();
                const now = new Date().getTime();
                const diffMinutes = (now - createdAt) / (1000 * 60);

                if (diffMinutes > 60 && dbTx.status === 'pending') {
                    await supabase
                        .from('transactions')
                        .update({ status: 'expired' })
                        .eq('order_id', orderId);
                    
                    // Kirim notifikasi pembayaran expired
                    if (dbTx.customer_name) {
                        const { data: userData } = await supabase
                            .from('users')
                            .select('id')
                            .eq('username', dbTx.customer_name)
                            .single();

                        if (userData) {
                            await createNotification({
                                userId: userData.id,
                                type: 'payment_expired',
                                title: 'Pembayaran Kedaluwarsa ⏰',
                                message: `Pembayaran untuk ${dbTx.product_name || 'produk'} (${orderId}) telah melewati batas waktu. Silakan buat pesanan baru.`,
                            });
                        }
                    }

                    return NextResponse.json({ status: 'expired' });
                }
            }

            return NextResponse.json({ 
                status: data.transaction.status,
                details: data.transaction 
            });
        }

        return NextResponse.json({ status: 'pending' });

    } catch (error: any) {
        console.error('Status Check Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
