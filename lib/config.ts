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
  admin: {
    whatsapp: "628999991950",
    telegram: "VannessWangsaff"
  },
  site: {
    name: "VANNESS STORE",
    description: "Platform penyedia layanan digital infrastruktur terpercaya.",
    logo: "https://files.catbox.moe/k8yobw.png"
  }
};
