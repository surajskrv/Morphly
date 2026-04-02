import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";

import { QueryProvider } from "@/providers/query-provider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Morphly — Job Discovery and Tailored Application Prep",
  description:
    "Find strong-fit jobs, tailor your resume and cover letter, and apply faster on the original source.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} data-scroll-behavior="smooth">
      <body className="bg-background text-foreground antialiased">
        <QueryProvider>
          {children}
          <Toaster
            position="top-center"
            richColors
            toastOptions={{
              style: {
                borderRadius: "1rem",
                fontSize: "0.875rem",
                boxShadow: "0 18px 42px rgba(72, 71, 63, 0.12)",
              },
            }}
          />
        </QueryProvider>
      </body>
    </html>
  );
}
