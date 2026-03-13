import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const username = searchParams.get('username');

        if (!username) {
            return NextResponse.json({ error: 'Username required' }, { status: 400 });
        }

        // Auto-cleanup: Tandai yang sudah lewat 15 menit sebagai expired di DB
        const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
        
        await supabase
            .from('transactions')
            .update({ status: 'expired' })
            .eq('status', 'pending')
            .lt('created_at', fifteenMinutesAgo);

        // Fetch user transactions
        const { data: rawTransactions, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('customer_name', username)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Map Supabase snake_case to frontend camelCase
        const transactions = (rawTransactions || []).map((t: any) => ({
            ...t,
            createdAt: t.created_at,
            orderId: t.order_id,
            productName: t.product_name,
            customerName: t.customer_name,
            paymentMethod: t.payment_method,
            completedAt: t.completed_at,
            deliveredData: t.delivered_data,
            deliveryType: t.delivery_type
        }));

        return NextResponse.json(transactions);
    } catch (error: any) {
        console.error('User Transactions Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
