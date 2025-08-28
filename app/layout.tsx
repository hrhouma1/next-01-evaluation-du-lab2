import type { Metadata } from 'next'
import './globals.css'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import AuthSessionProvider from "@/components/providers/SessionProvider"
import Navigation from "@/components/Navigation"

export const metadata: Metadata = {
  title: 'Laboratoire 2 - Services Web',
  description: 'Application de gestion de produits avec services REST et authentification',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="fr">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <AuthSessionProvider session={session}>
          <div className="min-h-screen flex flex-col">
            <Navigation />
            <main className="flex-1 container mx-auto px-4 py-8">
              {children}
            </main>
            <footer className="bg-gray-800 text-white py-8 mt-12">
              <div className="container mx-auto px-4 text-center">
                <p>&copy; 2024 Laboratoire 2. Tous droits réservés.</p>
                <p className="text-gray-400 text-sm mt-2">
                  API REST avec authentification NextAuth
                </p>
              </div>
            </footer>
          </div>
        </AuthSessionProvider>
      </body>
    </html>
  )
}