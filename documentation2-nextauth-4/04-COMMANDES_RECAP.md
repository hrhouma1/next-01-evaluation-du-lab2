# Récapitulatif de toutes les commandes NextAuth.js v4

Ce fichier liste toutes les commandes à exécuter dans l'ordre exact pour implémenter NextAuth.js v4 sans erreur.

## Phase 1 : Préparation du projet

### 1. Création de la branche
```bash
git checkout -b feature/nextauth-implementation
git branch
```

### 2. Installation des packages
```bash
npm install next-auth@4
npm install @next-auth/prisma-adapter
npm install bcryptjs
npm install @types/bcryptjs
```

**Attendre que chaque installation se termine avant de passer à la suivante.**

## Phase 2 : Configuration de la base de données

### 3. Génération et application du schéma Prisma
```bash
# Après avoir modifié le fichier prisma/schema.prisma
npx prisma generate
npx prisma db push
```

**Important :** Ces commandes doivent être exécutées APRÈS avoir modifié le fichier `prisma/schema.prisma`.

### 4. Vérification de la base de données (optionnel)
```bash
npx prisma studio
```

Cette commande ouvre une interface web pour voir votre base de données.

## Phase 3 : Création des dossiers

### 5. Structure de dossiers à créer
```bash
# Routes d'authentification
mkdir -p app/api/auth/[...nextauth]
mkdir -p app/api/auth/signup

# Pages d'authentification
mkdir -p app/auth/signin
mkdir -p app/auth/signup

# Composants
mkdir -p components/providers
mkdir -p components/auth
```

**Note :** Utilisez `mkdir -p` sur Unix/Mac/WSL ou créez les dossiers manuellement sur Windows.

## Phase 4 : Test et démarrage

### 6. Démarrage du serveur de développement
```bash
npm run dev
```

Le serveur va démarrer sur http://localhost:3000 ou http://localhost:3001 si le port 3000 est occupé.

### 7. Tests de base à effectuer

#### Test 1 : Accueil
- Ouvrez http://localhost:3000
- Vérifiez que la navigation affiche "Connexion" et "Inscription"

#### Test 2 : Inscription
```bash
# Dans le navigateur, allez sur :
http://localhost:3000/auth/signup

# Créez un compte avec :
# Nom : "Test User"
# Email : "test@example.com" 
# Mot de passe : "test123456"
```

#### Test 3 : Connexion
```bash
# Déconnectez-vous puis allez sur :
http://localhost:3000/auth/signin

# Connectez-vous avec :
# Email : "test@example.com"
# Mot de passe : "test123456"
```

#### Test 4 : Protection des routes
```bash
# Sans être connecté, essayez :
http://localhost:3000/products/new

# Vous devriez être redirigé vers la page de connexion
```

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
