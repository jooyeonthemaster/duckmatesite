import type { Metadata } from "next";
import { Inter, Righteous } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const righteous = Righteous({
  weight: "400",
  variable: "--font-righteous",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "DUCKMATE | The Real K-pop Experience",
  description: "Discover real K-pop courses curated by Korean fandoms.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${righteous.variable}`}>
      <body className="antialiased bg-white text-foreground overflow-x-hidden selection:bg-kpop-pink selection:text-white">
        {children}
      </body>
    </html>
  );
}
