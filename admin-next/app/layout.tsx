import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "قهوة الشام - لوحة التحكم",
  description: "لوحة تحكم إدارة قهوة الشام",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
