const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function getAllCategories() {
    let allCategories = new Set();
    let from = 0;
    let to = 1000;
    let hasMore = true;

    console.log("Fetching all categories...");
    while (hasMore) {
        const { data, error } = await supabase
            .from('products')
            .select('category')
            .eq('provider', 'buzzerpanel')
            .range(from, to);
        
        if (error) {
            console.error(error);
            break;
        }

        data.forEach(item => allCategories.add(item.category));
        
        if (data.length < 1000) hasMore = false;
        else {
            from += 1001;
            to += 1001;
        }
    }

    console.log('Total Kategori SMM Sebenarnya:', allCategories.size);
    console.log('Kategori:', Array.from(allCategories).slice(0, 10), '...');
}

getAllCategories();
