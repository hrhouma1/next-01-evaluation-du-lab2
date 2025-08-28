# Guide complet des commandes NextAuth.js v4 - Pour étudiants débutants

Ce fichier contient **toutes les commandes à exécuter** dans l'ordre exact, avec des explications détaillées de ce que fait chaque commande et pourquoi elle est nécessaire.

**Comment utiliser ce guide :**
- Lisez l'explication avant d'exécuter chaque commande
- Attendez que chaque commande se termine complètement
- Vérifiez les résultats attendus
- Ne sautez aucune étape

**Analogie :** Ce guide est comme une recette de cuisine détaillée - chaque étape doit être suivie dans l'ordre exact pour obtenir le bon résultat.

## Phase 1 : Préparation du projet - Organiser votre espace de travail

### Pourquoi créer une branche Git ?
**Analogie :** C'est comme travailler sur une copie de votre document important - si vous faites une erreur, l'original reste intact.

### 1. Création de la branche de travail

```bash
git checkout -b feature/nextauth-implementation
```

**Explication ligne par ligne :**
- `git checkout -b` = créer une nouvelle branche ET y basculer immédiatement
- `feature/nextauth-implementation` = nom descriptif de la branche
- Cette commande crée une copie parallèle de votre code où vous pouvez expérimenter

**Ce qui se passe techniquement :**
- Git crée un nouveau "pointeur" vers votre code actuel
- Tous vos changements futurs seront stockés sur cette nouvelle branche
- Votre branche principale (`main`) reste intacte

```bash
git branch
```

**Explication :**
- `git branch` = lister toutes les branches disponibles
- L'étoile (*) indique la branche active actuelle
- **Résultat attendu :** Vous devriez voir `* feature/nextauth-implementation`

**Si ça ne marche pas :**
- Erreur "git command not found" → Git n'est pas installé
- Pas d'étoile sur la bonne branche → Relancez la première commande

### 2. Installation des packages - Ajouter les outils nécessaires

**Pourquoi installer des packages ?**
**Analogie :** C'est comme acheter les ingrédients spécialisés avant de cuisiner - chaque package a un rôle spécifique.

```bash
npm install next-auth@4
```

**Explication ligne par ligne :**
- `npm install` = commande pour télécharger et installer un package
- `next-auth@4` = nom exact du package avec version spécifique
- `@4` = forcer la version 4 (stable) au lieu de la version 5 (bêta)

**Ce qui se passe techniquement :**
- npm contacte le registre officiel de packages JavaScript
- Télécharge NextAuth v4 et toutes ses dépendances
- Les stocke dans le dossier `node_modules/`
- Met à jour `package.json` et `package-lock.json`

**Durée moyenne :** 30-60 secondes selon votre connexion internet

```bash
npm install @next-auth/prisma-adapter
```

**Explication :**
- `@next-auth/prisma-adapter` = connecteur entre NextAuth et Prisma
- Permet à NextAuth de stocker les sessions dans votre base de données PostgreSQL
- **Analogie :** C'est comme un adaptateur électrique pour brancher deux systèmes différents

```bash
npm install bcryptjs
```

**Explication :**
- `bcryptjs` = librairie pour crypter les mots de passe
- **Sécurité critique :** Les mots de passe ne sont jamais stockés en clair
- bcrypt utilise un algorithme de hachage unidirectionnel très sécurisé
- **Analogie :** C'est comme un broyeur de documents - impossible de reconstituer l'original

```bash
npm install @types/bcryptjs
```

**Explication :**
- `@types/bcryptjs` = définitions TypeScript pour bcryptjs
- Permet à votre éditeur de code de comprendre comment utiliser bcryptjs
- **Analogie :** C'est comme le manuel d'instructions en français pour un appareil japonais
- Améliore l'autocomplétion et détecte les erreurs avant l'exécution

**RÈGLE D'OR : Attendre entre chaque installation**

**Pourquoi attendre ?**
- Chaque `npm install` modifie les fichiers `package.json` et `package-lock.json`
- Si vous lancez plusieurs installations simultanément, elles peuvent entrer en conflit
- **Analogie :** C'est comme attendre qu'un plat cuise avant d'ajouter l'ingrédient suivant

**Comment savoir qu'une installation est terminée ?**
- Le terminal affiche à nouveau votre prompt (ex: `PS C:\votre-projet>`)
- Vous voyez un message comme `added X packages in Xs`
- Pas de messages d'erreur en rouge
- La commande ne "tourne" plus (pas de spinner ou de points qui défilent)

## Phase 2 : Configuration de la base de données - Construire les fondations

### Pourquoi cette étape est cruciale ?
**Analogie :** Vous avez dessiné le plan de votre maison (schéma Prisma), maintenant il faut la construire physiquement et installer l'électricité.

### 3. Génération et application du schéma Prisma - Transformer le plan en réalité

**PRÉREQUIS OBLIGATOIRE :** Vous devez avoir modifié le fichier `prisma/schema.prisma` AVANT d'exécuter ces commandes.

```bash
npx prisma generate
```

**Explication ligne par ligne :**
- `npx` = exécuter un package installé localement (évite l'installation globale)
- `prisma generate` = générer le client Prisma personnalisé selon votre schéma
- Cette commande lit votre `schema.prisma` et crée du code TypeScript automatiquement

**Ce qui se passe techniquement :**
- Prisma analyse votre schéma (User, Account, Session, Product, etc.)
- Génère des fonctions TypeScript pour chaque modèle
- Crée les types TypeScript correspondants
- Met à jour le dossier `node_modules/.prisma/client/`

**Analogie :** C'est comme demander à un artisan de fabriquer des outils spécialisés selon le plan de votre maison.

**Résultat attendu :**
```
✔ Generated Prisma Client (v4.x.x) to ./node_modules/.prisma/client in XXXms
```

**Durée moyenne :** 10-30 secondes

```bash
npx prisma db push
```

**Explication :**
- `prisma db push` = appliquer les changements du schéma à la vraie base de données
- Crée/modifie les tables selon votre schéma
- Synchronise votre base PostgreSQL avec votre fichier `schema.prisma`

**Ce qui se passe techniquement :**
- Prisma se connecte à votre base de données PostgreSQL (via DATABASE_URL)
- Compare l'état actuel de la DB avec votre schéma
- Génère et exécute les commandes SQL nécessaires
- Crée les tables : `users`, `accounts`, `sessions`, `verificationtokens`
- Modifie la table `products` pour ajouter les colonnes `createdBy` et `createdById`

**Analogie :** C'est comme un entrepreneur qui construit physiquement votre maison selon le plan.

**Résultat attendu :**
```
🚀  Your database is now in sync with your schema.
```

**Durée moyenne :** 5-15 secondes selon la complexité

**ATTENTION - Ordre obligatoire :**
1. **D'abord** `npx prisma generate` (créer les outils)
2. **Ensuite** `npx prisma db push` (construire la structure)

**Pourquoi cet ordre ?**
- `generate` prépare le client Prisma pour votre nouveau schéma
- `push` utilise ce client pour modifier la base de données
- Inverser l'ordre peut causer des erreurs de synchronisation

### 4. Vérification de la base de données (optionnel mais recommandé)

```bash
npx prisma studio
```

**Explication :**
- `prisma studio` = ouvrir une interface graphique web pour explorer votre base de données
- Interface moderne et intuitive pour voir vos données
- Permet d'ajouter/modifier/supprimer des données manuellement

**Ce qui se passe techniquement :**
- Prisma démarre un serveur web local (généralement sur http://localhost:5555)
- Se connecte à votre base de données PostgreSQL
- Génère une interface graphique pour toutes vos tables
- Vous pouvez naviguer, filtrer, et éditer vos données

**Analogie :** C'est comme avoir un tableau de bord pour contrôler tous les systèmes de votre immeuble.

**Utilisation pratique :**
- Vérifier que les nouvelles tables ont été créées
- Voir les utilisateurs qui s'inscrivent en temps réel
- Déboguer les problèmes de données
- Comprendre la structure de vos relations

**Pour fermer Prisma Studio :** Ctrl+C dans le terminal

**Note pour débutants :** Cette étape est optionnelle mais très utile pour comprendre ce qui se passe dans votre base de données.

## Phase 3 : Création des dossiers - Organiser l'architecture

### Pourquoi créer des dossiers spécifiques ?
**Analogie :** C'est comme organiser les pièces de votre maison avant d'acheter les meubles - chaque fonction a sa place logique.

### 5. Structure de dossiers à créer - L'ossature de votre application

**IMPORTANT - Différences selon votre système :**
- **Windows PowerShell :** Utilisez `mkdir` (sans `-p`)
- **Windows WSL/Git Bash :** Utilisez `mkdir -p`
- **Mac/Linux :** Utilisez `mkdir -p`
- **Alternative universelle :** Créez les dossiers manuellement dans votre éditeur de code

#### Dossiers pour les Routes d'authentification (API)

```bash
mkdir -p app/api/auth/[...nextauth]
```

**Explication ligne par ligne :**
- `mkdir -p` = créer un dossier et tous ses parents si nécessaire
- `app/api/auth/` = chemin pour les APIs d'authentification
- `[...nextauth]` = nom spécial avec crochets et points (syntaxe Next.js)

**Pourquoi cette structure bizarre ?**
- `[...nextauth]` = "catch-all route" dans Next.js App Router
- Capture toutes les URLs comme `/api/auth/signin`, `/api/auth/callback`, etc.
- Les `...` signifient "plusieurs segments d'URL"
- **Analogie :** C'est comme un réceptionniste qui redirige tous les visiteurs selon leur demande

```bash
mkdir -p app/api/auth/signup
```

**Explication :**
- Dossier séparé pour l'API d'inscription utilisateur
- Contiendra le fichier `route.ts` pour créer de nouveaux comptes
- Séparé de NextAuth car c'est une fonctionnalité personnalisée

#### Dossiers pour les Pages d'authentification (Interface utilisateur)

```bash
mkdir -p app/auth/signin
```

**Explication :**
- Dossier pour la page de connexion visible par les utilisateurs
- Contiendra le fichier `page.tsx` avec le formulaire de connexion
- **URL finale :** `http://localhost:3000/auth/signin`

```bash
mkdir -p app/auth/signup
```

**Explication :**
- Dossier pour la page d'inscription visible par les utilisateurs
- Contiendra le formulaire pour créer un nouveau compte
- **URL finale :** `http://localhost:3000/auth/signup`

#### Dossiers pour les Composants React

```bash
mkdir -p components/providers
```

**Explication :**
- Dossier pour les composants "wrapper" (enveloppeurs)
- Contiendra `SessionProvider.tsx` qui partage la session dans toute l'app
- **Analogie :** C'est comme le système de diffusion d'informations de votre immeuble

```bash
mkdir -p components/auth
```

**Explication :**
- Dossier pour tous les composants liés à l'authentification
- Contiendra : `AuthButton.tsx`, `SignInForm.tsx`, `SignUpForm.tsx`
- Organisation logique : tout l'authentification au même endroit

### Structure finale de votre projet

Après ces commandes, votre projet devrait avoir cette structure :

```
votre-projet/
├── app/
│   ├── api/
│   │   └── auth/
│   │       ├── [...nextauth]/     ← Pour NextAuth
│   │       └── signup/            ← Pour l'inscription
│   └── auth/
│       ├── signin/                ← Page de connexion
│       └── signup/                ← Page d'inscription
├── components/
│   ├── providers/                 ← Composants wrapper
│   └── auth/                      ← Composants d'authentification
├── lib/
│   ├── auth.ts                    ← Configuration NextAuth (à créer)
│   └── prisma.ts                  ← Client Prisma (existant)
└── prisma/
    └── schema.prisma              ← Schéma de base de données (modifié)
```

### Alternative si `mkdir -p` ne fonctionne pas

**Sur Windows PowerShell :**
```powershell
mkdir app\api\auth\[...nextauth]
mkdir app\api\auth\signup
mkdir app\auth\signin
mkdir app\auth\signup
mkdir components\providers
mkdir components\auth
```

**Création manuelle dans VS Code :**
1. Clic droit dans l'explorateur de fichiers
2. "Nouveau dossier"
3. Créer la hiérarchie dossier par dossier

**Vérification que tout est créé :**
Après création, votre explorateur de fichiers devrait montrer tous ces nouveaux dossiers vides.

## Phase 4 : Test et démarrage - Vérifier que tout fonctionne

### Pourquoi tester à ce moment ?
**Analogie :** C'est comme faire un test d'électricité avant d'emménager - mieux vaut détecter les problèmes maintenant qu'après avoir tout installé.

### 6. Démarrage du serveur de développement - Allumer votre application

```bash
npm run dev
```

**Explication ligne par ligne :**
- `npm run dev` = lancer le script "dev" défini dans package.json
- Ce script démarre Next.js en mode développement
- Rechargement automatique quand vous modifiez le code
- Affichage détaillé des erreurs pour le débogage

**Ce qui se passe techniquement :**
- Next.js compile votre code TypeScript en JavaScript
- Démarre un serveur web local
- Active le hot reloading (rechargement à chaud)
- Surveille les changements de fichiers

**Résultats possibles :**

**SUCCÈS - Ce que vous devriez voir :**
```
▲ Next.js 14.0.4
- Local:        http://localhost:3000
- Environments: .env
✓ Ready in 2.5s
```

**SUCCÈS alternatif (port occupé) :**
```
⚠ Port 3000 is in use, trying 3001 instead.
▲ Next.js 14.0.4  
- Local:        http://localhost:3001
✓ Ready in 2.5s
```

**ÉCHEC - Messages d'erreur courants :**
- `Error: Cannot find module 'next-auth'` → Packages pas installés
- `PrismaClientInitializationError` → Base de données non accessible
- `Schema parsing error` → Erreur dans schema.prisma

**Durée de démarrage :** 2-10 secondes selon la puissance de votre ordinateur

### 7. Procédure de test complète - Vérifier chaque fonctionnalité

**IMPORTANT :** Effectuez ces tests dans l'ordre exact pour diagnostiquer les problèmes progressivement.

#### Test 1 : Accueil - Vérifier l'interface de base

**Marche à suivre :**
1. Ouvrez votre navigateur web
2. Allez sur `http://localhost:3000` (ou 3001 si affiché différemment)
3. Observez la page d'accueil

**Résultat attendu :**
- La page se charge sans erreur
- Navigation en haut avec le nom de votre application
- Boutons "Connexion" et "Inscription" visibles à droite
- Design cohérent avec Tailwind CSS

**Si ça ne marche pas :**
- Page blanche → Erreur JavaScript (vérifiez la console F12)
- Erreur 404 → Serveur pas démarré ou mauvaise URL
- Design cassé → Problème Tailwind CSS

#### Test 2 : Inscription - Créer un utilisateur test

**Marche à suivre détaillée :**
1. Dans le navigateur, allez sur `http://localhost:3000/auth/signup`
2. Remplissez le formulaire EXACTEMENT avec ces données :
   ```
   Nom complet : Test User
   Email : test@example.com
   Mot de passe : test123456
   Confirmer mot de passe : test123456
   ```
3. Cliquez sur "Créer le compte"
4. Attendez la réponse

**Résultat attendu :**
- Message "Compte créé avec succès !"
- Redirection automatique vers la page d'accueil
- Navigation montre maintenant "Bonjour, Test User" et "Déconnexion"
- Plus de boutons "Connexion" et "Inscription"

**Ce qui se passe techniquement :**
1. Votre formulaire envoie une requête POST vers `/api/auth/signup`
2. Le serveur vérifie les données (email unique, mot de passe assez long)
3. bcrypt crypte le mot de passe
4. Prisma enregistre l'utilisateur en base de données
5. NextAuth connecte automatiquement l'utilisateur
6. Session créée et cookie sécurisé posé dans le navigateur

**Si ça ne marche pas :**
- "Un compte avec cet email existe déjà" → Utilisez un autre email
- "Erreur serveur" → Vérifiez la console du serveur (terminal)
- Pas de redirection → Problème NextAuth ou session

#### Test 3 : Connexion - Vérifier l'authentification

**Marche à suivre :**
1. Si encore connecté, déconnectez-vous (bouton "Déconnexion")
2. Allez sur `http://localhost:3000/auth/signin`
3. Utilisez les mêmes identifiants que l'inscription :
   ```
   Email : test@example.com
   Mot de passe : test123456
   ```
4. Cliquez sur "Se connecter"

**Résultat attendu :**
- Connexion réussie sans message d'erreur
- Redirection vers la page d'accueil
- Interface utilisateur mise à jour (nom affiché, bouton déconnexion)

**Ce qui se passe techniquement :**
1. NextAuth vérifie l'email en base de données
2. bcrypt compare le mot de passe saisi avec le hash stocké
3. Si match : création d'un token JWT sécurisé
4. Cookie de session posé dans le navigateur
5. Redirection vers la page demandée

#### Test 4 : Protection des routes - Vérifier la sécurité

**Marche à suivre :**
1. Déconnectez-vous complètement
2. Dans la barre d'adresse, tapez directement : `http://localhost:3000/products/new`
3. Appuyez sur Entrée

**Résultat attendu :**
- Vous n'accédez PAS à la page `/products/new`
- Redirection automatique vers `/auth/signin`
- URL devient : `http://localhost:3000/auth/signin?callbackUrl=%2Fproducts%2Fnew`
- Message ou indication que vous devez vous connecter

**Ce qui se passe techniquement :**
1. Next.js middleware intercepte votre requête
2. Vérifie s'il y a un token de session valide
3. Pas de token trouvé → redirection vers la page de connexion
4. `callbackUrl` paramètre pour revenir après connexion

**Test complémentaire :**
1. Connectez-vous depuis cette page
2. Après connexion, vous devriez être automatiquement redirigé vers `/products/new`
3. Cette fois, l'accès est autorisé

### Checklist de validation complète

Cochez chaque point au fur et à mesure :

- [ ] Serveur démarre sans erreur
- [ ] Page d'accueil se charge correctement
- [ ] Navigation affiche les bons boutons selon l'état de connexion
- [ ] Inscription fonctionne (nouveau compte créé)
- [ ] Connexion automatique après inscription
- [ ] Déconnexion fonctionne
- [ ] Reconnexion avec les mêmes identifiants fonctionne  
- [ ] Protection des routes empêche l'accès non autorisé
- [ ] Redirection après connexion vers la page voulue

**Si tous les tests passent :** Félicitations ! Votre système d'authentification fonctionne parfaitement.

## Phase 5 : Test des APIs (optionnel)

### 8. Test de protection des APIs

#### Test API sans authentification (doit échouer)
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Product", "price": 99.99}'
```

**Résultat attendu :** 
```json
{"success": false, "error": "Authentification requise"}
```

#### Test API en lecture (doit réussir)
```bash
curl http://localhost:3000/api/products
```

**Résultat attendu :** Liste des produits ou tableau vide.

## Phase 6 : Commandes de maintenance

### 9. En cas de problème

#### Nettoyage complet
```bash
# Arrêter le serveur (Ctrl+C)
rm -rf node_modules
rm package-lock.json
npm install
npx prisma generate
npx prisma db push
npm run dev
```

#### Réinstallation des packages NextAuth
```bash
npm uninstall next-auth @next-auth/prisma-adapter
npm install next-auth@4 @next-auth/prisma-adapter
```

#### Reset de la base de données
```bash
npx prisma db push --force-reset
```

**Attention :** Cette commande supprime toutes les données !

### 10. Vérification des installations

#### Vérifier les versions installées
```bash
npm list next-auth
npm list @next-auth/prisma-adapter
npm list bcryptjs
```

#### Vérifier la configuration Prisma
```bash
npx prisma validate
```

## Phase 7 : Commandes de déploiement

### 11. Commit du travail
```bash
git add -A
git status
git commit -m "feat: implement NextAuth.js v4 authentication system

- Add email/password authentication with bcrypt hashing
- Add Google and GitHub OAuth providers  
- Add user registration and login pages
- Add protected routes and API endpoints
- Add role-based access control (user/admin)
- Add responsive authentication UI components
- Add session management and middleware protection"
```

### 12. Push de la branche (optionnel)
```bash
git push origin feature/nextauth-implementation
```

## Phase 8 : Configuration OAuth (optionnel)

### 13. Configuration Google OAuth

1. Allez sur https://console.cloud.google.com/
2. Créez un projet ou sélectionnez un existant
3. Activez l'API Google+ 
4. Créez des identifiants OAuth 2.0
5. Ajoutez ces URIs de redirection :
   ```
   http://localhost:3000/api/auth/callback/google
   http://localhost:3001/api/auth/callback/google
   ```
6. Copiez Client ID et Client Secret dans votre `.env`

### 14. Configuration GitHub OAuth

1. Allez sur https://github.com/settings/developers
2. Créez une nouvelle OAuth App
3. Authorization callback URL : 
   ```
   http://localhost:3000/api/auth/callback/github
   ```
4. Copiez Client ID et Client Secret dans votre `.env`

## Ordre d'exécution critique

**IMPORTANT :** Respectez cet ordre exact :

1. **Installer les packages** → Attendre la fin complète
2. **Modifier le fichier .env** → Sauvegarder
3. **Modifier prisma/schema.prisma** → Sauvegarder  
4. **Exécuter npx prisma generate** → Attendre la fin
5. **Exécuter npx prisma db push** → Attendre la fin
6. **Créer tous les fichiers de code** → Un par un
7. **Exécuter npm run dev** → Tester

## Variables d'environnement minimales

Pour que l'authentification fonctionne, vous devez avoir AU MINIMUM :

```env
DATABASE_URL="votre-url-postgresql"
NEXTAUTH_URL="http://localhost:3000"  
NEXTAUTH_SECRET="cle-secrete-longue-minimum-32-caracteres"
```

Les variables OAuth (Google, GitHub) sont optionnelles pour commencer.

## Vérifications avant de commencer

Avant d'exécuter les commandes, assurez-vous que :

- ✅ Node.js 18+ est installé : `node --version`
- ✅ npm fonctionne : `npm --version`
- ✅ Vous êtes dans le bon dossier : `pwd` ou `cd`
- ✅ Le projet Next.js existe : `ls package.json`
- ✅ Prisma est configuré : `ls prisma/schema.prisma`
- ✅ La base de données est accessible

## Commandes de diagnostic

En cas de problème, utilisez ces commandes pour diagnostiquer :

```bash
# Vérifier l'état de git
git status
git branch

# Vérifier les packages installés
npm list --depth=0

# Vérifier la configuration Prisma
npx prisma validate
cat prisma/schema.prisma

# Vérifier les variables d'environnement
cat .env

# Vérifier les ports utilisés (Windows)
netstat -ano | findstr :3000
netstat -ano | findstr :3001

# Vérifier les ports utilisés (Unix/Mac)
lsof -i :3000
lsof -i :3001
```

Ces commandes vous donneront toutes les informations nécessaires pour résoudre les problèmes.
