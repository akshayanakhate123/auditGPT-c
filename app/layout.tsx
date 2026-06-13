import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AuditGPT: AI-Powered D2C Growth Audits",
  description:
    "Get a structured D2C growth audit in 20 minutes. AI-powered diagnostic across 6 dimensions: PDP, Creative, Social, Funnel, Retention, SEO.",
  keywords: ["D2C audit", "growth audit", "brand health", "AI audit", "ecommerce"],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-background text-foreground antialiased" suppressHydrationWarning>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
