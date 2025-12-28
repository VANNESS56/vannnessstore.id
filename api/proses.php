<?php
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $user_name = $_POST['username'];
    $user_email = $_POST['email'];

    // ==========================================
    // PENGATURAN UTAMA (GANTI DI SINI)
    // ==========================================
    $panel_url = "https://panel.vannessstore.id"; // Ganti dengan URL Panel lo
    $api_key = "ptla_K4JNpJp8SrpMfNDLq4ydDXGCK7WDWZLPWuAExWI90ND"; // Ganti dengan Application API Key
    
    $egg_id = 16;        // Sesuai screenshot lo (Node.js Generic)
    $location_id = 1;    // Cek di Admin -> Locations (ID nya berapa)
    // ==========================================

    $data = [
        "name" => "Server-" . $user_name,
        "user" => 1, // ID Admin atau ID User yang sudah ada di panel
        "nest" => 6, // Sesuai Nest ID di screenshot lo
        "egg" => $egg_id,
        "docker_image" => "ghcr.io/pterodactyl/yolks:nodejs_18",
        "startup" => "if [[ -d .git ]]; then git pull; fi; if [[ -f package.json ]]; then npm install; fi; node {{JS_FILE}}",
        "limits" => [
            "memory" => 1024, // 1GB RAM
            "swap" => 0,
            "disk" => 2048,   // 2GB Disk
            "io" => 500,
            "cpu" => 80       // 80% CPU
        ],
        "feature_limits" => [
            "databases" => 0,
            "allocations" => 1,
            "backups" => 0
        ],
        "environment" => [
            "USER_UPLOAD" => "0",    // FIX ERROR: Required field
            "AUTO_UPDATE" => "0",    // FIX ERROR: Required field
            "JS_FILE" => "index.js", // FIX ERROR: Required field
            "BOT_PY_FILE" => "index.js"
        ],
        "deploy" => [
            "locations" => [$location_id],
            "dedicated_ip" => false,
            "port_range" => []
        ],
        "start_on_completion" => true
    ];

    $ch = curl_init($panel_url . "/api/application/servers");
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Authorization: Bearer " . $api_key,
        "Content-Type: application/json",
        "Accept: application/json"
    ]);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    // Matikan verifikasi SSL jika lo test di localhost XAMPP dan dapet error SSL
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode == 201) {
        echo "<div style='font-family:sans-serif; text-align:center; margin-top:50px;'>";
        echo "<h1 style='color:green;'>Berhasil!</h1>";
        echo "<p>Server 1GB RAM / 80% CPU sedang dibuat. Cek panel lo!</p>";
        echo "<a href='index.html'>Kembali</a>";
        echo "</div>";
    } else {
        echo "<div style='font-family:sans-serif; padding:20px;'>";
        echo "<h1 style='color:red;'>Gagal!</h1>";
        echo "<p>Pesan Error dari Panel:</p>";
        echo "<pre style='background:#eee; padding:10px;'>" . $response . "</pre>";
        echo "<a href='index.html'>Coba Lagi</a>";
        echo "</div>";
    }
} else {
    header("Location: index.html");
}
?>
