import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

import { config } from "@/lib/config";

export const metadata: Metadata = {
  title: config.site.name,
  description: config.site.description,
  manifest: "/manifest.json",
  icons: {
    icon: config.site.logo,
    apple: config.site.logo,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: config.site.name,
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  themeColor: "#44A194",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

import SecurityProvider from "@/components/SecurityProvider";
import PWARegister from "@/components/PWARegister";
import InstallAppBanner from "@/components/InstallAppBanner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content={config.site.name} />
        <link rel="apple-touch-icon" href={config.site.logo} />
      </head>
      <body className={`${inter.variable} ${inter.className} antialiased`}>
        <SecurityProvider>
          {children}
        </SecurityProvider>
        <PWARegister />
        <InstallAppBanner />
      </body>
    </html>
  );
}
