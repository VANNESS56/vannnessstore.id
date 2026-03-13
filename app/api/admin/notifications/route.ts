import { NextResponse } from 'next/server';
import { isAdmin, unauthorizedResponse } from '@/lib/auth';
import { broadcastNotification } from '@/lib/notifications';

// POST: Admin kirim notifikasi broadcast ke semua user
export async function POST(request: Request) {
    try {
        if (!await isAdmin(request)) return unauthorizedResponse();

        const body = await request.json();
        const { title, message, link } = body;

        if (!title || !message) {
            return NextResponse.json(
                { error: 'title dan message wajib diisi.' },
                { status: 400 }
            );
        }

        const success = await broadcastNotification({
            type: 'promo',
            title,
            message,
            link: link || undefined
        });

        if (success) {
            return NextResponse.json({ success: true, message: 'Notifikasi berhasil dikirim ke semua user.' });
        } else {
            return NextResponse.json({ error: 'Gagal mengirim notifikasi.' }, { status: 500 });
        }
    } catch (error: any) {
        console.error('Broadcast Notification Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
