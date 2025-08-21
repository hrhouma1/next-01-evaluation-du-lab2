# Migration complète vers Pages Router - Guide exhaustif

## Introduction et objectifs

Ce document détaille la migration complète de notre projet Next.js de App Router vers Pages Router. Nous recréerons l'intégralité du projet de zéro en utilisant l'ancienne approche pour comprendre les différences pratiques et maîtriser les deux systèmes.

## Vue d'ensemble de la migration

### Projet actuel (App Router)
```
laboratoire2-app-router/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── api/products/route.ts
│   ├── api/products/[id]/route.ts
│   ├── api/products/count/route.ts
│   ├── api/swagger/route.ts
│   ├── products/page.tsx
│   ├── products/[id]/page.tsx
│   ├── products/new/page.tsx
│   └── api-docs/page.tsx
├── lib/
├── prisma/
└── package.json
```

### Projet migré (Pages Router)
```
laboratoire2-pages-router/
├── pages/
│   ├── _app.tsx
│   ├── _document.tsx
│   ├── index.tsx
│   ├── api/products/index.ts
│   ├── api/products/[id].ts
│   ├── api/products/count.ts
│   ├── api/swagger.ts
│   ├── products/index.tsx
│   ├── products/[id].tsx
│   ├── products/new.tsx
│   └── api-docs.tsx
├── styles/
├── lib/
├── prisma/
└── package.json
```

## Étape 1 : Création du nouveau projet Pages Router

### 1.1 Initialisation du projet
```bash
# Créer un nouveau projet Next.js avec Pages Router
npx create-next-app@latest laboratoire2-pages-router --typescript --tailwind --no-app

# Naviguer dans le projet
cd laboratoire2-pages-router
```

### 1.2 Nettoyage et structure initiale
```bash
# Supprimer les fichiers d'exemple
rm pages/api/hello.ts
rm -rf pages/api/hello.ts 2>/dev/null || del pages\api\hello.ts 2>nul

# Créer la structure de dossiers nécessaire
mkdir -p lib
mkdir -p prisma
mkdir -p styles 2>/dev/null || mkdir lib prisma styles 2>nul
```

### 1.3 Installation des dépendances
```bash
# Dépendances Prisma
npm install prisma @prisma/client

# Dépendances Swagger
npm install swagger-ui-react swagger-jsdoc
npm install -D @types/swagger-ui-react @types/swagger-jsdoc

# Variables d'environnement
npm install dotenv
```

## Étape 2 : Configuration de base

### 2.1 Configuration TypeScript (tsconfig.json)
```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### 2.2 Configuration Tailwind (tailwind.config.js)
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### 2.3 Styles globaux (styles/globals.css)
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

html {
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
}

body {
  margin: 0;
  padding: 0;
  min-height: 100vh;
  background-color: #f9fafb;
}

* {
  box-sizing: border-box;
}
```

### 2.4 Variables d'environnement (.env)
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/laboratoire2_pages_router?schema=public"

# Next.js
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

## Étape 3 : Configuration Prisma

### 3.1 Schema Prisma (prisma/schema.prisma)
```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Product {
  id        Int      @id @default(autoincrement())
  name      String
  price     Float
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("products")
}
```

### 3.2 Client Prisma (lib/prisma.ts)
```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### 3.3 Initialisation de la base de données
```bash
# Générer le client Prisma
npx prisma generate

# Pousser le schema vers la base de données
npx prisma db push

# (Optionnel) Ajouter des données de test
npx prisma studio
```

## Étape 4 : Configuration Swagger pour Pages Router

### 4.1 Configuration Swagger (lib/swagger.ts)
```typescript
import swaggerJSDoc from 'swagger-jsdoc'

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Laboratoire 2 - API REST (Pages Router)',
      version: '1.0.0',
      description: 'Documentation des services web REST avec Pages Router pour la gestion de produits',
      contact: {
        name: 'Équipe de développement',
        email: 'contact@exemple.com'
      }
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://votre-app-pages-router.vercel.app'
          : 'http://localhost:3000',
        description: process.env.NODE_ENV === 'production' 
          ? 'Serveur de production (Pages Router)' 
          : 'Serveur de développement (Pages Router)'
      }
    ],
    components: {
      schemas: {
        Product: {
          type: 'object',
          required: ['id', 'name', 'price', 'createdAt', 'updatedAt'],
          properties: {
            id: {
              type: 'integer',
              description: 'Identifiant unique du produit',
              example: 1
            },
            name: {
              type: 'string',
              description: 'Nom du produit',
              example: 'iPhone 15 Pro'
            },
            price: {
              type: 'number',
              format: 'float',
              description: 'Prix du produit en euros',
              example: 1199.99
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Date de création du produit',
              example: '2024-01-15T10:30:00.000Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Date de dernière modification',
              example: '2024-01-15T11:45:00.000Z'
            }
          }
        },
        ProductInput: {
          type: 'object',
          required: ['name', 'price'],
          properties: {
            name: {
              type: 'string',
              description: 'Nom du produit',
              example: 'iPhone 15 Pro',
              minLength: 1
            },
            price: {
              type: 'number',
              format: 'float',
              description: 'Prix du produit en euros',
              example: 1199.99,
              minimum: 0.01
            }
          }
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            data: {
              type: 'object',
              description: 'Données de la réponse'
            },
            message: {
              type: 'string',
              description: 'Message descriptif',
              example: 'Opération réussie'
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'string',
              description: 'Message d\'erreur',
              example: 'Une erreur est survenue'
            }
          }
        }
      }
    }
  },
  apis: ['./pages/api/**/*.ts']
}

export const swaggerSpec = swaggerJSDoc(options)
```

## Étape 5 : Migration des routes API

### 5.1 API Products - Liste et création (pages/api/products/index.ts)
```typescript
import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Récupérer la liste de tous les produits
 *     description: |
 *       Retourne la liste complète de tous les produits enregistrés en base de données,
 *       triés par date de création décroissante (plus récent en premier).
 *     tags:
 *       - Produits
 *     responses:
 *       200:
 *         description: Liste des produits récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *                 message:
 *                   type: string
 *                   example: "3 produit(s) trouvé(s)"
 *             examples:
 *               liste_vide:
 *                 summary: Liste vide
 *                 value:
 *                   success: true
 *                   data: []
 *                   message: "0 produit(s) trouvé(s)"
 *               liste_avec_produits:
 *                 summary: Liste avec produits
 *                 value:
 *                   success: true
 *                   data:
 *                     - id: 1
 *                       name: "iPhone 15 Pro"
 *                       price: 1199.99
 *                       createdAt: "2024-01-15T10:30:00.000Z"
 *                       updatedAt: "2024-01-15T10:30:00.000Z"
 *                     - id: 2
 *                       name: "MacBook Air M2"
 *                       price: 1299.99
 *                       createdAt: "2024-01-15T10:25:00.000Z"
 *                       updatedAt: "2024-01-15T10:25:00.000Z"
 *                   message: "2 produit(s) trouvé(s)"
 *       500:
 *         description: Erreur serveur lors de la récupération
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "Erreur lors de la récupération des produits"
 *   post:
 *     summary: Créer un nouveau produit
 *     description: |
 *       Crée un nouveau produit en base de données après validation des données.
 *       Le nom doit être une chaîne non vide et le prix un nombre positif.
 *     tags:
 *       - Produits
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductInput'
 *           examples:
 *             produit_simple:
 *               summary: Produit standard
 *               value:
 *                 name: "iPhone 15 Pro"
 *                 price: 1199.99
 *             produit_economique:
 *               summary: Produit économique
 *               value:
 *                 name: "Écouteurs basiques"
 *                 price: 19.99
 *     responses:
 *       201:
 *         description: Produit créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *                 message:
 *                   type: string
 *                   example: "Produit créé avec succès"
 *             example:
 *               success: true
 *               data:
 *                 id: 1
 *                 name: "iPhone 15 Pro"
 *                 price: 1199.99
 *                 createdAt: "2024-01-15T10:30:00.000Z"
 *                 updatedAt: "2024-01-15T10:30:00.000Z"
 *               message: "Produit créé avec succès"
 *       400:
 *         description: Données invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               nom_manquant:
 *                 summary: Nom manquant
 *                 value:
 *                   success: false
 *                   error: "Le nom du produit est requis et doit être une chaîne non vide"
 *               prix_invalide:
 *                 summary: Prix invalide
 *                 value:
 *                   success: false
 *                   error: "Le prix doit être un nombre positif"
 *       500:
 *         description: Erreur serveur lors de la création
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "Erreur lors de la création du produit"
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case 'GET':
      try {
        const products = await prisma.product.findMany({
          orderBy: {
            createdAt: 'desc'
          }
        })
        
        return res.status(200).json({
          success: true,
          data: products,
          message: `${products.length} produit(s) trouvé(s)`
        })
      } catch (error) {
        console.error('Erreur lors de la récupération des produits:', error)
        return res.status(500).json({
          success: false,
          error: 'Erreur lors de la récupération des produits'
        })
      }

    case 'POST':
      try {
        const { name, price } = req.body

        // Validation du nom
        if (!name || typeof name !== 'string' || name.trim().length === 0) {
          return res.status(400).json({
            success: false,
            error: 'Le nom du produit est requis et doit être une chaîne non vide'
          })
        }

        // Validation du prix
        if (!price || typeof price !== 'number' || price <= 0) {
          return res.status(400).json({
            success: false,
            error: 'Le prix doit être un nombre positif'
          })
        }

        // Créer le produit
        const product = await prisma.product.create({
          data: {
            name: name.trim(),
            price: price
          }
        })

        return res.status(201).json({
          success: true,
          data: product,
          message: 'Produit créé avec succès'
        })
      } catch (error) {
        console.error('Erreur lors de la création du produit:', error)
        return res.status(500).json({
          success: false,
          error: 'Erreur lors de la création du produit'
        })
      }

    default:
      res.setHeader('Allow', ['GET', 'POST'])
      return res.status(405).json({
        success: false,
        error: `Méthode ${req.method} non autorisée`
      })
  }
}
```

### 5.2 API Products - Opérations par ID (pages/api/products/[id].ts)
```typescript
import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Obtenir un produit par ID
 *     description: |
 *       Récupère les détails d'un produit spécifique par son identifiant.
 *       Retourne une erreur 404 si le produit n'existe pas.
 *     tags:
 *       - Produits
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Identifiant unique du produit à récupérer
 *         schema:
 *           type: integer
 *           minimum: 1
 *           example: 1
 *     responses:
 *       200:
 *         description: Produit trouvé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *                 message:
 *                   type: string
 *                   example: "Produit trouvé"
 *             example:
 *               success: true
 *               data:
 *                 id: 1
 *                 name: "iPhone 15 Pro"
 *                 price: 1199.99
 *                 createdAt: "2024-01-15T10:30:00.000Z"
 *                 updatedAt: "2024-01-15T10:30:00.000Z"
 *               message: "Produit trouvé"
 *       400:
 *         description: ID du produit invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "ID du produit invalide"
 *       404:
 *         description: Produit non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "Produit non trouvé"
 *   put:
 *     summary: Modifier un produit par ID
 *     description: |
 *       Met à jour un produit existant avec de nouvelles données.
 *       Vérifie l'existence du produit et valide les nouvelles données avant modification.
 *     tags:
 *       - Produits
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Identifiant unique du produit à modifier
 *         schema:
 *           type: integer
 *           minimum: 1
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductInput'
 *           examples:
 *             modification_simple:
 *               summary: Modification du nom et prix
 *               value:
 *                 name: "iPhone 15 Pro Max"
 *                 price: 1399.99
 *     responses:
 *       200:
 *         description: Produit modifié avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *                 message:
 *                   type: string
 *                   example: "Produit modifié avec succès"
 *       404:
 *         description: Produit non trouvé
 *   delete:
 *     summary: Supprimer un produit par ID
 *     description: |
 *       Supprime un produit de la base de données après vérification de son existence.
 *       Retourne une erreur si le produit n'existe pas ou si l'ID est invalide.
 *     tags:
 *       - Produits
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Identifiant unique du produit à supprimer
 *         schema:
 *           type: integer
 *           minimum: 1
 *           example: 1
 *     responses:
 *       200:
 *         description: Produit supprimé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Produit \"iPhone 15 Pro\" supprimé avec succès"
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query
  const productId = parseInt(id as string)

  // Validation de l'ID
  if (isNaN(productId) || productId <= 0) {
    return res.status(400).json({
      success: false,
      error: 'ID du produit invalide'
    })
  }

  switch (req.method) {
    case 'GET':
      try {
        const product = await prisma.product.findUnique({
          where: { id: productId }
        })

        if (!product) {
          return res.status(404).json({
            success: false,
            error: 'Produit non trouvé'
          })
        }

        return res.status(200).json({
          success: true,
          data: product,
          message: 'Produit trouvé'
        })
      } catch (error) {
        console.error('Erreur lors de la récupération du produit:', error)
        return res.status(500).json({
          success: false,
          error: 'Erreur lors de la récupération du produit'
        })
      }

    case 'PUT':
      try {
        // Vérifier si le produit existe
        const existingProduct = await prisma.product.findUnique({
          where: { id: productId }
        })

        if (!existingProduct) {
          return res.status(404).json({
            success: false,
            error: 'Produit non trouvé'
          })
        }

        const { name, price } = req.body

        // Validation des données
        if (!name || typeof name !== 'string' || name.trim().length === 0) {
          return res.status(400).json({
            success: false,
            error: 'Le nom du produit est requis et doit être une chaîne non vide'
          })
        }

        if (!price || typeof price !== 'number' || price <= 0) {
          return res.status(400).json({
            success: false,
            error: 'Le prix doit être un nombre positif'
          })
        }

        // Mettre à jour le produit
        const updatedProduct = await prisma.product.update({
          where: { id: productId },
          data: {
            name: name.trim(),
            price: price
          }
        })

        return res.status(200).json({
          success: true,
          data: updatedProduct,
          message: 'Produit modifié avec succès'
        })
      } catch (error) {
        console.error('Erreur lors de la modification du produit:', error)
        return res.status(500).json({
          success: false,
          error: 'Erreur lors de la modification du produit'
        })
      }

    case 'DELETE':
      try {
        // Vérifier si le produit existe
        const existingProduct = await prisma.product.findUnique({
          where: { id: productId }
        })

        if (!existingProduct) {
          return res.status(404).json({
            success: false,
            error: 'Produit non trouvé'
          })
        }

        // Supprimer le produit
        await prisma.product.delete({
          where: { id: productId }
        })

        return res.status(200).json({
          success: true,
          message: `Produit "${existingProduct.name}" supprimé avec succès`
        })
      } catch (error) {
        console.error('Erreur lors de la suppression du produit:', error)
        return res.status(500).json({
          success: false,
          error: 'Erreur lors de la suppression du produit'
        })
      }

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
      return res.status(405).json({
        success: false,
        error: `Méthode ${req.method} non autorisée`
      })
  }
}
```

### 5.3 API Products - Comptage (pages/api/products/count.ts)
```typescript
import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

/**
 * @swagger
 * /api/products/count:
 *   get:
 *     summary: Compter le nombre total de produits
 *     description: |
 *       Retourne le nombre total de produits enregistrés en base de données.
 *       Utile pour les statistiques et la pagination.
 *     tags:
 *       - Statistiques
 *     responses:
 *       200:
 *         description: Nombre de produits récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: Nombre total de produits
 *                       example: 15
 *                 message:
 *                   type: string
 *                   example: "15 produit(s) en base"
 *             examples:
 *               base_vide:
 *                 summary: Base de données vide
 *                 value:
 *                   success: true
 *                   data:
 *                     total: 0
 *                   message: "0 produit(s) en base"
 *               base_avec_produits:
 *                 summary: Base avec produits
 *                 value:
 *                   success: true
 *                   data:
 *                     total: 15
 *                   message: "15 produit(s) en base"
 *       500:
 *         description: Erreur serveur lors du comptage
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "Erreur lors du comptage des produits"
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({
      success: false,
      error: `Méthode ${req.method} non autorisée`
    })
  }

  try {
    const total = await prisma.product.count()
    
    return res.status(200).json({
      success: true,
      data: { total },
      message: `${total} produit(s) en base`
    })
  } catch (error) {
    console.error('Erreur lors du comptage des produits:', error)
    return res.status(500).json({
      success: false,
      error: 'Erreur lors du comptage des produits'
    })
  }
}
```

### 5.4 API Swagger (pages/api/swagger.ts)
```typescript
import { NextApiRequest, NextApiResponse } from 'next'
import { swaggerSpec } from '@/lib/swagger'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({
      success: false,
      error: `Méthode ${req.method} non autorisée`
    })
  }

  res.status(200).json(swaggerSpec)
}
```

## Étape 6 : Migration des layouts

### 6.1 Layout principal (pages/_app.tsx)
```tsx
import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import Head from 'next/head'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Laboratoire 2 - Pages Router</title>
        <meta name="description" content="Gestion de produits avec Next.js Pages Router" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <nav className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-8">
                <h1 className="text-xl font-bold text-gray-900">
                  Laboratoire 2 - Pages Router
                </h1>
                <div className="hidden md:flex space-x-6">
                  <a 
                    href="/" 
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Accueil
                  </a>
                  <a 
                    href="/products" 
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Produits
                  </a>
                  <a 
                    href="/api-docs" 
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    API Docs
                  </a>
                </div>
              </div>
            </div>
          </nav>
        </header>
        
        <main className="container mx-auto px-4 py-8">
          <Component {...pageProps} />
        </main>
        
        <footer className="bg-gray-800 text-white py-8 mt-12">
          <div className="container mx-auto px-4 text-center">
            <p>&copy; 2024 Laboratoire 2 - Pages Router. Tous droits réservés.</p>
            <p className="text-gray-400 text-sm mt-2">
              API REST avec documentation Swagger automatique
            </p>
          </div>
        </footer>
      </div>
    </>
  )
}
```

### 6.2 Document personnalisé (pages/_document.tsx)
```tsx
import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="fr">
      <Head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#000000" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
```

## Étape 7 : Migration des pages

### 7.1 Page d'accueil (pages/index.tsx)
```tsx
import { GetServerSideProps } from 'next'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

interface HomePageProps {
  totalProducts: number
  recentProducts: Array<{
    id: number
    name: string
    price: number
    createdAt: string
  }>
}

export default function HomePage({ totalProducts, recentProducts }: HomePageProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Gestion de Produits
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Application de démonstration avec Pages Router et documentation Swagger
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Total des produits
            </h3>
            <p className="text-3xl font-bold text-blue-600">{totalProducts}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              API REST
            </h3>
            <p className="text-sm text-gray-600">6 endpoints documentés</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Architecture
            </h3>
            <p className="text-sm text-gray-600">Pages Router</p>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/products"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Gérer les produits
          </Link>
          <Link
            href="/api-docs"
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            Documentation API
          </Link>
        </div>
      </div>

      {recentProducts.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Produits récents
          </h2>
          <div className="grid gap-4">
            {recentProducts.map((product) => (
              <div key={product.id} className="flex justify-between items-center p-4 border rounded-lg">
                <div>
                  <h3 className="font-semibold text-gray-900">{product.name}</h3>
                  <p className="text-sm text-gray-500">
                    Créé le {new Date(product.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-blue-600">
                    {product.price}€
                  </p>
                  <Link
                    href={`/products/${product.id}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Voir détail
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const totalProducts = await prisma.product.count()
    const recentProductsRaw = await prisma.product.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        price: true,
        createdAt: true
      }
    })

    // Sérialiser les dates
    const recentProducts = recentProductsRaw.map(product => ({
      ...product,
      createdAt: product.createdAt.toISOString()
    }))

    return {
      props: {
        totalProducts,
        recentProducts
      }
    }
  } catch (error) {
    console.error('Erreur lors du chargement des données:', error)
    return {
      props: {
        totalProducts: 0,
        recentProducts: []
      }
    }
  }
}
```

### 7.2 Page liste des produits (pages/products/index.tsx)
```tsx
import { GetServerSideProps } from 'next'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { useState } from 'react'

interface Product {
  id: number
  name: string
  price: number
  createdAt: string
  updatedAt: string
}

interface ProductsPageProps {
  products: Product[]
}

export default function ProductsPage({ products: initialProducts }: ProductsPageProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [loading, setLoading] = useState(false)

  const handleDelete = async (productId: number, productName: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${productName}" ?`)) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setProducts(products.filter(p => p.id !== productId))
        alert('Produit supprimé avec succès')
      } else {
        const data = await response.json()
        alert(`Erreur : ${data.error}`)
      }
    } catch (error) {
      alert('Erreur lors de la suppression')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Gestion des produits
        </h1>
        <Link
          href="/products/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Ajouter un produit
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Aucun produit trouvé
          </h2>
          <p className="text-gray-600 mb-4">
            Commencez par ajouter votre premier produit
          </p>
          <Link
            href="/products/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ajouter un produit
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prix
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date de création
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {product.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      ID: {product.id}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-semibold">
                      {product.price}€
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(product.createdAt).toLocaleDateString('fr-FR')}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(product.createdAt).toLocaleTimeString('fr-FR')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Link
                        href={`/products/${product.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Voir
                      </Link>
                      <Link
                        href={`/products/${product.id}/edit`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Modifier
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id, product.name)}
                        disabled={loading}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const productsRaw = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' }
    })

    // Sérialiser les dates
    const products = productsRaw.map(product => ({
      ...product,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString()
    }))

    return {
      props: {
        products
      }
    }
  } catch (error) {
    console.error('Erreur lors du chargement des produits:', error)
    return {
      props: {
        products: []
      }
    }
  }
}
```

### 7.3 Page détail produit (pages/products/[id].tsx)
```tsx
import { GetServerSideProps } from 'next'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { useState } from 'react'

interface Product {
  id: number
  name: string
  price: number
  createdAt: string
  updatedAt: string
}

interface ProductDetailPageProps {
  product: Product | null
}

export default function ProductDetailPage({ product }: ProductDetailPageProps) {
  const [loading, setLoading] = useState(false)

  if (!product) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Produit non trouvé
        </h1>
        <p className="text-gray-600 mb-6">
          Le produit que vous recherchez n'existe pas ou a été supprimé.
        </p>
        <Link
          href="/products"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retour à la liste
        </Link>
      </div>
    )
  }

  const handleDelete = async () => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${product.name}" ?`)) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        alert('Produit supprimé avec succès')
        window.location.href = '/products'
      } else {
        const data = await response.json()
        alert(`Erreur : ${data.error}`)
      }
    } catch (error) {
      alert('Erreur lors de la suppression')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">
            Détails du produit
          </h1>
        </div>
        
        <div className="px-6 py-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ID
              </label>
              <p className="text-sm text-gray-900">#{product.id}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom du produit
              </label>
              <p className="text-lg font-semibold text-gray-900">{product.name}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prix
              </label>
              <p className="text-2xl font-bold text-blue-600">{product.price}€</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de création
              </label>
              <p className="text-sm text-gray-900">
                {new Date(product.createdAt).toLocaleString('fr-FR')}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dernière modification
              </label>
              <p className="text-sm text-gray-900">
                {new Date(product.updatedAt).toLocaleString('fr-FR')}
              </p>
            </div>
          </div>
        </div>
        
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex space-x-3">
            <Link
              href={`/products/${product.id}/edit`}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Modifier
            </Link>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Suppression...' : 'Supprimer'}
            </button>
            <Link
              href="/products"
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Retour à la liste
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params!
  const productId = parseInt(id as string)

  if (isNaN(productId)) {
    return {
      props: {
        product: null
      }
    }
  }

  try {
    const productRaw = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!productRaw) {
      return {
        props: {
          product: null
        }
      }
    }

    // Sérialiser les dates
    const product = {
      ...productRaw,
      createdAt: productRaw.createdAt.toISOString(),
      updatedAt: productRaw.updatedAt.toISOString()
    }

    return {
      props: {
        product
      }
    }
  } catch (error) {
    console.error('Erreur lors du chargement du produit:', error)
    return {
      props: {
        product: null
      }
    }
  }
}
```

### 7.4 Page Swagger UI (pages/api-docs.tsx)
```tsx
'use client'

import dynamic from 'next/dynamic'
import React from 'react'
import 'swagger-ui-react/swagger-ui.css'

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false })

async function getSwaggerSpec() {
  try {
    const response = await fetch('/api/swagger', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    console.log('Swagger spec fetched successfully:', data)
    return data
  } catch (error) {
    console.error('Failed to fetch swagger spec:', error)
    throw error
  }
}

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Documentation API REST - Pages Router</h1>
      </div>
      <div style={{ padding: '0 2rem' }}>
        <SwaggerUIComponent />
      </div>
    </div>
  )
}

function SwaggerUIComponent() {
  const [spec, setSpec] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    getSwaggerSpec()
      .then((data) => {
        console.log('Swagger spec loaded:', data)
        setSpec(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Error loading swagger spec:', err)
        setError(err.message)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <div className="p-8 text-center">Chargement de la documentation...</div>
  }

  if (error) {
    return <div className="p-8 text-center text-red-600">Erreur : {error}</div>
  }

  if (!spec) {
    return <div className="p-8 text-center">Aucune documentation disponible</div>
  }

  return (
    <SwaggerUI
      spec={spec}
      deepLinking={true}
      displayRequestDuration={true}
      tryItOutEnabled={true}
    />
  )
}
```

## Étape 8 : Tests et validation

### 8.1 Démarrage du serveur
```bash
# Démarrer le serveur de développement
npm run dev

# Le serveur sera accessible à http://localhost:3000
```

### 8.2 Tests des endpoints API
```bash
# Test GET /api/products
curl http://localhost:3000/api/products

# Test POST /api/products
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Product", "price": 99.99}'

# Test GET /api/products/1
curl http://localhost:3000/api/products/1

# Test PUT /api/products/1
curl -X PUT http://localhost:3000/api/products/1 \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Product", "price": 149.99}'

# Test DELETE /api/products/1
curl -X DELETE http://localhost:3000/api/products/1

# Test GET /api/products/count
curl http://localhost:3000/api/products/count

# Test documentation Swagger
curl http://localhost:3000/api/swagger
```

### 8.3 Tests des pages
- **Page d'accueil :** http://localhost:3000
- **Liste des produits :** http://localhost:3000/products
- **Détail produit :** http://localhost:3000/products/1
- **Nouveau produit :** http://localhost:3000/products/new
- **Documentation Swagger :** http://localhost:3000/api-docs

### 8.4 Validation de la documentation Swagger
1. Aller sur http://localhost:3000/api-docs
2. Vérifier que tous les endpoints sont listés :
   - Section "Produits" avec 5 endpoints
   - Section "Statistiques" avec 1 endpoint
3. Tester chaque endpoint avec "Try it out"
4. Vérifier les schémas et exemples

## Étape 9 : Comparaison avec App Router

### 9.1 Différences structurelles

| Aspect | App Router (Original) | Pages Router (Migré) |
|--------|----------------------|---------------------|
| **Configuration** | `app/layout.tsx` | `pages/_app.tsx` + `pages/_document.tsx` |
| **Routes API** | `app/api/products/route.ts` | `pages/api/products/index.ts` |
| **Pages** | `app/products/page.tsx` | `pages/products/index.tsx` |
| **Paramètres dynamiques** | `app/products/[id]/page.tsx` | `pages/products/[id].tsx` |
| **Méthodes HTTP** | Fonctions séparées (GET, POST) | Switch dans handler() |
| **Données serveur** | Composants serveur async | getServerSideProps |

### 9.2 Avantages et inconvénients observés

**Pages Router (Migration) :**
- ✅ Plus simple à comprendre initialement
- ✅ Documentation abondante
- ✅ Compatible avec toutes les bibliothèques
- ❌ Une seule fonction pour toutes les méthodes HTTP
- ❌ getServerSideProps plus verbeux
- ❌ Layouts moins flexibles

**App Router (Original) :**
- ✅ Méthodes HTTP séparées (plus clair)
- ✅ Composants serveur (performance)
- ✅ Layouts imbriqués
- ✅ Streaming et Suspense
- ❌ Courbe d'apprentissage plus élevée
- ❌ Moins d'exemples disponibles

## Étape 10 : Déploiement

### 10.1 Préparation pour la production
```bash
# Build de production
npm run build

# Test du build
npm start
```

### 10.2 Configuration Vercel
```json
{
  "name": "laboratoire2-pages-router",
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "env": {
    "DATABASE_URL": "@database-url"
  }
}
```

### 10.3 Variables d'environnement Vercel
```bash
# Ajouter la variable de base de données dans Vercel Dashboard
DATABASE_URL=postgresql://...

# Mettre à jour l'URL du serveur dans lib/swagger.ts
```

## Conclusion

Cette migration complète de App Router vers Pages Router démontre les différences pratiques entre les deux approches. Bien que Pages Router soit plus simple à appréhender initialement, App Router offre des avantages significatifs en termes de structure et de performance.

### Points clés de la migration

1. **Structure des fichiers :** Migration de `app/` vers `pages/`
2. **Routes API :** Consolidation des méthodes HTTP dans des handlers uniques
3. **Layouts :** Passage des layouts imbriqués à un layout global unique
4. **Récupération de données :** Remplacement des composants serveur par getServerSideProps
5. **Documentation Swagger :** Adaptation de la configuration pour Pages Router

### Recommandations

- **Pour l'apprentissage :** Pages Router peut être plus accessible initialement
- **Pour la production :** App Router offre de meilleures performances et évolutivité
- **Pour la maintenance :** App Router avec ses méthodes HTTP séparées est plus maintenable

Cette migration exhaustive permet de comprendre les deux approches et de faire un choix éclairé selon le contexte du projet.
