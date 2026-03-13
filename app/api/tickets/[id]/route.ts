import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createNotification } from '@/lib/notifications';

// GET: Ambil pesan-pesan dalam tiket
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const { data: messages, error } = await supabase
            .from('ticket_messages')
            .select('*')
            .eq('ticket_id', id)
            .order('created_at', { ascending: true });

        if (error) throw error;

        return NextResponse.json(messages || []);
    } catch (error: any) {
        console.error('Ticket Messages Fetch Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST: Kirim pesan baru ke tiket
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { senderId, senderName, senderRole, message } = body;

        if (!senderId || !senderName || !message) {
            return NextResponse.json(
                { error: 'senderId, senderName, dan message wajib diisi.' },
                { status: 400 }
            );
        }

        const messageId = `MSG${Date.now()}`;
        const now = new Date().toISOString();

        // Insert pesan baru
        const { error: msgError } = await supabase.from('ticket_messages').insert([{
            id: messageId,
            ticket_id: id,
            sender_id: senderId,
            sender_name: senderName,
            sender_role: senderRole || 'member',
            message: message,
            created_at: now
        }]);

        if (msgError) throw msgError;

        // Update timestamp tiket
        const updateData: any = { updated_at: now };
        
        // Jika admin membalas, ubah status menjadi in_progress (jika masih open)
        if (senderRole === 'admin') {
            const { data: ticket } = await supabase
                .from('tickets')
                .select('status, user_id, subject')
                .eq('id', id)
                .single();

            if (ticket && ticket.status === 'open') {
                updateData.status = 'in_progress';
            }

            // Kirim notifikasi ke user bahwa tiketnya dibalas admin
            if (ticket) {
                await createNotification({
                    userId: ticket.user_id,
                    type: 'ticket_reply',
                    title: 'Tiket Dibalas oleh Admin 💬',
                    message: `Admin membalas tiket "${ticket.subject}". Klik untuk melihat balasan.`,
                    link: '/tickets'
                });
            }
        }

        await supabase.from('tickets').update(updateData).eq('id', id);

        return NextResponse.json({ success: true, messageId }, { status: 201 });
    } catch (error: any) {
        console.error('Ticket Message Send Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// PUT: Update status tiket
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { status } = body;

        const validStatuses = ['open', 'in_progress', 'resolved', 'closed'];
        if (!validStatuses.includes(status)) {
            return NextResponse.json(
                { error: `Status tidak valid. Gunakan: ${validStatuses.join(', ')}` },
                { status: 400 }
            );
        }

        const { error } = await supabase
            .from('tickets')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', id);

        if (error) throw error;

        // Kirim notifikasi jika status menjadi resolved
        if (status === 'resolved') {
            const { data: ticket } = await supabase
                .from('tickets')
                .select('user_id, subject')
                .eq('id', id)
                .single();

            if (ticket) {
                await createNotification({
                    userId: ticket.user_id,
                    type: 'info',
                    title: 'Tiket Selesai ✅',
                    message: `Tiket "${ticket.subject}" telah ditandai selesai oleh admin.`,
                    link: '/tickets'
                });
            }
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Ticket Status Update Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
