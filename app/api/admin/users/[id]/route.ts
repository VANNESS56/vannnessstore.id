import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { isAdmin, unauthorizedResponse } from '@/lib/auth';

// PUT update user (role, balance)
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        if (!await isAdmin(request)) return unauthorizedResponse();

        const { id } = await params;
        const body = await request.json();

        const updateData: any = {};
        if (body.role !== undefined) updateData.role = body.role;
        if (body.balance !== undefined) updateData.balance = Number(body.balance);

        const { data, error } = await supabase
            .from('users')
            .update(updateData)
            .eq('id', id)
            .select('id, username, role, balance, created_at')
            .single();

        if (error) {
            if (error.code === 'PGRST116') return NextResponse.json({ error: 'User not found' }, { status: 404 });
            throw error;
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Admin User Update Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// DELETE user
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        if (!await isAdmin(request)) return unauthorizedResponse();

        const { id } = await params;

        const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Admin User Delete Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
