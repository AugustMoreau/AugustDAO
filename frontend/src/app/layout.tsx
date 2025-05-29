import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AugustDAO',
  description: 'A decentralized autonomous organization built on Solana',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
            {children}
          </main>
          <Toaster position="bottom-right" />
        </Providers>
      </body>
    </html>
  )
} 