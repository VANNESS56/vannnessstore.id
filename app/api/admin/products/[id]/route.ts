import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { isAdmin, unauthorizedResponse } from '@/lib/auth';

// PUT update product
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        if (!await isAdmin(request)) return unauthorizedResponse();

        const { id } = await params;
        const body = await request.json();

        const updateData: any = {};
        if (body.name !== undefined) updateData.name = body.name;
        if (body.description !== undefined) updateData.description = body.description;
        if (body.price !== undefined) updateData.price = Number(body.price);
        if (body.category !== undefined) updateData.category = body.category;
        if (body.image !== undefined) updateData.image = body.image;
        if (body.auto_delivery !== undefined) updateData.auto_delivery = body.auto_delivery;

        const { data, error } = await supabase
            .from('products')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            if (error.code === 'PGRST116') return NextResponse.json({ error: 'Product not found' }, { status: 404 });
            throw error;
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Admin Product Update Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// DELETE product
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        if (!await isAdmin(request)) return unauthorizedResponse();

        const { id } = await params;

        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Admin Product Delete Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
