import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
    try {
        const { data: rawProducts, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        const products = (rawProducts || []).map((p: any) => ({
            ...p,
            createdAt: p.created_at
        }));

        return NextResponse.json(products);
    } catch (error: any) {
        console.error('Products Fetch Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
