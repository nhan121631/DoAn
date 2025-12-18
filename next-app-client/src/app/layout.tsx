import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { NextAuthProvider } from "./components/providers/authProviders";
import SessionWatcher from "@/components/SessionWatcher";
import FavoriteInitializer from "./user-dashboard/components/favorited-rooms/FavoriteInitializer";
import { AntdRegistry } from "@ant-design/nextjs-registry";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ants - Tìm phòng, căn hộ và nhà cho sinh viên và người lao động",
  description:
    "Ants - Nền tảng cho thuê nhà hàng đầu dành cho sinh viên và người lao động. Tìm kiếm phòng, căn hộ và nhà với giá cả phải chăng, tiện nghi hiện đại và vị trí thuận tiện. Đặt phòng dễ dàng, nhanh chóng và an toàn với Ants ngay hôm nay!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${robotoMono.variable} antialiased`}>
        <NextAuthProvider>
          <SessionWatcher />
          <AntdRegistry>
            <FavoriteInitializer />
            {children}
          </AntdRegistry>
        </NextAuthProvider>
      </body>
    </html>
  );
}
