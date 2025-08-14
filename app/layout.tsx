import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Laboratoire 2 - Services Web',
  description: 'Application de gestion de produits avec services REST',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">{children}</body>
    </html>
  )
}