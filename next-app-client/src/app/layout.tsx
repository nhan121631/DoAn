import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { NextAuthProvider } from "./components/providers/authProviders";
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
  title: "Ants - Find rooms, apartments, and houses for students and workers",
  description:
    "Ants - Find rooms, apartments, and houses for students and workers. Search, compare, and move in easily and quickly.",
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
          <AntdRegistry>
            <FavoriteInitializer />
            {children}
          </AntdRegistry>
        </NextAuthProvider>
      </body>
    </html>
  );
}
