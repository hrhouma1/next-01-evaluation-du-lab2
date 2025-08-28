import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // Pages qui nécessitent une authentification
    const protectedRoutes = [
      "/products/new",
      "/products/[id]/edit"
    ]
    
    // APIs qui nécessitent une authentification
    const protectedApiRoutes = [
      "/api/products"
    ]

    // Vérifier si la route courante nécessite une authentification
    const isProtectedRoute = protectedRoutes.some(route => 
      pathname.match(route.replace(/\[.*?\]/g, '[^/]+'))
    )
    
    const isProtectedApiRoute = protectedApiRoutes.some(route => 
      pathname.startsWith(route)
    )

    // Si c'est une route protégée et que l'utilisateur n'est pas connecté
    if (isProtectedRoute && !token) {
      const signInUrl = new URL("/auth/signin", req.url)
      signInUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(signInUrl)
    }

    // Si c'est une API protégée et que l'utilisateur n'est pas connecté
    if (isProtectedApiRoute && req.method !== "GET" && !token) {
      return NextResponse.json(
        { success: false, error: "Authentification requise" },
        { status: 401 }
      )
    }

    // Protection admin pour certaines routes
    const adminOnlyRoutes = [
      "/admin"
    ]

    const isAdminRoute = adminOnlyRoutes.some(route => 
      pathname.startsWith(route)
    )

    if (isAdminRoute && token?.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Accès admin requis" },
        { status: 403 }
      )
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
)

export const config = {
  matcher: [
    // Matcher pour les routes à protéger
    "/products/new",
    "/products/:id/edit",
    "/api/products/:path*",
    "/admin/:path*"
  ]
}
