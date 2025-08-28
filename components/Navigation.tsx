import Link from "next/link"
import AuthButton from "@/components/auth/AuthButton"

export default function Navigation() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold text-gray-900 hover:text-blue-600">
              Laboratoire 2 - Auth
            </Link>
            <div className="hidden md:flex space-x-6">
              <Link 
                href="/" 
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Accueil
              </Link>
              <Link 
                href="/products" 
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Produits
              </Link>
              <Link 
                href="/api-docs" 
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                API Docs
              </Link>
            </div>
          </div>
          <AuthButton />
        </div>
      </nav>
    </header>
  )
}
