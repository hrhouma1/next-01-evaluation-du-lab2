import type { Metadata } from 'next'

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
      <body>{children}</body>
    </html>
  )
}