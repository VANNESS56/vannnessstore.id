import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
    try {
        // We know from previous checks there are around 30k products
        // Let's fetch categories in parallel batches of 10
        const batchSize = 1000;
        const totalEstimatedRequests = 35; // Enough for 35k products
        const concurrency = 5; // 5 parallel requests at a time
        
        let allCategories = new Set();
        
        for (let i = 0; i < totalEstimatedRequests; i += concurrency) {
            const promises = [];
            for (let j = 0; j < concurrency && (i + j) < totalEstimatedRequests; j++) {
                const from = (i + j) * batchSize;
                promises.push(
                    supabase
                        .from('products')
                        .select('category')
                        .eq('provider', 'buzzerpanel')
                        .range(from, from + batchSize - 1)
                );
            }
            
            const results = await Promise.all(promises);
            let addedInBatch = 0;
            
            results.forEach(({ data, error }) => {
                if (error) throw error;
                if (data) {
                    data.forEach((p: any) => allCategories.add(p.category));
                    addedInBatch += data.length;
                }
            });
            
            if (addedInBatch === 0) break; // No more data
        }

        const sortedCategories = Array.from(allCategories).sort();
        return NextResponse.json(sortedCategories);
    } catch (error: any) {
        console.error('SMM Categories API Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
