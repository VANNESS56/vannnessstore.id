import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// PUT: Tandai notifikasi sebagai sudah dibaca
export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { userId, notificationId, markAll } = body;

        if (!userId) {
            return NextResponse.json({ error: 'userId diperlukan' }, { status: 400 });
        }

        if (markAll) {
            // Tandai semua notifikasi user sebagai sudah dibaca
            const { error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('user_id', userId)
                .eq('is_read', false);

            if (error) throw error;
            return NextResponse.json({ success: true, message: 'Semua notifikasi ditandai sudah dibaca' });
        } else if (notificationId) {
            // Tandai satu notifikasi
            const { error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('id', notificationId)
                .eq('user_id', userId);

            if (error) throw error;
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'notificationId atau markAll diperlukan' }, { status: 400 });
    } catch (error: any) {
        console.error('Notification Read Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
