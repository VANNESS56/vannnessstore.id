import { supabase } from './supabase';

type NotificationType = 'payment_success' | 'payment_expired' | 'ticket_reply' | 'promo' | 'info' | 'welcome';

interface CreateNotificationParams {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    link?: string;
}

export async function createNotification({ userId, type, title, message, link }: CreateNotificationParams) {
    try {
        const { error } = await supabase.from('notifications').insert([{
            id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            user_id: userId,
            type,
            title,
            message,
            link: link || null,
            is_read: false,
            created_at: new Date().toISOString()
        }]);

        if (error) {
            console.error('Create Notification Error:', error);
            return false;
        }
        return true;
    } catch (err) {
        console.error('Create Notification Exception:', err);
        return false;
    }
}

// Broadcast notifikasi ke semua user (untuk promo, dll)
export async function broadcastNotification({ type, title, message, link }: Omit<CreateNotificationParams, 'userId'>) {
    try {
        const { data: users, error: usersError } = await supabase
            .from('users')
            .select('id');

        if (usersError || !users) return false;

        const notifications = users.map(user => ({
            id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            user_id: user.id,
            type,
            title,
            message,
            link: link || null,
            is_read: false,
            created_at: new Date().toISOString()
        }));

        const { error } = await supabase.from('notifications').insert(notifications);
        if (error) throw error;

        return true;
    } catch (err) {
        console.error('Broadcast Notification Error:', err);
        return false;
    }
}
