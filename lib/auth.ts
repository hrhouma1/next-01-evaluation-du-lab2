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
    // Provider Google OAuth
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    
    // Provider GitHub OAuth
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    
    // Provider Credentials (email/password local)
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

        // Chercher l'utilisateur en base
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email as string,
          },
        })

        if (!user || !user.password) {
          throw new Error("Aucun utilisateur trouvé avec cet email")
        }

        // Vérifier le mot de passe
        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
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
      // Permettre la connexion pour tous les fournisseurs
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
      console.log(`Déconnexion de l'utilisateur`)
    },
  },
  
  debug: process.env.NODE_ENV === "development",
}