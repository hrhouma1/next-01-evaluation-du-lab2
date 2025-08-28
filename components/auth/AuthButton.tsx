"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { useState } from "react"

export default function AuthButton() {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(false)

  const handleSignOut = async () => {
    setLoading(true)
    try {
      await signOut({ callbackUrl: "/" })
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error)
      setLoading(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="flex items-center space-x-4">
        <div className="animate-pulse h-8 w-20 bg-gray-300 rounded"></div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex items-center space-x-4">
        <Link
          href="/auth/signin"
          className="text-gray-600 hover:text-gray-900 transition-colors"
        >
          Connexion
        </Link>
        <Link
          href="/auth/signup"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Inscription
        </Link>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        {session.user?.image && (
          <img
            src={session.user.image}
            alt={session.user.name || "Avatar"}
            className="w-8 h-8 rounded-full"
          />
        )}
        <span className="text-gray-700">
          Bonjour, {session.user?.name || session.user?.email}
        </span>
        {session.user?.role === "admin" && (
          <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
            Admin
          </span>
        )}
      </div>
      <button
        onClick={handleSignOut}
        disabled={loading}
        className="text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "..." : "Déconnexion"}
      </button>
    </div>
  )
}
