# Codes complets NextAuth.js v4 - Référence pour étudiants débutants

Ce fichier contient **tous les codes complets** prêts à copier/coller. Chaque section correspond à un fichier spécifique de votre projet avec des explications détaillées.

**Comment utiliser ce document :**
- Copiez le code exact de chaque section
- Collez-le dans le fichier indiqué
- Lisez les explications pour comprendre chaque ligne
- Ne modifiez rien sauf les valeurs spécifiquement indiquées

## Variables d'environnement (.env) - Le coffre-fort de votre application

### Qu'est-ce que le fichier .env ?
**Analogie :** C'est comme un coffre-fort numérique où vous stockez tous les secrets de votre application (mots de passe, clés d'API, etc.). Ces informations ne doivent jamais être partagées publiquement.

### Localisation
**Fichier à modifier :** `.env` (à la racine de votre projet, même niveau que `package.json`)

### Code complet avec explications

```env
# ============================================
# SECTION 1 : BASE DE DONNÉES
# ============================================
# Base de données (gardez votre URL existante)
DATABASE_URL="votre-url-postgresql-existante"
# Explication : 
# - Cette ligne existe déjà dans votre projet
# - NE LA CHANGEZ PAS - gardez votre URL PostgreSQL existante
# - C'est la connexion à votre base de données Neon, Supabase, etc.
# - Analogie : C'est l'adresse de votre entrepôt de données

# ============================================
# SECTION 2 : NEXTAUTH CONFIGURATION - OBLIGATOIRES
# ============================================
# Ces deux variables sont ABSOLUMENT NÉCESSAIRES pour NextAuth

NEXTAUTH_URL="http://localhost:3000"
# Explication ligne par ligne :
# - NEXTAUTH_URL = adresse complète de votre application
# - "http://localhost:3000" = votre ordinateur, port 3000
# - NextAuth utilise cette URL pour les redirections après connexion
# - En production, remplacez par votre vraie adresse (ex: "https://monsite.com")
# - Analogie : C'est l'adresse postale complète de votre immeuble

NEXTAUTH_SECRET="changez-cette-cle-secrete-minimum-32-caracteres-long-et-unique"
# Explication CRITIQUE :
# - NEXTAUTH_SECRET = clé pour crypter les sessions utilisateur
# - OBLIGATOIRE : doit faire au moins 32 caractères
# - UNIQUE : inventez une clé que personne d'autre n'utilise
# - Cette clé protège les données de session contre le piratage
# - Exemple de bonne clé : "MonApp-2024-CleSuperSecrete-Authentication-Key-XYZ789"
# - Analogie : C'est le code secret du coffre-fort de votre immeuble

# ============================================
# SECTION 3 : OAUTH - OPTIONNELS (pour débutants)
# ============================================
# Ces variables permettent la connexion avec Google/GitHub
# Laissez-les VIDES ("") si vous ne configurez pas OAuth pour le moment

# OAuth Google - OPTIONNELS (laissez vide si pas configuré)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
# Explication :
# - GOOGLE_CLIENT_ID = identifiant public de votre app chez Google
# - GOOGLE_CLIENT_SECRET = mot de passe secret de votre app chez Google
# - Ces valeurs viennent de Google Cloud Console (configuration avancée)
# - Si vides (""), les boutons Google ne fonctionneront pas (pas grave)
# - Analogie : C'est comme avoir une carte d'identité chez Google

# OAuth GitHub - OPTIONNELS (laissez vide si pas configuré) 
GITHUB_ID=""
GITHUB_SECRET=""
# Explication :
# - Même principe que Google mais pour GitHub
# - GITHUB_ID = identifiant public chez GitHub
# - GITHUB_SECRET = mot de passe secret chez GitHub
# - Ces valeurs viennent de GitHub Developer Settings
# - Si vides (""), les boutons GitHub ne fonctionneront pas (pas grave)
# - Analogie : C'est comme avoir une carte d'identité chez GitHub

# ============================================
# RÉSUMÉ - CE QUE VOUS DEVEZ ABSOLUMENT FAIRE
# ============================================
# 1. Gardez votre DATABASE_URL existante (ne la changez pas)
# 2. Vérifiez NEXTAUTH_URL correspond à votre port (3000 ou 3001)
# 3. CHANGEZ OBLIGATOIREMENT NEXTAUTH_SECRET par une vraie clé unique
# 4. Laissez les OAuth vides pour commencer (Google et GitHub)
```

## Schema Prisma (prisma/schema.prisma) - Le plan d'architecte de votre base de données

### Qu'est-ce que le schema Prisma ?
**Analogie :** C'est comme le plan d'architecte d'un immeuble avant sa construction. Vous décrivez les "chambres" (tables) et comment elles sont connectées entre elles, puis Prisma construit la vraie base de données selon ce plan.

### Localisation et instructions importantes
**Fichier à modifier :** `prisma/schema.prisma` (existe déjà dans votre projet)

**ATTENTION - Instructions cruciales :**
1. **NE SUPPRIMEZ RIEN** de votre fichier existant
2. **AJOUTEZ** seulement les nouvelles lignes indiquées
3. **MODIFIEZ** votre modèle Product existant en ajoutant 2 lignes
4. **AJOUTEZ** les 4 nouveaux modèles à la fin du fichier

### Code complet avec explications exhaustives

```prisma
// ============================================
// ÉTAPE 1 : MODIFIER LE MODÈLE PRODUCT EXISTANT
// ============================================
// Trouvez votre modèle Product existant et AJOUTEZ seulement ces 2 lignes :

model Product {
  // Vos colonnes existantes - GARDEZ-LES TELLES QUELLES
  id    Int     @id @default(autoincrement())
  name  String
  price Float
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // ============================================
  // NOUVELLES LIGNES À AJOUTER - RELATION UTILISATEUR
  // ============================================
  createdBy   User? @relation(fields: [createdById], references: [id])
  createdById String?
  // Explication ligne par ligne :
  // - createdBy = référence vers l'utilisateur qui a créé ce produit
  // - User? = le "?" signifie "optionnel" (un produit peut ne pas avoir de créateur)
  // - @relation = indique à Prisma comment connecter les tables
  // - fields: [createdById] = la colonne qui contient l'ID de l'utilisateur
  // - references: [id] = fait référence à l'ID dans la table User
  // - createdById String? = colonne qui stocke l'ID de l'utilisateur (optionnelle)
  // Analogie : C'est comme écrire "Appartement créé par M. Dupont" sur chaque fiche

  @@map("products")
  // @@map("products") = nom de la table en base sera "products" (au pluriel)
}

// ============================================
// ÉTAPE 2 : AJOUTER LES NOUVEAUX MODÈLES NEXTAUTH
// ============================================
// Copiez tous ces modèles À LA FIN de votre fichier schema.prisma

// ----------------------------------------
// MODÈLE USER - Table des utilisateurs
// ----------------------------------------
model User {
  // === IDENTITÉ DE BASE ===
  id            String    @id @default(cuid())
  // Explication :
  // - id = identifiant unique de chaque utilisateur
  // - String = texte (différent d'Int pour plus de sécurité)
  // - @id = clé primaire (identifiant unique)
  // - @default(cuid()) = génère automatiquement un ID unique aléatoire
  // - cuid = "Collision resistant Unique ID" (très peu de chance de doublon)
  // Analogie : C'est comme un numéro de sécurité sociale unique pour chaque résident

  name          String?
  // - name = nom affiché de l'utilisateur ("Jean Dupont")
  // - String? = texte optionnel (certains utilisateurs n'ont pas de nom)
  // - Utile pour l'affichage dans l'interface

  email         String    @unique
  // - email = adresse email de l'utilisateur
  // - String = texte obligatoire (pas de ?)
  // - @unique = chaque email ne peut être utilisé qu'une seule fois
  // - Sert d'identifiant principal pour la connexion
  // Analogie : C'est l'adresse postale unique de chaque résident

  password      String?   
  // - password = mot de passe crypté (haché)
  // - String? = optionnel car certains utilisateurs se connectent via Google/GitHub uniquement
  // - Jamais stocké en clair, toujours crypté avec bcrypt
  // - Si null, l'utilisateur ne peut pas se connecter avec email/mot de passe

  emailVerified DateTime?
  // - emailVerified = date de vérification de l'email
  // - DateTime? = optionnel (null = email pas encore vérifié)
  // - Utilisé pour la sécurité (confirmer que l'email appartient bien à l'utilisateur)

  image         String?
  // - image = URL de l'avatar de l'utilisateur
  // - String? = optionnel (ex: photo de profil Google/GitHub)
  // - Affiché dans l'interface à côté du nom

  role          String    @default("user")
  // - role = rôle de l'utilisateur dans l'application
  // - String = texte obligatoire
  // - @default("user") = par défaut, tous les nouveaux utilisateurs sont "user"
  // - Peut être "user", "admin", "moderator", etc.
  // - Utilisé pour contrôler les permissions

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  // - createdAt = date de création du compte
  // - updatedAt = date de dernière modification du profil
  // - Utiles pour l'audit et la gestion

  // === RELATIONS VERS D'AUTRES TABLES ===
  accounts Account[]
  // - accounts = liste des comptes externes (Google, GitHub, etc.) de cet utilisateur
  // - Account[] = tableau d'objets Account
  // - Un utilisateur peut avoir plusieurs comptes (Google ET GitHub par exemple)

  sessions Session[]
  // - sessions = liste des sessions actives de cet utilisateur
  // - Session[] = tableau d'objets Session
  // - Un utilisateur peut être connecté sur plusieurs appareils

  products Product[]
  // - products = liste des produits créés par cet utilisateur
  // - Product[] = tableau d'objets Product
  // - Relation inverse de createdBy dans Product

  @@map("users")
  // @@map("users") = nom de la table en base sera "users"
}

// ----------------------------------------
// MODÈLE ACCOUNT - Comptes externes (OAuth)
// ----------------------------------------
model Account {
  // === IDENTITÉ DU COMPTE ===
  id                String  @id @default(cuid())
  // Identifiant unique de ce compte externe

  userId            String  @map("user_id")
  // - userId = ID de l'utilisateur auquel appartient ce compte
  // - String = référence vers User.id
  // - @map("user_id") = nom de colonne en base sera "user_id"

  // === INFORMATIONS PROVIDER ===
  type              String
  // - type = type de compte ("oauth", "email", etc.)
  // - Généralement "oauth" pour Google/GitHub

  provider          String
  // - provider = nom du fournisseur ("google", "github", "facebook", etc.)
  // - Identifie quel service externe est utilisé

  providerAccountId String  @map("provider_account_id")
  // - providerAccountId = ID de l'utilisateur chez le provider
  // - Ex: l'ID Google de l'utilisateur, différent de notre ID interne
  // - @map = nom de colonne en base

  // === TOKENS OAUTH (informations techniques) ===
  refresh_token     String? @db.Text
  // - refresh_token = token pour renouveler l'accès
  // - @db.Text = stocké comme TEXT en base (peut être très long)
  // - Permet de maintenir la connexion automatiquement

  access_token      String? @db.Text
  // - access_token = token d'accès aux APIs du provider
  // - Permet d'accéder aux données Google/GitHub de l'utilisateur

  expires_at        Int?
  // - expires_at = timestamp d'expiration du token
  // - Int? = nombre entier optionnel (timestamp Unix)

  token_type        String?
  // - token_type = type de token (généralement "Bearer")

  scope             String?
  // - scope = permissions accordées (ex: "read:user", "user:email")

  id_token          String? @db.Text
  // - id_token = token d'identité JWT du provider
  // - Contient les informations de profil cryptées

  session_state     String?
  // - session_state = état de session OAuth

  // === MÉTADONNÉES ===
  createdAt         DateTime @default(now()) @map("created_at")
  updatedAt         DateTime @updatedAt @map("updated_at")

  // === RELATION VERS L'UTILISATEUR ===
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  // - user = référence vers l'utilisateur propriétaire
  // - fields: [userId] references: [id] = liaison via userId -> User.id
  // - onDelete: Cascade = si l'utilisateur est supprimé, supprimer aussi ce compte
  // Analogie : Si le résident déménage, on supprime aussi ses clés d'accès

  // === CONTRAINTES ===
  @@unique([provider, providerAccountId])
  // - Un seul compte par provider par utilisateur
  // - Ex: impossible d'avoir 2 comptes Google pour le même utilisateur

  @@map("accounts")
}

// ----------------------------------------
// MODÈLE SESSION - Sessions actives
// ----------------------------------------
model Session {
  id           String   @id @default(cuid())
  // Identifiant unique de cette session

  sessionToken String   @unique @map("session_token")
  // - sessionToken = token unique de la session
  // - @unique = chaque token de session est unique
  // - C'est ce qui est stocké dans le cookie du navigateur
  // Analogie : C'est comme un bracelet temporaire avec un code unique

  userId       String   @map("user_id")
  // - userId = ID de l'utilisateur connecté
  // - Lie cette session à un utilisateur spécifique

  expires      DateTime
  // - expires = date d'expiration de cette session
  // - DateTime = obligatoire (toute session doit expirer)
  // - Après cette date, l'utilisateur devra se reconnecter
  // Sécurité : évite les sessions infinies

  // === MÉTADONNÉES ===
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  // === RELATION VERS L'UTILISATEUR ===
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  // - Si l'utilisateur est supprimé, supprimer aussi ses sessions

  @@map("sessions")
}

// ----------------------------------------
// MODÈLE VERIFICATION TOKEN - Vérification email
// ----------------------------------------
model VerificationToken {
  identifier String
  // - identifier = généralement l'email à vérifier
  // - Identifie pour qui est ce token

  token      String
  // - token = code secret temporaire
  // - Envoyé par email pour vérifier l'adresse

  expires    DateTime
  // - expires = date d'expiration du token
  // - Après cette date, le token ne fonctionne plus

  // === CONTRAINTE DE SÉCURITÉ ===
  @@unique([identifier, token])
  // - Chaque combinaison identifier+token doit être unique
  // - Évite les collisions de tokens

  @@map("verificationtokens")
}

// ============================================
// RÉSUMÉ - RELATIONS ENTRE LES MODÈLES
// ============================================
/*
Structure des relations :

User (utilisateur)
├── Account[] (comptes OAuth multiples)
├── Session[] (sessions actives multiples)  
└── Product[] (produits créés multiples)

Analogie d'immeuble :
- User = résident
- Account = différentes clés d'accès (badge, code, empreinte)
- Session = bracelet temporaire "visiteur autorisé"
- Product = objets possédés par le résident
- VerificationToken = code temporaire pour confirmer l'adresse
*/
```

## Configuration NextAuth (lib/auth.ts) - Le cerveau de l'authentification

### Qu'est-ce que ce fichier ?
**Analogie :** C'est le **cerveau central** de votre système de sécurité - il définit toutes les règles : comment se connecter, où stocker les données, combien de temps rester connecté, etc.

### Localisation
**Fichier à créer :** `lib/auth.ts` (créer le dossier `lib/` s'il n'existe pas)

### Code complet avec explications exhaustives

```typescript
// ============================================
// IMPORTATIONS NÉCESSAIRES
// ============================================
import type { NextAuthOptions } from "next-auth"
// Explication : NextAuthOptions = type TypeScript pour la configuration
// "type" = on importe seulement le type, pas une valeur

import { PrismaAdapter } from "@next-auth/prisma-adapter"
// Explication : PrismaAdapter = connecteur entre NextAuth et votre base de données
// Permet à NextAuth de stocker/lire les données dans PostgreSQL via Prisma
// Analogie : C'est comme un traducteur entre NextAuth et votre base de données

import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
// Explication : Providers = moyens de connexion externes
// GoogleProvider = connexion avec compte Google
// GitHubProvider = connexion avec compte GitHub
// Ces imports permettent le "Se connecter avec Google/GitHub"

import CredentialsProvider from "next-auth/providers/credentials"
// Explication : CredentialsProvider = connexion avec email/mot de passe
// C'est pour la connexion "classique" avec formulaire

import { prisma } from "@/lib/prisma"
// Explication : prisma = client de base de données configuré
// @/lib/prisma fait référence au fichier lib/prisma.ts de votre projet existant

import bcrypt from "bcryptjs"
// Explication : bcrypt = librairie pour crypter/vérifier les mots de passe
// Sécurité : les mots de passe ne sont jamais stockés en clair

// ============================================
// EXTENSIONS DE TYPES TYPESCRIPT
// ============================================
// Ces sections étendent les types NextAuth pour inclure nos champs personnalisés

declare module "next-auth" {
  // Extension de l'interface Session (données disponibles côté client)
  interface Session {
    user: {
      id: string
      // Explication : id = identifiant unique de l'utilisateur
      // string = type texte (correspond à notre User.id)
      
      name?: string | null
      // name = nom affiché de l'utilisateur
      // ?: string | null = optionnel, peut être texte ou null
      
      email?: string | null
      // email = adresse email de l'utilisateur
      // Généralement présent, mais techniquement optionnel
      
      image?: string | null
      // image = URL de l'avatar/photo de profil
      // Optionnel (vient des providers OAuth généralement)
      
      role?: string | null
      // role = rôle de l'utilisateur ("user", "admin", etc.)
      // PERSONNALISÉ : ajouté par nous, pas dans NextAuth par défaut
    }
  }

  // Extension de l'interface User (données après authentification)
  interface User {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    role?: string | null
    // Explication : même structure que Session.user
    // Représente l'utilisateur juste après connexion réussie
  }
}

declare module "next-auth/jwt" {
  // Extension de l'interface JWT (données dans le token)
  interface JWT {
    role?: string | null
    // Explication : role stocké dans le token JWT
    // JWT = JSON Web Token, contient les données de session cryptées
    // Permet de transporter le rôle entre les requêtes
  }
}

// ============================================
// CONFIGURATION PRINCIPALE NEXTAUTH
// ============================================
export const authOptions: NextAuthOptions = {
  // Explication : authOptions = objet de configuration complet
  // NextAuthOptions = type qui définit la structure attendue
  // export const = rendre cette configuration disponible pour import

  // ----------------------------------------
  // ADAPTATEUR BASE DE DONNÉES
  // ----------------------------------------
  adapter: PrismaAdapter(prisma),
  // Explication :
  // - adapter = connecteur vers la base de données
  // - PrismaAdapter(prisma) = utilise Prisma avec notre client configuré
  // - NextAuth va automatiquement créer/lire User, Account, Session
  // - Analogie : C'est comme dire à NextAuth "utilise notre système de fichiers"

  // ----------------------------------------
  // PROVIDERS (MOYENS DE CONNEXION)
  // ----------------------------------------
  providers: [
    // Tableau des différentes façons de se connecter

    // PROVIDER 1 : GOOGLE OAUTH
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      // Explication :
      // - clientId/clientSecret = identifiants de votre app chez Google
      // - process.env.GOOGLE_CLIENT_ID = lu depuis le fichier .env
      // - || "" = si vide dans .env, utiliser chaîne vide (désactive Google)
      // - Si vides, le bouton Google ne fonctionnera pas (mais pas d'erreur)
    }),

    // PROVIDER 2 : GITHUB OAUTH
    GitHubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
      // Explication : même principe que Google mais pour GitHub
      // Les variables d'environnement ont des noms légèrement différents
    }),

    // PROVIDER 3 : EMAIL/MOT DE PASSE
    CredentialsProvider({
      name: "credentials",
      // name = identifiant interne de ce provider

      // ----------------------------------------
      // DÉFINITION DU FORMULAIRE DE CONNEXION
      // ----------------------------------------
      credentials: {
        // Définit les champs du formulaire de connexion
        
        email: { 
          label: "Email",
          // label = texte affiché à l'utilisateur
          
          type: "email",
          // type = type HTML du champ (email = validation automatique)
          
          placeholder: "votre@email.com" 
          // placeholder = texte d'aide dans le champ vide
        },
        
        password: { 
          label: "Mot de passe", 
          type: "password" 
          // type = "password" masque automatiquement la saisie (••••••)
        },
      },

      // ----------------------------------------
      // FONCTION DE VÉRIFICATION DES IDENTIFIANTS
      // ----------------------------------------
      async authorize(credentials) {
        // Explication :
        // - authorize = fonction appelée quand quelqu'un essaie de se connecter
        // - credentials = {email, password} saisis par l'utilisateur
        // - async = fonction asynchrone (peut attendre des réponses de base de données)
        // - Doit retourner l'utilisateur si connexion OK, ou null/throw si échec

        // ÉTAPE 1 : VÉRIFICATIONS DE BASE
        if (!credentials?.email || !credentials?.password) {
          // Explication :
          // - credentials?.email = vérifier que credentials existe ET a un email
          // - !credentials?.email = si email manquant ou vide
          // - || = ou logique
          // - Si l'un des deux champs manque, arrêter avec erreur

          throw new Error("Email et mot de passe requis")
          // throw new Error = déclencher une erreur avec message
          // L'utilisateur verra ce message sur le formulaire de connexion
        }

        try {
          // try/catch = gestion d'erreur pour les opérations de base de données

          // ÉTAPE 2 : RECHERCHER L'UTILISATEUR EN BASE
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email,
            },
          })
          // Explication :
          // - prisma.user.findUnique = chercher UN utilisateur unique
          // - where: { email: credentials.email } = critère de recherche
          // - await = attendre le résultat de la base de données
          // - user = contiendra l'utilisateur trouvé ou null si pas trouvé

          // ÉTAPE 3 : VÉRIFIER QUE L'UTILISATEUR EXISTE ET A UN MOT DE PASSE
          if (!user || !user.password) {
            // Explication :
            // - !user = utilisateur pas trouvé
            // - !user.password = utilisateur trouvé mais pas de mot de passe (compte OAuth uniquement)
            // - || = si l'une des conditions est vraie

            throw new Error("Aucun compte trouvé avec cet email")
            // Message d'erreur volontairement vague (sécurité)
            // On ne dit pas si c'est l'email ou le mot de passe qui pose problème
          }

          // ÉTAPE 4 : VÉRIFIER LE MOT DE PASSE
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )
          // Explication :
          // - bcrypt.compare = comparer mot de passe en clair avec mot de passe crypté
          // - credentials.password = mot de passe saisi par l'utilisateur
          // - user.password = mot de passe crypté stocké en base
          // - await = attendre le résultat de la comparaison
          // - isPasswordValid = true si identique, false sinon

          if (!isPasswordValid) {
            throw new Error("Mot de passe incorrect")
            // Si les mots de passe ne correspondent pas, refuser la connexion
          }

          // ÉTAPE 5 : CONNEXION RÉUSSIE - RETOURNER LES DONNÉES UTILISATEUR
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          }
          // Explication :
          // - return = retourner un objet avec les données de l'utilisateur
          // - Ces données seront disponibles dans les callbacks et la session
          // - On ne retourne PAS le mot de passe (sécurité)
          // - Si cette fonction arrive ici, la connexion est validée

        } catch (error) {
          // catch = si quelque chose s'est mal passé dans le try
          
          console.error("Erreur d'authentification:", error)
          // Afficher l'erreur dans les logs du serveur (pas visible utilisateur)
          
          throw new Error("Erreur lors de la connexion")
          // Renvoyer une erreur générique à l'utilisateur
          // Évite de donner trop d'informations aux attaquants
        }
      },
    }),
  ],

  // ----------------------------------------
  // CONFIGURATION DES SESSIONS
  // ----------------------------------------
  session: {
    strategy: "jwt",
    // Explication :
    // - strategy = méthode de stockage des sessions
    // - "jwt" = utiliser des JSON Web Tokens (recommandé pour la scalabilité)
    // - Alternative : "database" (stockage en base, plus sécurisé mais plus lent)

    maxAge: 30 * 24 * 60 * 60, // 30 jours
    // Explication :
    // - maxAge = durée de vie maximum d'une session (en secondes)
    // - 30 * 24 * 60 * 60 = 30 jours × 24 heures × 60 minutes × 60 secondes
    // - Après 30 jours, l'utilisateur devra se reconnecter
    // - Sécurité : évite les sessions infinies
  },

  // ----------------------------------------
  // CALLBACKS (FONCTIONS PERSONNALISÉES)
  // ----------------------------------------
  callbacks: {
    // Les callbacks permettent de personnaliser le comportement de NextAuth

    // CALLBACK 1 : PERSONNALISER LE JWT
    async jwt({ token, user }) {
      // Explication :
      // - Appelé chaque fois qu'un JWT est créé ou vérifié
      // - token = contenu actuel du JWT
      // - user = données utilisateur (seulement lors de la connexion)

      if (user) {
        // Si user existe, c'est une nouvelle connexion
        token.role = user.role
        // Ajouter le rôle de l'utilisateur au token JWT
        // Permet de transporter le rôle entre les requêtes
      }
      return token
      // Retourner le token (modifié ou non)
    },

    // CALLBACK 2 : PERSONNALISER LA SESSION
    async session({ session, token }) {
      // Explication :
      // - Appelé quand on récupère les données de session
      // - session = objet session à personnaliser
      // - token = JWT décodé

      if (session.user) {
        // Si la session a un utilisateur
        session.user.id = token.sub!
        // Ajouter l'ID utilisateur à la session
        // token.sub = "subject" du JWT (généralement l'ID utilisateur)
        // ! = assertion TypeScript que sub n'est pas null

        session.user.role = token.role as string
        // Ajouter le rôle à la session
        // as string = conversion de type TypeScript
      }
      return session
      // Retourner la session personnalisée
    },

    // CALLBACK 3 : CONTRÔLER LES CONNEXIONS
    async signIn({ user, account, profile }) {
      // Explication :
      // - Appelé avant chaque connexion réussie
      // - user = données utilisateur
      // - account = données du provider (Google, GitHub, etc.)
      // - profile = profil récupéré du provider
      // - Retourner true = autoriser, false = refuser

      return true
      // Pour l'instant, autoriser toutes les connexions
      // On pourrait ajouter ici des règles : vérifier domaine email, etc.
    },
  },

  // ----------------------------------------
  // PAGES PERSONNALISÉES
  // ----------------------------------------
  pages: {
    signIn: "/auth/signin",
    // Explication : utiliser notre page de connexion personnalisée
    // Au lieu de la page NextAuth par défaut
    
    error: "/auth/error",
    // Page d'erreur personnalisée (optionnel)
  },

  // ----------------------------------------
  // ÉVÉNEMENTS (LOGS ET MONITORING)
  // ----------------------------------------
  events: {
    // Les événements permettent d'écouter les actions NextAuth

    async signIn({ user, account, profile, isNewUser }) {
      // Explication : déclenché à chaque connexion réussie
      console.log(`Connexion réussie pour ${user.email}`)
      // Log pour tracer les connexions (utile pour debug/sécurité)
    },

    async signOut({ token }) {
      // Explication : déclenché à chaque déconnexion
      console.log("Déconnexion d'un utilisateur")
      // Log pour tracer les déconnexions
    },
  },

  // ----------------------------------------
  // MODE DEBUG
  // ----------------------------------------
  debug: process.env.NODE_ENV === "development",
  // Explication :
  // - debug = afficher des logs détaillés NextAuth
  // - process.env.NODE_ENV = environnement d'exécution
  // - "development" = mode développement (sur votre ordinateur)
  // - En production, debug sera automatiquement false (pas de logs sensibles)
}

// ============================================
// RÉSUMÉ - CE QUE FAIT CETTE CONFIGURATION
// ============================================
/*
Cette configuration définit :

1. MOYENS DE CONNEXION :
   - Email/mot de passe (avec vérification bcrypt)
   - Google OAuth (si configuré)
   - GitHub OAuth (si configuré)

2. STOCKAGE :
   - Sessions JWT (durée 30 jours)
   - Données utilisateur en PostgreSQL via Prisma

3. SÉCURITÉ :
   - Mots de passe cryptés avec bcrypt
   - Sessions avec expiration automatique
   - Validation des entrées utilisateur
   - Logs de connexions/déconnexions

4. PERSONNALISATION :
   - Pages de connexion personnalisées
   - Rôles utilisateur ajoutés aux sessions
   - Gestion d'erreurs adaptée

Analogie finale : C'est le "règlement intérieur" complet de votre immeuble sécurisé.
*/
```

## Routes NextAuth (app/api/auth/[...nextauth]/route.ts) - Le point d'entrée API

### Qu'est-ce que ce fichier ?
**Analogie :** C'est comme la **réception principale** de votre immeuble sécurisé - tous les visiteurs (requêtes d'authentification) passent obligatoirement par ici avant d'être dirigés vers les bons services.

### Localisation et structure de dossiers
**Fichier à créer :** `app/api/auth/[...nextauth]/route.ts`

**ATTENTION - Structure de dossiers cruciale :**
```
app/
└── api/
    └── auth/
        └── [...nextauth]/          ← Nom exact avec crochets et points
            └── route.ts            ← Fichier à créer
```

**Pourquoi cette structure bizarre ?**
- `[...nextauth]` = "catch-all route" qui capture toutes les URLs d'authentification
- Les `...` signifient "capturer plusieurs segments d'URL"
- NextAuth a besoin de gérer `/api/auth/signin`, `/api/auth/signout`, `/api/auth/callback`, etc.
- Cette route unique gère toutes ces URLs automatiquement

### Code complet avec explications exhaustives

```typescript
// ============================================
// IMPORTATIONS NÉCESSAIRES
// ============================================
import NextAuth from "next-auth"
// Explication : NextAuth = fonction principale qui crée le gestionnaire d'API
// Cette fonction transforme notre configuration en vraies routes d'API
// Analogie : C'est comme assembler un système de sécurité selon le manuel d'instructions

import { authOptions } from "@/lib/auth"
// Explication : authOptions = notre configuration complète créée dans lib/auth.ts
// @/lib/auth = chemin absolu vers notre fichier de configuration
// Cette configuration contient tous les providers, callbacks, etc.

// ============================================
// CRÉATION DU GESTIONNAIRE D'API
// ============================================
const handler = NextAuth(authOptions)
// Explication ligne par ligne :
// - const handler = déclaration d'une constante
// - NextAuth(authOptions) = créer un gestionnaire d'API avec notre configuration
// - Ce gestionnaire peut traiter les requêtes GET et POST
// - NextAuth génère automatiquement toutes les routes nécessaires :
//   * /api/auth/signin - page de connexion
//   * /api/auth/signout - déconnexion
//   * /api/auth/callback/[provider] - retour des providers OAuth
//   * /api/auth/session - récupérer la session actuelle
//   * /api/auth/providers - liste des providers disponibles
//   * etc.

// ============================================
// EXPORT DES MÉTHODES HTTP
// ============================================
export { handler as GET, handler as POST }
// Explication ligne par ligne :
// - export = rendre disponible pour Next.js
// - { handler as GET, handler as POST } = utiliser handler pour les requêtes GET et POST
// - Next.js App Router exige d'exporter les fonctions nommées GET, POST, etc.
// - GET = pour afficher les pages (ex: page de connexion)
// - POST = pour traiter les soumissions (ex: formulaire de connexion)
// - NextAuth gère automatiquement quelle méthode utiliser selon la requête

// ============================================
// CE QUE FAIT CE FICHIER CONCRÈTEMENT
// ============================================
/*
Quand un utilisateur va sur /api/auth/signin :
1. Next.js route la requête vers ce fichier
2. Le handler NextAuth reçoit la requête
3. NextAuth consulte authOptions pour savoir quoi faire
4. NextAuth génère la page de connexion avec nos providers configurés
5. La page est renvoyée à l'utilisateur

Quand un utilisateur soumet le formulaire de connexion :
1. Requête POST envoyée vers /api/auth/callback/credentials
2. Ce même handler la reçoit
3. NextAuth appelle la fonction authorize() de notre CredentialsProvider
4. Si succès : création de session et redirection
5. Si échec : affichage du message d'erreur

Analogie :
- Le handler = réceptionniste de l'immeuble
- authOptions = manuel de procédures de sécurité
- GET = visiteur qui demande des informations
- POST = visiteur qui présente ses papiers d'identité

URLs automatiquement générées par ce fichier :
- /api/auth/signin ← page de connexion
- /api/auth/signout ← déconnexion
- /api/auth/callback/google ← retour connexion Google
- /api/auth/callback/github ← retour connexion GitHub
- /api/auth/callback/credentials ← traitement email/mot de passe
- /api/auth/session ← récupérer infos session courante
- /api/auth/providers ← liste des moyens de connexion
- /api/auth/csrf ← protection contre les attaques CSRF
*/

// ============================================
// POURQUOI SI PEU DE CODE ?
// ============================================
/*
Ce fichier semble simple mais il fait énormément de choses !
NextAuth fait tout le travail complexe pour nous :

1. GESTION DES ROUTES : Crée automatiquement toutes les URLs d'auth
2. SÉCURITÉ : Protection CSRF, validation des tokens, etc.
3. OAUTH : Gère les flux complexes Google/GitHub automatiquement
4. SESSIONS : Création, validation, expiration des sessions
5. COOKIES : Gestion sécurisée des cookies de session
6. PAGES : Génération des pages de connexion par défaut
7. CALLBACKS : Exécution de nos fonctions personnalisées au bon moment

C'est la puissance de NextAuth : des milliers de lignes de code complexe
remplacées by quelques lignes simples !

Analogie : C'est comme acheter une voiture complète au lieu de
construire le moteur, les freins, la direction, etc. soi-même.
*/
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
