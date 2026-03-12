import { NextResponse } from 'next/server';
import { supabase } from './supabase';

export async function isAdmin(request: Request) {
    const authHeader = request.headers.get('Authorization');
    const userId = request.headers.get('X-User-Id');

    if (!userId) {
        return false;
    }

    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('role')
            .eq('id', userId)
            .single();

        if (error || !user) return false;
        
        return user.role === 'admin';
    } catch (err) {
        return false;
    }
}

export function unauthorizedResponse() {
    return NextResponse.json({ error: 'Unauthorized: Akses dibatasi hanya untuk Admin.' }, { status: 403 });
}
