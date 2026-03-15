const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gxjpsqqxajvltbksqgly.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4anBzcXF4YWp2bHRia3NxZ2x5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMjAxNTUsImV4cCI6MjA4ODg5NjE1NX0.kEAQpe8Hk7347NA-4eoNMUGRn35RC4604QyWVwZzan4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFullInsert() {
    console.log("Testing a full transaction insert manually...");
    
    const transaction = {
        id: `trx_test_${Date.now()}`,
        order_id: `TEST_${Date.now()}`,
        product_id: 'deposit',
        product_name: 'Test Deposit',
        customer_name: 'test_user',
        amount: 10000,
        status: 'pending',
        payment_method: 'qris',
        created_at: new Date().toISOString()
    };

    const { error } = await supabase.from('transactions').insert([transaction]);
    
    if (error) {
        console.error("FULL INSERT FAILED:", error);
    } else {
        console.log("FULL INSERT SUCCESS!");
    }
}

testFullInsert();
