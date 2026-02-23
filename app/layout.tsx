import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import ThemeRegistry from '@/components/ThemeRegistry'
import { AuthProvider } from '@/contexts/AuthContext'
import Navbar from '@/components/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Frontend Project',
  description: 'Next.js + TypeScript application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeRegistry>
          <AuthProvider>
            <Navbar />
            {children}
          </AuthProvider>
        </ThemeRegistry>
      </body>
    </html>
  )
}
