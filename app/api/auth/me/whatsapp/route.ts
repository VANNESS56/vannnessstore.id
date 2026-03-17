import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
    const userId = request.headers.get('X-User-Id');

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { whatsapp } = await request.json();

        if (!whatsapp) {
            return NextResponse.json({ error: 'WhatsApp number is required' }, { status: 400 });
        }

        // Basic validation: numeric, min length 10
        const cleanWhatsApp = whatsapp.replace(/\D/g, '');
        if (cleanWhatsApp.length < 10) {
            return NextResponse.json({ error: 'Nomor WhatsApp tidak valid' }, { status: 400 });
        }

        const { data: user, error } = await supabase
            .from('users')
            .update({ whatsapp: cleanWhatsApp })
            .eq('id', userId)
            .select('id, username, role, balance, whatsapp, created_at')
            .single();

        if (error) {
            return NextResponse.json({ error: 'Gagal memperbarui nomor WhatsApp' }, { status: 500 });
        }

        return NextResponse.json({ 
            success: true, 
            message: 'Nomor WhatsApp berhasil dihubungkan',
            user 
        });
    } catch (error: any) {
        console.error('Update WhatsApp Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
