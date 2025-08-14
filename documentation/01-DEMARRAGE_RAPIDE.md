# Démarrage rapide - 5 minutes

## Pour l'enseignant : Test rapide du laboratoire

### 1. Installation (1 minute)
```bash
npm install
```

### 2. Configuration base de données (2 minutes)
1. Créez un compte sur [neon.tech](https://neon.tech)
2. Créez une base PostgreSQL
3. Copiez l'URL de connexion
4. Créez `.env.local` :
```bash
DATABASE_URL="postgresql://user:pass@host.neon.tech/db?sslmode=require"
```

### 3. Synchronisation (30 secondes)
```bash
npx prisma generate
npx prisma db push
```

### 4. Démarrage (30 secondes)
```bash
npm run dev
```

### 5. Test immédiat (1 minute)
Ouvrez http://localhost:3000 - la page doit s'afficher.

**Testez avec curl :**
```bash
# Ajouter un produit
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Product", "price": 99.99}'

# Lister les produits
curl http://localhost:3000/api/products

# Supprimer le produit
curl -X DELETE http://localhost:3000/api/products/1
```

## Pour l'étudiant : Ce que vous devez faire

### Étape 1 : Récupérer le code
- Cloner ce repository
- Ouvrir dans VS Code

### Étape 2 : Configurer votre base de données
- Créer un compte Neon.tech (gratuit)
- Obtenir votre URL de connexion
- Créer le fichier `.env.local`

### Étape 3 : Tester vos 3 services
- Utiliser Postman ou curl
- GET /api/products
- POST /api/products
- DELETE /api/products/[id]

### Étape 4 : Comprendre et expliquer
- Comment chaque service fonctionne
- Comment la base de données est configurée
- Comment les erreurs sont gérées

## Checklist de validation

### Pour l'enseignant
- [ ] Le projet se lance sans erreur
- [ ] Les 3 endpoints répondent
- [ ] Les données sont persistées
- [ ] Les erreurs sont gérées
- [ ] La documentation est claire

### Pour l'étudiant
- [ ] J'ai testé tous les endpoints
- [ ] J'ai compris le code
- [ ] J'ai pris des captures d'écran
- [ ] J'ai committé sur GitHub
- [ ] Je peux expliquer comment ça marche

## Résolution de problèmes

### "Cannot connect to database"
```bash
# Vérifiez votre URL dans .env.local
# Testez la connexion sur neon.tech
npx prisma studio  # Doit s'ouvrir sans erreur
```

### "Prisma Client not found"
```bash
npx prisma generate
```

### "Port 3000 in use"
```bash
npm run dev -- -p 3001
# Puis utilisez http://localhost:3001
```

### "Module not found"
```bash
rm -rf node_modules package-lock.json
npm install
```

## Ressources

- **Documentation :** Lisez `README.md` pour le guide complet
- **Tests :** Consultez `EXEMPLES_TESTS.md` pour tous les cas de test
- **Étudiant :** Suivez `GUIDE_ETUDIANT.md` étape par étape

## Objectifs pédagogiques

À la fin de ce TP, l'étudiant sait :
1. **Créer une API REST** avec Next.js App Router
2. **Connecter une base de données** PostgreSQL avec Prisma
3. **Gérer les opérations CRUD** (Create, Read, Delete)
4. **Tester des services web** avec Postman
5. **Valider les données** et gérer les erreurs
6. **Déployer sur le cloud** (bonus avec Vercel)

**Durée estimée :** 3-4 heures pour un étudiant débutant
**Prérequis :** Bases de JavaScript/TypeScript et HTTP

## Endpoints disponibles

| Méthode | Endpoint                     | Description                                  |
|---------|------------------------------|----------------------------------------------|
| GET     | `/api/products`              | Lister tous les produits                      |
| POST    | `/api/products`              | Créer un produit (name, price)               |
| GET     | `/api/products/[id]`         | Obtenir un produit par son identifiant       |
| PUT     | `/api/products/[id]`         | Modifier un produit par son identifiant      |
| DELETE  | `/api/products/[id]`         | Supprimer un produit par son identifiant     |
| GET     | `/api/products/count`        | Compter le nombre total de produits          |

## Endpoints proposés (exercices)

Ces endpoints seront ajoutés par les étudiants au fur et à mesure des exercices (voir 08-EXERCICES_SIMPLES.md) :

| Méthode | Endpoint                             | Description                                        |
|---------|--------------------------------------|----------------------------------------------------|
| GET     | `/api/products/most-expensive`       | Récupérer le produit le plus cher                  |
| GET     | `/api/products/cheapest`             | Récupérer le produit le moins cher                 |
| DELETE  | `/api/products/all`                   | Supprimer tous les produits                        |
| GET     | `/api/products/search/[name]`         | Rechercher un produit par nom exact                |
| PATCH   | `/api/products/[id]/price`            | Modifier uniquement le prix d’un produit           |
| GET     | `/api/products/oldest-first`          | Lister les produits du plus ancien au plus récent  |
| HEAD    | `/api/products/[id]`                  | Vérifier l’existence d’un produit (sans contenu)   |

## Exemples d'appels API

### Exemples GET

```bash
# Lister tous les produits
curl -X GET http://localhost:3000/api/products

# Obtenir un produit par ID (ex: 1)
curl -X GET http://localhost:3000/api/products/1

# Compter le nombre total de produits
curl -X GET http://localhost:3000/api/products/count

# (Exercice) Produit le plus cher
curl -X GET http://localhost:3000/api/products/most-expensive

# (Exercice) Produit le moins cher
curl -X GET http://localhost:3000/api/products/cheapest

# (Exercice) Lister du plus ancien au plus récent
curl -X GET http://localhost:3000/api/products/oldest-first

# (Exercice) Recherche par nom exact (URL encodée)
curl -X GET http://localhost:3000/api/products/search/iPhone%2015
```

### Exemples POST

```bash
# Créer un produit
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name": "MacBook Air M2", "price": 1299.99}'
```

### Exemples PUT

```bash
# Modifier un produit (ex: ID 1)
curl -X PUT http://localhost:3000/api/products/1 \
  -H "Content-Type: application/json" \
  -d '{"name": "MacBook Air M2 - Edition", "price": 1399.99}'
```

### Exemples DELETE

```bash
# Supprimer un produit par ID (ex: 1)
curl -X DELETE http://localhost:3000/api/products/1

# (Exercice) Supprimer tous les produits
curl -X DELETE http://localhost:3000/api/products/all
```