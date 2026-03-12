import { NextResponse } from 'next/server';
import { config } from '@/lib/config';
import { supabase } from '@/lib/supabase';

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
                    await supabase
                        .from('transactions')
                        .update({ 
                            status: 'completed',
                            completed_at: data.transaction.completed_at || new Date().toISOString(),
                            payment_method: data.transaction.payment_method
                        })
                        .eq('order_id', orderId);
                    
                    return NextResponse.json({ status: 'completed', details: data.transaction });
                }
                
                // Cek Expiry Lokal (15 Menit)
                const createdAt = new Date(dbTx.created_at).getTime();
                const now = new Date().getTime();
                const diffMinutes = (now - createdAt) / (1000 * 60);

                if (diffMinutes > 15 && dbTx.status === 'pending') {
                    await supabase
                        .from('transactions')
                        .update({ status: 'expired' })
                        .eq('order_id', orderId);
                    
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
