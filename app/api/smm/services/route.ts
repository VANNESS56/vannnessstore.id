import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');

        if (!category) {
            return NextResponse.json({ error: 'Category is required' }, { status: 400 });
        }

        const { data: services, error } = await supabase
            .from('products')
            .select('*')
            .eq('provider', 'buzzerpanel')
            .eq('category', category)
            .order('price', { ascending: true });

        if (error) throw error;

        return NextResponse.json(services);
    } catch (error: any) {
        console.error('SMM Services Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
