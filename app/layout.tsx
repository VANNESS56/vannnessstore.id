import type { Metadata } from "next";
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
  icons: {
    icon: config.site.logo,
    apple: config.site.logo,
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
