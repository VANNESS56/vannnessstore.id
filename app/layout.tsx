import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Vanness Store",
  description: "Platform penyedia layanan digital infrastruktur terpercaya. Panel Pterodactyl, VPS Premium, Script & Bot.",
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
};

import SecurityProvider from "@/components/SecurityProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${inter.variable} ${inter.className} antialiased`}>
        <SecurityProvider>
          {children}
        </SecurityProvider>
      </body>
    </html>
  );
}
