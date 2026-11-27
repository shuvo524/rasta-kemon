import type { Metadata } from "next";
import { Hind_Siliguri, Inter } from "next/font/google";
import "./globals.css";
import LanguageProvider from "@/components/LanguageProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const hindSiliguri = Hind_Siliguri({
  subsets: ["bengali", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-bangla",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "রাস্তা কেমন — বের হওয়ার আগে জেনে নিন, আপনার সামনের রাস্তা কেমন",
  description:
    "কমিউনিটি-চালিত রোড ইন্টেলিজেন্স প্ল্যাটফর্ম — বাংলাদেশের রাস্তার অবস্থা জানুন, সমস্যার খবর দিন, অন্যদের যাত্রা সহজ করুন।",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn" className={`${hindSiliguri.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-cream font-sans text-ink antialiased">
        <LanguageProvider>
          <Navbar />
          <main className="min-h-[70vh]">{children}</main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
