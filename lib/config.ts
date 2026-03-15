export const config = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  },
  pakasir: {
    slug: "vanness-store",
    apiKey: process.env.PAKASIR_API_KEY || "",
    apiBaseUrl: "https://app.pakasir.com/api",
    paymentBaseUrl: "https://pakasir.com/p",
    defaultMethod: "qris"
  },
  buzzerpanel: {
    apiKey: process.env.BUZZERPANEL_API_KEY || "",
    secretKey: process.env.BUZZERPANEL_SECRET_KEY || "",
    apiBaseUrl: "https://buzzerpanel.id/api/json.php"
  },
  admin: {
    whatsapp: "628999991950",
    telegram: "VannessWangsaff",
    instagram: "pannesscoyy"
  },
  site: {
    name: "VANNESS STORE",
    description: "Vanness Store adalah platform layanan social media marketing yang menyediakan berbagai layanan untuk meningkatkan popularitas akun media sosial seperti followers, likes, dan viewers dengan proses cepat dan harga terjangkau.",
    logo: "https://files.catbox.moe/k8yobw.png"
  }
};
