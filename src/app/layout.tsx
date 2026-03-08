import type { Metadata } from "next";
import "./globals.css";
import ClientLanguageProvider from "@/i18n/ClientLanguageProvider";

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
      <body className="antialiased">
        <ClientLanguageProvider>
          {children}
        </ClientLanguageProvider>
      </body>
    </html>
  );
}
