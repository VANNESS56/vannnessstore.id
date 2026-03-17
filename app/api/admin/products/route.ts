import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { isAdmin, unauthorizedResponse } from '@/lib/auth';

// GET all products with optional search and prioritize local products
export async function GET(request: Request) {
    try {
        if (!await isAdmin(request)) return unauthorizedResponse();

        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';
        const limit = parseInt(searchParams.get('limit') || '2000');

        let query = supabase
            .from('products')
            .select('*')
            .order('provider', { ascending: false }) // 'local' or null usually comes before 'buzzerpanel' or we can tweak
            .order('created_at', { ascending: false })
            .limit(limit);

        if (search) {
            query = query.ilike('name', `%${search}%`);
        } else {
            // If no search, prioritize local/manual products by fetching them first
            // We'll fetch local products first, then fill up the rest with SMM if needed
            const { data: localProducts, error: localError } = await supabase
                .from('products')
                .select('*')
                .or('provider.is.null,provider.eq.local,provider.eq.manual')
                .order('created_at', { ascending: false })
                .limit(500);

            if (localError) throw localError;

            // Then fetch some SMM products to fill the list
            const { data: smmProducts, error: smmError } = await supabase
                .from('products')
                .select('*')
                .eq('provider', 'buzzerpanel')
                .order('created_at', { ascending: false })
                .limit(500);
            
            if (smmError) throw smmError;

            const combined = [...(localProducts || []), ...(smmProducts || [])];
            return NextResponse.json(combined);
        }

        const { data: rawProducts, error } = await query;
        
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
            auto_delivery: body.auto_delivery || false,
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
