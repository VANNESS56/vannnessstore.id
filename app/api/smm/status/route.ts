import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { buzzerpanel } from '@/lib/buzzerpanel';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const transactionId = searchParams.get('trx_id');

        if (!transactionId) {
            return NextResponse.json({ error: 'Transaction ID is required' }, { status: 400 });
        }

        // 1. Get transaction and product info
        const { data: trx, error: trxError } = await supabase
            .from('transactions')
            .select(`
                *,
                products (provider)
            `)
            .eq('id', transactionId)
            .single();

        if (trxError || !trx) {
            return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
        }

        // 2. Check if it's a Buzzerpanel order
        if (trx.products?.provider !== 'buzzerpanel' || !trx.smm_order_id) {
            return NextResponse.json({ error: 'Not an SMM order or Order ID missing' }, { status: 400 });
        }

        // 3. Call Buzzerpanel API
        const statusResponse = await buzzerpanel.checkStatus(trx.smm_order_id);

        if (!statusResponse.status) {
            return NextResponse.json({ error: statusResponse.data?.msg || 'Failed to fetch status from provider' }, { status: 500 });
        }

        const externalStatus = statusResponse.data.status; // e.g., "Success", "Processing", "Pending", "Error", "Partial", "Canceled"
        
        let localStatus = trx.status;
        let refundProcessed = false;
        let refundAmount = 0;

        // 4. Handle Refunds for Canceled or Partial
        try {
            const deliveredJson = trx.delivered_data ? JSON.parse(trx.delivered_data) : {};
            const alreadyRefunded = deliveredJson.is_refunded || false;

            if (!alreadyRefunded && (externalStatus === 'Canceled' || externalStatus === 'Partial' || externalStatus === 'Error')) {
                // Calculate Refund
                if (externalStatus === 'Canceled' || externalStatus === 'Error') {
                    refundAmount = trx.amount;
                } else if (externalStatus === 'Partial') {
                    const remains = Number(statusResponse.data.remains || 0);
                    const totalQty = Number(trx.smm_qty || 1);
                    if (remains > 0 && totalQty > 0) {
                        refundAmount = Math.floor((remains / totalQty) * trx.amount);
                    }
                }

                if (refundAmount > 0) {
                    // Start Refund Process
                    // 1. Get current user balance
                    const { data: user, error: userError } = await supabase
                        .from('users')
                        .select('balance')
                        .eq('id', trx.user_id)
                        .single();

                    if (!userError && user) {
                        const newBalance = (user.balance || 0) + refundAmount;
                        
                        // 2. Update user balance
                        await supabase
                            .from('users')
                            .update({ balance: newBalance })
                            .eq('id', trx.user_id);
                        
                        refundProcessed = true;
                        localStatus = 'refunded';

                        // 3. Create a notification for the refund
                        await supabase.from('notifications').insert({
                            user_id: trx.user_id,
                            title: 'Refund Saldo Otomatis',
                            message: `Pesanan SMM #${trx.order_id} status ${externalStatus}. Saldo sebesar Rp ${refundAmount.toLocaleString('id-ID')} telah dikembalikan ke akun Anda.`,
                            type: 'info'
                        });
                    }
                }
            }
        } catch (e) {
            console.error('Refund Logic Error:', e);
        }

        // 5. Update transaction status mapping
        if (!refundProcessed) {
            if (externalStatus === 'Success' || externalStatus === 'Completed') localStatus = 'completed';
            if (externalStatus === 'Error' || externalStatus === 'Canceled') localStatus = 'failed';
            if (externalStatus === 'Partial') localStatus = 'completed'; // Mark as completed locally if partial, but refund handled above
        }

        // Prepare update data
        const updateData: any = {
            status: localStatus
        };

        // Add refund flag to delivered_data if processed
        const updatedDeliveredData = {
            ...statusResponse.data,
            is_refunded: refundProcessed || (trx.delivered_data ? JSON.parse(trx.delivered_data).is_refunded : false),
            refund_amount: refundAmount > 0 ? refundAmount : (trx.delivered_data ? JSON.parse(trx.delivered_data).refund_amount : 0)
        };
        updateData.delivered_data = JSON.stringify(updatedDeliveredData);

        const { error: updateError } = await supabase
            .from('transactions')
            .update(updateData)
            .eq('id', transactionId);

        if (updateError) console.error('Update Status Error:', updateError);

        return NextResponse.json({
            provider_status: externalStatus,
            start_count: statusResponse.data.start_count,
            remains: statusResponse.data.remains,
            local_status: localStatus,
            refunded: refundProcessed,
            refund_amount: refundAmount
        });

    } catch (error: any) {
        console.error('SMM Status API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
