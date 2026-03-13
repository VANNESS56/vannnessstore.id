import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { isAdmin, unauthorizedResponse } from '@/lib/auth';

// GET: Admin melihat semua tiket
export async function GET(request: Request) {
    try {
        if (!await isAdmin(request)) return unauthorizedResponse();

        const { searchParams } = new URL(request.url);
        const statusFilter = searchParams.get('status');

        let query = supabase
            .from('tickets')
            .select('*')
            .order('updated_at', { ascending: false });

        if (statusFilter && statusFilter !== 'all') {
            query = query.eq('status', statusFilter);
        }

        const { data: tickets, error } = await query;

        if (error) throw error;

        return NextResponse.json(tickets || []);
    } catch (error: any) {
        console.error('Admin Tickets Fetch Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
