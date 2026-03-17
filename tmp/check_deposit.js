
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDeposit() {
    const { data, error } = await supabase
        .from('products')
        .select('id, name')
        .eq('id', 'deposit');
    
    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Data:', data);
    }
}

checkDeposit();
