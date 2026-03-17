
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function createDepositProduct() {
    const depositProduct = {
        id: 'deposit',
        name: 'Top Up Saldo',
        category: 'Deposit',
        price: 0,
        provider: 'system',
        auto_delivery: true,
        min_qty: 1,
        max_qty: 9999999
    };

    const { data, error } = await supabase
        .from('products')
        .insert([depositProduct]);
    
    if (error) {
        console.error('Error creating deposit product:', error);
    } else {
        console.log('Successfully created deposit product:', data);
    }
}

createDepositProduct();
