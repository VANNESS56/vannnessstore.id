const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function debugProvider() {
    const { data, error } = await supabase
        .from('products')
        .select('id, name, provider, category')
        .limit(10);
    
    if (error) {
        console.error(error);
        return;
    }

    console.log('Sample Products:', data);

    const { data: bData, error: bError } = await supabase
        .from('products')
        .select('category')
        .eq('provider', 'buzzerpanel')
        .limit(10);
    
    if (bError) {
        console.error('Buzzer Error:', bError);
    } else {
        console.log('Buzzer Products Sample:', bData);
    }
}

debugProvider();
