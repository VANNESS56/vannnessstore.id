import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        const { username, password, whatsapp } = await request.json();

        if (!username || !password || !whatsapp) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        // Check if user exists in Supabase
        const { data: existingUser } = await supabase
            .from('users')
            .select('username')
            .eq('username', username)
            .single();

        if (existingUser) {
            return NextResponse.json({ error: 'User already exists' }, { status: 400 });
        }

        const newUser = {
            id: Date.now().toString(),
            username,
            password, // In production, hash this!
            whatsapp,
            role: 'member',
            balance: 0,
            created_at: new Date().toISOString()
        };

        const { error } = await supabase.from('users').insert([newUser]);

        if (error) throw error;

        return NextResponse.json({ message: 'User registered successfully', user: { username } });
    } catch (error: any) {
        console.error('Register Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
