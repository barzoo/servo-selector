import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import ClientLanguageProvider from "@/i18n/ClientLanguageProvider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "伺服选型工具 | Servo Sizing Tool",
  description: "Bosch Rexroth 伺服系统选型计算工具 | Servo System Sizing Tool",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClientLanguageProvider>
          {children}
        </ClientLanguageProvider>
      </body>
    </html>
  );
}
