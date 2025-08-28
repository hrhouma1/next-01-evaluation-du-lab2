# Suite du Guide NextAuth.js v4 - Étapes 11 à 20

## Étape 11 : Formulaire d'inscription

Créez le fichier `components/auth/SignUpForm.tsx` :

```typescript
"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function SignUpForm() {
  // États du formulaire
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  
  const router = useRouter()

  // Soumission du formulaire d'inscription
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    // Validation côté client
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas")
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères")
      setLoading(false)
      return
    }

    try {
      // Appel à l'API d'inscription
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.toLowerCase().trim(),
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de l'inscription")
      }

      setSuccess("Compte créé avec succès ! Connexion en cours...")
      
      // Connexion automatique après inscription
      const result = await signIn("credentials", {
        email: email.toLowerCase().trim(),
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Compte créé mais erreur de connexion")
      } else {
        router.push("/")
        router.refresh()
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Inscription via OAuth
  const handleProviderSignUp = async (provider: "google" | "github") => {
    setLoading(true)
    try {
      await signIn(provider, { callbackUrl: "/" })
    } catch (error) {
      setError(`Erreur avec ${provider}`)
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Messages d'erreur et succès */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-800">{error}</div>
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-50 p-4">
          <div className="text-sm text-green-800">{success}</div>
        </div>
      )}

      {/* Formulaire d'inscription */}
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name" className="sr-only">
            Nom complet
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            placeholder="Nom complet"
          />
        </div>
        
        <div>
          <label htmlFor="email" className="sr-only">
            Adresse email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            placeholder="Adresse email"
          />
        </div>
        
        <div>
          <label htmlFor="password" className="sr-only">
            Mot de passe
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            placeholder="Mot de passe (min. 6 caractères)"
          />
        </div>
        
        <div>
          <label htmlFor="confirmPassword" className="sr-only">
            Confirmer le mot de passe
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            placeholder="Confirmer le mot de passe"
          />
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Création du compte..." : "Créer le compte"}
          </button>
        </div>
      </form>

      {/* Séparateur */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-gray-50 text-gray-500">Ou créer un compte avec</span>
        </div>
      </div>

      {/* Boutons OAuth */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => handleProviderSignUp("google")}
          disabled={loading}
          className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
        >
          <span>Google</span>
        </button>

        <button
          type="button"
          onClick={() => handleProviderSignUp("github")}
          disabled={loading}
          className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
        >
          <span>GitHub</span>
        </button>
      </div>
    </div>
  )
}
```

## Étape 12 : Composant de navigation

Créez le fichier `components/Navigation.tsx` :

```typescript
import Link from "next/link"
import AuthButton from "@/components/auth/AuthButton"

export default function Navigation() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo et navigation principale */}
          <div className="flex items-center space-x-8">
            <Link 
              href="/" 
              className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
            >
              Mon Application
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
          
          {/* Boutons d'authentification */}
          <AuthButton />
        </div>
      </nav>
    </header>
  )
}
```

## Étape 13 : Mise à jour du layout principal

Modifiez le fichier `app/layout.tsx` pour intégrer l'authentification :

```typescript
import type { Metadata } from 'next'
import './globals.css'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import AuthSessionProvider from "@/components/providers/SessionProvider"
import Navigation from "@/components/Navigation"

export const metadata: Metadata = {
  title: 'Mon Application - Avec Authentification',
  description: 'Application avec authentification NextAuth.js',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Récupérer la session côté serveur
  const session = await getServerSession(authOptions)

  return (
    <html lang="fr">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <AuthSessionProvider session={session}>
          <div className="min-h-screen flex flex-col">
            {/* Navigation avec authentification */}
            <Navigation />
            
            {/* Contenu principal */}
            <main className="flex-1 container mx-auto px-4 py-8">
              {children}
            </main>
            
            {/* Footer */}
            <footer className="bg-gray-800 text-white py-8 mt-12">
              <div className="container mx-auto px-4 text-center">
                <p>&copy; 2024 Mon Application. Tous droits réservés.</p>
                <p className="text-gray-400 text-sm mt-2">
                  Sécurisée avec NextAuth.js
                </p>
              </div>
            </footer>
          </div>
        </AuthSessionProvider>
      </body>
    </html>
  )
}
```

## Étape 14 : Pages d'authentification

### Page de connexion

Créez les dossiers et la page de connexion :

```bash
# Créer les dossiers pour les pages d'auth
mkdir -p app/auth/signin
mkdir -p app/auth/signup
```

Créez le fichier `app/auth/signin/page.tsx` :

```typescript
import { Metadata } from "next"
import SignInForm from "@/components/auth/SignInForm"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Connexion - Mon Application",
  description: "Connectez-vous à votre compte",
}

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Connectez-vous à votre compte
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ou{" "}
            <Link
              href="/auth/signup"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              créez un nouveau compte
            </Link>
          </p>
        </div>
        <SignInForm />
      </div>
    </div>
  )
}
```

### Page d'inscription

Créez le fichier `app/auth/signup/page.tsx` :

```typescript
import { Metadata } from "next"
import SignUpForm from "@/components/auth/SignUpForm"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Inscription - Mon Application",
  description: "Créez votre compte",
}

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Créez votre compte
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ou{" "}
            <Link
              href="/auth/signin"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              connectez-vous à votre compte existant
            </Link>
          </p>
        </div>
        <SignUpForm />
      </div>
    </div>
  )
}
```

## Étape 15 : Middleware de protection des routes

Créez le fichier `middleware.ts` à la racine du projet :

```typescript
import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // Pages qui nécessitent une authentification
    const protectedRoutes = [
      "/products/new",
      "/products/.+/edit", // Regex pour /products/123/edit
      "/admin"
    ]
    
    // APIs qui nécessitent une authentification (sauf GET)
    const protectedApiRoutes = [
      "/api/products"
    ]

    // Vérifier si la route courante est protégée
    const isProtectedRoute = protectedRoutes.some(route => {
      const regex = new RegExp(`^${route.replace(/\[.*?\]/g, '[^/]+')}$`)
      return regex.test(pathname)
    })
    
    const isProtectedApiRoute = protectedApiRoutes.some(route => 
      pathname.startsWith(route)
    )

    // Si c'est une route protégée et que l'utilisateur n'est pas connecté
    if (isProtectedRoute && !token) {
      const signInUrl = new URL("/auth/signin", req.url)
      signInUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(signInUrl)
    }

    // Si c'est une API protégée (POST, PUT, DELETE) et pas de token
    if (isProtectedApiRoute && req.method !== "GET" && !token) {
      return NextResponse.json(
        { success: false, error: "Authentification requise" },
        { status: 401 }
      )
    }

    // Protection admin pour certaines routes
    const adminOnlyRoutes = ["/admin"]
    const isAdminRoute = adminOnlyRoutes.some(route => 
      pathname.startsWith(route)
    )

    if (isAdminRoute && token?.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Accès administrateur requis" },
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

// Configuration des routes à surveiller
export const config = {
  matcher: [
    // Pages protégées
    "/products/new",
    "/products/:id/edit",
    "/admin/:path*",
    // APIs protégées
    "/api/products/:path*"
  ]
}
```

## Étape 16 : Test de l'authentification

Démarrez votre serveur de développement :

```bash
npm run dev
```

Votre application devrait maintenant démarrer sans erreur. Ouvrez votre navigateur et allez sur l'adresse affichée (généralement `http://localhost:3000` ou `http://localhost:3001`).

### Tests à effectuer :

1. **Accueil** : Vérifiez que la navigation affiche "Connexion" et "Inscription"

2. **Inscription** :
   - Allez sur `/auth/signup`
   - Créez un compte avec :
     - Nom : "Test User"
     - Email : "test@example.com"
     - Mot de passe : "test123456"
   - Après inscription, vous devriez être automatiquement connecté

3. **Connexion** :
   - Déconnectez-vous
   - Allez sur `/auth/signin`
   - Connectez-vous avec les identifiants créés

4. **Protection des routes** :
   - Sans connexion, essayez d'aller sur `/products/new`
   - Vous devriez être redirigé vers la page de connexion
   - Après connexion, l'accès devrait être autorisé

## Étape 17 : Protection des APIs existantes (optionnel)

Si vous avez des APIs de produits existantes que vous voulez protéger, ajoutez cette vérification au début de vos fonctions POST, PUT, DELETE :

```typescript
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function POST(request: NextRequest) {
  // Vérifier l'authentification
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Authentification requise" },
      { status: 401 }
    )
  }

  // Le reste de votre code existant...
}
```

## Étape 18 : Configuration OAuth (optionnel)

### Google OAuth

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez un existant
3. Activez l'API Google+ 
4. Créez des identifiants OAuth 2.0
5. Ajoutez `http://localhost:3000/api/auth/callback/google` aux URIs de redirection autorisées
6. Copiez Client ID et Client Secret dans votre `.env`

### GitHub OAuth

1. Allez sur [GitHub Settings > Developer settings](https://github.com/settings/developers)
2. Créez une nouvelle OAuth App
3. Authorization callback URL : `http://localhost:3000/api/auth/callback/github`
4. Copiez App ID et Client Secret dans votre `.env`

## Étape 19 : Débogage et résolution de problèmes

### Problèmes courants :

1. **Erreur "Module not found"** :
   ```bash
   # Réinstallez les dépendances
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Erreur Prisma** :
   ```bash
   # Régénérez le client
   npx prisma generate
   npx prisma db push
   ```

3. **Session non persistante** :
   - Vérifiez que `NEXTAUTH_SECRET` est bien défini
   - Vérifiez que la base de données est accessible

4. **OAuth ne fonctionne pas** :
   - Vérifiez que les variables d'environnement sont correctes
   - Vérifiez les URLs de callback

## Étape 20 : Commit de votre travail

Une fois que tout fonctionne :

```bash
# Ajouter tous les fichiers
git add -A

# Commiter les changements
git commit -m "feat: implement NextAuth.js v4 authentication system

- Add email/password authentication with bcrypt hashing
- Add Google and GitHub OAuth providers
- Add user registration and login pages
- Add protected routes and API endpoints
- Add role-based access control (user/admin)
- Add responsive authentication UI components
- Add session management and middleware protection"

# Pousser la branche (optionnel)
git push origin feature/nextauth-implementation
```

## Félicitations !

Vous venez d'implémenter un système d'authentification complet avec NextAuth.js v4. Votre application dispose maintenant de :

- Authentification multi-fournisseurs (email/mot de passe, Google, GitHub)
- Protection automatique des routes sensibles
- APIs sécurisées avec contrôle d'accès
- Interface utilisateur adaptative
- Gestion des rôles utilisateurs
- Sessions sécurisées

La suite de la documentation se trouve dans les autres fichiers de ce dossier pour les configurations avancées et le débogage.
