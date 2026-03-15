const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gxjpsqqxajvltbksqgly.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4anBzcXF4YWp2bHRia3NxZ2x5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMjAxNTUsImV4cCI6MjA4ODg5NjE1NX0.kEAQpe8Hk7347NA-4eoNMUGRn35RC4604QyWVwZzan4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProducts() {
    console.log("Checking products table structure...");
    const { data: products, error } = await supabase.from('products').select('*').limit(1);
    if (error) {
        console.error("Error fetching products:", error.message);
    } else if (products && products.length > 0) {
        console.log("Columns in products:", Object.keys(products[0]));
    }
}

checkProducts();
