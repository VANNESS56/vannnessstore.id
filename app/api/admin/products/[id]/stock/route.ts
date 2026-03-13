import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { isAdmin, unauthorizedResponse } from '@/lib/auth';

// GET: Ambil stok produk
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        if (!await isAdmin(request)) return unauthorizedResponse();

        const { id } = await params;

        const { data, error } = await supabase
            .from('product_stock')
            .select('*')
            .eq('product_id', id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        const available = (data || []).filter((s: any) => !s.is_sold).length;
        const sold = (data || []).filter((s: any) => s.is_sold).length;

        return NextResponse.json({
            stock: data || [],
            available,
            sold,
            total: (data || []).length
        });
    } catch (error: any) {
        console.error('Stock Fetch Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST: Tambah stok produk (batch)
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        if (!await isAdmin(request)) return unauthorizedResponse();

        const { id } = await params;
        const body = await request.json();
        const { items } = body; // Array of strings

        if (!items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ error: 'items harus berupa array string.' }, { status: 400 });
        }

        const stockItems = items
            .filter((item: string) => item.trim())
            .map((item: string) => ({
                id: `stk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                product_id: id,
                data: item.trim(),
                is_sold: false,
                created_at: new Date().toISOString()
            }));

        const { error } = await supabase.from('product_stock').insert(stockItems);
        if (error) throw error;

        return NextResponse.json({
            success: true,
            added: stockItems.length,
            message: `${stockItems.length} item stok berhasil ditambahkan.`
        }, { status: 201 });
    } catch (error: any) {
        console.error('Stock Add Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// DELETE: Hapus satu item stok (hanya yang belum terjual)
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        if (!await isAdmin(request)) return unauthorizedResponse();

        const { id } = await params;
        const { searchParams } = new URL(request.url);
        const stockId = searchParams.get('stock_id');

        if (!stockId) {
            return NextResponse.json({ error: 'stock_id diperlukan.' }, { status: 400 });
        }

        const { error } = await supabase
            .from('product_stock')
            .delete()
            .eq('id', stockId)
            .eq('product_id', id)
            .eq('is_sold', false);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Stock Delete Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
