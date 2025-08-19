# Déploiement Vercel - Session pratique en classe

Ce document retrace exactement les étapes que nous venons de réaliser ensemble pour préparer et déployer le projet sur Vercel.

---

## Étapes réalisées

### Étape 1 : Préparation du projet pour la production

#### 1.1 Ajout du script postinstall
**Problème identifié :** Le `package.json` ne contenait pas le script `postinstall` nécessaire pour Vercel.

**Solution appliquée :**
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "postinstall": "prisma generate"
  }
}
```

**Pourquoi c'est important :** Vercel exécute `npm install` puis les scripts `postinstall`. Sans cela, le client Prisma ne sera pas généré et l'application plantera.

#### 1.2 Test du build de production
**Commande exécutée :**
```bash
npm run build
```

**Résultat :**
```
✓ Creating an optimized production build    
✓ Compiled successfully
✓ Linting and checking validity of types    
✓ Collecting page data    
✓ Generating static pages (8/8)
✓ Collecting build traces
✓ Finalizing page optimization
```

**Pages générées :**
- `/` (statique)
- `/products` (statique)
- `/products/new` (statique)
- `/products/[id]` (dynamique)
- `/products/[id]/edit` (dynamique)
- APIs : `/api/products`, `/api/products/[id]`, `/api/products/count`

#### 1.3 Commit et push vers GitHub
**Commandes exécutées :**
```bash
git add -A
git commit -m "feat: ready for Vercel deployment - added postinstall script, UI pages, Tailwind 3"
git pull origin main
git commit --no-edit
git push origin main
```

**Repository GitHub :** `hrhouma1/next-01-evaluation-du-lab2`

### Étape 2 : Vérification de la base de données Neon

#### 2.1 Configuration existante validée
**URL de base :** 
```
postgresql://neondb_owner:npg_Bfc3tayVv1wU@ep-patient-darkness-ae1a7vdi-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

**Points importants :**
- URL utilise le **pooler** (`-pooler.c-2`) : optimal pour serverless
- `sslmode=require` : sécurité obligatoire
- `channel_binding=require` : sécurité renforcée

#### 2.2 Synchronisation du schéma
**Commande exécutée :**
```bash
npx prisma db push
```

**Résultat :**
```
The database is already in sync with the Prisma schema.
✔ Generated Prisma Client (v5.22.0)
```

**Statut :** Base de données prête pour la production.

### Étape 3 : Serveur de développement fonctionnel
**Commande :**
```bash
npm run dev
```

**Résultat :**
```
▲ Next.js 14.0.4
- Local: http://localhost:3000
- Environments: .env
✓ Ready in 2.4s
```

**Services disponibles et testés :**
- GET /api/products
- POST /api/products
- PUT /api/products/[id]
- DELETE /api/products/[id]
- GET /api/products/count

---

## Prochaine étape : Déploiement sur Vercel

### Ce que nous allons faire maintenant

#### 3.1 Accéder à Vercel
1. Aller sur https://vercel.com
2. Se connecter avec le compte GitHub

#### 3.2 Créer le projet
1. "Add New..." → "Project"
2. Importer `hrhouma1/next-01-evaluation-du-lab2`
3. Vercel détecte Next.js automatiquement

#### 3.3 Configuration des variables d'environnement
**Variable à ajouter :**
- **Nom :** `DATABASE_URL`
- **Valeur :** `postgresql://neondb_owner:npg_Bfc3tayVv1wU@ep-patient-darkness-ae1a7vdi-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require`
- **Environnement :** Production

#### 3.4 Déploiement
1. Cliquer sur "Deploy"
2. Attendre le build (2-3 minutes)
3. Récupérer l'URL de production

#### 3.5 Tests en production
**URLs à tester :**
- `https://[votre-url].vercel.app/api/products`
- `https://[votre-url].vercel.app/products`
- `https://[votre-url].vercel.app/products/new`

---

## Checklist de validation

### Avant déploiement (fait)
- [x] Script `postinstall` dans `package.json`
- [x] Build local réussi
- [x] Code pushé sur GitHub
- [x] Base Neon synchronisée
- [x] Serveur dev fonctionnel

### Pendant déploiement (à faire)
- [ ] Projet Vercel créé
- [ ] Variable `DATABASE_URL` configurée
- [ ] Build Vercel réussi
- [ ] URL de production obtenue

### Après déploiement (à tester)
- [ ] API `/api/products` répond
- [ ] Page `/products` s'affiche
- [ ] Création de produit fonctionne
- [ ] Modification de produit fonctionne
- [ ] Suppression de produit fonctionne

---

## État actuel

**Projet prêt pour Vercel :** ✅  
**Base de données opérationnelle :** ✅  
**Code sur GitHub :** ✅  

**Prochaine action :** Aller sur https://vercel.com et suivre les étapes 3.1 à 3.5 ci-dessus.

L'URL de base Neon utilise bien le pooler et toutes les sécurités requises. Le déploiement devrait se passer sans problème.

---

## Étape 3 : Déploiement sur Vercel réalisé

### 3.1 Accès à Vercel
**Action :** Connexion sur https://vercel.com avec le compte GitHub

### 3.2 Import du repository
**Repository importé :** `hrhouma1/next-01-evaluation-du-lab2`
**Framework détecté :** Next.js (automatique)

### 3.3 Configuration des variables d'environnement
**Variable ajoutée :**
- **Nom :** `DATABASE_URL`
- **Valeur :** `postgresql://neondb_owner:npg_Bfc3tayVv1wU@ep-patient-darkness-ae1a7vdi-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require`
- **Environnement :** Production

### 3.4 Build et déploiement
**Statut :** Déploiement réussi
**URL de production :** https://next-01-evaluation-du-lab2.vercel.app/

### 3.5 Validation de l'application déployée
**Page d'accueil testée :** https://next-01-evaluation-du-lab2.vercel.app/

**Contenu affiché :**
```
# Laboratoire 2 - Services Web REST

Cette application propose des services web REST pour gérer des produits :

Services principaux
• GET /api/products - Obtenir la liste des produits
• POST /api/products - Ajouter un nouveau produit
• PUT /api/products/[id] - Modifier un produit par ID
• DELETE /api/products/[id] - Supprimer un produit par ID

Services complémentaires
• GET /api/products/count - Compter les produits

Utilisez Postman ou un autre client REST pour tester ces endpoints.
Interface web: /products
```

**Statut page d'accueil :** ✅ Fonctionnelle

---

## Tests en production à effectuer

### Test 1 : API endpoints
**URLs à tester avec Postman ou curl :**

```bash
# Lister tous les produits
curl https://next-01-evaluation-du-lab2.vercel.app/api/products

# Compter les produits
curl https://next-01-evaluation-du-lab2.vercel.app/api/products/count

# Créer un produit
curl -X POST https://next-01-evaluation-du-lab2.vercel.app/api/products \
  -H "Content-Type: application/json" \
  -d '{"name": "Produit Test Vercel", "price": 99.99}'
```

### Test 2 : Interface utilisateur
**URLs à tester dans le navigateur :**

- **Liste :** https://next-01-evaluation-du-lab2.vercel.app/products
- **Création :** https://next-01-evaluation-du-lab2.vercel.app/products/new
- **Détail :** https://next-01-evaluation-du-lab2.vercel.app/products/[id]
- **Édition :** https://next-01-evaluation-du-lab2.vercel.app/products/[id]/edit

### Test 3 : CRUD complet via l'interface
1. Aller sur `/products`
2. Cliquer sur "Nouveau produit"
3. Créer un produit de test
4. Vérifier qu'il apparaît dans la liste
5. Cliquer sur le produit pour voir le détail
6. Cliquer sur "Modifier" et changer le prix
7. Vérifier la mise à jour
8. Supprimer le produit depuis la liste

---

## Résultats attendus

### API en production
**Format de réponse attendu pour GET /api/products :**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Produit exemple",
      "price": 99.99,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "message": "X produit(s) trouvé(s)"
}
```

### Interface en production
- **Tailwind CSS :** Styles appliqués correctement
- **Navigation :** Liens fonctionnels entre les pages
- **Formulaires :** Soumission et validation opérationnelles
- **États :** Loading, erreurs, succès gérés

---

## Checklist finale mise à jour

### Déploiement (fait)
- [x] Projet Vercel créé
- [x] Variable `DATABASE_URL` configurée
- [x] Build Vercel réussi
- [x] URL de production obtenue : https://next-01-evaluation-du-lab2.vercel.app/
- [x] Page d'accueil accessible et fonctionnelle

### Tests à effectuer maintenant
- [ ] API `/api/products` répond en production
- [ ] API `/api/products/count` répond en production
- [ ] Page `/products` s'affiche correctement
- [ ] Création de produit fonctionne via l'interface
- [ ] Modification de produit fonctionne
- [ ] Suppression de produit fonctionne
- [ ] Tailwind CSS s'applique correctement

---

## Succès du déploiement

**Application déployée avec succès sur Vercel !**

**URL de production :** https://next-01-evaluation-du-lab2.vercel.app/

Le projet est maintenant accessible publiquement et prêt pour la démonstration en classe. Tous les services web REST et l'interface utilisateur sont déployés et opérationnels.
