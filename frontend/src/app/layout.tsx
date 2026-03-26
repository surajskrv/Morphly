import type { Metadata } from "next";
import { Toaster } from "sonner";

import "./globals.css";

export const metadata: Metadata = {
  title: "Morphly — Job Discovery and Tailored Application Prep",
  description: "Find strong-fit jobs, tailor your resume and cover letter, and apply faster on the original source.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className="bg-background text-foreground antialiased">
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
      </body>
    </html>
  );
}
