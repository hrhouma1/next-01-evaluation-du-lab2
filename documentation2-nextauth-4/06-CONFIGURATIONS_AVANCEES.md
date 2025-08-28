# Configurations avancées NextAuth.js v4

Ce guide couvre les configurations avancées, les bonnes pratiques et les extensions possibles de NextAuth.js v4.

## Sécurisation avancée

### Configuration des cookies sécurisés

Pour la production, ajoutez ces options dans `lib/auth.ts` :

```typescript
export const authOptions: NextAuthOptions = {
  // ... autres configurations
  
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production' // HTTPS uniquement en production
      }
    },
    callbackUrl: {
      name: `__Secure-next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  },
  
  // Configuration session renforcée
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 jours (au lieu de 30)
    updateAge: 24 * 60 * 60, // Re-génère le token toutes les 24h
  },
}
```

### Rate limiting pour l'inscription

Créez `lib/rateLimit.ts` :

```typescript
// Stockage en mémoire simple (pour développement)
const attempts = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(identifier: string, maxAttempts = 5, windowMs = 15 * 60 * 1000) {
  const now = Date.now()
  const userAttempts = attempts.get(identifier)

  // Reset si la fenêtre est expirée
  if (userAttempts && now > userAttempts.resetTime) {
    attempts.delete(identifier)
  }

  const current = attempts.get(identifier) || { count: 0, resetTime: now + windowMs }

  if (current.count >= maxAttempts) {
    throw new Error(`Trop de tentatives. Réessayez dans ${Math.ceil((current.resetTime - now) / 1000 / 60)} minutes.`)
  }

  current.count++
  attempts.set(identifier, current)
}
```

Puis dans `app/api/auth/signup/route.ts` :

```typescript
import { checkRateLimit } from "@/lib/rateLimit"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body
    
    // Rate limiting par IP et par email
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    checkRateLimit(`signup-ip-${ip}`, 3, 15 * 60 * 1000) // 3 tentatives par IP/15min
    checkRateLimit(`signup-email-${email}`, 5, 60 * 60 * 1000) // 5 tentatives par email/heure

    // ... reste du code
  } catch (error: any) {
    if (error.message.includes('tentatives')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 429 } // Too Many Requests
      )
    }
    // ... autres erreurs
  }
}
```

## Gestion avancée des rôles

### Modèle de permissions granulaires

Modifiez `prisma/schema.prisma` pour plus de flexibilité :

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  password      String?
  emailVerified DateTime?
  image         String?
  isActive      Boolean   @default(true)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  accounts Account[]
  sessions Session[]
  products Product[]
  userRoles UserRole[]

  @@map("users")
}

model Role {
  id          String @id @default(cuid())
  name        String @unique
  description String?
  permissions String[] // JSON array des permissions
  createdAt   DateTime @default(now())
  
  userRoles UserRole[]

  @@map("roles")
}

model UserRole {
  id     String @id @default(cuid())
  userId String @map("user_id")
  roleId String @map("role_id")
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  role Role @relation(fields: [roleId], references: [id], onDelete: Cascade)
  
  @@unique([userId, roleId])
  @@map("user_roles")
}

model Product {
  id    Int     @id @default(autoincrement())
  name  String
  price Float
  isPublished Boolean @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  createdBy   User? @relation(fields: [createdById], references: [id])
  createdById String?

  @@map("products")
}
```

### Helper pour vérification des permissions

Créez `lib/permissions.ts` :

```typescript
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function hasPermission(permission: string): Promise<boolean> {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return false
  }

  const userWithRoles = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      userRoles: {
        include: {
          role: true
        }
      }
    }
  })

  if (!userWithRoles) {
    return false
  }

  // Vérifier si l'utilisateur a la permission
  return userWithRoles.userRoles.some(userRole => 
    userRole.role.permissions.includes(permission)
  )
}

export async function requirePermission(permission: string) {
  const hasAccess = await hasPermission(permission)
  
  if (!hasAccess) {
    throw new Error(`Permission '${permission}' requise`)
  }
}

// Permissions prédéfinies
export const PERMISSIONS = {
  // Produits
  PRODUCTS_READ: 'products:read',
  PRODUCTS_CREATE: 'products:create',
  PRODUCTS_UPDATE: 'products:update',
  PRODUCTS_DELETE: 'products:delete',
  PRODUCTS_PUBLISH: 'products:publish',
  
  // Administration
  USERS_READ: 'users:read',
  USERS_UPDATE: 'users:update',
  USERS_DELETE: 'users:delete',
  ROLES_MANAGE: 'roles:manage',
  
  // Système
  SYSTEM_ADMIN: 'system:admin',
} as const
```

### Middleware avec permissions

Modifiez `middleware.ts` :

```typescript
import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import { hasPermission } from "@/lib/permissions"

export default withAuth(
  async function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // Routes avec permissions spécifiques
    const routePermissions: Record<string, string> = {
      '/products/new': 'products:create',
      '/api/products': 'products:create', // Pour POST
      '/admin': 'system:admin',
      '/admin/users': 'users:read',
      '/admin/roles': 'roles:manage',
    }

    // Vérifier les permissions pour les routes spécifiques
    for (const [route, permission] of Object.entries(routePermissions)) {
      if (pathname.startsWith(route)) {
        const hasAccess = await hasPermission(permission)
        
        if (!hasAccess) {
          if (pathname.startsWith('/api/')) {
            return NextResponse.json(
              { success: false, error: `Permission '${permission}' requise` },
              { status: 403 }
            )
          } else {
            return NextResponse.redirect(new URL("/auth/insufficient-permissions", req.url))
          }
        }
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
)
```

## Configuration avancée des providers

### Provider personnalisé pour LDAP/Active Directory

```typescript
import CredentialsProvider from "next-auth/providers/credentials"
import ldap from "ldapjs"

const LDAPProvider = CredentialsProvider({
  name: "LDAP",
  credentials: {
    username: { label: "Nom d'utilisateur", type: "text" },
    password: { label: "Mot de passe", type: "password" }
  },
  async authorize(credentials) {
    if (!credentials?.username || !credentials?.password) {
      return null
    }

    return new Promise((resolve, reject) => {
      const client = ldap.createClient({
        url: process.env.LDAP_URL || 'ldap://localhost:389'
      })

      const dn = `uid=${credentials.username},${process.env.LDAP_BASE_DN}`

      client.bind(dn, credentials.password, (err) => {
        if (err) {
          console.error('LDAP bind failed:', err)
          client.destroy()
          resolve(null)
          return
        }

        // Rechercher les informations utilisateur
        client.search(dn, {}, (err, res) => {
          if (err) {
            client.destroy()
            resolve(null)
            return
          }

          let userData: any = null

          res.on('searchEntry', (entry) => {
            const user = entry.object
            userData = {
              id: user.uid as string,
              name: user.displayName as string || user.cn as string,
              email: user.mail as string,
              role: user.memberOf?.includes('cn=admin') ? 'admin' : 'user'
            }
          })

          res.on('end', () => {
            client.destroy()
            resolve(userData)
          })
        })
      })
    })
  }
})
```

### Configuration OAuth avancée avec scopes

```typescript
GoogleProvider({
  clientId: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  authorization: {
    params: {
      scope: "openid email profile https://www.googleapis.com/auth/calendar.readonly",
      prompt: "consent",
      access_type: "offline",
      response_type: "code"
    }
  }
}),

// Récupérer les données étendues
callbacks: {
  async jwt({ token, account, profile }) {
    if (account) {
      token.accessToken = account.access_token
      token.refreshToken = account.refresh_token
    }
    return token
  },
  
  async session({ session, token }) {
    // Ajouter le token d'accès à la session si nécessaire
    session.accessToken = token.accessToken
    return session
  }
}
```

## Audit et logging

### Système d'audit complet

Créez `lib/audit.ts` :

```typescript
import { prisma } from "./prisma"

export interface AuditEvent {
  userId?: string
  action: string
  resource: string
  resourceId?: string
  details?: Record<string, any>
  ipAddress?: string
  userAgent?: string
}

export async function logAuditEvent(event: AuditEvent) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: event.userId,
        action: event.action,
        resource: event.resource,
        resourceId: event.resourceId,
        details: event.details ? JSON.stringify(event.details) : null,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        createdAt: new Date()
      }
    })
  } catch (error) {
    console.error('Failed to log audit event:', error)
  }
}

// Fonctions helper
export const auditActions = {
  AUTH: {
    LOGIN: 'auth:login',
    LOGOUT: 'auth:logout',
    REGISTER: 'auth:register',
    PASSWORD_CHANGE: 'auth:password_change',
  },
  PRODUCTS: {
    CREATE: 'products:create',
    UPDATE: 'products:update', 
    DELETE: 'products:delete',
    VIEW: 'products:view',
  },
  USERS: {
    CREATE: 'users:create',
    UPDATE: 'users:update',
    DELETE: 'users:delete',
    ROLE_CHANGE: 'users:role_change',
  }
} as const
```

Ajoutez le modèle d'audit à Prisma :

```prisma
model AuditLog {
  id         String   @id @default(cuid())
  userId     String?  @map("user_id")
  action     String
  resource   String
  resourceId String?  @map("resource_id")
  details    String?  @db.Text
  ipAddress  String?  @map("ip_address")
  userAgent  String?  @map("user_agent")
  createdAt  DateTime @default(now()) @map("created_at")

  user User? @relation(fields: [userId], references: [id])

  @@index([userId])
  @@index([action])
  @@index([resource])
  @@index([createdAt])
  @@map("audit_logs")
}
```

Utilisez l'audit dans vos APIs :

```typescript
import { logAuditEvent, auditActions } from "@/lib/audit"

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  try {
    // ... logique de création de produit ...
    
    // Log de l'audit
    await logAuditEvent({
      userId: session?.user?.id,
      action: auditActions.PRODUCTS.CREATE,
      resource: 'Product',
      resourceId: newProduct.id.toString(),
      details: { name: newProduct.name, price: newProduct.price },
      ipAddress: request.ip || request.headers.get('x-forwarded-for'),
      userAgent: request.headers.get('user-agent')
    })
    
  } catch (error) {
    // Log des erreurs aussi
    await logAuditEvent({
      userId: session?.user?.id,
      action: `${auditActions.PRODUCTS.CREATE}:failed`,
      resource: 'Product',
      details: { error: error.message },
      ipAddress: request.ip || request.headers.get('x-forwarded-for'),
      userAgent: request.headers.get('user-agent')
    })
    
    throw error
  }
}
```

## Intégration avec des services externes

### Webhook pour synchronisation utilisateur

Créez `app/api/webhooks/user-sync/route.ts` :

```typescript
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  // Vérifier la signature du webhook
  const signature = request.headers.get('x-webhook-signature')
  const body = await request.text()
  
  const expectedSignature = crypto
    .createHmac('sha256', process.env.WEBHOOK_SECRET!)
    .update(body)
    .digest('hex')
  
  if (signature !== `sha256=${expectedSignature}`) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const event = JSON.parse(body)

  try {
    switch (event.type) {
      case 'user.created':
        await prisma.user.upsert({
          where: { email: event.data.email },
          update: {
            name: event.data.name,
            image: event.data.avatar_url,
          },
          create: {
            id: event.data.external_id,
            email: event.data.email,
            name: event.data.name,
            image: event.data.avatar_url,
            emailVerified: new Date(),
          }
        })
        break
        
      case 'user.updated':
        await prisma.user.update({
          where: { id: event.data.external_id },
          data: {
            name: event.data.name,
            image: event.data.avatar_url,
          }
        })
        break
        
      case 'user.deleted':
        await prisma.user.update({
          where: { id: event.data.external_id },
          data: { isActive: false }
        })
        break
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook processing failed:', error)
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
  }
}
```

## Optimisations de performance

### Cache des sessions avec Redis

Installez Redis :

```bash
npm install redis
npm install @types/redis
```

Créez `lib/redis.ts` :

```typescript
import Redis from 'redis'

const redis = Redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
})

redis.on('error', (err) => console.log('Redis Client Error', err))

export { redis }
```

Modifiez `lib/auth.ts` pour utiliser le cache :

```typescript
import { redis } from "./redis"

export const authOptions: NextAuthOptions = {
  // ... autres configurations
  
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (trigger === 'signIn' && user) {
        // Mettre en cache les données utilisateur
        await redis.setex(`user:${user.id}`, 3600, JSON.stringify({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        }))
      }
      
      return token
    },
    
    async session({ session, token }) {
      if (token.sub) {
        // Récupérer depuis le cache
        const cachedUser = await redis.get(`user:${token.sub}`)
        
        if (cachedUser) {
          const userData = JSON.parse(cachedUser)
          session.user = { ...session.user, ...userData }
        }
      }
      
      return session
    }
  }
}
```

## Configuration de production

### Variables d'environnement de production

```env
# Authentification
NEXTAUTH_URL="https://votre-domain.com"
NEXTAUTH_SECRET="cle-secrete-super-longue-et-unique-pour-production"

# Base de données (avec connection pooling)
DATABASE_URL="postgresql://user:pass@host:5432/db?pgbouncer=true&connection_limit=10"

# Redis pour le cache
REDIS_URL="redis://your-redis-instance:6379"

# OAuth (avec domaines de production)
GOOGLE_CLIENT_ID="prod-google-client-id"
GOOGLE_CLIENT_SECRET="prod-google-client-secret"
GITHUB_ID="prod-github-client-id"
GITHUB_SECRET="prod-github-client-secret"

# Sécurité
WEBHOOK_SECRET="webhook-secret-key"
RATE_LIMIT_REDIS_URL="redis://rate-limit-instance:6379"

# Monitoring
SENTRY_DSN="https://your-sentry-dsn"
LOG_LEVEL="error" # En production, moins de logs
```

### Middleware de sécurité avancé

```typescript
import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import rateLimit from "@/lib/rateLimit"

export default withAuth(
  async function middleware(req) {
    // Rate limiting global
    const ip = req.ip || req.headers.get('x-forwarded-for') || 'unknown'
    
    try {
      await rateLimit({
        identifier: `global:${ip}`,
        limit: 100, // 100 requests
        duration: 60 * 1000 // par minute
      })
    } catch {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    // Headers de sécurité
    const response = NextResponse.next()
    
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'origin-when-cross-origin')
    response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')
    
    // CSP pour la sécurité des contenus
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https:; font-src 'self' https:; frame-src 'none';"
    )

    return response
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Logique d'autorisation personnalisée
        const { pathname } = req.nextUrl
        
        // Permettre l'accès aux routes publiques
        const publicPaths = ['/', '/api/auth', '/auth']
        if (publicPaths.some(path => pathname.startsWith(path))) {
          return true
        }
        
        // Exiger une authentification pour le reste
        return !!token
      }
    }
  }
)
```

Cette documentation couvre les aspects avancés de NextAuth.js v4. Pour une implémentation en production, considérez également l'ajout de tests automatisés, la surveillance des performances et la mise en place d'alertes de sécurité.
