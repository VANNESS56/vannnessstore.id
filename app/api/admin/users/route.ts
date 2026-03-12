import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { isAdmin, unauthorizedResponse } from '@/lib/auth';

// GET all users
export async function GET(request: Request) {
    try {
        if (!await isAdmin(request)) return unauthorizedResponse();

        const { data: rawUsers, error } = await supabase
            .from('users')
            .select('id, username, role, balance, created_at')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        const users = (rawUsers || []).map((u: any) => ({
            ...u,
            createdAt: u.created_at
        }));
        return NextResponse.json(users);
    } catch (error: any) {
        console.error('Admin Users Fetch Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
