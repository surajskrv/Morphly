import type { Metadata } from 'next'
import { Toaster } from 'sonner'
import './globals.css'

export const metadata: Metadata = {
  title: 'Morphly — AI Job Application Automation',
  description: 'Find jobs, generate resumes, and auto-apply with AI.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground antialiased">
        {children}
        <Toaster
          position="top-center"
          richColors
          toastOptions={{
            style: {
              borderRadius: '0.75rem',
              fontSize: '0.875rem',
            },
          }}
        />
      </body>
    </html>
  )
}
