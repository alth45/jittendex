import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// CARA BENAR MEMASANG LINK EXTERNAL DI NEXT.JS
export const metadata: Metadata = {
  title: "Jittendex Viewer",
  description: "Kanji Dictionary Viewer",
  other: {
    "resource-hints": "https://fonts.googleapis.com",
  },
  // Ini akan merender tag <link> secara otomatis di dalam <head> yang aman
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* Hapus tag <head> manual di sini. 
          Gunakan Metadata API di atas.
          Link font akan saya masukkan lewat dangerouslySetInnerHTML 
          agar tetap ada tapi tidak merusak sinkronisasi React.
      */}
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,400;0,500;1,400&family=Noto+Sans+JP:wght@400;700&family=Noto+Serif+JP:wght@400;700;900&family=Playfair+Display:ital,wght@1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}