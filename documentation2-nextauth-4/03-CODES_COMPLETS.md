# Codes complets NextAuth.js v4 - Copier/Coller

Ce fichier contient tous les codes complets à copier/coller exactement. Chaque code correspond à un fichier spécifique de votre projet.

## Variables d'environnement (.env)

```env
# Base de données (gardez votre URL existante)
DATABASE_URL="votre-url-postgresql-existante"

# NextAuth Configuration - OBLIGATOIRES
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="changez-cette-cle-secrete-minimum-32-caracteres-long-et-unique"

# OAuth Google - OPTIONNELS (laissez vide si pas configuré)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# OAuth GitHub - OPTIONNELS (laissez vide si pas configuré) 
GITHUB_ID=""
GITHUB_SECRET=""
```

## Schema Prisma (prisma/schema.prisma)

**IMPORTANT** : Ajoutez ce code À LA FIN de votre fichier schema.prisma existant, après le modèle Product.

```prisma
// MODIFIEZ votre modèle Product existant - AJOUTEZ seulement ces 2 lignes :
model Product {
  id    Int     @id @default(autoincrement())
  name  String
  price Float
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // AJOUTER ces 2 lignes pour la relation avec l'utilisateur
  createdBy   User? @relation(fields: [createdById], references: [id])
  createdById String?

  @@map("products")
}

// AJOUTER tous ces nouveaux modèles à la fin du fichier

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  password      String?   
  emailVerified DateTime?
  image         String?
  role          String    @default("user")
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  accounts Account[]
  sessions Session[]
  products Product[]

  @@map("users")
}

model Account {
  id                String  @id @default(cuid())
  userId            String  @map("user_id")
  type              String
  provider          String
  providerAccountId String  @map("provider_account_id")
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?
  createdAt         DateTime @default(now()) @map("created_at")
  updatedAt         DateTime @updatedAt @map("updated_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique @map("session_token")
  userId       String   @map("user_id")
  expires      DateTime
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model VerificationToken {
  identifier String
  token      String
  expires    DateTime

  @@unique([identifier, token])
  @@map("verificationtokens")
}
```

## Configuration NextAuth (lib/auth.ts)

**CRÉER LE FICHIER COMPLET :**

```typescript
import type { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role?: string | null
    }
  }

  interface User {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    role?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string | null
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { 
          label: "Email", 
          type: "email",
          placeholder: "votre@email.com" 
        },
        password: { 
          label: "Mot de passe", 
          type: "password" 
        },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email et mot de passe requis")
        }

        try {
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email,
            },
          })

          if (!user || !user.password) {
            throw new Error("Aucun compte trouvé avec cet email")
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            throw new Error("Mot de passe incorrect")
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          }
        } catch (error) {
          console.error("Erreur d'authentification:", error)
          throw new Error("Erreur lors de la connexion")
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!
        session.user.role = token.role as string
      }
      return session
    },
    async signIn({ user, account, profile }) {
      return true
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log(`Connexion réussie pour ${user.email}`)
    },
    async signOut({ token }) {
      console.log("Déconnexion d'un utilisateur")
    },
  },
  debug: process.env.NODE_ENV === "development",
}
```

## Routes NextAuth (app/api/auth/[...nextauth]/route.ts)

**CRÉER LE FICHIER COMPLET :**

```typescript
import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
```

## API Inscription (app/api/auth/signup/route.ts)

**CRÉER LE FICHIER COMPLET :**

```typescript
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password } = body

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: "Tous les champs sont requis" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Le mot de passe doit contenir au moins 6 caractères" },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "Adresse email invalide" },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "Un compte avec cet email existe déjà" },
        { status: 409 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: "user",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      }
    })

    return NextResponse.json(
      {
        success: true,
        data: user,
        message: "Compte créé avec succès"
      },
      { status: 201 }
    )

  } catch (error) {
    console.error("Erreur lors de l'inscription:", error)
    return NextResponse.json(
      { success: false, error: "Erreur serveur lors de l'inscription" },
      { status: 500 }
    )
  }
}
```

## SessionProvider (components/providers/SessionProvider.tsx)

**CRÉER LE FICHIER COMPLET :**

```typescript
"use client"

import { SessionProvider } from "next-auth/react"
import type { Session } from "next-auth"
import { ReactNode } from "react"

interface Props {
  children: ReactNode
  session: Session | null
}

export default function AuthSessionProvider({ children, session }: Props) {
  return <SessionProvider session={session}>{children}</SessionProvider>
}
```

## AuthButton (components/auth/AuthButton.tsx)

**CRÉER LE FICHIER COMPLET :**

```typescript
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
```

## Formulaire de connexion (components/auth/SignInForm.tsx)

**CRÉER LE FICHIER COMPLET :**

```typescript
"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"

export default function SignInForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Email ou mot de passe incorrect")
      } else {
        router.push(callbackUrl)
        router.refresh()
      }
    } catch (error) {
      setError("Une erreur est survenue")
    } finally {
      setLoading(false)
    }
  }

  const handleProviderSignIn = async (provider: "google" | "github") => {
    setLoading(true)
    try {
      await signIn(provider, { callbackUrl })
    } catch (error) {
      setError(`Erreur avec ${provider}`)
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-800">{error}</div>
        </div>
      )}

      <form className="space-y-6" onSubmit={handleSubmit}>
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
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            placeholder="Mot de passe"
          />
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </div>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-gray-50 text-gray-500">Ou continuer avec</span>
        </div>
      </div>

      <div className="space-y-3">
        <button
          type="button"
          onClick={() => handleProviderSignIn("google")}
          disabled={loading}
          className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
        >
          <span>Google</span>
        </button>

        <button
          type="button"
          onClick={() => handleProviderSignIn("github")}
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

## Formulaire d'inscription (components/auth/SignUpForm.tsx)

**CRÉER LE FICHIER COMPLET :**

```typescript
"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function SignUpForm() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

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

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-gray-50 text-gray-500">Ou créer un compte avec</span>
        </div>
      </div>

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

## Navigation (components/Navigation.tsx)

**CRÉER LE FICHIER COMPLET :**

```typescript
import Link from "next/link"
import AuthButton from "@/components/auth/AuthButton"

export default function Navigation() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
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
          <AuthButton />
        </div>
      </nav>
    </header>
  )
}
```

## Layout principal (app/layout.tsx)

**REMPLACER COMPLÈTEMENT le contenu existant :**

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

## Page de connexion (app/auth/signin/page.tsx)

**CRÉER LE FICHIER COMPLET :**

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

## Page d'inscription (app/auth/signup/page.tsx)

**CRÉER LE FICHIER COMPLET :**

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

## Middleware de protection (middleware.ts)

**CRÉER LE FICHIER À LA RACINE du projet :**

```typescript
import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    const protectedRoutes = [
      "/products/new",
      "/products/.+/edit",
      "/admin"
    ]
    
    const protectedApiRoutes = [
      "/api/products"
    ]

    const isProtectedRoute = protectedRoutes.some(route => {
      const regex = new RegExp(`^${route.replace(/\[.*?\]/g, '[^/]+')}$`)
      return regex.test(pathname)
    })
    
    const isProtectedApiRoute = protectedApiRoutes.some(route => 
      pathname.startsWith(route)
    )

    if (isProtectedRoute && !token) {
      const signInUrl = new URL("/auth/signin", req.url)
      signInUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(signInUrl)
    }

    if (isProtectedApiRoute && req.method !== "GET" && !token) {
      return NextResponse.json(
        { success: false, error: "Authentification requise" },
        { status: 401 }
      )
    }

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

export const config = {
  matcher: [
    "/products/new",
    "/products/:id/edit", 
    "/admin/:path*",
    "/api/products/:path*"
  ]
}
```

## Récapitulatif des fichiers créés

Voici tous les fichiers que vous devez créer ou modifier :

### Fichiers à CRÉER :
- `lib/auth.ts`
- `app/api/auth/[...nextauth]/route.ts`
- `app/api/auth/signup/route.ts`
- `components/providers/SessionProvider.tsx`
- `components/auth/AuthButton.tsx`
- `components/auth/SignInForm.tsx`
- `components/auth/SignUpForm.tsx`
- `components/Navigation.tsx`
- `app/auth/signin/page.tsx`
- `app/auth/signup/page.tsx`
- `middleware.ts`

### Fichiers à MODIFIER :
- `.env` (ajouter les variables NextAuth)
- `prisma/schema.prisma` (ajouter les modèles auth)
- `app/layout.tsx` (remplacer complètement)

### Après avoir copié tous ces codes :
```bash
npx prisma generate
npx prisma db push
npm run dev
```

Votre application d'authentification sera alors complètement fonctionnelle !
