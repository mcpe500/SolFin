import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { UserProvider } from "@/contexts/user-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SolFin - Personal & Family Finance Planner",
  description: "A comprehensive personal finance management application with offline-first capabilities and AI-powered receipt scanning.",
  keywords: ["SolFin", "Finance", "Budget", "Personal Finance", "Money Management", "AI"],
  authors: [{ name: "SolFin Team" }],
  openGraph: {
    title: "SolFin - Personal Finance Planner",
    description: "Comprehensive personal finance management with AI-powered features",
    url: "https://solfin.app",
    siteName: "SolFin",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SolFin - Personal Finance Planner",
    description: "Comprehensive personal finance management with AI-powered features",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <UserProvider>
          {children}
        </UserProvider>
        <Toaster />
      </body>
    </html>
  );
}
