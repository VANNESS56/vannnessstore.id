const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gxjpsqqxajvltbksqgly.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4anBzcXF4YWp2bHRia3NxZ2x5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMjAxNTUsImV4cCI6MjA4ODg5NjE1NX0.kEAQpe8Hk7347NA-4eoNMUGRn35RC4604QyWVwZzan4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    console.log("Checking transactions table structure...");
    
    // Attempt an insert of a dummy transaction to see what columns it expects
    // We'll use a very minimal object and see the error message
    const { error: insertError } = await supabase
        .from('transactions')
        .insert([{ id: 'test_probe_' + Date.now() }]);
    
    if (insertError) {
        console.error("Insert Error (expected columns missing or constraint failed):", insertError.message);
        // Sometimes the error message contains the column names that are required
    }

    // Try to fetch one row and list keys
    const { data, error } = await supabase.from('transactions').select('*').limit(1);
    if (error) {
        console.error("Error fetching transactions:", error.message);
    } else if (data && data.length > 0) {
        console.log("Existing columns in transactions:", Object.keys(data[0]));
    } else {
        console.log("No data in transactions table or table is empty.");
        // Try to get column information via an RPC if available, or just check products as a baseline
        const { data: pData } = await supabase.from('products').select('*').limit(1);
        if (pData) console.log("Baseline products columns:", Object.keys(pData[0] || {}));
    }
}

checkSchema();
