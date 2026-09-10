import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import "./globals.css";
import Navbar from "@/components/navbar";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "SkyCrash — Free Practice Crash Game",
  description: "A free demo crash-multiplier game. Practice cashing out with virtual credits — no real money, no purchases, no predictions.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-black text-white min-h-screen flex flex-col`}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}

