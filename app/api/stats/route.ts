import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
    try {
        // Count users
        const { count: memberCount, error: userError } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true });

        // Count completed transactions
        const { count: transactionCount, error: txError } = await supabase
            .from('transactions')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'completed');

        if (userError || txError) throw userError || txError;

        return NextResponse.json({
            memberCount: memberCount || 0,
            transactionCount: transactionCount || 0
        });
    } catch (error) {
        console.error('Stats fetch error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
