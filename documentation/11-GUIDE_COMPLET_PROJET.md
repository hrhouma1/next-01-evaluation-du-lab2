# Guide complet du projet – Services web REST, UI et Tailwind 3

Ce document présente, de A à Z, la démarche pour construire et faire tourner le projet: API REST avec Next.js App Router, base PostgreSQL via Prisma, pages d’interface simples reliées aux endpoints, et intégration de Tailwind CSS 3.

La démarche suit une progression pragmatique: installation, configuration, endpoints, pages, tests.

---

## 1. Prérequis et installation

### 1.1. Outils
- Node.js 18+
- Un compte Neon.tech (ou une base PostgreSQL équivalente)
- Git (recommandé)

### 1.2. Installation du projet
Si vous partez de ce dépôt, placez-vous dans le dossier du projet puis installez les dépendances:
```bash
npm install
```

### 1.3. Variables d’environnement
Créer un fichier `.env.local` à la racine et y placer l’URL PostgreSQL:
```bash
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
```

### 1.4. Prisma (ORM)
Générer le client et appliquer le schéma:
```bash
npx prisma generate
npx prisma db push
```

---

## 2. Schéma des données

Le modèle minimal utilisé pour les produits se trouve dans `prisma/schema.prisma`:
```prisma
model Product {
  id        Int      @id @default(autoincrement())
  name      String
  price     Float
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  @@map("products")
}
```
Puis synchroniser avec la base:
```bash
npx prisma generate
npx prisma db push
```

---

## 3. Endpoints disponibles

| Méthode | Endpoint                     | Description                                  |
|---------|------------------------------|----------------------------------------------|
| GET     | `/api/products`              | Lister tous les produits                      |
| POST    | `/api/products`              | Créer un produit (name, price)               |
| GET     | `/api/products/[id]`         | Obtenir un produit par son identifiant       |
| PUT     | `/api/products/[id]`         | Modifier un produit par son identifiant      |
| DELETE  | `/api/products/[id]`         | Supprimer un produit par son identifiant     |
| GET     | `/api/products/count`        | Compter le nombre total de produits          |

Endpoints d’exercices proposés (à implémenter si besoin):

| Méthode | Endpoint                             | Description                                        |
|---------|--------------------------------------|----------------------------------------------------|
| GET     | `/api/products/most-expensive`       | Récupérer le produit le plus cher                  |
| GET     | `/api/products/cheapest`             | Récupérer le produit le moins cher                 |
| DELETE  | `/api/products/all`                   | Supprimer tous les produits                        |
| GET     | `/api/products/search/[name]`         | Rechercher un produit par nom exact                |
| PATCH   | `/api/products/[id]/price`            | Modifier uniquement le prix d’un produit           |
| GET     | `/api/products/oldest-first`          | Lister les produits du plus ancien au plus récent  |
| HEAD    | `/api/products/[id]`                  | Vérifier l’existence d’un produit (sans contenu)   |

---

## 4. Création des routes API (App Router)

### 4.1. Lister et créer (`app/api/products/route.ts`)
- GET: retourne la liste triée par date de création.
- POST: crée un produit après validation des champs.

Structure attendue des réponses JSON:
```json
{
  "success": true,
  "data": [],
  "message": "..."
}
```
ou en cas d’erreur:
```json
{
  "success": false,
  "error": "Message d'erreur"
}
```

### 4.2. Lire, modifier, supprimer par id (`app/api/products/[id]/route.ts`)
- GET: retourne un produit par son id.
- PUT: modifie `name` et `price` après validation.
- DELETE: supprime le produit s’il existe.

### 4.3. Compter les produits (`app/api/products/count/route.ts`)
- GET: retourne `{ total: number }` dans `data`.

Ces handlers utilisent le client Prisma exporté par `lib/prisma.ts`.

---

## 5. Intégration de Tailwind CSS 3

Objectif: disposer d’une base de styles utilitaires immédiatement réutilisable dans les pages.

### 5.1. Installation
```bash
npm install -D tailwindcss@^3.4.0 postcss autoprefixer
npx tailwindcss init -p
```

### 5.2. Configuration
`tailwind.config.js`:
```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: { extend: {} },
  plugins: [],
}
```

`postcss.config.js`:
```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

Créer `app/globals.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

html, body { height: 100%; }
```

Importer ce CSS global dans `app/layout.tsx`:
```ts
import './globals.css'
```
Et appliquer éventuellement un fond/typo global:
```tsx
<body className="min-h-screen bg-gray-50 text-gray-900 antialiased">{children}</body>
```

Redémarrer le serveur si nécessaire:
```bash
npm run dev
```

---

## 6. Création des pages d’interface

L’objectif est de couvrir les parcours usuels: lister, créer, consulter, modifier, supprimer. Les pages ci-dessous sont déjà incluses dans le projet; elles sont présentées ici pour montrer la structure attendue et les appels API à reproduire.

### 6.1. Liste des produits – `/products`
- Fichier: `app/products/page.tsx`
- Comportement: fetch GET `/api/products`, affichage des cartes, boutons modifier/supprimer, lien vers création.
- Points d’attention: gérer `loading`, `error`, et rafraîchir la liste après une suppression.

### 6.2. Création – `/products/new`
- Fichier: `app/products/new/page.tsx`
- Formulaire contrôlé avec `name`, `price`.
- Envoi POST sur `/api/products` avec `Content-Type: application/json`.
- Redirection vers `/products` en cas de succès.

### 6.3. Détail – `/products/[id]`
- Fichier: `app/products/[id]/page.tsx`
- Récupération côté serveur avec `fetch` vers `/api/products/[id]`.
- Construction d’URL absolue côté serveur via les headers pour éviter l’erreur `ERR_INVALID_URL`.

### 6.4. Édition – `/products/[id]/edit`
- Fichier: `app/products/[id]/edit/page.tsx`
- Pré-remplit le formulaire avec GET `/api/products/[id]` puis PUT sur le même endpoint.

Structure UI minimale conseillée:
- Container centré `container mx-auto p-8`
- Titres `text-2xl font-semibold`
- Grilles `grid md:grid-cols-2 gap-6`
- Boutons simples `bg-black text-white px-4 py-2 rounded`

---

## 7. Tests rapides

### 7.1. Avec curl
```bash
# Créer un produit
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","price":19.99}'

# Lister
curl http://localhost:3000/api/products

# Détail
curl http://localhost:3000/api/products/1

# Modifier
curl -X PUT http://localhost:3000/api/products/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Test V2","price":29.99}'

# Supprimer
curl -X DELETE http://localhost:3000/api/products/1

# Compter
curl http://localhost:3000/api/products/count
```

### 7.2. Fichier .http (VS Code – REST Client)
Voir `tests/api.http` pour une séquence complète de requêtes prêtes à exécuter.

---

## 8. Points de contrôle

- Le serveur démarre et les API répondent sans erreur
- La page `/products` affiche la liste mise à jour
- La création, l’édition et la suppression fonctionnent
- Tailwind 3 applique bien les classes utilitaires

---

## 9. Dépannage

- Avertissement Tailwind "content is missing": vérifier `tailwind.config.js` et supprimer toute configuration dupliquée; s’assurer que les chemins `./app/**`, `./components/**`, `./pages/**` sont présents.
- Erreur `ERR_INVALID_URL` lors de `fetch` côté serveur: construire une URL absolue à partir des headers (`host`, `x-forwarded-proto`).
- Port occupé: lancer `npm run dev -- -p 3001` et utiliser l’URL proposée dans la console.

---

## 10. Prochaines étapes

- Implémenter les endpoints d’exercices (recherche, tri, prix extrêmes, suppression de masse, etc.)
- Ajouter des validations avancées (Zod) et des tests automatisés
- Enrichir l’interface (recherche, filtres, pagination) et composer des composants UI réutilisables

Ce guide constitue une trame de travail complète: endpoints, pages, et stylage. Suivre chaque section pas à pas et valider à chaque étape par un appel API ou une page UI.