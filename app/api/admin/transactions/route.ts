import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { isAdmin, unauthorizedResponse } from '@/lib/auth';

export async function GET(request: Request) {
    try {
        if (!await isAdmin(request)) return unauthorizedResponse();

        // Auto-cleanup: Tandai yang sudah lewat 15 menit sebagai expired di DB
        const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
        
        await supabase
            .from('transactions')
            .update({ status: 'expired' })
            .eq('status', 'pending')
            .lt('created_at', fifteenMinutesAgo);

        // Fetch all transactions
        const { data: rawTransactions, error } = await supabase
            .from('transactions')
            .select('*')
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
            completedAt: t.completed_at
        }));

        return NextResponse.json(transactions);
    } catch (error: any) {
        console.error('Admin Transactions Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
