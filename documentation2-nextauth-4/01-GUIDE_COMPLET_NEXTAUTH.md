# Guide complet NextAuth.js v4 - Authentification sécurisée

## Introduction

Ce guide vous permettra d'ajouter un système d'authentification complet à votre application Next.js App Router. Vous allez implémenter la connexion par email/mot de passe, Google OAuth, GitHub OAuth, ainsi que la protection des routes et des APIs.

L'authentification NextAuth.js v4 est une solution robuste utilisée en production par des milliers d'applications. À la fin de ce guide, vous aurez une application sécurisée avec gestion des utilisateurs, sessions et contrôle d'accès.

## Prérequis

Avant de commencer, assurez-vous d'avoir :
- Un projet Next.js 14+ avec App Router
- Node.js 18+ installé
- Une base de données PostgreSQL (Neon, Supabase, ou locale)
- Un éditeur de code (VS Code recommandé)
- Connaissance de base de React et TypeScript

## Vue d'ensemble de l'architecture finale

Une fois terminé, votre application aura :
- Authentification multi-fournisseurs (email/mot de passe, Google, GitHub)
- Pages de connexion et inscription sécurisées
- Protection automatique des routes sensibles
- APIs protégées avec middleware
- Interface utilisateur adaptative selon l'état de connexion
- Gestion des rôles utilisateurs (user, admin)
- Sessions sécurisées avec JWT

## Étape 1 : Création d'une nouvelle branche

Nous allons travailler sur une branche séparée pour ne pas affecter votre code existant.

```bash
# Créer et basculer sur une nouvelle branche
git checkout -b feature/nextauth-implementation

# Vérifier que vous êtes sur la bonne branche
git branch
```

Vous devriez voir une étoile (*) devant `feature/nextauth-implementation`.

## Étape 2 : Installation des packages NextAuth

Installez NextAuth v4 et ses dépendances :

```bash
# Package principal NextAuth v4 (stable)
npm install next-auth@4

# Adaptateur pour Prisma (connexion base de données)
npm install @next-auth/prisma-adapter

# Hachage des mots de passe
npm install bcryptjs

# Types TypeScript pour bcryptjs
npm install @types/bcryptjs
```

Attendez que toutes les installations se terminent avant de passer à l'étape suivante.

## Étape 3 : Configuration des variables d'environnement

Créez ou modifiez le fichier `.env` à la racine de votre projet :

```env
# Variables existantes (gardez-les)
DATABASE_URL="votre-url-de-base-de-donnees"

# Variables NextAuth (AJOUTEZ ces lignes)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="changez-cette-clé-secrète-minimum-32-caractères-uniques"

# OAuth Google (optionnel - laissez vide pour commencer)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# OAuth GitHub (optionnel - laissez vide pour commencer)
GITHUB_ID=""
GITHUB_SECRET=""
```

**Important :** 
- Remplacez `NEXTAUTH_SECRET` par une vraie clé secrète longue
- Ne partagez jamais ce fichier `.env` publiquement
- Si votre serveur démarre sur un autre port (ex: 3001), modifiez `NEXTAUTH_URL`

## Étape 4 : Mise à jour du schéma Prisma

Ouvrez le fichier `prisma/schema.prisma` et ajoutez les modèles d'authentification à la fin du fichier, après votre modèle Product existant :

```prisma
// Modèle Product existant - NE PAS MODIFIER
model Product {
  id    Int     @id @default(autoincrement())
  name  String
  price Float
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // AJOUTER cette relation avec l'utilisateur
  createdBy   User? @relation(fields: [createdById], references: [id])
  createdById String?

  @@map("products")
}

// NOUVEAUX MODÈLES - AJOUTER à la fin du fichier

// Modèle utilisateur principal
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  password      String?   // Pour l'authentification locale
  emailVerified DateTime?
  image         String?
  role          String    @default("user") // user ou admin
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations NextAuth (obligatoires)
  accounts Account[]
  sessions Session[]

  // Relations avec les produits
  products Product[]

  @@map("users")
}

// Modèle pour les comptes OAuth (Google, GitHub, etc.)
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

// Modèle pour les sessions actives
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

// Modèle pour les tokens de vérification
model VerificationToken {
  identifier String
  token      String
  expires    DateTime

  @@unique([identifier, token])
  @@map("verificationtokens")
}
```

## Étape 5 : Application des changements à la base de données

Générez le client Prisma et appliquez les changements :

```bash
# Générer le client Prisma avec les nouveaux modèles
npx prisma generate

# Appliquer les changements à votre base de données
npx prisma db push
```

Vous devriez voir un message de confirmation que les tables ont été créées.

## Étape 6 : Configuration NextAuth

Créez le fichier `lib/auth.ts` avec la configuration complète :

```typescript
import type { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

// Extension des types NextAuth pour inclure le rôle
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

// Configuration principale NextAuth
export const authOptions: NextAuthOptions = {
  // Connexion avec Prisma pour la base de données
  adapter: PrismaAdapter(prisma),
  
  // Fournisseurs d'authentification
  providers: [
    // Google OAuth (optionnel)
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    
    // GitHub OAuth (optionnel)
    GitHubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
    }),
    
    // Authentification par email/mot de passe
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
        // Vérifier que les credentials sont fournis
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email et mot de passe requis")
        }

        try {
          // Chercher l'utilisateur en base de données
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email,
            },
          })

          // Vérifier que l'utilisateur existe et a un mot de passe
          if (!user || !user.password) {
            throw new Error("Aucun compte trouvé avec cet email")
          }

          // Vérifier le mot de passe
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            throw new Error("Mot de passe incorrect")
          }

          // Retourner les données utilisateur
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
  
  // Configuration des sessions
  session: {
    strategy: "jwt", // Utiliser JWT pour les sessions
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },
  
  // Callbacks pour personnaliser le comportement
  callbacks: {
    // Personnaliser le token JWT
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    
    // Personnaliser l'objet session
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!
        session.user.role = token.role as string
      }
      return session
    },
    
    // Contrôler qui peut se connecter
    async signIn({ user, account, profile }) {
      return true // Autoriser toutes les connexions
    },
  },
  
  // Pages personnalisées
  pages: {
    signIn: "/auth/signin", // Page de connexion personnalisée
    error: "/auth/error",   // Page d'erreur personnalisée
  },
  
  // Événements pour logging
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log(`Connexion réussie pour ${user.email}`)
    },
    async signOut({ token }) {
      console.log("Déconnexion d'un utilisateur")
    },
  },
  
  // Mode debug en développement
  debug: process.env.NODE_ENV === "development",
}
```

## Étape 7 : Création des routes d'authentification

Créez le dossier et fichier pour les routes NextAuth :

```bash
# Créer le dossier des routes d'authentification
mkdir -p app/api/auth/[...nextauth]
```

Créez le fichier `app/api/auth/[...nextauth]/route.ts` :

```typescript
import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
```

## Étape 8 : API d'inscription

Créez le dossier et l'API pour l'inscription :

```bash
# Créer le dossier pour l'API d'inscription
mkdir -p app/api/auth/signup
```

Créez le fichier `app/api/auth/signup/route.ts` :

```typescript
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    // Récupérer les données du body
    const body = await request.json()
    const { name, email, password } = body

    // Validation des données obligatoires
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: "Tous les champs sont requis" },
        { status: 400 }
      )
    }

    // Validation de la longueur du mot de passe
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Le mot de passe doit contenir au moins 6 caractères" },
        { status: 400 }
      )
    }

    // Validation du format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "Adresse email invalide" },
        { status: 400 }
      )
    }

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "Un compte avec cet email existe déjà" },
        { status: 409 }
      )
    }

    // Hasher le mot de passe (12 rounds pour la sécurité)
    const hashedPassword = await bcrypt.hash(password, 12)

    // Créer l'utilisateur en base
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: "user", // Rôle par défaut
      },
      // Ne pas retourner le mot de passe
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

## Étape 9 : Provider de session

Créez le dossier et le provider de session :

```bash
# Créer le dossier des providers
mkdir -p components/providers
```

Créez le fichier `components/providers/SessionProvider.tsx` :

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

## Étape 10 : Composants d'authentification

Créez le dossier des composants d'authentification :

```bash
# Créer le dossier des composants auth
mkdir -p components/auth
```

### Composant AuthButton

Créez le fichier `components/auth/AuthButton.tsx` :

```typescript
"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { useState } from "react"

export default function AuthButton() {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(false)

  // Gérer la déconnexion
  const handleSignOut = async () => {
    setLoading(true)
    try {
      await signOut({ callbackUrl: "/" })
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error)
      setLoading(false)
    }
  }

  // Affichage pendant le chargement
  if (status === "loading") {
    return (
      <div className="flex items-center space-x-4">
        <div className="animate-pulse h-8 w-20 bg-gray-300 rounded"></div>
      </div>
    )
  }

  // Utilisateur non connecté
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

  // Utilisateur connecté
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
        className="text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
      >
        {loading ? "..." : "Déconnexion"}
      </button>
    </div>
  )
}
```

### Formulaire de connexion

Créez le fichier `components/auth/SignInForm.tsx` :

```typescript
"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"

export default function SignInForm() {
  // États du formulaire
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  
  // Navigation
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/"

  // Soumission du formulaire email/mot de passe
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

  // Connexion via fournisseurs OAuth
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
      {/* Affichage des erreurs */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-800">{error}</div>
        </div>
      )}

      {/* Formulaire email/mot de passe */}
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

      {/* Séparateur */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-gray-50 text-gray-500">Ou continuer avec</span>
        </div>
      </div>

      {/* Boutons OAuth */}
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

## Étape 11 : Suite du guide dans le prochain fichier

Ce premier fichier couvre les étapes 1 à 10. La suite du guide se trouve dans le fichier suivant pour respecter les limites de longueur.

Passez au fichier `02-CODES_COMPLETS.md` pour continuer l'implémentation.
