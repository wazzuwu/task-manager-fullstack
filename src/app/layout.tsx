import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'TaskFlow — Team Task Manager',
  description:
    'Manage projects, assign tasks, and track team progress in real time.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <body className="h-full bg-white text-slate-900 antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
