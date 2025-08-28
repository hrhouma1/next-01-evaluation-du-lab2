# Guide exhaustif de dépannage NextAuth.js v4 - Solutions détaillées pour étudiants débutants

Ce guide vous accompagne **étape par étape** pour résoudre **toutes les erreurs courantes** que vous pouvez rencontrer lors de l'implémentation NextAuth.js v4. Chaque erreur est expliquée en détail avec des solutions concrètes.

**Comment utiliser ce guide :**
- Copiez le message d'erreur exact que vous avez
- Cherchez-le dans ce document (Ctrl+F)
- Suivez la solution étape par étape
- Testez après chaque modification
- N'hésitez pas à recommencer si nécessaire

**Analogie :** Ce guide est comme un manuel de réparation automobile détaillé - chaque problème a sa solution spécifique avec des instructions précises.

## Erreurs de compilation - Quand votre code ne "compile" pas

### Qu'est-ce qu'une erreur de compilation ?
**Explication pour débutants :** Une erreur de compilation survient quand Next.js essaie de transformer votre code TypeScript en JavaScript mais ne peut pas y arriver à cause d'un problème (module manquant, syntaxe incorrecte, etc.).

**Analogie :** C'est comme un traducteur qui s'arrête au milieu d'une phrase parce qu'il ne comprend pas un mot - il ne peut pas continuer tant que le problème n'est pas résolu.

### ERREUR 1 : "Module not found: Can't resolve 'next-auth'"

**Symptôme complet que vous voyez :**
```
Module not found: Can't resolve 'next-auth'
  Import trace for requested module:
  ./lib/auth.ts
  ./app/api/auth/[...nextauth]/route.ts
```

**Traduction en français simple :** "Je ne trouve pas le module 'next-auth'"

**Ce qui s'est passé techniquement :**
1. Next.js essaie de compiler votre fichier `lib/auth.ts`
2. Il voit la ligne `import NextAuth from "next-auth"`
3. Il cherche le package `next-auth` dans `node_modules/`
4. Il ne le trouve pas → erreur

**Causes possibles :**
- NextAuth n'a jamais été installé
- L'installation a été interrompue (Ctrl+C pendant `npm install`)
- Le fichier `package.json` a été corrompu
- Problème de connexion internet pendant l'installation

**Solution détaillée :**

**Étape 1 : Diagnostiquer le problème**
```bash
npm list next-auth
```

**Explications de cette commande :**
- `npm list` = lister tous les packages installés
- `next-auth` = chercher spécifiquement ce package
- Si installé : vous verrez `next-auth@4.x.x`
- Si absent : vous verrez `(empty)` ou une erreur

**Étape 2A : Si le package est absent (cas le plus fréquent)**
```bash
npm install next-auth@4
```

**Ce qui se passe :**
- npm contacte le registre officiel npmjs.com
- Télécharge next-auth version 4.x.x et ses dépendances
- Les installe dans `node_modules/next-auth/`
- Met à jour `package.json` et `package-lock.json`

**Durée moyenne :** 30-90 secondes

**Étape 2B : Si le package existe mais est bugué (plus rare)**
```bash
npm uninstall next-auth
```

**Explication :**
- Supprime complètement next-auth de `node_modules/`
- Nettoie les références dans `package.json`
- Prépare une installation propre

```bash
npm install next-auth@4
```

**Vérification que ça marche :**
```bash
npm list next-auth
```
**Résultat attendu :** `next-auth@4.24.x` (ou version similaire)

### ERREUR 2 : "Module not found: Can't resolve '@next-auth/prisma-adapter'"

**Symptôme complet :**
```
Module not found: Can't resolve '@next-auth/prisma-adapter'
  Import trace for requested module:
  ./lib/auth.ts
```

**Traduction simple :** "Je ne trouve pas l'adaptateur Prisma pour NextAuth"

**Ce qui s'est passé :**
1. Votre code essaie d'importer `PrismaAdapter` depuis `@next-auth/prisma-adapter`
2. Next.js ne trouve pas ce package dans `node_modules/`
3. Compilation interrompue

**Piège courant pour débutants :**
Beaucoup d'étudiants installent `@auth/prisma-adapter` (pour NextAuth v5) au lieu de `@next-auth/prisma-adapter` (pour NextAuth v4). Les noms sont très similaires mais ce sont des packages différents !

**Analogie :** C'est comme commander une pièce de voiture Renault avec une référence Peugeot - les marques sont proches mais les pièces ne sont pas compatibles.

**Solution détaillée :**

**Étape 1 : Vérifier quel package est installé**
```bash
npm list | findstr prisma-adapter
```

**Sur Mac/Linux :**
```bash
npm list | grep prisma-adapter
```

**Résultats possibles :**
- `@auth/prisma-adapter@x.x.x` → **MAUVAIS PACKAGE** (pour NextAuth v5)
- `@next-auth/prisma-adapter@x.x.x` → **BON PACKAGE** (pour NextAuth v4)
- Rien → Aucun adaptateur installé

**Étape 2 : Nettoyer le mauvais package (si nécessaire)**
```bash
npm uninstall @auth/prisma-adapter
```

**Explication :** Cette commande supprime le mauvais package s'il a été installé par erreur.

**Étape 3 : Installer le bon package**
```bash
npm install @next-auth/prisma-adapter
```

**Ce que fait ce package :**
- Fait le lien entre NextAuth (gestion d'authentification) et Prisma (base de données)
- Stocke les sessions utilisateur dans PostgreSQL au lieu de la mémoire
- Gère automatiquement les tables users, accounts, sessions, etc.

**Vérification :**
```bash
npm list @next-auth/prisma-adapter
```
**Résultat attendu :** `@next-auth/prisma-adapter@1.x.x`

### ERREUR 3 : "Cannot find module './lib/prisma' or its corresponding type declarations"

**Symptôme complet que vous voyez :**
```
Cannot find module '@/lib/prisma'
Error: Cannot resolve dependency '@/lib/prisma'
TypeScript error in /your-project/lib/auth.ts(2,24):
Cannot find module '@/lib/prisma' or its corresponding type declarations.
```

**Traduction simple :** "Je ne trouve pas le fichier lib/prisma.ts"

**Ce qui s'est passé techniquement :**
1. Votre fichier `lib/auth.ts` contient une ligne comme `import { prisma } from '@/lib/prisma'`
2. TypeScript cherche le fichier `lib/prisma.ts` dans votre projet
3. Il ne le trouve pas ou le fichier existe mais est vide/mal configuré
4. La compilation s'arrête

**Pourquoi cette erreur arrive-t-elle ?**
- Vous avez copié du code qui référence `@/lib/prisma` mais n'avez pas créé ce fichier
- Le fichier existe mais ne contient pas les bonnes exportations
- Problème de configuration TypeScript avec l'alias `@/`

**Analogie :** C'est comme si vous aviez une recette qui dit "ajoutez le mélange du bol bleu" mais qu'il n'y a pas de bol bleu sur votre plan de travail.

**Solution complète étape par étape :**

**Étape 1 : Vérifier si le fichier existe**
```bash
ls lib/prisma.ts
```

**Sur Windows PowerShell :**
```powershell
Get-Item lib\prisma.ts
```

**Résultats possibles :**
- Le fichier est affiché → Il existe, passez à l'étape 3
- "No such file" / "Cannot find path" → Le fichier n'existe pas, passez à l'étape 2

**Étape 2 : Créer le fichier lib/prisma.ts**

**2A. Créer le dossier lib s'il n'existe pas**
```bash
mkdir lib
```

**2B. Créer le fichier avec le bon contenu**
Créez le fichier `lib/prisma.ts` et copiez-collez exactement ce code :

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

**Explication ligne par ligne de ce code :**

```typescript
import { PrismaClient } from '@prisma/client'
```
- Importe la classe PrismaClient depuis le package Prisma
- Cette classe permet de communiquer avec votre base de données PostgreSQL

```typescript
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}
```
- Définit un type TypeScript pour l'objet global
- `globalThis` = objet global JavaScript (disponible partout)
- On dit à TypeScript : "cet objet peut avoir une propriété prisma de type PrismaClient"

```typescript
export const prisma = globalForPrisma.prisma ?? new PrismaClient()
```
- **Partie la plus importante :** Crée ou réutilise une instance de Prisma
- `??` = "nullish coalescing" → si à gauche est null/undefined, utilise la droite
- **Traduction :** "Utilise l'instance Prisma globale si elle existe, sinon crée-en une nouvelle"
- **Pourquoi c'est important :** Évite de créer plusieurs connexions à la base de données

```typescript
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```
- En mode développement, stocke l'instance Prisma globalement
- Évite les reconnexions multiples quand Next.js recompile à chaud
- En production, chaque requête utilise sa propre instance (plus sûr)

**Analogie complète :** Ce fichier est comme un gestionnaire de connexions téléphoniques dans un bureau. Au lieu de créer une nouvelle ligne téléphonique pour chaque appel (coûteux), il réutilise les lignes existantes quand c'est possible.

**Étape 3 : Vérifier le contenu du fichier existant**
Si le fichier `lib/prisma.ts` existe déjà, ouvrez-le et vérifiez qu'il contient exactement le code ci-dessus. S'il y a des différences, remplacez tout le contenu.

**Erreurs courantes dans ce fichier :**
- Oublier le `export` devant `const prisma`
- Mauvais nom d'import : `import { PrismaClient } from 'prisma/client'` (il manque le @)
- Syntaxe `??` non supportée (Node.js trop ancien)

**Étape 4 : Vérification que tout fonctionne**
```bash
npm run dev
```

Si le serveur démarre sans erreur, le problème est résolu. Sinon, vérifiez :
- Le fichier est bien sauvegardé
- Pas d'erreurs de syntaxe (parenthèses, guillemets)
- Le dossier `lib/` est au bon endroit (à la racine du projet)

## Erreurs de base de données - Quand Prisma ne peut pas accéder aux données

### Qu'est-ce qu'une erreur de base de données ?
**Explication pour débutants :** Ces erreurs surviennent quand votre application essaie de communiquer avec PostgreSQL mais rencontre un problème : table inexistante, schéma incorrect, connexion impossible, etc.

**Analogie :** C'est comme essayer d'ouvrir une armoire avec une clé qui ne correspond pas, ou chercher un dossier dans un classeur qui n'a jamais été organisé.

### ERREUR 4 : "Schema validation failed"

**Symptôme complet que vous voyez :**
```
Error: Schema validation failed
  --> prisma/schema.prisma:23
   |
23 | model User {
   |       ^^^^
   |
error: Error validating model "User": The model name "User" is invalid.
```

**Ou parfois :**
```
Prisma schema validation failed
Error: 
  - Error in prisma/schema.prisma at line XX: Invalid relation field
  - Error in prisma/schema.prisma at line YY: Unknown type
```

**Traduction simple :** "Votre fichier schema.prisma contient des erreurs"

**Ce qui s'est passé techniquement :**
1. Vous avez modifié le fichier `prisma/schema.prisma`
2. Prisma lit ce fichier pour comprendre la structure de votre base de données
3. Il trouve des erreurs de syntaxe ou de logique
4. Il refuse de continuer tant que les erreurs ne sont pas corrigées

**Causes courantes pour débutants :**
- **Fautes de frappe :** `modle User` au lieu de `model User`
- **Relations mal définies :** références vers des modèles qui n'existent pas
- **Types de données incorrects :** `Int` au lieu de `Int?`
- **Noms dupliqués :** deux modèles avec le même nom
- **Syntaxe incorrecte :** manque de `@` devant les attributs

**Solution détaillée :**

**Étape 1 : Diagnostiquer précisément l'erreur**
```bash
npx prisma validate
```

**Explication de cette commande :**
- `npx prisma validate` = vérifier la syntaxe du schéma sans toucher à la base de données
- Affiche toutes les erreurs trouvées avec numéros de ligne
- Outil de diagnostic gratuit et sans risque

**Exemple de résultat avec erreurs :**
```
Error validating: These models do not have a unique identifier or id declared:
  Model: "User"
  
Error validating field "accounts" in model "User": The relation field `accounts` on Model `User` is missing an opposite relation field named `user` on model `Account`.
```

**Étape 2 : Corriger les erreurs courantes**

**Erreur A : Modèle sans identifiant unique**
```prisma
model User {
  name  String
  email String
}
```
**Solution :** Ajouter un champ `id` :
```prisma
model User {
  id    String @id @default(cuid())  ← Ajouter cette ligne
  name  String
  email String
}
```

**Erreur B : Relation mal définie**
```prisma
model User {
  id       String    @id @default(cuid())
  products Product[]  ← Référence vers Product qui n'existe pas
}
```
**Solution :** S'assurer que le modèle `Product` existe aussi dans le schéma.

**Erreur C : Types incorrects**
```prisma
model User {
  id    String @id @default(cuid())
  age   string  ← 's' minuscule est incorrect
}
```
**Solution :** Utiliser les bons types Prisma :
```prisma
model User {
  id    String @id @default(cuid())
  age   Int?    ← Types valides : String, Int, Float, Boolean, DateTime
}
```

**Étape 3 : Validation complète**
Après chaque correction, relancez :
```bash
npx prisma validate
```

**Résultat attendu quand tout est correct :**
```
The schema is valid.
```

### ERREUR 5 : "The table 'users' does not exist"

**Symptôme complet que vous voyez :**
```
PrismaClientKnownRequestError: 
Invalid `prisma.user.findUnique()` invocation:

The table `main.users` does not exist in the current database.
  at PrismaClient.handleRequestError
```

**Ou :**
```
P2021: The table `users` does not exist in the current database
```

**Traduction simple :** "La table 'users' n'existe pas dans votre base de données"

**Ce qui s'est passé techniquement :**
1. Votre code NextAuth essaie de lire/écrire dans la table `users`
2. PostgreSQL dit "cette table n'existe pas"
3. L'opération échoue

**Pourquoi ça arrive ?**
- Vous avez modifié `schema.prisma` mais pas appliqué les changements à la vraie base de données
- La base de données a été supprimée ou réinitialisée
- Connexion vers une mauvaise base de données (URL incorrecte)

**Analogie :** C'est comme chercher un dossier "Factures 2024" dans un classeur où vous n'avez jamais créé ce dossier.

**Solution détaillée :**

**Étape 1 : Vérifier que votre schéma est valide**
```bash
npx prisma validate
```
Si des erreurs apparaissent, corrigez-les d'abord (voir erreur précédente).

**Étape 2 : Appliquer le schéma à la base de données**
```bash
npx prisma db push
```

**Explication de cette commande :**
- Lit votre fichier `schema.prisma`
- Compare avec l'état actuel de la base PostgreSQL
- Génère et exécute les commandes SQL nécessaires (CREATE TABLE, ALTER TABLE, etc.)
- Synchronise la base avec votre schéma

**Ce qui se passe techniquement :**
1. Prisma se connecte à PostgreSQL via `DATABASE_URL`
2. Analyse les différences entre schéma et base de données
3. Génère du SQL pour créer les tables manquantes
4. Exécute ces commandes SQL

**Résultat attendu :**
```
🚀  Your database is now in sync with your schema.
```

**Étape 3 : Si l'étape 2 échoue avec des erreurs**

**Option A : Forcer la recréation (ATTENTION : supprime toutes les données)**
```bash
npx prisma db push --force-reset
```

**DANGER - Lisez ceci attentivement :**
- `--force-reset` = supprime TOUTES les données existantes
- Recrée toutes les tables depuis zéro
- À utiliser UNIQUEMENT en développement, jamais en production
- Vous perdrez tous les utilisateurs créés, tous les produits, etc.

**Option B : Diagnostic plus poussé**
```bash
# Vérifier la connexion à la base de données
npx prisma db execute --stdin
```
Puis tapez une requête SQL simple comme `SELECT 1;` et pressez Ctrl+D.

Si cette commande échoue, le problème est votre connexion PostgreSQL, pas les tables.

**Étape 4 : Vérification que tout fonctionne**
```bash
npx prisma studio
```

Vous devriez voir toutes les tables NextAuth : `users`, `accounts`, `sessions`, `verificationtokens`, plus votre table `products` si elle existait déjà.

### ERREUR 6 : "Invalid `prisma.user.create()` invocation"

**Symptôme complet que vous voyez :**
```
Invalid `prisma.user.create()` invocation:
  
  {
    data: {
      name: "Test User",
      email: "test@example.com",
      password: "hashedPassword123",
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  }
  }

Unknown arg `data.password` in data.password for type UserCreateArgs.
Available args:
type UserCreateArgs = {
  data: UserCreateInput
}

type UserCreateInput = {
  id?: String
  name?: String | null
  email: String
  // password field is missing here!
}
```

**Traduction simple :** "Je ne peux pas créer un utilisateur avec un champ 'password' car ce champ n'existe pas dans mon schéma"

**Ce qui s'est passé techniquement :**
1. Votre code d'inscription (`/api/auth/signup`) essaie de créer un utilisateur avec un mot de passe
2. Il utilise `prisma.user.create({ data: { ..., password: "xxx" } })`
3. Prisma vérifie si le champ `password` existe dans le modèle `User`
4. Il ne le trouve pas → erreur avec la liste des champs disponibles

**Pourquoi ça arrive ?**
- Vous avez copié le code NextAuth mais oublié de mettre à jour le schéma Prisma
- Le champ `password` a été supprimé accidentellement du modèle `User`
- Vous utilisez le schéma Prisma de base qui ne contient que les champs OAuth (pas de passwords locaux)

**Analogie :** C'est comme essayer de remplir un formulaire qui a une case "Mot de passe" alors que le formulaire officiel ne contient pas cette case.

**Solution détaillée :**

**Étape 1 : Vérifier le contenu actuel de votre modèle User**
Ouvrez le fichier `prisma/schema.prisma` et cherchez le modèle `User`. Il ressemble probablement à ça :

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  
  // Relations NextAuth seulement (OAuth)
  accounts Account[]
  sessions Session[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**Problème identifié :** Il manque le champ `password` !

**Étape 2 : Ajouter le champ password au modèle User**

Modifiez votre modèle `User` pour qu'il ressemble exactement à ça :

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  password      String?   // ← LIGNE AJOUTÉE - Cette ligne est OBLIGATOIRE
  emailVerified DateTime?
  image         String?
  role          String?   @default("user")  // ← OPTIONNEL - pour les rôles utilisateur
  
  // Relations NextAuth
  accounts Account[]
  sessions Session[]
  
  // Relations avec vos autres modèles (si applicable)
  products Product[] @relation("CreatedBy")  // ← Si vous avez des produits
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**Explication ligne par ligne de l'ajout :**

```prisma
password String?
```
- `password` = nom du champ qui stockera le mot de passe crypté
- `String?` = type texte, nullable (peut être null)
- **Pourquoi nullable ?** Parce que les utilisateurs OAuth (Google, GitHub) n'ont pas de mot de passe local

**IMPORTANT :** Ne jamais stocker les mots de passe en clair ! Votre code d'inscription doit utiliser bcrypt pour crypter le mot de passe avant de l'enregistrer.

**Étape 3 : Regénérer le client Prisma**
```bash
npx prisma generate
```

**Explication de cette commande :**
- Lit le nouveau schéma avec le champ `password`
- Régénère les types TypeScript pour inclure ce nouveau champ
- Met à jour le client Prisma pour reconnaître `password`

**Résultat attendu :**
```
✔ Generated Prisma Client (v4.x.x) to ./node_modules/.prisma/client in XXXms
```

**Étape 4 : Appliquer les changements à la base de données**
```bash
npx prisma db push
```

**Ce qui se passe :**
- Prisma compare votre nouveau schéma avec la base existante
- Génère une commande SQL comme `ALTER TABLE users ADD COLUMN password TEXT;`
- Applique cette modification à PostgreSQL

**Résultat attendu :**
```
The following migration(s) have been applied:

  └─ 20241201120000_add_password_field/
      └─ migration.sql

🚀  Your database is now in sync with your schema.
```

**Étape 5 : Vérification que tout fonctionne**

**Test 1 : Vérifier dans Prisma Studio**
```bash
npx prisma studio
```
Allez sur la table `User` → vous devriez voir une nouvelle colonne `password`.

**Test 2 : Tester l'inscription**
```bash
npm run dev
```
Allez sur `http://localhost:3000/auth/signup` et essayez de créer un compte. L'erreur devrait avoir disparu.

**Erreurs connexes possibles après cette correction :**

**Si vous obtenez "password cannot be null" :**
Vérifiez que votre code d'inscription utilise bien bcrypt :
```typescript
import bcrypt from 'bcryptjs'

// Dans votre API signup :
const hashedPassword = await bcrypt.hash(password, 12)
await prisma.user.create({
  data: {
    name,
    email,
    password: hashedPassword,  // ← Utilisez le mot de passe crypté
  },
})
```

**Si vous obtenez des erreurs TypeScript :**
Redémarrez votre serveur Next.js après `npx prisma generate` :
```bash
# Arrêtez le serveur (Ctrl+C)
# Puis relancez :
npm run dev
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
