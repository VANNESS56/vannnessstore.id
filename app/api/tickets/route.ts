import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET: Ambil tiket milik user tertentu
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('user_id');

        if (!userId) {
            return NextResponse.json({ error: 'user_id diperlukan' }, { status: 400 });
        }

        const { data: tickets, error } = await supabase
            .from('tickets')
            .select('*')
            .eq('user_id', userId)
            .order('updated_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json(tickets || []);
    } catch (error: any) {
        console.error('Tickets Fetch Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST: Buat tiket baru
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, username, subject, category, message } = body;

        if (!userId || !username || !subject || !message) {
            return NextResponse.json(
                { error: 'userId, username, subject, dan message wajib diisi.' },
                { status: 400 }
            );
        }

        const ticketId = `TKT${Date.now()}`;
        const messageId = `MSG${Date.now()}`;
        const now = new Date().toISOString();

        // Insert tiket
        const { error: ticketError } = await supabase.from('tickets').insert([{
            id: ticketId,
            user_id: userId,
            username: username,
            subject: subject,
            category: category || 'general',
            status: 'open',
            priority: 'normal',
            created_at: now,
            updated_at: now
        }]);

        if (ticketError) throw ticketError;

        // Insert pesan pertama
        const { error: msgError } = await supabase.from('ticket_messages').insert([{
            id: messageId,
            ticket_id: ticketId,
            sender_id: userId,
            sender_name: username,
            sender_role: 'member',
            message: message,
            created_at: now
        }]);

        if (msgError) throw msgError;

        return NextResponse.json({ success: true, ticketId }, { status: 201 });
    } catch (error: any) {
        console.error('Ticket Create Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
