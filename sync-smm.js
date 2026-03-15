const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const API_KEY = process.env.BUZZERPANEL_API_KEY;
const SECRET_KEY = process.env.BUZZERPANEL_SECRET_KEY;
const API_URL = "https://buzzerpanel.id/api/json.php";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function syncServices() {
    console.log("--- Memulai Sinkronisasi SMM Buzzerpanel ---");

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                api_key: API_KEY,
                secret_key: SECRET_KEY,
                action: 'services'
            })
        });

        const result = await response.json();

        if (!result.status) {
            console.error("Gagal mengambil data dari Buzzerpanel:", result.data.msg);
            return;
        }

        const services = result.data;
        console.log(`Ditemukan ${services.length} layanan.`);

        // Ambil kategori unik untuk inspirasi (opsional)
        // const categories = [...new Set(services.map(s => s.category))];

        // Kita hanya akan mensinkronisasi beberapa layanan contoh atau semuanya?
        // Untuk tahap awal, mari kita sinkronisasi semuanya atau batas tertentu.
        // PERHATIAN: Harga dari Buzzerpanel mungkin perlu kita markup.
        
        const productsToUpsert = services.map(s => ({
            id: `smm_${s.id}`,
            name: s.name,
            description: s.note || `Layanan SMM untuk ${s.category}`,
            price: Math.ceil(s.price * 1.15), // Markup 15%
            category: s.category,
            image: "https://files.catbox.moe/k8yobw.png", // Default logo
            smm_service_id: s.id.toString(),
            provider: 'buzzerpanel',
            min_qty: s.min,
            max_qty: s.max,
            created_at: new Date().toISOString()
        }));

        console.log(`Mengunggah ke Supabase...`);
        
        // Chunking jika data terlalu besar (Supabase has limits)
        const chunkSize = 50;
        for (let i = 0; i < productsToUpsert.length; i += chunkSize) {
            const chunk = productsToUpsert.slice(i, i + chunkSize);
            const { error } = await supabase.from('products').upsert(chunk);
            if (error) {
                console.error(`Error pada chunk ${i}:`, error.message);
            } else {
                console.log(`Chunk ${i / chunkSize + 1} selesai.`);
            }
        }

        console.log("✅ Sinkronisasi SMM Selesai.");
    } catch (err) {
        console.error("Terjadi kesalahan:", err.message);
    }
}

syncServices();
