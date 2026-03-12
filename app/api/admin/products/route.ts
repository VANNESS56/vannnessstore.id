import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { isAdmin, unauthorizedResponse } from '@/lib/auth';

// GET all products
export async function GET(request: Request) {
    try {
        if (!await isAdmin(request)) return unauthorizedResponse();

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
        console.error('Admin Products Fetch Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST create product
export async function POST(request: Request) {
    try {
        if (!await isAdmin(request)) return unauthorizedResponse();

        const body = await request.json();

        const newProduct = {
            id: `p${Date.now()}`,
            name: body.name,
            description: body.description,
            price: Number(body.price),
            category: body.category,
            image: body.image || '',
            created_at: new Date().toISOString()
        };

        const { error } = await supabase.from('products').insert([newProduct]);
        if (error) throw error;

        return NextResponse.json(newProduct, { status: 201 });
    } catch (error: any) {
        console.error('Admin Product Create Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
