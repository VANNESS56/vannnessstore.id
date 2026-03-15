const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gxjpsqqxajvltbksqgly.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4anBzcXF4YWp2bHRia3NxZ2x5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMjAxNTUsImV4cCI6MjA4ODg5NjE1NX0.kEAQpe8Hk7347NA-4eoNMUGRn35RC4604QyWVwZzan4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createDepositProduct() {
    console.log("Checking if 'deposit' product exists...");
    const { data: existing } = await supabase.from('products').select('*').eq('id', 'deposit').single();
    
    if (existing) {
        console.log("'deposit' product already exists.");
        return;
    }

    console.log("Creating 'deposit' product...");
    const depositProduct = {
        id: 'deposit',
        name: 'Top Up Saldo',
        description: 'Layanan penambahan saldo akun Vanness Store.',
        price: 0,
        category: 'In-Game/Topup',
        image: 'https://files.catbox.moe/k8yobw.png',
        created_at: new Date().toISOString(),
        auto_delivery: false
    };

    const { error } = await supabase.from('products').insert([depositProduct]);
    if (error) {
        console.error("FAILED TO CREATE DEPOSIT PRODUCT:", error.message);
    } else {
        console.log("DEPOSIT PRODUCT CREATED SUCCESSFULLY.");
    }
}

createDepositProduct();
