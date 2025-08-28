# Guide de dépannage NextAuth.js v4 - Solutions aux erreurs courantes

Ce guide résout les erreurs les plus fréquentes rencontrées lors de l'implémentation NextAuth.js v4.

## Erreurs de compilation

### ❌ Erreur : "Module not found: Can't resolve 'next-auth'"

**Symptôme :**
```
Module not found: Can't resolve 'next-auth'
```

**Cause :** NextAuth n'est pas installé ou l'installation a échoué.

**Solution :**
```bash
# Vérifier si NextAuth est installé
npm list next-auth

# Si absent, installer
npm install next-auth@4

# Si présent mais bugué, réinstaller
npm uninstall next-auth
npm install next-auth@4
```

### ❌ Erreur : "Module not found: Can't resolve '@next-auth/prisma-adapter'"

**Symptôme :**
```
Module not found: Can't resolve '@next-auth/prisma-adapter'
```

**Cause :** Mauvais nom de package ou version incompatible.

**Solution :**
```bash
# Désinstaller le mauvais package (si installé)
npm uninstall @auth/prisma-adapter

# Installer le bon package pour NextAuth v4
npm install @next-auth/prisma-adapter
```

### ❌ Erreur : "Cannot find module './lib/prisma' or its corresponding type declarations"

**Symptôme :**
```
Cannot find module '@/lib/prisma'
```

**Cause :** Le fichier `lib/prisma.ts` n'existe pas ou n'est pas configuré.

**Solution :**
Vérifiez que le fichier `lib/prisma.ts` existe et contient :
```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

## Erreurs de base de données

### ❌ Erreur : "Schema validation failed"

**Symptôme :**
```
Error: Schema validation failed
```

**Cause :** Le schéma Prisma contient des erreurs de syntaxe.

**Solution :**
```bash
# Valider le schéma
npx prisma validate

# Si erreur, vérifiez :
# 1. Toutes les relations sont correctes
# 2. Les noms de modèles sont uniques  
# 3. Les types de données sont valides
# 4. La syntaxe Prisma est correcte
```

### ❌ Erreur : "The table 'users' does not exist"

**Symptôme :**
```
The table 'main.users' does not exist in the current database
```

**Cause :** Les tables d'authentification n'ont pas été créées dans la base de données.

**Solution :**
```bash
# Appliquer le schéma à la base de données
npx prisma db push

# Si ça ne marche pas, forcer la recréation
npx prisma db push --force-reset
```

**Attention :** `--force-reset` supprime toutes les données existantes !

### ❌ Erreur : "Invalid `prisma.user.create()` invocation"

**Symptôme :**
```
Invalid `prisma.user.create()` invocation:
  Unknown arg `data.password` in data.password for type UserCreateArgs
```

**Cause :** Le modèle User dans Prisma ne contient pas le champ `password`.

**Solution :**
Vérifiez que votre modèle User dans `prisma/schema.prisma` contient :
```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  password      String?   // ← Cette ligne est OBLIGATOIRE
  // ... autres champs
}
```

Puis :
```bash
npx prisma generate
npx prisma db push
```

## Erreurs d'authentification

### ❌ Erreur : "NextAuth URL (NEXTAUTH_URL) not provided"

**Symptôme :**
```
[next-auth][error][NEXTAUTH_URL] 
NEXTAUTH_URL environment variable is not set
```

**Cause :** La variable d'environnement `NEXTAUTH_URL` n'est pas définie.

**Solution :**
Ajoutez dans votre fichier `.env` :
```env
NEXTAUTH_URL="http://localhost:3000"
```

Si votre serveur tourne sur un autre port :
```env
NEXTAUTH_URL="http://localhost:3001"
```

### ❌ Erreur : "No secret provided"

**Symptôme :**
```
[next-auth][error][NO_SECRET] 
No secret provided
```

**Cause :** La variable `NEXTAUTH_SECRET` est manquante ou trop courte.

**Solution :**
Ajoutez dans votre `.env` une clé secrète longue :
```env
NEXTAUTH_SECRET="votre-cle-secrete-tres-longue-minimum-32-caracteres-unique"
```

### ❌ Erreur : "Credentials signin failed"

**Symptôme :**
```
[next-auth][error][CREDENTIALS_SIGNIN_FAILED]
```

**Cause :** Erreur dans la logique d'authentification credentials.

**Solutions possibles :**

1. **Vérifier le hachage du mot de passe :**
```typescript
// Dans lib/auth.ts, vérifiez cette ligne :
const isPasswordValid = await bcrypt.compare(
  credentials.password,
  user.password
)
```

2. **Vérifier la gestion d'erreurs :**
```typescript
// Remplacez les throw new Error par return null
async authorize(credentials) {
  if (!credentials?.email || !credentials?.password) {
    return null // ← return null au lieu de throw
  }
  // ...
}
```

### ❌ Erreur : "OAuth signin failed"

**Symptôme :**
```
[next-auth][error][OAUTH_SIGNIN_FAILED]
```

**Cause :** Configuration OAuth incorrecte.

**Solutions :**

1. **Vérifiez les variables d'environnement :**
```env
GOOGLE_CLIENT_ID="votre-client-id-google"
GOOGLE_CLIENT_SECRET="votre-client-secret-google"
```

2. **Vérifiez les URLs de callback dans votre provider :**
- Google Console : `http://localhost:3000/api/auth/callback/google`
- GitHub Settings : `http://localhost:3000/api/auth/callback/github`

## Erreurs de routage

### ❌ Erreur : "404 - This page could not be found"

**Symptôme :**
Page 404 sur `/auth/signin` ou `/auth/signup`

**Cause :** Les pages d'authentification n'existent pas.

**Solution :**
Vérifiez que ces fichiers existent :
- `app/auth/signin/page.tsx`
- `app/auth/signup/page.tsx`

### ❌ Erreur : "500 - Internal Server Error" sur les APIs

**Symptôme :**
Erreur 500 sur `/api/auth/[...nextauth]`

**Cause :** Erreur dans la configuration NextAuth.

**Solutions :**

1. **Vérifiez le fichier de route :**
```typescript
// app/api/auth/[...nextauth]/route.ts doit contenir :
import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
```

2. **Vérifiez les logs :**
```bash
# Dans le terminal où tourne npm run dev
# Cherchez les erreurs détaillées
```

## Erreurs de session

### ❌ Erreur : "useSession must be used within SessionProvider"

**Symptôme :**
```
Error: useSession must be used within a SessionProvider
```

**Cause :** Un composant utilise `useSession` sans être dans un `SessionProvider`.

**Solution :**
Vérifiez que votre `app/layout.tsx` wrappe bien les enfants :
```typescript
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="fr">
      <body>
        <AuthSessionProvider session={session}>
          {children} {/* ← Les enfants doivent être wrappés */}
        </AuthSessionProvider>
      </body>
    </html>
  )
}
```

### ❌ Erreur : "Session is null" quand elle devrait exister

**Symptôme :**
L'utilisateur est connecté mais `session` est `null`.

**Causes possibles :**

1. **Problème de callback session :**
```typescript
// Dans lib/auth.ts, vérifiez :
callbacks: {
  async session({ session, token }) {
    if (session.user) {
      session.user.id = token.sub!
      session.user.role = token.role as string
    }
    return session
  },
}
```

2. **Problème de token JWT :**
```typescript
// Vérifiez aussi :
callbacks: {
  async jwt({ token, user }) {
    if (user) {
      token.role = user.role
    }
    return token
  },
}
```

## Erreurs de middleware

### ❌ Erreur : "Middleware not working"

**Symptôme :**
Les routes protégées ne redirigent pas vers la connexion.

**Causes possibles :**

1. **Fichier mal placé :**
Le fichier `middleware.ts` doit être à la RACINE du projet, pas dans un sous-dossier.

2. **Configuration matcher incorrecte :**
```typescript
export const config = {
  matcher: [
    "/products/new",      // ← Chemins exacts
    "/products/:id/edit", // ← Pas de regex ici
    "/admin/:path*"
  ]
}
```

3. **Import withAuth incorrect :**
```typescript
import { withAuth } from "next-auth/middleware" // ← Bon import
```

## Erreurs de types TypeScript

### ❌ Erreur : "Property 'role' does not exist on type 'User'"

**Symptôme :**
```
Property 'role' does not exist on type 'User'
```

**Cause :** Les extensions de types NextAuth ne sont pas correctes.

**Solution :**
Vérifiez que `lib/auth.ts` contient bien :
```typescript
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role?: string | null  // ← Cette ligne
    }
  }

  interface User {
    role?: string | null    // ← Cette ligne
  }
}
```

## Diagnostic général

### Commandes de diagnostic utiles

```bash
# Vérifier l'état des packages
npm list next-auth @next-auth/prisma-adapter bcryptjs

# Vérifier la configuration Prisma
npx prisma validate

# Vérifier la base de données
npx prisma studio

# Vérifier les variables d'environnement
echo $NEXTAUTH_URL     # Unix/Mac
echo $NEXTAUTH_SECRET  # Unix/Mac
# Ou simplement ouvrir le fichier .env

# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm install
```

### Logs utiles à activer

Dans `lib/auth.ts`, activez le debug :
```typescript
export const authOptions: NextAuthOptions = {
  // ... autres configurations
  debug: true, // ← Activez ceci en développement
}
```

Cela affichera des logs détaillés dans la console pour diagnostiquer les problèmes.

## Problèmes de port

### ❌ Port 3000 occupé

**Symptôme :**
```
Port 3000 is in use, trying 3001 instead
```

**Solution :**
Mettez à jour votre `.env` :
```env
NEXTAUTH_URL="http://localhost:3001"
```

Et si vous avez configuré OAuth, mettez à jour les URLs de callback :
- `http://localhost:3001/api/auth/callback/google`
- `http://localhost:3001/api/auth/callback/github`

## Aide supplémentaire

Si vous rencontrez une erreur qui ne figure pas dans ce guide :

1. **Copiez l'erreur complète** depuis la console
2. **Vérifiez les logs** dans le terminal où tourne `npm run dev`
3. **Suivez exactement** l'ordre des étapes dans le guide principal
4. **Comparez votre code** avec les exemples complets du fichier `03-CODES_COMPLETS.md`

La plupart des erreurs viennent de :
- ✅ Packages mal installés
- ✅ Variables d'environnement manquantes
- ✅ Base de données non mise à jour
- ✅ Fichiers dans les mauvais emplacements
- ✅ Fautes de frappe dans le code

Prenez le temps de vérifier chaque point méthodiquement.
