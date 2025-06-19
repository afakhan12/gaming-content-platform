import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import Image from "next/image";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Updated Gaming Content Platform",
  description: "Updated Gaming Content Platform for managing articles and translations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/images/icon.png" type="image/png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <nav className="w-full flex items-center py-4 bg-white/80 dark:bg-black/80 shadow-md mb-8 sticky top-0 z-50">
          <div className="flex items-center w-full max-w-7xl px-4 mx-auto">
            <Link href="/" className="flex items-center gap-2 mr-8">
              <Image src="/images/logo.png" alt="Site Logo" width={120} height={32} className="hidden sm:block" />
            </Link>
            <div className="flex gap-8 text-base font-medium flex-1 justify-center">
              <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
              <Link href="/dashboard" className="hover:text-blue-600 transition-colors">Dashboard</Link>
              <Link href="/dashboard/posted" className="hover:text-blue-600 transition-colors">Posted</Link>
              <Link href="/dashboard/bucket" className="hover:text-blue-600 transition-colors">Bucket</Link>
              <Link href="/dashboard/translations" className="hover:text-blue-600 transition-colors">Translations</Link>
              <Link href="/dashboard/archived" className="hover:text-blue-600 transition-colors">Archived</Link>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
