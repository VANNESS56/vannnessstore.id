
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function listTables() {
  const { data, error } = await supabase
    .from('products')
    .select('id')
    .limit(1);
    
  if (error) {
    console.error('Error selecting from products:', error);
  } else {
    console.log('Successfully connected to Supabase.');
  }

  // There isn't a direct way to list tables via JS client without RPC or postgres introspection.
  // I'll just try to create the settings table via SQL if it doesn't exist.
}

listTables();
