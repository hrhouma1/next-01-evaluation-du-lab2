# Guide complet NextAuth.js v4 - Authentification sécurisée pour débutants

## Introduction - Qu'est-ce que l'authentification ?

### Analogie simple
Imaginez votre application web comme un immeuble d'appartements :
- **L'authentification** = vérifier l'identité de quelqu'un (comme montrer sa carte d'identité)
- **L'autorisation** = vérifier si cette personne a le droit d'accéder à un étage spécifique (comme avoir la clé du bon appartement)
- **La session** = un bracelet temporaire qui prouve que vous avez déjà été vérifié (évite de redemander la carte d'identité à chaque porte)

### Ce que vous allez apprendre
Ce guide vous apprendra à construire un système complet qui permet aux utilisateurs de :
1. **Créer un compte** (inscription) - comme s'enregistrer à la réception de l'immeuble
2. **Se connecter** (connexion) - comme scanner son badge d'entrée  
3. **Rester connecté** (session) - comme porter un bracelet visiteur
4. **Accéder aux zones autorisées** (protection des routes) - comme avoir accès aux étages selon son statut
5. **Se déconnecter** (déconnexion) - comme rendre son bracelet en partant

### Pourquoi NextAuth.js v4 ?
NextAuth.js v4 est comme un **système de sécurité professionnel pré-installé** pour votre immeuble :
- ✅ **Déjà testé et sécurisé** - utilisé par des milliers d'applications réelles
- ✅ **Facile à installer** - quelques lignes de code au lieu de centaines
- ✅ **Compatible avec tout** - Google, Facebook, email/mot de passe, etc.
- ✅ **Gère les sessions** - se souvient automatiquement qui est connecté
- ✅ **Protège contre les attaques** - cryptage, hachage, protection CSRF intégrés

## Prérequis - Vérifiez que vous avez tout

### Outils nécessaires (comme vos outils de bricolage)
Avant de commencer, assurez-vous d'avoir :

- **Un projet Next.js 14+ avec App Router** 
  - *Explication* : Next.js est le framework web que nous utilisons. App Router est la nouvelle façon de structurer les pages (plus moderne que Pages Router)
  - *Comment vérifier* : Regardez si vous avez un dossier `app/` à la racine de votre projet

- **Node.js 18+** installé sur votre ordinateur
  - *Explication* : Node.js permet d'exécuter du JavaScript sur votre ordinateur (pas seulement dans le navigateur)
  - *Comment vérifier* : Tapez `node --version` dans votre terminal. Vous devriez voir quelque chose comme `v18.0.0` ou plus récent

- **Une base de données PostgreSQL** (Neon, Supabase, ou locale)
  - *Explication* : PostgreSQL est comme un classeur géant qui stocke toutes les données de vos utilisateurs
  - *Pourquoi PostgreSQL* : Plus robuste que SQLite, gratuit contrairement à certaines alternatives
  - *Options recommandées* : Neon.db ou Supabase (gratuits et faciles à configurer)

- **Un éditeur de code** (VS Code recommandé)
  - *Explication* : C'est votre environnement de travail pour écrire du code
  - *Pourquoi VS Code* : Extensions utiles, auto-complétion, intégration Git

- **Connaissance de base de React et TypeScript**
  - *React* : Comprendre les composants, states, props
  - *TypeScript* : Comprendre les types de base (string, number, boolean)
  - *Pas de panique* : Tout sera expliqué étape par étape !

### Vocabulaire technique essentiel

**🔑 Termes que vous entendrez souvent :**

- **Provider** = Fournisseur d'authentification (Google, GitHub, email/mot de passe)
  - *Analogie* : Comme différentes façons d'entrer dans l'immeuble (badge, code, empreinte)

- **Session** = Preuve temporaire que vous êtes connecté  
  - *Analogie* : Comme un bracelet de festival qui prouve que vous avez payé l'entrée

- **Token** = Code secret temporaire qui prouve votre identité
  - *Analogie* : Comme un ticket de métro avec une durée de validité

- **Middleware** = Gardien automatique qui vérifie les permissions
  - *Analogie* : Comme un vigile qui contrôle les badges à chaque étage

- **Hachage** = Technique pour cacher les mots de passe de façon irréversible
  - *Analogie* : Comme transformer "motdepasse123" en "kjh234kj5h6kj234h" de façon qu'on ne puisse jamais revenir en arrière

## Vue d'ensemble de l'architecture finale - Ce que vous construirez

### Votre application aura toutes ces fonctionnalités :

**🔐 Authentification multi-fournisseurs** (email/mot de passe, Google, GitHub)
- *Concrètement* : Vos utilisateurs pourront se connecter de 3 façons différentes
- *Pourquoi* : Plus de choix = plus d'utilisateurs satisfaits

**📱 Pages de connexion et inscription sécurisées**
- *Concrètement* : De belles pages `/auth/signin` et `/auth/signup` avec formulaires
- *Inclus* : Validation des données, messages d'erreur clairs, design responsive

**🛡️ Protection automatique des routes sensibles**
- *Concrètement* : Certaines pages ne seront accessibles qu'aux utilisateurs connectés
- *Exemple* : `/products/new` redirigera vers la page de connexion si pas connecté

**🔒 APIs protégées avec middleware**  
- *Concrètement* : Certaines actions (créer, modifier, supprimer) nécessiteront une connexion
- *Technique* : Le middleware = garde du corps automatique de vos APIs

**🎨 Interface utilisateur adaptative selon l'état de connexion**
- *Concrètement* : Le menu change automatiquement (bouton "Connexion" devient "Déconnexion")
- *Magie* : L'interface "sait" en temps réel qui est connecté

**👤 Gestion des rôles utilisateurs** (user, admin)
- *Concrètement* : Certains utilisateurs auront plus de privilèges que d'autres
- *Extensible* : Vous pourrez ajouter d'autres rôles (modérateur, premium, etc.)

**🔐 Sessions sécurisées avec JWT**
- *Concrètement* : Les utilisateurs restent connectés même s'ils ferment le navigateur
- *Sécurité* : Tokens cryptés, expiration automatique, protection contre le vol

## Étape 1 : Création d'une nouvelle branche - Sécurisez votre travail

### 🤔 Pourquoi créer une branche séparée ?
Imaginez que vous rénoviez votre appartement. Vous ne voulez pas dormir dans le chantier ! 
Une branche Git, c'est comme créer une **copie parallèle** de votre code où vous pouvez expérimenter sans risquer de casser la version qui fonctionne.

### 📝 Analogie simple
- **Branche principale (main)** = votre appartement actuel (fonctionnel)
- **Nouvelle branche** = appartement témoin où vous testez la nouvelle déco
- Si ça marche → vous adoptez la nouvelle déco (merge)
- Si ça ne marche pas → vous abandonnez et gardez l'ancien (suppression de branche)

### 💻 Commandes à exécuter

```bash
# COMMANDE 1 : Créer et basculer sur une nouvelle branche
git checkout -b feature/nextauth-implementation

# 🔍 Explication : 
# - "git checkout" = changer de branche
# - "-b" = créer une nouvelle branche  
# - "feature/nextauth-implementation" = nom descriptif de notre nouvelle fonctionnalité
```

```bash
# COMMANDE 2 : Vérifier que vous êtes sur la bonne branche  
git branch

# 🔍 Ce que vous devriez voir :
#   main
# * feature/nextauth-implementation    ← L'étoile (*) indique la branche active
```

**✅ Résultat attendu :** Vous devriez voir une étoile (*) devant `feature/nextauth-implementation`.

### ❌ Si ça ne marche pas
- **Erreur "git command not found"** → Git n'est pas installé sur votre machine
- **Pas d'étoile à côté du bon nom** → Relancez `git checkout feature/nextauth-implementation`

## Étape 2 : Installation des packages NextAuth - Ajoutons les outils

### 🤔 Qu'est-ce qu'un package ?
Un package, c'est comme un **kit de meubles IKEA** pour développeurs :
- Quelqu'un a déjà écrit le code complexe
- Vous l'installez et l'utilisez dans votre projet  
- Gain de temps énorme : des milliers de lignes de code prêtes à l'emploi !

### 📦 Les 4 packages que nous allons installer

**1. `next-auth@4` - Le package principal**
```bash
npm install next-auth@4
```
- *C'est quoi* : Le cœur du système d'authentification
- *Analogie* : C'est comme le système de sécurité central de l'immeuble
- *@4* : Nous voulons spécifiquement la version 4 (stable) pas la version 5 (beta)

**2. `@next-auth/prisma-adapter` - Connexion base de données**
```bash  
npm install @next-auth/prisma-adapter
```
- *C'est quoi* : Permet à NextAuth de parler avec votre base de données Prisma
- *Analogie* : C'est comme un traducteur entre le système de sécurité et le fichier des résidents
- *Pourquoi nécessaire* : NextAuth doit stocker les informations des utilisateurs quelque part

**3. `bcryptjs` - Hachage des mots de passe**  
```bash
npm install bcryptjs
```
- *C'est quoi* : Outil pour crypter les mots de passe de façon sécurisée
- *Analogie* : C'est comme un broyeur à documents ultra-puissant et irréversible
- *Exemple* : "motdepasse123" devient "h$k3j9$3k2j5h6kj234h"
- *Sécurité* : Même si un hacker vole votre base de données, il ne peut pas lire les vrais mots de passe

**4. `@types/bcryptjs` - Types TypeScript**
```bash
npm install @types/bcryptjs  
```
- *C'est quoi* : Permet à TypeScript de comprendre comment utiliser bcryptjs
- *Analogie* : C'est comme le mode d'emploi en français pour un appareil étranger
- *Pour les débutants* : TypeScript = JavaScript avec vérification d'erreurs automatique

### 🔄 Processus d'installation complet

```bash
# ÉTAPE 1 : Package principal NextAuth v4 (stable et testé)
npm install next-auth@4

# ÉTAPE 2 : Adaptateur pour connecter NextAuth à Prisma (votre base de données)
npm install @next-auth/prisma-adapter

# ÉTAPE 3 : Outil de cryptage des mots de passe (sécurité)
npm install bcryptjs

# ÉTAPE 4 : Types TypeScript pour bcryptjs (aide au développement)
npm install @types/bcryptjs
```

### ⚠️ IMPORTANT - Attendez entre chaque installation !
**Pourquoi ?** Chaque `npm install` télécharge et configure des fichiers. Si vous lancez tout d'un coup, ça peut créer des conflits.

**✅ Comment savoir que c'est terminé ?**
- L'installation est finie quand vous voyez à nouveau votre prompt (ex: `PS C:\votre-projet>`)
- Pas de messages d'erreur en rouge
- Un message comme "added X packages" apparaît

### 🎯 Vérification que tout est installé
```bash
# Vérifier que les packages sont bien installés
npm list next-auth @next-auth/prisma-adapter bcryptjs @types/bcryptjs

# 🔍 Vous devriez voir quelque chose comme :
# ├── next-auth@4.24.7
# ├── @next-auth/prisma-adapter@1.0.7  
# ├── bcryptjs@2.4.3
# └── @types/bcryptjs@2.4.6
```

**💡 Si vous voyez des versions légèrement différentes, c'est normal !**

## Étape 3 : Configuration des variables d'environnement - Les secrets de votre app

### 🤔 C'est quoi les variables d'environnement ?

**Analogie simple :** Les variables d'environnement, c'est comme le **coffre-fort secret** de votre application.

- **Variables normales** = affichées publiquement (comme l'adresse de votre restaurant)
- **Variables d'environnement** = cachées et sécurisées (comme les codes du coffre-fort)

**Exemples de ce qu'on y met :**
- 🔑 Mots de passe de base de données
- 🗝️ Clés secrètes pour l'authentification  
- 🎫 Identifiants API (Google, Facebook, etc.)
- 🌍 URLs qui changent selon l'environnement (localhost vs production)

### 📂 Le fichier `.env` - Votre coffre-fort numérique

**Où se trouve ce fichier ?**
- À la **racine** de votre projet (même niveau que `package.json`)
- Nom exact : `.env` (avec le point au début, très important !)

**Comment le créer/modifier ?**
1. Si le fichier `.env` n'existe pas → créez-le
2. Si il existe déjà → ouvrez-le et ajoutez les nouvelles lignes

### 🔧 Configuration étape par étape

**Ouvrez votre fichier `.env` et ajoutez ces lignes :**

```env
# ============================================
# VARIABLES EXISTANTES - NE PAS MODIFIER
# ============================================
# Gardez votre DATABASE_URL existante telle quelle
DATABASE_URL="votre-url-de-base-de-donnees-existante"

# ============================================
# NOUVELLES VARIABLES NEXTAUTH - À AJOUTER
# ============================================

# 🌐 URL de votre application
NEXTAUTH_URL="http://localhost:3000"
# 🔍 Explication : 
# - NextAuth doit savoir où tourne votre app pour rediriger correctement
# - "localhost:3000" = votre ordinateur, port 3000
# - Si votre app tourne sur le port 3001, changez en "http://localhost:3001"

# 🔐 Clé secrète super importante (CHANGEZ CETTE VALEUR !)
NEXTAUTH_SECRET="your-super-secret-key-minimum-32-characters-long-and-unique"
# 🔍 Explication :
# - Cette clé sert à crypter les tokens de session
# - OBLIGATOIRE : doit faire au moins 32 caractères
# - UNIQUE : changez absolument la valeur par défaut !
# - Exemple de bonne clé : "mon-app-2024-secret-ultra-long-et-unique-xyz789"

# ============================================
# OAUTH (OPTIONNEL POUR COMMENCER)
# ============================================
# Laissez vide pour le moment, on configurera plus tard si besoin

# 📧 Google OAuth (pour "Se connecter avec Google")
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
# 🔍 Ces valeurs viennent de la Google Console (étape optionnelle)

# 🐙 GitHub OAuth (pour "Se connecter avec GitHub")  
GITHUB_ID=""
GITHUB_SECRET=""
# 🔍 Ces valeurs viennent des GitHub Developer Settings (étape optionnelle)
```

### 🔥 SUPER IMPORTANT - Sécurité du fichier `.env`

**⚠️ RÈGLES D'OR À RESPECTER ABSOLUMENT :**

1. **Ne JAMAIS publier le fichier `.env`**
   - Ni sur GitHub, ni nulle part publiquement
   - Vos clés secrètes seraient exposées au monde entier !

2. **Vérifiez votre `.gitignore`**
   ```
   # Ce fichier DOIT contenir cette ligne :
   .env
   ```
   - Si `.env` n'est pas dans `.gitignore`, ajoutez-le immédiatement !

3. **Changez OBLIGATOIREMENT `NEXTAUTH_SECRET`**
   ```env
   # ❌ MAUVAIS (valeur par défaut)
   NEXTAUTH_SECRET="changez-cette-clé-secrète"
   
   # ✅ BON (valeur unique et longue)
   NEXTAUTH_SECRET="mon-projet-2024-secret-authentication-key-unique-xyz789"
   ```

### 🎯 Génération d'une bonne clé secrète

**Méthode 1 : Générateur en ligne**
- Allez sur https://generate-secret.vercel.app/32
- Copiez la clé générée

**Méthode 2 : Terminal**
```bash
# Sur Linux/Mac/WSL :
openssl rand -base64 32

# Sur Windows PowerShell :
[System.Web.Security.Membership]::GeneratePassword(32, 0)
```

**Méthode 3 : Manuel (simple)**
- Tapez n'importe quoi de long et unique
- Exemple : `"mon-app-NextAuth-2024-secret-ultra-long-unique-123456789"`

### 🔍 Vérification de votre configuration

**Votre fichier `.env` final devrait ressembler à ça :**

```env
# Base de données (existante)
DATABASE_URL="postgresql://user:pass@localhost:5432/mydb"

# NextAuth (nouvelles variables)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="votre-cle-secrete-longue-et-unique-32-caracteres-minimum"

# OAuth (vides pour le moment)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_ID=""
GITHUB_SECRET=""
```

### 🛠️ Adaptations selon votre situation

**Si votre serveur démarre sur le port 3001 :**
```env
NEXTAUTH_URL="http://localhost:3001"  # ← Changez le port
```

**Si vous utilisez Windows :**
```env
# Les chemins Windows fonctionnent aussi
NEXTAUTH_URL="http://localhost:3000"  # ← Identique
```

**Si vous déployez plus tard en production :**
```env
# En production, ça ressemblera à :
NEXTAUTH_URL="https://votre-domaine.com"  # ← URL réelle de votre site
```

### ✅ Test que tout fonctionne

1. **Sauvegardez le fichier `.env`**
2. **Redémarrez votre serveur de développement** (important !)
   ```bash
   # Arrêtez le serveur (Ctrl+C) puis relancez :
   npm run dev
   ```
3. **Vérifiez qu'aucun message d'erreur n'apparaît**

## Étape 4 : Mise à jour du schéma Prisma - Définir la structure de votre base de données

### 🤔 C'est quoi Prisma et le schéma ?

**Prisma** = votre **assistant personnel pour base de données**
- Il traduit votre code JavaScript en langage SQL (que comprend la base de données)
- Il génère automatiquement des fonctions pour créer, lire, modifier, supprimer des données
- Il vérifie que vous ne faites pas d'erreurs de syntaxe

**Le schéma Prisma** = le **plan d'architecte** de votre base de données
- Comme un architecte dessine le plan d'une maison avant de la construire
- Vous décrivez vos "tables" (modèles) dans un fichier texte simple
- Prisma transforme ce plan en vraie base de données

### 📋 Analogie : Votre base de données comme un immeuble

Imaginez que vous gérez un immeuble d'appartements avec plusieurs registres :

- **Table `users`** = registre des résidents (nom, email, mot de passe)
- **Table `products`** = registre des objets dans l'immeuble (nom, prix, propriétaire)  
- **Table `sessions`** = registre des personnes actuellement dans l'immeuble
- **Table `accounts`** = registre des différents moyens d'accès (badge, code, empreinte)

**Les relations** = liens entre les registres :
- "Ce produit appartient à cet utilisateur" 
- "Cette session correspond à cet utilisateur"
- "Ce compte externe (Google) est lié à cet utilisateur"

### 📂 Localisation du fichier

**Où se trouve le schéma ?**
- Fichier : `prisma/schema.prisma`
- Si ce dossier/fichier n'existe pas → votre projet n'a pas Prisma configuré (vérifiez les prérequis !)

### 🎯 Ce que nous allons ajouter

**Votre schéma actuel** (modèle Product existant) :
```prisma
model Product {
  id    Int     @id @default(autoincrement())
  name  String
  price Float
  // ... autres champs
}
```

**Ce que nous allons ajouter** (modèles d'authentification) :
- `User` = utilisateurs de votre app
- `Account` = comptes externes (Google, GitHub)  
- `Session` = sessions actives
- `VerificationToken` = tokens de vérification email

### 🔧 Modification étape par étape

**Ouvrez le fichier `prisma/schema.prisma` et ajoutez ces modèles À LA FIN du fichier :**

```prisma
// ============================================
// ÉTAPE 1 : MODIFIER le modèle Product existant
// ============================================
// Trouvez votre modèle Product existant et AJOUTEZ SEULEMENT les 2 lignes commentées

model Product {
  id        Int      @id @default(autoincrement())
  name      String
  price     Float
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // 👇 AJOUTEZ CES 2 LIGNES pour créer un lien avec l'utilisateur qui a créé le produit
  createdBy   User?  @relation(fields: [createdById], references: [id])
  createdById String?
  // 🔍 Explication :
  // - createdBy = référence vers l'utilisateur qui a créé ce produit
  // - createdById = ID de cet utilisateur (clé étrangère)
  // - User? = optionnel (certains produits peuvent ne pas avoir de créateur)
  // - @relation = indique à Prisma comment connecter les tables

  @@map("products")
}

// ============================================
// ÉTAPE 2 : AJOUTER les nouveaux modèles NextAuth
// ============================================
// Copiez tous ces modèles À LA FIN de votre fichier schema.prisma

// 👤 MODÈLE USER - Table des utilisateurs (résidents de votre immeuble)
model User {
  // === IDENTITÉ DE BASE ===
  id            String    @id @default(cuid())
  // 🔍 cuid() = identifiant unique aléatoire (ex: "cljn123xyz")
  // 🔍 @id = clé primaire (identifiant unique de chaque utilisateur)

  name          String?
  // 🔍 String? = texte optionnel (certains utilisateurs n'ont pas de nom affiché)

  email         String    @unique
  // 🔍 @unique = chaque email ne peut être utilisé qu'une fois
  // 🔍 Obligatoire pour identifier l'utilisateur

  password      String?   
  // 🔍 Mot de passe haché (crypté) pour l'authentification locale
  // 🔍 String? = optionnel car certains utilisateurs se connectent via Google/GitHub uniquement

  // === MÉTADONNÉES ===
  emailVerified DateTime?
  // 🔍 Date de vérification de l'email (null = pas encore vérifié)

  image         String?   
  // 🔍 URL de la photo de profil (optionnel)

  role          String    @default("user")
  // 🔍 Rôle de l'utilisateur : "user" par défaut, peut être "admin"
  // 🔍 @default("user") = valeur automatique si pas spécifiée

  createdAt     DateTime  @default(now())
  // 🔍 Date de création du compte (automatique)

  updatedAt     DateTime  @updatedAt
  // 🔍 Date de dernière modification (mise à jour automatique)

  // === RELATIONS AVEC D'AUTRES TABLES ===
  // 🔗 Relations NextAuth (OBLIGATOIRES pour que NextAuth fonctionne)
  accounts Account[]
  // 🔍 Un utilisateur peut avoir plusieurs comptes (Google + GitHub + local)

  sessions Session[]
  // 🔍 Un utilisateur peut avoir plusieurs sessions actives (téléphone + ordinateur)

  // 🔗 Relations métier (pour votre application)
  products Product[]
  // 🔍 Un utilisateur peut créer plusieurs produits

  @@map("users")
  // 🔍 @@map("users") = le nom de la table en base sera "users" (au pluriel)
}

// 🔗 MODÈLE ACCOUNT - Comptes externes (Google, GitHub, etc.)
model Account {
  // === IDENTITÉ DU COMPTE ===
  id                String  @id @default(cuid())
  // 🔍 Identifiant unique de ce compte externe

  userId            String  @map("user_id")
  // 🔍 ID de l'utilisateur auquel ce compte est rattaché
  // 🔍 @map("user_id") = le champ s'appellera "user_id" dans la base de données

  type              String
  // 🔍 Type de compte : "oauth", "email", etc.

  provider          String
  // 🔍 Fournisseur : "google", "github", "facebook", etc.

  providerAccountId String  @map("provider_account_id")
  // 🔍 ID de l'utilisateur chez le fournisseur (ex: ID Google de l'utilisateur)

  // === TOKENS OAUTH (pour se connecter aux APIs externes) ===
  refresh_token     String? @db.Text
  // 🔍 Token pour renouveler l'accès quand il expire
  // 🔍 @db.Text = type TEXTE LONG en base de données (tokens peuvent être longs)

  access_token      String? @db.Text
  // 🔍 Token pour accéder aux données de l'utilisateur chez le fournisseur

  expires_at        Int?
  // 🔍 Timestamp d'expiration du token

  token_type        String?
  // 🔍 Type de token (généralement "Bearer")

  scope             String?
  // 🔍 Permissions accordées (ex: "read_user", "read_repos")

  id_token          String? @db.Text
  // 🔍 Token d'identité (contient les infos de base de l'utilisateur)

  session_state     String?
  // 🔍 État de la session OAuth

  // === MÉTADONNÉES ===
  createdAt         DateTime @default(now()) @map("created_at")
  updatedAt         DateTime @updatedAt @map("updated_at")

  // === RELATION ===
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  // 🔍 Ce compte appartient à un utilisateur
  // 🔍 onDelete: Cascade = si l'utilisateur est supprimé, ses comptes aussi

  @@unique([provider, providerAccountId])
  // 🔍 Un utilisateur ne peut avoir qu'un seul compte par fournisseur
  // 🔍 Exemple : un seul compte Google par utilisateur

  @@map("accounts")
}

// 🎫 MODÈLE SESSION - Sessions actives (bracelets temporaires)
model Session {
  id           String   @id @default(cuid())
  // 🔍 Identifiant unique de la session

  sessionToken String   @unique @map("session_token")
  // 🔍 Token de session (code secret temporaire)
  // 🔍 @unique = chaque token de session est unique

  userId       String   @map("user_id")
  // 🔍 Utilisateur auquel appartient cette session

  expires      DateTime
  // 🔍 Date d'expiration de la session

  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  // === RELATION ===
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  // 🔍 Cette session appartient à un utilisateur
  // 🔍 Si l'utilisateur est supprimé, ses sessions aussi

  @@map("sessions")
}

// 🔐 MODÈLE VERIFICATION TOKEN - Tokens de vérification email
model VerificationToken {
  identifier String
  // 🔍 Identifiant (généralement l'email à vérifier)

  token      String
  // 🔍 Token de vérification (code temporaire envoyé par email)

  expires    DateTime
  // 🔍 Date d'expiration du token

  @@unique([identifier, token])
  // 🔍 Combinaison identifier+token unique
  // 🔍 Empêche la réutilisation de tokens

  @@map("verificationtokens")
}
```

### 📚 Explication des concepts Prisma pour débutants

**🔑 Types de données courants :**
- `String` = texte (ex: "John", "john@email.com")
- `String?` = texte optionnel (peut être vide)
- `Int` = nombre entier (1, 2, 100)
- `DateTime` = date et heure
- `Boolean` = vrai/faux

**🎯 Attributs importants :**
- `@id` = clé primaire (identifiant unique)
- `@unique` = valeur unique dans toute la table
- `@default(...)` = valeur par défaut
- `@map("...")` = nom différent en base de données
- `@@map("...")` = nom de table en base de données

**🔗 Relations expliquées :**
- `products Product[]` = "un utilisateur peut avoir plusieurs produits"
- `user User @relation(...)` = "ce compte appartient à un utilisateur"
- `onDelete: Cascade` = "si le parent est supprimé, supprime aussi l'enfant"

## Étape 5 : Application des changements à la base de données - Transformer le plan en réalité

### 🤔 Que font ces commandes ?

Vous venez de **dessiner le plan** de votre base de données (schéma Prisma). Maintenant il faut **construire la vraie maison** !

**Analogie de construction :**
1. **Schéma Prisma** = plan d'architecte sur papier
2. **`npx prisma generate`** = fabriquer les outils spécialisés pour cette maison 
3. **`npx prisma db push`** = construire physiquement la maison selon le plan

### 🔧 Commande 1 : Génération du client Prisma

```bash
npx prisma generate
```

**🔍 Cette commande fait quoi exactement ?**
- **Lit votre schéma** (le plan d'architecte)
- **Génère du code TypeScript** automatiquement
- **Crée des fonctions** pour chaque modèle (User, Product, Session, etc.)

**🎯 Concrètement, après cette commande vous pourrez écrire :**
```typescript
// Créer un utilisateur (fonction générée automatiquement)
const newUser = await prisma.user.create({
  data: { name: "John", email: "john@example.com" }
})

// Chercher un produit (fonction générée automatiquement)  
const product = await prisma.product.findUnique({
  where: { id: 1 }
})
```

**✅ Résultat attendu :**
```
✔ Generated Prisma Client (4.16.2 | library) to ./node_modules/.prisma/client in 234ms

You can now start using Prisma Client in your code. Reference: https://pris.ly/d/client
```

**❌ Erreurs possibles :**
- `"Schema parsing error"` → Erreur de syntaxe dans le schéma (vérifiez les accolades, virgules)
- `"Command not found"` → Prisma n'est pas installé (`npm install prisma @prisma/client`)

### 🏗️ Commande 2 : Mise à jour de la base de données

```bash
npx prisma db push
```

**🔍 Cette commande fait quoi exactement ?**
- **Compare** votre schéma avec la base de données actuelle
- **Détecte les différences** (nouvelles tables, nouveaux champs)
- **Modifie la vraie base de données** pour qu'elle corresponde au schéma
- **Préserve les données existantes** (vos produits actuels ne seront pas supprimés)

**🎯 Concrètement, cette commande va créer :**
- ✅ Table `users` (utilisateurs)
- ✅ Table `accounts` (comptes externes Google/GitHub)
- ✅ Table `sessions` (sessions actives)
- ✅ Table `verificationtokens` (tokens de vérification)
- ✅ Modifier la table `products` (ajouter les champs `createdBy` et `createdById`)

**✅ Résultat attendu :**
```
Environment variables loaded from .env
Prisma schema loaded from prisma\schema.prisma
Datasource "db": PostgreSQL database "your-db", schema "public" at "your-host:5432"

🚀  Your database is now in sync with your schema.

✔ Generated Prisma Client (4.16.2 | library) to ./node_modules/.prisma/client in 345ms
```

**🔍 Décodage du message :**
- `"Your database is now in sync"` = ✅ Parfait, les tables sont créées
- `"Generated Prisma Client"` = ✅ Le code TypeScript est à jour aussi

### ⚠️ Messages d'avertissement (normaux) 

Vous pourriez voir ces avertissements (c'est normal) :

```
⚠️  There might be data loss when applying the changes:
  • You are about to create a unique constraint on the columns (email) on the users table...
```

**🤔 Faut-il s'inquiéter ?**
- **NON** si c'est la première fois que vous ajoutez l'authentification
- **OUI** si vous avez déjà des utilisateurs avec des emails dupliqués

**Pour la première installation → tapez `y` (yes) quand demandé**

### 🎯 Processus complet étape par étape

```bash
# ÉTAPE 1 : Générer le client Prisma (outils)
npx prisma generate

# 🔍 Attendez le message de succès avant de continuer !
# ✅ "Generated Prisma Client" doit apparaître

# ÉTAPE 2 : Mettre à jour la base de données (construction)
npx prisma db push

# 🔍 Attendez le message "Your database is now in sync" 
# ✅ Si demandé, tapez 'y' pour confirmer les changements
```

### 🔍 Vérification que tout a fonctionné

**Méthode 1 : Via Prisma Studio (interface graphique)**
```bash
npx prisma studio
```
- S'ouvre dans votre navigateur sur http://localhost:5555
- Vous devriez voir vos nouvelles tables : users, accounts, sessions, verificationtokens
- Les tables sont vides (normal, aucun utilisateur créé encore)

**Méthode 2 : Via le message de confirmation**
```
✔ Your database is now in sync with your schema.
```

### ❌ Résolution des problèmes courants

**Erreur "Connection refused" :**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
- 🔍 **Problème** : La base de données n'est pas accessible
- ✅ **Solution** : Vérifiez votre `DATABASE_URL` dans le fichier `.env`
- ✅ **Solution** : Vérifiez que votre base PostgreSQL est démarrée

**Erreur "Schema parsing error" :**
```
Schema parsing error: Error validating model "User": The model name is invalid...
```
- 🔍 **Problème** : Erreur de syntaxe dans le schéma
- ✅ **Solution** : Vérifiez les accolades `{}`, les virgules, l'indentation
- ✅ **Solution** : Comparez avec l'exemple exact fourni

**Erreur "Unique constraint failed" :**
```
Unique constraint failed on the fields: (`email`)
```
- 🔍 **Problème** : Tentative de créer des utilisateurs avec des emails identiques
- ✅ **Solution** : Normal si vous testez, chaque email doit être unique

### 🏆 Félicitations !

Si vous voyez `"Your database is now in sync with your schema"`, c'est parfait ! 
Votre base de données est maintenant **prête pour l'authentification NextAuth** ! 

Les fondations sont posées, on peut maintenant construire le système d'authentification par-dessus.

## Étape 6 : Configuration NextAuth - Le cerveau du système

### 🤔 C'est quoi ce fichier `lib/auth.ts` ?

**Analogie simple :** Ce fichier, c'est le **panneau de contrôle central** de votre système de sécurité.

- **Comme un tableau électrique** → connecte tous les éléments ensemble
- **Définit les règles** → qui peut entrer, comment, avec quelles permissions
- **Configure les fournisseurs** → Google, GitHub, email/mot de passe
- **Gère les sessions** → combien de temps on reste connecté
- **Personnalise les callbacks** → que faire à la connexion/déconnexion

### 📂 Création du fichier configuration

### ✅ Configuration complète disponible

Le fichier `lib/auth.ts` est assez complexe avec beaucoup d'options. Pour ne pas surcharger ce guide d'introduction, **tous les codes complets avec commentaires détaillés** sont disponibles dans le fichier `03-CODES_COMPLETS.md`.

**🎯 Ce que contient la configuration NextAuth :**

1. **Extensions TypeScript** → Ajouter le champ "role" aux sessions
2. **PrismaAdapter** → Connecter NextAuth à votre base de données  
3. **3 fournisseurs d'authentification** →
   - Email/mot de passe (local)
   - Google OAuth (optionnel)
   - GitHub OAuth (optionnel)
4. **Configuration des sessions** → JWT, durée de vie
5. **Callbacks personnalisés** → Que faire lors de la connexion/déconnexion
6. **Pages personnalisées** → Vos propres pages de connexion
7. **Mode debug** → Logs détaillés pour le développement

## Étape 7-10 : Création des fichiers restants

Les étapes 7 à 10 couvrent :

**🗂️ Étape 7 :** Routes d'authentification (`app/api/auth/[...nextauth]/route.ts`)
- *C'est quoi* : Le "central téléphonique" de NextAuth 
- *Rôle* : Gère toutes les requêtes d'authentification automatiquement

**📝 Étape 8 :** API d'inscription (`app/api/auth/signup/route.ts`)  
- *C'est quoi* : API pour créer de nouveaux comptes utilisateur
- *Inclus* : Validation, hachage de mot de passe, vérification email unique

**🔌 Étape 9 :** SessionProvider (`components/providers/SessionProvider.tsx`)
- *C'est quoi* : Permet à tous vos composants de "savoir" qui est connecté
- *Magie* : Votre interface se met à jour automatiquement

**🎨 Étape 10 :** Composants d'authentification
- `AuthButton.tsx` = boutons connexion/déconnexion intelligents  
- `SignInForm.tsx` = formulaire de connexion avec OAuth
- `Navigation.tsx` = navigation adaptative selon l'état de connexion

## 📖 Suite du guide - Où continuer ?

### Pour avoir tous les codes complets immédiatement :
**→ Consultez le fichier `03-CODES_COMPLETS.md`**
- Tous les codes à copier/coller
- Commentaires détaillés ligne par ligne
- Explications pour chaque concept

### Pour continuer étape par étape :
**→ Consultez le fichier `02-SUITE_GUIDE_NEXTAUTH.md`**
- Étapes 11-20 détaillées
- Interface utilisateur complète
- Tests et validation

### En cas de problème :
**→ Consultez le fichier `05-DEPANNAGE_ERREURS.md`**
- Solutions aux erreurs courantes
- Diagnostic et résolution

## 🎯 Récapitulatif de ce que vous avez appris

**✅ Étapes 1-5 : Fondations solides**
1. **Git branching** - Travailler en sécurité sans casser l'existant
2. **Installation packages** - Ajouter NextAuth et ses dépendances  
3. **Variables d'environnement** - Configurer les secrets de façon sécurisée
4. **Schéma Prisma** - Définir la structure de vos données d'authentification
5. **Génération base de données** - Transformer le plan en vraie base de données

**🔧 Concepts techniques maîtrisés**
- **Package management** avec npm
- **Variables d'environnement** et sécurité
- **Modélisation de données** avec Prisma
- **Relations entre tables** (User ↔ Product ↔ Session)
- **Types de données** (String, DateTime, Boolean, etc.)

**🏗️ Architecture posée**
- Base de données prête pour l'authentification
- Structure de fichiers NextAuth configurée
- Variables secrètes sécurisées
- Client Prisma généré et opérationnel

**🎓 Prêt pour la suite !**

Vous avez maintenant des **fondations solides** ! La partie "configuration technique" est terminée. 

La suite (étapes 6-20) couvre la partie "interface utilisateur" :
- Création des composants visuels
- Pages de connexion/inscription  
- Protection automatique des routes
- Tests et validation

**👉 Continuez avec le fichier `02-SUITE_GUIDE_NEXTAUTH.md` pour construire l'interface !**
