const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkCount() {
    const { count, error } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });
    
    if (error) console.error(error);
    else console.log('Total Produk di DB:', count);

    const { data: buzzerCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('provider', 'buzzerpanel');
    
    console.log('Total Produk SMM:', buzzerCount);
    
    const { data: categories } = await supabase
        .from('products')
        .select('category')
        .eq('provider', 'buzzerpanel');
    
    const uniqueCats = [...new Set(categories.map(c => c.category))];
    console.log('Jumlah Kategori SMM Unik:', uniqueCats.length);
}

checkCount();
