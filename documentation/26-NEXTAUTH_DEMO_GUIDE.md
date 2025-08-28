# Guide de démonstration NextAuth - Branche feature/nextauth-demo

## Introduction

Cette branche démontre l'intégration complète de NextAuth.js avec notre application Next.js App Router. L'authentification sécurise l'accès aux fonctionnalités sensibles comme la création et modification de produits.

## Fonctionnalités implémentées

### 1. Authentification multiple
- **Credentials locaux** : Email/mot de passe stockés en base
- **OAuth Google** : Connexion avec compte Google (optionnel)
- **OAuth GitHub** : Connexion avec compte GitHub (optionnel)

### 2. Système d'autorisation
- **Utilisateur standard** : Peut consulter les produits
- **Utilisateur connecté** : Peut créer/modifier/supprimer des produits
- **Admin** : Accès complet (extensible)

### 3. Protection des routes
- Pages protégées : `/products/new`, `/products/[id]/edit`
- APIs protégées : POST/PUT/DELETE sur `/api/products`
- Redirection automatique vers la connexion

## Structure des fichiers créés

```
laboratoire2/
├── lib/auth.ts                           # Configuration NextAuth
├── middleware.ts                         # Protection des routes
├── components/
│   ├── auth/
│   │   ├── AuthButton.tsx               # Bouton connexion/déconnexion
│   │   ├── SignInForm.tsx               # Formulaire de connexion
│   │   └── SignUpForm.tsx               # Formulaire d'inscription
│   ├── providers/SessionProvider.tsx     # Provider de session
│   └── Navigation.tsx                    # Navigation avec auth
├── app/
│   ├── layout.tsx                        # Layout avec SessionProvider
│   ├── auth/
│   │   ├── signin/page.tsx              # Page de connexion
│   │   └── signup/page.tsx              # Page d'inscription
│   └── api/
│       └── auth/
│           ├── [...nextauth]/route.ts    # Routes NextAuth
│           └── signup/route.ts           # API d'inscription
└── prisma/schema.prisma                  # Modèles auth ajoutés
```

## Configuration requise

### Variables d'environnement

Créer/mettre à jour le fichier `.env` :

```env
# Base de données (existante)
DATABASE_URL="postgresql://..."

# NextAuth - Obligatoires
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-min-32-characters"

# OAuth Google (optionnel)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# OAuth GitHub (optionnel)
GITHUB_ID="your-github-app-id"
GITHUB_SECRET="your-github-app-secret"
```

### Configuration OAuth (optionnel)

#### Google OAuth
1. Aller sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créer un projet ou sélectionner un existant
3. Activer Google+ API
4. Créer des identifiants OAuth 2.0
5. Ajouter `http://localhost:3000/api/auth/callback/google` aux URIs de redirection

#### GitHub OAuth
1. Aller sur [GitHub Settings > Developer settings](https://github.com/settings/developers)
2. Créer une nouvelle OAuth App
3. Authorization callback URL : `http://localhost:3000/api/auth/callback/github`

## Test de la démonstration

### Démarrage
```bash
# Basculer sur la branche de démonstration
git checkout feature/nextauth-demo

# Installer les dépendances (si nécessaire)
npm install

# Les tables sont déjà créées avec prisma db push
# Démarrer l'application
npm run dev
```

### 1. Test de l'inscription
1. Aller sur http://localhost:3000
2. Cliquer sur "Inscription" dans la navigation
3. Créer un compte avec :
   - Nom : "Test User"
   - Email : "test@example.com" 
   - Mot de passe : "test123456"
4. La connexion se fait automatiquement après inscription

### 2. Test de la connexion/déconnexion
1. Se déconnecter avec le bouton dans la navigation
2. Cliquer sur "Connexion"
3. Tester les différentes méthodes :
   - Email/mot de passe créé précédemment
   - Google OAuth (si configuré)
   - GitHub OAuth (si configuré)

### 3. Test des protections de routes
1. **Sans connexion** :
   - Aller sur `/products` → Accès autorisé (lecture)
   - Aller sur `/products/new` → Redirection vers `/auth/signin`
   
2. **Avec connexion** :
   - Aller sur `/products/new` → Accès autorisé
   - Créer un produit → Fonctionne
   - Modifier un produit → Fonctionne

### 4. Test des protections API
1. **Sans authentification** :
```bash
# GET autorisé
curl http://localhost:3000/api/products

# POST refusé
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name": "Test", "price": 100}'
# Retourne : {"success": false, "error": "Authentification requise"}
```

2. **Avec authentification** : Les APIs fonctionnent normalement via l'interface

## Intégration avec l'existant

### Modèle Product étendu
```prisma
model Product {
  id    Int     @id @default(autoincrement())
  name  String
  price Float
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // NOUVEAU : Relation avec l'utilisateur créateur
  createdBy   User? @relation(fields: [createdById], references: [id])
  createdById String?

  @@map("products")
}
```

### Nouveaux modèles d'authentification
- **User** : Utilisateurs avec rôles
- **Account** : Comptes OAuth liés
- **Session** : Sessions actives
- **VerificationToken** : Tokens de vérification

## Fonctionnalités avancées

### Middleware de protection
```typescript
// middleware.ts - Protection automatique
const protectedRoutes = [
  "/products/new",
  "/products/[id]/edit"
]

// Redirection automatique si non connecté
if (isProtectedRoute && !req.auth) {
  return NextResponse.redirect("/auth/signin")
}
```

### Gestion des rôles
```typescript
// lib/auth.ts - Extension session avec rôles
callbacks: {
  async session({ session, token }) {
    if (session.user) {
      session.user.role = token.role as string
    }
    return session
  }
}
```

### Protection API granulaire
```typescript
// Protection des méthodes HTTP sensibles
if (isProtectedApiRoute && req.method !== "GET" && !req.auth) {
  return NextResponse.json(
    { success: false, error: "Authentification requise" },
    { status: 401 }
  )
}
```

## Interface utilisateur

### Navigation dynamique
- **Non connecté** : Boutons "Connexion" et "Inscription"
- **Connecté** : Avatar, nom, statut admin, bouton "Déconnexion"

### Protection visuelle
- Les liens vers les pages protégées s'affichent seulement si connecté
- Messages d'erreur explicites pour les tentatives d'accès non autorisées

## Avantages de cette implémentation

### Sécurité
- Mots de passe hachés avec bcrypt (12 rounds)
- Protection CSRF automatique
- Sessions sécurisées avec JWT
- Validation des données côté serveur

### Expérience utilisateur
- Connexion avec multiples fournisseurs
- Redirection intelligente après connexion
- Messages d'erreur explicites
- Interface responsive

### Développement
- Configuration centralisée dans `lib/auth.ts`
- Middleware automatique pour la protection
- Types TypeScript complets
- Intégration transparente avec l'existant

## Extension possible

### Fonctionnalités supplémentaires
1. **Vérification email** : Confirmation par email
2. **Réinitialisation mot de passe** : Reset par email
3. **Sessions multiples** : Gestion des appareils
4. **Audit trail** : Historique des connexions
5. **Permissions granulaires** : Rôles avancés

### Intégrations
1. **Notifications** : Alertes de connexion
2. **Analytics** : Statistiques d'usage
3. **Rate limiting** : Protection contre les attaques
4. **Two-factor auth** : Authentification 2FA

## Comparaison avant/après

### AVANT (sans authentification)
- Accès libre à toutes les fonctionnalités
- Aucune traçabilité des actions
- Pas de gestion d'utilisateurs
- APIs publiques

### APRÈS (avec NextAuth)
- Contrôle d'accès granulaire
- Traçabilité par utilisateur
- Gestion complète des comptes
- APIs protégées
- Multi-fournisseurs d'authentification
- Interface utilisateur adaptative

## Performance

### Impact minimal
- Client Prisma optimisé pour les requêtes auth
- Sessions JWT (pas de round-trip base de données)
- Middleware léger
- Lazy loading des composants auth

### Optimisations
- Cache des sessions
- Requêtes optimisées
- Bundle splitting automatique
- Composants de chargement

Cette démonstration montre comment NextAuth.js s'intègre parfaitement avec notre architecture Next.js App Router existante, ajoutant une couche d'authentification robuste sans compromettre les performances ou l'expérience utilisateur.
