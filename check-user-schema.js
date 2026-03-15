
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkUserSchema() {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .limit(1);
    
  if (data && data.length > 0) {
    console.log('User Columns:', Object.keys(data[0]));
  } else {
    console.log('No user data or error:', error);
  }
}

checkUserSchema();
