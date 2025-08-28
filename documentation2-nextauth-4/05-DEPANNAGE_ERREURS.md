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

## Erreurs d'authentification - Problèmes de configuration NextAuth

### Qu'est-ce qu'une erreur d'authentification ?
**Explication pour débutants :** Ces erreurs surviennent quand NextAuth ne peut pas fonctionner correctement à cause de configurations manquantes ou incorrectes : URL mal définie, clé secrète absente, providers mal configurés, etc.

**Analogie :** C'est comme essayer de démarrer une voiture sans clés, ou avec une adresse GPS incomplète - le système ne peut pas fonctionner sans les informations essentielles.

### ERREUR 7 : "NextAuth URL (NEXTAUTH_URL) not provided"

**Symptôme complet que vous voyez :**
```
[next-auth][error][NEXTAUTH_URL] 
https://next-auth.js.org/errors#nextauth_url
NEXTAUTH_URL environment variable is not set

Error: Please define the NEXTAUTH_URL environment variable
  at checkEnvVariable (/node_modules/next-auth/src/utils/env.js:42:11)
```

**Traduction simple :** "NextAuth ne sait pas quelle est l'URL de votre application"

**Ce qui s'est passé techniquement :**
1. NextAuth a besoin de connaître l'URL de base de votre application
2. Il cherche la variable d'environnement `NEXTAUTH_URL`
3. Il ne la trouve pas dans votre fichier `.env`
4. Il refuse de démarrer sans cette information critique

**Pourquoi NextAuth a besoin de cette URL ?**
- **Redirections après connexion :** ramener l'utilisateur à la bonne page
- **Callbacks OAuth :** Google/GitHub ont besoin de savoir où renvoyer l'utilisateur
- **Cookies de session :** sécuriser les cookies avec le bon domaine
- **URLs internes :** génerer les liens vers `/api/auth/signin`, etc.

**Analogie :** C'est comme donner votre adresse postale à un livreur - il ne peut pas vous livrer s'il ne sait pas où vous habitez.

**Solution détaillée :**

**Étape 1 : Vérifier si le fichier .env existe**
```bash
ls .env
```

**Sur Windows PowerShell :**
```powershell
Get-Item .env
```

**Si le fichier n'existe pas :**
```bash
# Créer le fichier .env à la racine du projet
touch .env
```

**Sur Windows :**
```powershell
New-Item .env
```

**Étape 2 : Ajouter la variable NEXTAUTH_URL**

Ouvrez votre fichier `.env` et ajoutez cette ligne :

```env
NEXTAUTH_URL="http://localhost:3000"
```

**Explication de cette valeur :**
- `http://localhost:3000` = URL complète de votre serveur de développement
- **Pas de slash à la fin** → `http://localhost:3000/` est incorrect
- **Protocole obligatoire** → `localhost:3000` sans `http://` est incorrect

**Si votre serveur tourne sur un port différent :**
Regardez dans votre terminal où tourne `npm run dev` :
- Port 3001 : `NEXTAUTH_URL="http://localhost:3001"`
- Port 3002 : `NEXTAUTH_URL="http://localhost:3002"`
- Etc.

**Étape 3 : Redémarrer le serveur**
```bash
# Arrêter le serveur (Ctrl+C)
# Puis relancer :
npm run dev
```

**Pourquoi redémarrer ?** Next.js ne recharge pas automatiquement les variables d'environnement. Il faut redémarrer pour qu'il lise le nouveau `.env`.

**Vérification que ça marche :**
Le serveur devrait démarrer sans l'erreur `NEXTAUTH_URL`. Si l'erreur persiste :
- Vérifiez qu'il n'y a pas d'espaces autour du `=`
- Vérifiez que le fichier `.env` est bien à la racine (même niveau que `package.json`)
- Vérifiez qu'il n'y a pas de fautes de frappe dans le nom de la variable

### ERREUR 8 : "No secret provided"

**Symptôme complet que vous voyez :**
```
[next-auth][error][NO_SECRET] 
https://next-auth.js.org/errors#no_secret
Please define a `secret` in production. MissingSecret

Warning: No secret was provided. This is required in production to securely sign cookies.
NextAuth will generate a secret for you, but this may cause problems in production.
```

**Traduction simple :** "NextAuth n'a pas de clé secrète pour sécuriser les sessions"

**Ce qui s'est passé techniquement :**
1. NextAuth utilise une clé secrète pour crypter et signer les tokens JWT
2. Il cherche cette clé dans la variable `NEXTAUTH_SECRET`
3. Il ne la trouve pas → il génère une clé temporaire aléatoire
4. **Problème :** cette clé temporaire change à chaque redémarrage du serveur

**Pourquoi c'est un problème ?**
- **Sessions perdues :** quand vous redémarrez le serveur, tous les utilisateurs connectés sont déconnectés
- **Sécurité :** une clé générée automatiquement peut être moins sûre
- **Production :** NextAuth refuse de fonctionner sans clé secrète fixe

**Analogie :** C'est comme changer la serrure de votre maison à chaque fois que vous sortez - vos clés existantes ne fonctionnent plus.

**Solution détaillée :**

**Étape 1 : Générer une clé secrète sécurisée**

**Méthode A : Utiliser un générateur en ligne**
- Allez sur https://generate-secret.vercel.app/32
- Copiez la clé générée (32+ caractères)

**Méthode B : Utiliser Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Méthode C : Créer manuellement**
Tapez 32+ caractères aléatoirement : lettres, chiffres, symboles. Par exemple :
```
ma-cle-super-secrete-pour-nextauth-2024-unique-projet
```

**Étape 2 : Ajouter la variable dans .env**

Ouvrez votre fichier `.env` et ajoutez cette ligne :

```env
NEXTAUTH_SECRET="la-cle-que-vous-avez-generee-etape-precedente"
```

**Exemple concret :**
```env
NEXTAUTH_SECRET="abc123def456ghi789jkl012mno345pqr678stu901vwx234"
```

**Règles importantes pour la clé secrète :**
- **Minimum 32 caractères** (NextAuth le recommande)
- **Unique à votre projet** (ne copiez pas l'exemple ci-dessus)
- **Gardez-la secrète** (ne la partagez jamais, ne la commitez pas sur GitHub)
- **Mélangez lettres, chiffres et symboles** pour plus de sécurité

**Étape 3 : Redémarrer le serveur**
```bash
# Arrêter le serveur (Ctrl+C)
# Puis relancer :
npm run dev
```

**Étape 4 : Vérification que ça marche**
Le warning `No secret provided` devrait avoir disparu dans votre terminal.

**Votre fichier .env devrait maintenant ressembler à ça :**
```env
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="votre-cle-secrete-longue-et-unique"
```

**Note de sécurité :** En production (sur un serveur réel), utilisez une clé encore plus complexe et stockez-la de façon sécurisée (variables d'environnement du serveur, pas dans un fichier).

### ERREUR 9 : "Credentials signin failed"

**Symptôme complet que vous voyez :**
```
[next-auth][error][CREDENTIALS_SIGNIN_FAILED]
https://next-auth.js.org/errors#credentials_signin_failed

CredentialsSignin: Invalid credentials provided
  at authorize (lib/auth.ts:45:13)
  at process.processTicksAndRejections
```

**Ou parfois :**
```
Error: Signin failed. Check the details you provided are correct.
```

**Traduction simple :** "La connexion avec email/mot de passe a échoué"

**Ce qui s'est passé techniquement :**
1. L'utilisateur remplit le formulaire de connexion avec email + mot de passe
2. NextAuth appelle votre fonction `authorize` dans `lib/auth.ts`
3. Cette fonction renvoie `null` au lieu d'un objet utilisateur
4. NextAuth interprète cela comme "identifiants incorrects"

**Causes courantes pour débutants :**
- **Mot de passe incorrect :** l'utilisateur tape le mauvais mot de passe
- **Email inexistant :** l'utilisateur tape un email qui n'existe pas en base
- **Erreur de comparaison bcrypt :** votre code ne compare pas correctement les mots de passe
- **Fonction authorize qui throw des erreurs** au lieu de retourner `null`
- **Base de données inaccessible :** Prisma ne peut pas se connecter

**Solution détaillée :**

**Étape 1 : Vérifier que l'utilisateur existe**
Allez dans Prisma Studio pour vérifier :
```bash
npx prisma studio
```
- Ouvrez la table `User`
- Cherchez l'email que vous essayez d'utiliser
- Vérifiez qu'il y a bien un mot de passe crypté dans la colonne `password`

**Si l'utilisateur n'existe pas :** Créez d'abord un compte via `/auth/signup`.

**Étape 2 : Débugger votre fonction authorize**

Ouvrez `lib/auth.ts` et ajoutez des `console.log` pour débugger :

```typescript
async authorize(credentials) {
  console.log("🚀 Tentative de connexion avec:", credentials?.email);
  
  if (!credentials?.email || !credentials?.password) {
    console.log("❌ Identifiants manquants");
    return null;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: credentials.email }
    });

    console.log("👤 Utilisateur trouvé:", user ? "OUI" : "NON");
    
    if (!user || !user.password) {
      console.log("❌ Utilisateur inexistant ou sans mot de passe");
      return null;
    }

    const isPasswordValid = await bcrypt.compare(
      credentials.password,
      user.password
    );

    console.log("🔑 Mot de passe valide:", isPasswordValid ? "OUI" : "NON");

    if (!isPasswordValid) {
      console.log("❌ Mot de passe incorrect");
      return null;
    }

    console.log("✅ Connexion réussie pour:", user.email);
    
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };
    
  } catch (error) {
    console.error("💥 Erreur dans authorize:", error);
    return null; // ← IMPORTANT: return null, pas throw error
  }
}
```

**Étape 3 : Tester avec les logs**
```bash
npm run dev
```

Essayez de vous connecter et regardez les messages dans le terminal. Cela vous dira exactement où ça coince.

**Erreurs courantes révélées par les logs :**

**Si "Utilisateur trouvé: NON" :**
- L'email tapé ne correspond pas exactement à celui en base
- Vérifiez les majuscules/minuscules
- Vérifiez les espaces avant/après l'email

**Si "Mot de passe valide: NON" :**
- Le mot de passe tapé ne correspond pas au hash en base
- Vérifiez que le mot de passe a bien été crypté avec bcrypt lors de l'inscription
- Vérifiez que vous utilisez le bon mot de passe

**Étape 4 : Nettoyer les logs (après débogage)**
Une fois le problème résolu, retirez tous les `console.log` de votre code de production.

### ERREUR 10 : "OAuth signin failed"

**Symptôme complet que vous voyez :**
```
[next-auth][error][OAUTH_SIGNIN_FAILED]
https://next-auth.js.org/errors#oauth_signin_failed

OAuthSignInError: Failed to retrieve user profile from Google
  at oAuthCallback (node_modules/next-auth/src/core/lib/oauth/callback.ts:89:13)
```

**Ou :**
```
[next-auth][error][OAUTH_GET_ACCESS_TOKEN_ERROR]
https://next-auth.js.org/errors#oauth_get_access_token_error
invalid_client
```

**Traduction simple :** "La connexion avec Google/GitHub/autre provider OAuth a échoué"

**Ce qui s'est passé techniquement :**
1. L'utilisateur clique sur "Se connecter avec Google"
2. Il est redirigé vers Google pour s'authentifier
3. Google essaie de renvoyer l'utilisateur vers votre application
4. L'échange de tokens ou la récupération du profil échoue

**Causes courantes pour débutants :**
- **Variables d'environnement manquantes :** `GOOGLE_CLIENT_ID` ou `GOOGLE_CLIENT_SECRET` absents
- **URLs de callback incorrectes :** dans la console Google/GitHub
- **Client ID/Secret incorrects :** copiés avec des erreurs
- **Application OAuth non activée :** dans les consoles Google/GitHub

**Solution détaillée :**

**Étape 1 : Vérifier les variables d'environnement**

Ouvrez votre fichier `.env` et vérifiez que vous avez :

```env
# Pour Google OAuth (optionnel)
GOOGLE_CLIENT_ID="1234567890-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="ABCDEF-GhIjKlMnOpQrStUvWxYz"

# Pour GitHub OAuth (optionnel)
GITHUB_ID="1234567890abcdef"
GITHUB_SECRET="abcdef1234567890ghijklmnopqrstuvwxyz123456"
```

**Variables manquantes ?** C'est normal si vous voulez utiliser seulement email/mot de passe. Dans ce cas, supprimez les providers OAuth de `lib/auth.ts` :

```typescript
// Commentez ou supprimez ces lignes :
// GoogleProvider({
//   clientId: process.env.GOOGLE_CLIENT_ID!,
//   clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
// }),
// GitHubProvider({
//   clientId: process.env.GITHUB_ID!,
//   clientSecret: process.env.GITHUB_SECRET!,
// }),
```

**Étape 2 : Vérifier la configuration Google OAuth (si vous l'utilisez)**

**2A. Vérifier les URLs de callback dans la Google Console**
- Allez sur https://console.cloud.google.com/
- Sélectionnez votre projet
- APIs & Services > Identifiants
- Cliquez sur votre Client ID OAuth 2.0
- Dans "Authorized redirect URIs", vous DEVEZ avoir exactement :
  ```
  http://localhost:3000/api/auth/callback/google
  ```
  (ou 3001 si votre serveur tourne sur ce port)

**2B. Vérifier que l'API Google+ est activée**
- Dans la même console : APIs & Services > Bibliothèque
- Cherchez "Google+ API" ou "People API"
- Cliquez dessus et activez l'API

**Étape 3 : Vérifier la configuration GitHub OAuth (si vous l'utilisez)**

**3A. Vérifier l'application OAuth dans GitHub**
- Allez sur https://github.com/settings/developers
- Cliquez sur votre OAuth App
- "Authorization callback URL" doit être exactement :
  ```
  http://localhost:3000/api/auth/callback/github
  ```

**3B. Vérifier que l'app est bien publique**
- Dans les paramètres de votre OAuth App
- "Application type" doit être "Public" (pas "Private")

**Étape 4 : Tester spécifiquement OAuth**

**Test Google :**
Allez sur `http://localhost:3000/api/auth/signin` et cliquez sur "Se connecter avec Google". 

**Erreurs fréquentes et solutions :**
- **"redirect_uri_mismatch" :** URL de callback incorrecte dans la Google Console
- **"invalid_client" :** Client ID ou Secret incorrect
- **"access_denied" :** L'utilisateur a refusé l'accès (normal)

**Test GitHub :**
Même processus avec le bouton GitHub.

**Étape 5 : Mode sans OAuth (le plus simple pour débuter)**
Si OAuth vous pose trop de problèmes, vous pouvez désactiver complètement Google et GitHub et utiliser seulement email/mot de passe :

```typescript
// Dans lib/auth.ts, gardez seulement :
providers: [
  CredentialsProvider({
    name: "credentials",
    // ... votre configuration credentials
  }),
  // Commentez tous les autres providers
],
```

Cela simplifie beaucoup la configuration pour commencer.

## Erreurs de routage - Problèmes de navigation et URLs

### Qu'est-ce qu'une erreur de routage ?
**Explication pour débutants :** Ces erreurs surviennent quand vous essayez d'accéder à une page web mais que Next.js ne trouve pas le fichier correspondant, ou quand les APIs ne répondent pas correctement.

**Analogie :** C'est comme chercher une adresse dans une ville - si la rue n'existe pas ou si le numéro de maison est incorrect, vous ne trouvez pas votre destination.

### ERREUR 11 : "404 - This page could not be found"

**Symptôme complet que vous voyez dans le navigateur :**
```
404
This page could not be found.

Error: Cannot GET /auth/signin
```

**Ou :**
```
404 | This page could not be found.
```
Avec l'URL `http://localhost:3000/auth/signup` qui ne marche pas.

**Traduction simple :** "Cette page n'existe pas"

**Ce qui s'est passé techniquement :**
1. Vous tapez `/auth/signin` dans votre navigateur
2. Next.js cherche le fichier `app/auth/signin/page.tsx`
3. Il ne le trouve pas → erreur 404
4. Same pour `/auth/signup` et `app/auth/signup/page.tsx`

**Pourquoi ça arrive ?**
- Vous avez créé les dossiers mais oublié de créer les fichiers `page.tsx`
- Les fichiers sont dans le mauvais endroit
- Les fichiers ont le mauvais nom (ex: `signin.tsx` au lieu de `page.tsx`)
- Vous utilisez Pages Router au lieu d'App Router (structure différente)

**Solution détaillée :**

**Étape 1 : Vérifier la structure de dossiers**
```bash
ls -la app/auth/signin/
ls -la app/auth/signup/
```

**Sur Windows PowerShell :**
```powershell
Get-ChildItem app\auth\signin\
Get-ChildItem app\auth\signup\
```

**Résultats attendus :**
- `app/auth/signin/page.tsx` doit exister
- `app/auth/signup/page.tsx` doit exister

**Si ces fichiers n'existent pas :**

**Étape 2A : Créer le fichier de connexion**
Créez le fichier `app/auth/signin/page.tsx` avec ce contenu :

```typescript
import { SignInForm } from '@/components/auth/SignInForm'

export default function SignInPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center mb-6">
          Connexion
        </h1>
        <SignInForm />
      </div>
    </div>
  )
}
```

**Étape 2B : Créer le fichier d'inscription**
Créez le fichier `app/auth/signup/page.tsx` avec ce contenu :

```typescript
import { SignUpForm } from '@/components/auth/SignUpForm'

export default function SignUpPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center mb-6">
          Créer un compte
        </h1>
        <SignUpForm />
      </div>
    </div>
  )
}
```

**Explication de ces fichiers :**
- `export default function` = fonction principale de la page (obligatoire)
- Le nom de la fonction importe peu, mais doit être descriptif
- `return` doit contenir du JSX (HTML + JavaScript)
- Les composants `SignInForm` et `SignUpForm` doivent exister dans `components/auth/`

**Étape 3 : Vérifier que les composants existent**
```bash
ls -la components/auth/
```

Vous devez avoir :
- `components/auth/SignInForm.tsx`
- `components/auth/SignUpForm.tsx`

Si ces fichiers n'existent pas, c'est un autre problème (voir le guide complet pour les créer).

**Étape 4 : Tester les pages**
```bash
npm run dev
```

Allez sur :
- `http://localhost:3000/auth/signin` → devrait marcher
- `http://localhost:3000/auth/signup` → devrait marcher

**Structure finale correcte :**
```
app/
└── auth/
    ├── signin/
    │   └── page.tsx    ← Page de connexion
    └── signup/
        └── page.tsx    ← Page d'inscription
```

### ERREUR 12 : "500 - Internal Server Error" sur les APIs

**Symptôme complet que vous voyez :**
```
500 - Internal Server Error

Application error: a server-side exception has occurred
```

Quand vous allez sur `http://localhost:3000/api/auth/signin` ou toute autre URL commençant par `/api/auth/`.

**Traduction simple :** "Erreur interne du serveur sur les APIs d'authentification"

**Ce qui s'est passé techniquement :**
1. NextAuth essaie de traiter une requête d'authentification
2. Une erreur survient dans votre configuration (`lib/auth.ts` ou le fichier de route)
3. Le serveur renvoie une erreur 500 au lieu de la réponse attendue

**Causes courantes pour débutants :**
- Fichier `app/api/auth/[...nextauth]/route.ts` manquant ou incorrect
- Erreur dans la configuration `lib/auth.ts`
- Variables d'environnement manquantes (DATABASE_URL, NEXTAUTH_SECRET, etc.)
- Problème de connexion à la base de données

**Solution détaillée :**

**Étape 1 : Vérifier que le fichier de route existe**
```bash
ls -la app/api/auth/[...nextauth]/route.ts
```

**Si le fichier n'existe pas :**

Créez le fichier `app/api/auth/[...nextauth]/route.ts` avec exactement ce contenu :

```typescript
import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
```

**Explication ligne par ligne :**
```typescript
import NextAuth from "next-auth"
```
- Importe la fonction principale de NextAuth
- Cette fonction génère toutes les routes d'authentification automatiquement

```typescript
import { authOptions } from "@/lib/auth"
```
- Importe votre configuration depuis `lib/auth.ts`
- `@/lib/auth` = alias pour `./lib/auth` (plus propre)

```typescript
const handler = NextAuth(authOptions)
```
- Crée le gestionnaire de routes avec votre configuration
- `handler` gère toutes les URLs comme `/api/auth/signin`, `/api/auth/callback`, etc.

```typescript
export { handler as GET, handler as POST }
```
- Exporte le handler pour les requêtes GET et POST
- Syntaxe obligatoire pour Next.js App Router
- NextAuth a besoin des deux méthodes HTTP

**Étape 2 : Vérifier les logs détaillés**

Dans le terminal où tourne `npm run dev`, vous devriez voir des messages d'erreur détaillés. Exemples :

**Si vous voyez :**
```
Error: Cannot find module '@/lib/auth'
```
→ Le fichier `lib/auth.ts` n'existe pas ou est mal configuré.

**Si vous voyez :**
```
PrismaClientInitializationError: Can't reach database server
```
→ Problème de connexion à PostgreSQL (vérifiez DATABASE_URL).

**Si vous voyez :**
```
[next-auth][error][NO_SECRET]
```
→ Variable NEXTAUTH_SECRET manquante (voir erreur précédente).

**Étape 3 : Tester spécifiquement l'API NextAuth**

Allez sur `http://localhost:3000/api/auth/providers` dans votre navigateur.

**Résultat attendu :**
```json
{
  "credentials": {
    "id": "credentials",
    "name": "credentials", 
    "type": "credentials"
  },
  "google": {
    "id": "google",
    "name": "Google",
    "type": "oauth"
  }
}
```

**Si vous obtenez une erreur 500 ici aussi :** Le problème est dans votre configuration `lib/auth.ts`.

**Étape 4 : Diagnostic approfondi**

Ajoutez temporairement cette ligne dans `lib/auth.ts` pour débugger :

```typescript
export const authOptions: NextAuthOptions = {
  debug: true,  // ← Ajoutez cette ligne
  // ... le reste de votre configuration
}
```

Puis redémarrez le serveur. Cela affichera des logs très détaillés dans le terminal pour identifier exactement où ça coince.

**Une fois le problème résolu, retirez `debug: true`** car cela affiche des informations sensibles.

## Erreurs de session - Problèmes de gestion des sessions utilisateur

### Qu'est-ce qu'une erreur de session ?
**Explication pour débutants :** Les erreurs de session surviennent quand votre application ne peut pas gérer correctement l'état de connexion de l'utilisateur. Cela peut être un problème de configuration du SessionProvider, de callbacks mal configurés, ou de problèmes dans la chaîne de transmission des informations de session.

**Analogie :** C'est comme un système de badges d'accès dans un immeuble - si le lecteur de badge n'est pas branché (SessionProvider manquant) ou si le badge a été mal programmé (callbacks incorrects), l'utilisateur ne peut pas accéder aux zones protégées même s'il devrait y avoir droit.

### ERREUR 13 : "useSession must be used within SessionProvider"

**Symptôme complet que vous voyez :**
```
Unhandled Runtime Error
Error: useSession must be used within a SessionProvider

Call Stack
  useSession
    node_modules/next-auth/react/index.js (158:0)
  AuthButton
    components/auth/AuthButton.tsx (8:23)
```

**Traduction simple :** "useSession ne peut pas être utilisé en dehors d'un SessionProvider"

**Ce qui s'est passé techniquement :**
1. Un de vos composants React utilise le hook `useSession` de NextAuth
2. React cherche le contexte `SessionProvider` dans l'arbre des composants
3. Il ne le trouve pas → erreur fatale
4. L'application ne peut pas s'afficher

**Pourquoi ça arrive ?**
- Le `SessionProvider` n'a pas été ajouté dans le layout principal
- Le `SessionProvider` ne wrappe pas correctement tous les composants
- Vous utilisez `useSession` dans un composant qui n'est pas dans l'arbre React principal
- Configuration incorrecte du SessionProvider

**Analogie :** C'est comme essayer d'utiliser l'électricité dans une pièce qui n'est pas raccordée au tableau électrique général.

**Solution détaillée :**

**Étape 1 : Vérifier que le SessionProvider existe**
```bash
ls -la components/providers/SessionProvider.tsx
```

**Si ce fichier n'existe pas, créez-le :**

Créez le fichier `components/providers/SessionProvider.tsx` avec ce contenu exact :

```typescript
'use client'

import { SessionProvider } from 'next-auth/react'
import { Session } from 'next-auth'

interface AuthSessionProviderProps {
  children: React.ReactNode
  session: Session | null
}

export function AuthSessionProvider({ 
  children, 
  session 
}: AuthSessionProviderProps) {
  return (
    <SessionProvider session={session}>
      {children}
    </SessionProvider>
  )
}
```

**Explication ligne par ligne :**

```typescript
'use client'
```
- Directive obligatoire pour Next.js App Router
- Indique que ce composant s'exécute côté client (navigateur)
- Nécessaire car les hooks React (`SessionProvider`) ne fonctionnent que côté client

```typescript
import { SessionProvider } from 'next-auth/react'
```
- Importe le vrai SessionProvider de NextAuth
- Composant qui fournit le contexte de session à toute l'application

```typescript
interface AuthSessionProviderProps {
  children: React.ReactNode
  session: Session | null
}
```
- Définit les props que notre wrapper accepte
- `children` = tous les composants enfants
- `session` = session actuelle (peut être null si pas connecté)

```typescript
export function AuthSessionProvider({ children, session }: AuthSessionProviderProps) {
  return (
    <SessionProvider session={session}>
      {children}
    </SessionProvider>
  )
}
```
- Notre wrapper personnalisé autour du SessionProvider officiel
- Transmet la session et wrappe tous les enfants

**Étape 2 : Vérifier la configuration dans app/layout.tsx**

Ouvrez `app/layout.tsx` et vérifiez qu'il ressemble exactement à ça :

```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthSessionProvider } from '@/components/providers/SessionProvider'
import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/Footer'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Laboratoire 2 - NextAuth Demo',
  description: 'Application Next.js avec authentification NextAuth v4',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="fr">
      <body className={inter.className}>
        <AuthSessionProvider session={session}>
          <div className="min-h-screen flex flex-col">
            <Navigation />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </AuthSessionProvider>
      </body>
    </html>
  )
}
```

**Points critiques à vérifier :**

**Point A : Import correct**
```typescript
import { AuthSessionProvider } from '@/components/providers/SessionProvider'
```
- Vérifiez que le chemin correspond à votre fichier
- Pas d'erreur de frappe dans le nom

**Point B : Récupération de session côté serveur**
```typescript
const session = await getServerSession(authOptions)
```
- `getServerSession` = fonction pour récupérer la session côté serveur
- `authOptions` = votre configuration NextAuth importée de `lib/auth.ts`
- Cette ligne doit être AVANT le return

**Point C : Wrapper correct**
```typescript
<AuthSessionProvider session={session}>
  {/* TOUT le contenu de votre app doit être ICI */}
  <div className="min-h-screen flex flex-col">
    <Navigation />
    <main className="flex-1">
      {children}
    </main>
    <Footer />
  </div>
</AuthSessionProvider>
```
- `{children}` représente toutes vos pages
- Navigation et Footer doivent aussi être dans le SessionProvider s'ils utilisent `useSession`

**Étape 3 : Tester la correction**
```bash
npm run dev
```

L'erreur "useSession must be used within SessionProvider" devrait avoir disparu.

**Si l'erreur persiste :**

**Test de diagnostic :** Ajoutez temporairement cette ligne dans un composant qui utilise `useSession` :

```typescript
import { useSession } from 'next-auth/react'

export function MonComposant() {
  console.log("SessionProvider détecté:", !!useSession) // Debug
  const { data: session } = useSession()
  // ...
}
```

Si vous voyez `false` dans la console, le SessionProvider n'est toujours pas correctement configuré.

### ERREUR 14 : "Session is null" quand elle devrait exister

**Symptôme complet que vous voyez :**
```
// Dans la console du navigateur (F12)
Session: null

// Ou dans votre interface :
// - Utilisateur semble connecté (URL montre qu'il vient de se connecter)
// - Mais l'interface affiche "Connexion" au lieu du nom d'utilisateur
// - useSession().data renvoie null
```

**Traduction simple :** "L'utilisateur devrait être connecté mais la session est vide"

**Ce qui s'est passé techniquement :**
1. L'utilisateur s'est authentifié avec succès (email/password ou OAuth)
2. NextAuth a créé un token JWT
3. Mais les callbacks de session ne transmettent pas correctement les informations
4. Le hook `useSession` reçoit une session null ou incomplète

**Causes courantes pour débutants :**
- **Callbacks session mal configurés :** ne retournent pas les bonnes informations
- **Callbacks JWT mal configurés :** ne passent pas les données utilisateur
- **Types TypeScript incorrects :** interface Session ne correspond pas
- **Problème de cookie :** session stockée mais pas accessible
- **Timing :** composant s'affiche avant que la session soit chargée

**Solution détaillée :**

**Étape 1 : Vérifier les callbacks dans lib/auth.ts**

Ouvrez `lib/auth.ts` et vérifiez la section `callbacks`. Elle doit ressembler exactement à ça :

```typescript
export const authOptions: NextAuthOptions = {
  // ... autres configurations
  callbacks: {
    async jwt({ token, user }) {
      // Appelé à chaque connexion ET à chaque vérification de session
      if (user) {
        // Première connexion : ajouter les infos utilisateur au token
        token.role = user.role
        token.id = user.id
      }
      return token
    },

    async session({ session, token }) {
      // Appelé à chaque fois que la session est lue
      if (token && session.user) {
        // Transférer les infos du token vers la session
        session.user.id = token.sub as string  // sub = user ID
        session.user.role = token.role as string
      }
      return session
    },
  },
}
```

**Explication ligne par ligne des callbacks :**

**Callback JWT :**
```typescript
async jwt({ token, user }) {
  if (user) {
    token.role = user.role
    token.id = user.id
  }
  return token
}
```
- `jwt` est appelé à chaque connexion et vérification de session
- `user` existe seulement lors de la première connexion
- On enrichit le `token` avec les informations personnalisées
- Le token est stocké de façon cryptée dans un cookie

**Callback Session :**
```typescript
async session({ session, token }) {
  if (token && session.user) {
    session.user.id = token.sub as string
    session.user.role = token.role as string
  }
  return session
}
```
- `session` est appelé chaque fois qu'un composant utilise `useSession`
- On transfert les infos du `token` vers l'objet `session`
- `token.sub` = ID utilisateur (fourni automatiquement par NextAuth)
- C'est cet objet `session` que reçoivent vos composants React

**Étape 2 : Vérifier les extensions de types TypeScript**

Dans le même fichier `lib/auth.ts`, vérifiez que vous avez ces déclarations de types :

```typescript
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
    role?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string | null
  }
}
```

**Pourquoi ces types sont nécessaires :**
- TypeScript a besoin de savoir que `session.user` a une propriété `role`
- Sans ça, `token.role` et `session.user.role` génèrent des erreurs TypeScript
- Ces déclarations étendent les types de base de NextAuth

**Étape 3 : Test de diagnostic avec logs détaillés**

Ajoutez temporairement des `console.log` dans vos callbacks pour débugger :

```typescript
callbacks: {
  async jwt({ token, user }) {
    console.log("🔑 JWT Callback - user:", user ? "EXISTS" : "NULL")
    console.log("🔑 JWT Callback - token avant:", token)
    
    if (user) {
      token.role = user.role
      token.id = user.id
      console.log("🔑 JWT Callback - token enrichi:", token)
    }
    return token
  },

  async session({ session, token }) {
    console.log("📋 Session Callback - token:", token)
    console.log("📋 Session Callback - session avant:", session)
    
    if (token && session.user) {
      session.user.id = token.sub as string
      session.user.role = token.role as string
      console.log("📋 Session Callback - session enrichie:", session)
    }
    return session
  },
},
```

**Étape 4 : Tester et analyser les logs**

1. Connectez-vous sur votre application
2. Regardez les logs dans le terminal ET dans la console du navigateur (F12)
3. Vérifiez que :
   - JWT callback s'exécute avec `user: EXISTS` à la connexion
   - Session callback s'exécute et enrichit la session
   - `useSession` dans vos composants reçoit les bonnes données

**Étape 5 : Test dans un composant**

Créez un composant de test temporaire pour diagnostiquer :

```typescript
'use client'

import { useSession } from 'next-auth/react'

export function SessionDebug() {
  const { data: session, status } = useSession()
  
  return (
    <div className="p-4 bg-gray-100 m-4">
      <h3>Session Debug</h3>
      <p>Status: {status}</p>
      <pre>{JSON.stringify(session, null, 2)}</pre>
    </div>
  )
}
```

Ajoutez ce composant temporairement dans une page pour voir exactement ce que contient votre session.

**Étape 6 : Nettoyer les logs**
Une fois le problème identifié et résolu, retirez tous les `console.log` et le composant de debug.

## Erreurs de middleware - Problèmes de protection des routes

### Qu'est-ce qu'une erreur de middleware ?
**Explication pour débutants :** Les erreurs de middleware surviennent quand le système de protection de routes de Next.js ne fonctionne pas correctement. Le middleware est censé intercepter les requêtes avant qu'elles arrivent à vos pages et vérifier si l'utilisateur a le droit d'accéder à cette route.

**Analogie :** Le middleware est comme un vigile à l'entrée d'un bâtiment - si le vigile n'est pas à son poste (middleware mal placé) ou s'il n'a pas reçu ses instructions (configuration incorrecte), n'importe qui peut rentrer dans les zones sécurisées.

### ERREUR 15 : "Middleware not working" - Protection des routes ne fonctionne pas

**Symptôme complet que vous observez :**
```
// Test : aller sur http://localhost:3000/products/new en étant déconnecté
// Résultat attendu : redirection vers /auth/signin
// Résultat obtenu : accès direct à la page (PAS de redirection)

// Ou :
// - Vous pouvez accéder aux routes admin sans être admin
// - Les APIs protégées répondent même sans authentification
// - Aucune redirection automatique vers la page de connexion
```

**Traduction simple :** "Le système de protection des routes ne fonctionne pas"

**Ce qui devrait se passer techniquement :**
1. Vous tapez `/products/new` dans l'URL
2. Le middleware Next.js intercepte cette requête AVANT qu'elle arrive à la page
3. Il vérifie si vous êtes connecté via NextAuth
4. Si pas connecté → redirection automatique vers `/auth/signin`
5. Si connecté → accès autorisé à la page

**Causes courantes pour débutants :**
- **Fichier middleware au mauvais endroit :** dans `app/` au lieu de la racine
- **Configuration matcher incorrecte :** syntaxe de chemins incorrecte
- **Import NextAuth middleware incorrect :** mauvaise fonction importée
- **Middleware pas exporté correctement :** problème d'export
- **Conflit avec d'autres middlewares :** plusieurs middlewares qui interfèrent

**Solution détaillée :**

**Étape 1 : Vérifier l'emplacement du fichier middleware**

Le fichier `middleware.ts` DOIT être à la racine de votre projet, au même niveau que `package.json`.

```bash
ls -la middleware.ts
```

**Structure correcte :**
```
votre-projet/
├── app/
├── components/
├── lib/
├── prisma/
├── middleware.ts      ← ICI (racine)
├── package.json
└── ...
```

**Structure INCORRECTE :**
```
votre-projet/
├── app/
│   └── middleware.ts  ← MAUVAIS ENDROIT
├── lib/
│   └── middleware.ts  ← MAUVAIS ENDROIT
└── ...
```

**Si le fichier n'existe pas ou est mal placé :**

Créez le fichier `middleware.ts` à la racine avec ce contenu exact :

```typescript
import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // Cette fonction s'exécute pour chaque requête protégée
    console.log("🛡️ Middleware - Vérification de:", req.url)
    console.log("🛡️ Token présent:", !!req.nextauth.token)
    
    // Vérification des rôles admin (optionnel)
    if (req.nextUrl.pathname.startsWith("/admin")) {
      const isAdmin = req.nextauth.token?.role === "admin"
      console.log("🛡️ Accès admin requis - Utilisateur admin:", isAdmin)
      
      if (!isAdmin) {
        // Rediriger vers l'accueil si pas admin
        return Response.redirect(new URL("/", req.url))
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // Cette fonction détermine si l'utilisateur est autorisé
        console.log("🛡️ Callback authorized - Token:", !!token)
        return !!token // true si token existe (utilisateur connecté)
      },
    },
  }
)

export const config = {
  matcher: [
    // Pages protégées (nécessitent une connexion)
    "/products/new",
    "/products/:path*/edit",
    "/admin/:path*",
    
    // APIs protégées (nécessitent une connexion)
    "/api/products/:path*",
    "/api/admin/:path*"
  ]
}
```

**Explication ligne par ligne :**

**Import et export :**
```typescript
import { withAuth } from "next-auth/middleware"
export default withAuth(...)
```
- `withAuth` = fonction de NextAuth qui crée un middleware d'authentification
- `export default` = exporte ce middleware comme middleware principal du projet

**Fonction middleware personnalisée :**
```typescript
function middleware(req) {
  console.log("🛡️ Middleware - Vérification de:", req.url)
  // ...
}
```
- Cette fonction s'exécute pour chaque requête vers une route protégée
- `req` = objet de la requête avec toutes les informations (URL, headers, token, etc.)
- Vous pouvez ajouter votre logique personnalisée ici

**Vérification des rôles :**
```typescript
if (req.nextUrl.pathname.startsWith("/admin")) {
  const isAdmin = req.nextauth.token?.role === "admin"
  if (!isAdmin) {
    return Response.redirect(new URL("/", req.url))
  }
}
```
- Vérifie si l'URL commence par `/admin`
- Contrôle que l'utilisateur a le rôle "admin"
- Redirige vers l'accueil si pas autorisé

**Callback authorized :**
```typescript
callbacks: {
  authorized: ({ token }) => !!token
}
```
- Fonction qui détermine si l'accès est autorisé
- `!!token` = true si token existe (utilisateur connecté), false sinon
- Si return false → redirection automatique vers `/auth/signin`

**Configuration matcher :**
```typescript
export const config = {
  matcher: [
    "/products/new",
    "/products/:path*/edit", 
    "/api/products/:path*"
  ]
}
```
- Liste des chemins où le middleware doit s'appliquer
- `:path*` = wildcard pour capturer plusieurs segments d'URL
- Syntaxe Next.js, pas regex classique

**Étape 2 : Vérifier la configuration matcher**

**Syntaxes correctes pour matcher :**

```typescript
// Chemins exacts
"/products/new"           → protège uniquement /products/new

// Wildcards simples  
"/products/:id"           → protège /products/123, /products/abc, etc.
"/products/:id/edit"      → protège /products/123/edit, /products/abc/edit

// Wildcards multiples
"/admin/:path*"           → protège /admin/users, /admin/settings/general
"/api/products/:path*"    → protège /api/products/123, /api/products/create

// APIs spécifiques
"/api/products"           → protège uniquement /api/products (pas les sous-routes)
```

**Syntaxes INCORRECTES (ne fonctionnent pas) :**
```typescript
// Regex non supportée
"/products/*/edit"        // INCORRECT
"/products/.*/edit"       // INCORRECT

// Globs non supportés
"/admin/**"               // INCORRECT

// Extensions de fichiers
"*.api"                   // INCORRECT
```

**Étape 3 : Tester le middleware**

**Test 1 : Vérification des logs**
```bash
npm run dev
```

Allez sur une route protégée en étant déconnecté. Vous devriez voir dans le terminal :
```
🛡️ Middleware - Vérification de: http://localhost:3000/products/new
🛡️ Token présent: false
🛡️ Callback authorized - Token: false
```

**Test 2 : Vérification des redirections**
- Déconnectez-vous complètement
- Allez sur `http://localhost:3000/products/new`
- **Résultat attendu :** Redirection automatique vers `/auth/signin?callbackUrl=%2Fproducts%2Fnew`

**Test 3 : Vérification après connexion**
- Connectez-vous
- Allez sur `http://localhost:3000/products/new`  
- **Résultat attendu :** Accès autorisé, pas de redirection

**Étape 4 : Problèmes courants et solutions**

**Problème A : "Cannot read property 'pathname' of undefined"**
```typescript
// INCORRECT :
if (req.url.startsWith("/admin"))

// CORRECT :
if (req.nextUrl.pathname.startsWith("/admin"))
```

**Problème B : Middleware s'applique partout**
Vérifiez que votre `config.matcher` est bien défini et limité aux bonnes routes.

**Problème C : Boucles de redirection infinies**
```typescript
// Assurez-vous de ne PAS protéger les routes d'authentification
export const config = {
  matcher: [
    "/products/:path*",
    // Ne PAS inclure :
    // "/auth/:path*",     // INCORRECT - créerait une boucle
    // "/api/auth/:path*", // INCORRECT - empêcherait la connexion
  ]
}
```

**Étape 5 : Retirer les logs de debug**
Une fois que le middleware fonctionne, retirez les `console.log` pour la production :

```typescript
export default withAuth(
  function middleware(req) {
    // Gardez seulement la logique métier, pas les logs
    if (req.nextUrl.pathname.startsWith("/admin")) {
      const isAdmin = req.nextauth.token?.role === "admin"
      if (!isAdmin) {
        return Response.redirect(new URL("/", req.url))
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)
```

## Erreurs de types TypeScript - Problèmes de typage avec NextAuth

### Qu'est-ce qu'une erreur de types TypeScript ?
**Explication pour débutants :** TypeScript vérifie que votre code utilise correctement les types de données. Quand vous étendez NextAuth avec des champs personnalisés (comme `role`), vous devez informer TypeScript de ces nouveaux champs, sinon il génère des erreurs.

**Analogie :** C'est comme remplir un formulaire officiel - si vous ajoutez une case "Profession" qui n'était pas prévue sur le formulaire original, vous devez officiellement déclarer que cette case existe maintenant.

### ERREUR 16 : "Property 'role' does not exist on type 'User'"

**Symptôme complet que vous voyez :**
```
TypeScript Error in lib/auth.ts (67:18):
Property 'role' does not exist on type 'User'.

    65 |     if (user) {
    66 |       token.role = user.role  ← Erreur ici
    67 |       token.id = user.id
    68 |     }
```

**Ou aussi :**
```
TypeScript Error:
Property 'role' does not exist on type '{ name?: string | null; email?: string | null; image?: string | null; }'

Cannot access session.user.role in component AuthButton.tsx
```

**Traduction simple :** "TypeScript ne connaît pas la propriété 'role' sur l'objet User"

**Ce qui s'est passé techniquement :**
1. Vous utilisez `user.role` ou `session.user.role` dans votre code
2. TypeScript vérifie les types de NextAuth par défaut
3. Les types par défaut ne contiennent pas de champ `role`
4. TypeScript refuse de compiler car il ne reconnaît pas cette propriété

**Pourquoi ça arrive ?**
- Vous avez ajouté des champs personnalisés (role, permissions, etc.) à NextAuth
- Mais vous n'avez pas déclaré ces nouveaux types à TypeScript
- TypeScript utilise toujours les types de base de NextAuth

**Solution détaillée :**

**Étape 1 : Ajouter les déclarations de types dans lib/auth.ts**

À la fin de votre fichier `lib/auth.ts`, ajoutez exactement ces déclarations :

```typescript
// Extensions de types pour NextAuth - OBLIGATOIRE
declare module "next-auth" {
  interface Session {
    user: {
      id: string                    // ← ID utilisateur (toujours nécessaire)
      name?: string | null          // ← Nom affiché
      email?: string | null         // ← Adresse email
      image?: string | null         // ← Photo de profil (OAuth)
      role?: string | null          // ← Rôle personnalisé (user/admin)
    }
  }

  interface User {
    id: string                      // ← ID utilisateur dans la base
    role?: string | null            // ← Rôle personnalisé
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string | null            // ← Rôle dans le token JWT
  }
}
```

**Explication ligne par ligne :**

**Extension Session :**
```typescript
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role?: string | null
    }
  }
}
```
- `declare module` = dit à TypeScript "je vais étendre ce module existant"
- `interface Session` = étend l'interface Session existante de NextAuth
- Ajoute les champs personnalisés que vous utilisez dans vos composants React

**Extension User :**
```typescript
interface User {
  id: string
  role?: string | null
}
```
- Étend l'interface User utilisée dans les callbacks
- Nécessaire pour `user.role` dans le callback JWT

**Extension JWT :**
```typescript
declare module "next-auth/jwt" {
  interface JWT {
    role?: string | null
  }
}
```
- Étend l'interface JWT pour le token
- Nécessaire pour `token.role` dans les callbacks

**Types de données expliqués :**
- `string` = texte obligatoire
- `string?` = texte optionnel
- `string | null` = texte ou null
- `string? | null` = texte optionnel qui peut aussi être null

**Étape 2 : Vérifier que vos callbacks utilisent les bons types**

Dans le même fichier, vérifiez que vos callbacks correspondent aux types déclarés :

```typescript
callbacks: {
  async jwt({ token, user }) {
    if (user) {
      token.role = user.role  // ← Plus d'erreur TypeScript
      token.id = user.id
    }
    return token
  },

  async session({ session, token }) {
    if (token && session.user) {
      session.user.id = token.sub as string
      session.user.role = token.role  // ← Plus d'erreur TypeScript
    }
    return session
  },
},
```

**Étape 3 : Vérifier l'utilisation dans vos composants**

Dans vos composants React, vous pouvez maintenant utiliser sans erreur :

```typescript
'use client'

import { useSession } from 'next-auth/react'

export function AuthButton() {
  const { data: session } = useSession()

  if (!session) {
    return <button>Connexion</button>
  }

  return (
    <div>
      <p>Bonjour, {session.user.name}</p>
      <p>Rôle : {session.user.role}</p>  {/* ← Plus d'erreur TypeScript */}
    </div>
  )
}
```

**Étape 4 : Redémarrer TypeScript**

Après avoir ajouté les déclarations de types :

```bash
# Arrêtez le serveur de développement (Ctrl+C)
npm run dev
```

**Dans VS Code :** Vous pouvez aussi redémarrer le serveur TypeScript :
- Ouvrez la palette de commandes (Ctrl+Shift+P)
- Tapez "TypeScript: Restart TS Server"
- Appuyez sur Entrée

**Étape 5 : Vérification que tout fonctionne**

**Test 1 : Plus d'erreurs TypeScript**
Votre éditeur ne devrait plus souligner `user.role` ou `session.user.role` en rouge.

**Test 2 : Autocomplétion améliorée**
Quand vous tapez `session.user.`, vous devriez voir `role` dans la liste d'autocomplétion.

**Erreurs connexes possibles :**

**Si vous obtenez "Cannot redeclare block-scoped variable" :**
- Vous avez déclaré les types plusieurs fois
- Supprimez les déclarations en double, gardez seulement celles dans `lib/auth.ts`

**Si vous obtenez des erreurs sur d'autres propriétés :**
Ajoutez-les à vos déclarations de types :
```typescript
interface User {
  id: string
  role?: string | null
  permissions?: string[]     // ← Ajoutez vos champs personnalisés
  department?: string | null
}
```

## Diagnostic général - Outils et commandes pour résoudre tous les problèmes

### Guide de diagnostic méthodique

**Quand utiliser cette section :**
- Vous avez une erreur qui ne figure pas dans les sections précédentes
- Vous voulez faire un diagnostic complet de votre installation
- Votre application ne fonctionne pas du tout
- Vous voulez partir sur de bonnes bases

**Analogie :** C'est comme faire une révision complète de votre voiture - on vérifie tous les systèmes un par un pour s'assurer que tout fonctionne.

### Étape 1 : Vérification de l'environnement de développement

**Commandes de base :**
```bash
# Vérifier les versions des outils principaux
node --version          # Doit être 18+ pour Next.js 14
npm --version           # Doit être 9+
```

**Résultats attendus :**
```
node --version  → v18.17.0 ou plus récent
npm --version   → 9.8.1 ou plus récent
```

**Si versions trop anciennes :** Mettez à jour Node.js depuis https://nodejs.org

### Étape 2 : Vérification des packages NextAuth

**Commandes détaillées :**
```bash
# Vérifier les packages NextAuth installés
npm list next-auth @next-auth/prisma-adapter bcryptjs

# Vérifier TOUS les packages (plus verbeux)
npm list --depth=0
```

**Résultats attendus :**
```
├── next-auth@4.24.7
├── @next-auth/prisma-adapter@1.0.7  
├── bcryptjs@2.4.3
└── @types/bcryptjs@2.4.6
```

**Commandes de réparation si problèmes :**
```bash
# Désinstaller les mauvaises versions
npm uninstall @auth/prisma-adapter next-auth

# Réinstaller les bonnes versions
npm install next-auth@4 @next-auth/prisma-adapter bcryptjs @types/bcryptjs
```

### Étape 3 : Vérification de la configuration Prisma

**Validation du schéma :**
```bash
npx prisma validate
```

**Résultat attendu :**
```
The schema is valid.
```

**Si erreurs :** Corrigez les erreurs indiquées avant de continuer.

**Vérification de la base de données :**
```bash
# Tester la connexion à la base de données
npx prisma db execute --stdin
```

Puis tapez une requête simple :
```sql
SELECT 1;
```
Et pressez Ctrl+D (Unix/Mac) ou Ctrl+Z puis Entrée (Windows).

**Si connexion OK :** Vous verrez le résultat de la requête.
**Si connexion échoue :** Vérifiez votre `DATABASE_URL` dans `.env`.

**Visualisation de la base :**
```bash
npx prisma studio
```

Vérifiez que vous voyez bien toutes les tables : `users`, `accounts`, `sessions`, `verificationtokens`.

### Étape 4 : Vérification des variables d'environnement

**Sur Unix/Mac :**
```bash
echo $DATABASE_URL
echo $NEXTAUTH_URL  
echo $NEXTAUTH_SECRET
```

**Sur Windows :**
```bash
# Ou simplement ouvrir le fichier .env
Get-Content .env
```

**Variables minimales obligatoires :**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="cle-secrete-minimum-32-caracteres"
```

### Étape 5 : Nettoyage complet (solution radicale)

**Si rien ne fonctionne, nettoyage total :**

```bash
# 1. Arrêter le serveur (Ctrl+C)

# 2. Supprimer tous les fichiers de cache et dépendances
rm -rf node_modules package-lock.json
# Sur Windows : rmdir /s node_modules et supprimez package-lock.json

# 3. Nettoyer le cache npm
npm cache clean --force

# 4. Réinstaller complètement
npm install

# 5. Regénérer Prisma
npx prisma generate
npx prisma db push

# 6. Relancer le serveur
npm run dev
```

### Étape 6 : Diagnostic en mode debug complet

**Activez tous les logs de debug :**

Dans `lib/auth.ts` :
```typescript
export const authOptions: NextAuthOptions = {
  debug: true,  // ← Logs détaillés NextAuth
  // ... rest of config
}
```

Dans `middleware.ts` (si existant) :
```typescript
export default withAuth(
  function middleware(req) {
    console.log("🛡️ Middleware:", req.nextUrl.pathname)
    console.log("🛡️ Token:", !!req.nextauth.token)
    // ... rest of middleware
  }
)
```

**Redémarrez et testez :** Vous aurez des logs très détaillés pour identifier exactement où ça bloque.

### Étape 7 : Tests de fonctionnalités par ordre de priorité

**Test 1 : Serveur démarre**
```bash
npm run dev
```
**Attendu :** "Ready in X.Xs" sans erreurs.

**Test 2 : APIs NextAuth accessibles**
Allez sur `http://localhost:3000/api/auth/providers`
**Attendu :** JSON avec la liste des providers.

**Test 3 : Pages d'authentification**
- `http://localhost:3000/auth/signin` → page de connexion
- `http://localhost:3000/auth/signup` → page d'inscription

**Test 4 : Inscription**
Créez un compte test, vérifiez dans Prisma Studio qu'il apparaît.

**Test 5 : Connexion**
Connectez-vous avec le compte créé.

**Test 6 : Protection des routes**
Accédez à une route protégée déconnecté → redirection vers signin.

### Commandes de maintenance régulière

**Vérification mensuelle :**
```bash
# Vérifier les updates de packages
npm outdated

# Valider Prisma
npx prisma validate

# Nettoyer les logs
# (supprimer console.log temporaires du code)
```

**En cas de problème récurrent :**
```bash
# Reset complet de la base de données (ATTENTION : supprime toutes les données)
npx prisma db push --force-reset

# Puis recréer un utilisateur de test
```

Cette approche méthodique vous permettra d'identifier et de résoudre 99% des problèmes NextAuth que vous pouvez rencontrer.
