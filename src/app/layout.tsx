import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClientProviders } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Content Hub - Advanced CMS System",
  description: "A powerful content management system built with Next.js and modern technologies",
  keywords: ["CMS", "Content Management", "Blog", "Next.js", "React"],
  authors: [{ name: "Content Hub Team" }],
  openGraph: {
    title: "Content Hub - Advanced CMS System",
    description: "A powerful content management system built with Next.js and modern technologies",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#3b82f6" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
