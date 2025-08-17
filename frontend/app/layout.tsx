import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Meeting Notes Summarizer',
  description: 'Generate professional summaries from meeting transcripts using AI',
  keywords: 'AI, meeting notes, summarizer, transcript, business',
  authors: [{ name: 'AI Meeting Summarizer' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-screen bg-white text-gray-900 dark:bg-dark-900 dark:text-gray-100 transition-colors duration-300`}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              style: {
                background: '#4CAF50',
              },
            },
            error: {
              duration: 5000,
              style: {
                background: '#F44336',
              },
            },
          }}
        />
      </body>
    </html>
  )
}