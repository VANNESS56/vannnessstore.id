import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { isAdmin, unauthorizedResponse } from '@/lib/auth';

export async function GET(request: Request) {
    try {
        if (!await isAdmin(request)) return unauthorizedResponse();

        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

        // 1. Fetch completed SMM transactions for today
        const { data: todayTrx, error: todayError } = await supabase
            .from('transactions')
            .select('amount, smm_order_id, status')
            .eq('status', 'completed')
            .not('smm_order_id', 'is', null)
            .gte('created_at', startOfDay);

        if (todayError) throw todayError;

        // 2. Fetch all completed SMM transactions (Total Profit)
        const { data: totalTrx, error: totalError } = await supabase
            .from('transactions')
            .select('amount, smm_order_id, status')
            .eq('status', 'completed')
            .not('smm_order_id', 'is', null);

        if (totalError) throw totalError;

        // Calculate profit (assuming 15% markup: Sale = Cost * 1.15 => Profit = Sale - Sale/1.15)
        const calculateProfit = (transactions: any[]) => {
            return transactions.reduce((acc, trx) => {
                const profit = trx.amount - (trx.amount / 1.15);
                return acc + profit;
            }, 0);
        };

        const todayProfit = calculateProfit(todayTrx || []);
        const totalProfitOverall = calculateProfit(totalTrx || []);

        return NextResponse.json({
            todaySmmProfit: Math.floor(todayProfit),
            totalSmmProfit: Math.floor(totalProfitOverall),
            todaySmmCount: todayTrx?.length || 0,
            totalSmmCount: totalTrx?.length || 0
        });

    } catch (error: any) {
        console.error('Admin Stats Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
