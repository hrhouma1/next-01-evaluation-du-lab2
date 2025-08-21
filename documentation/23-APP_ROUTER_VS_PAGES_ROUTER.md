# App Router vs Pages Router - Guide complet Next.js

## Introduction

Next.js propose deux systèmes de routing pour organiser les pages et APIs de votre application. Ce document explique en détail les différences, avantages et inconvénients de chaque approche.

## Historique et contexte

### Pages Router
- Introduit avec Next.js 1.0 en 2016
- Système de routing basé sur les fichiers dans le dossier `pages/`
- Standard pendant 6 ans jusqu'à Next.js 13
- Actuellement en mode maintenance

### App Router
- Introduit avec Next.js 13.0 en octobre 2022
- Nouveau système basé sur le dossier `app/`
- Recommandé par Vercel pour tous les nouveaux projets
- Approche moderne avec composants serveur React

## Structure des projets

### Notre projet actuel (App Router)

```
laboratoire2/
├── app/
│   ├── layout.tsx              # Layout racine global
│   ├── page.tsx               # Page d'accueil (/)
│   ├── globals.css            # Styles CSS globaux
│   ├── api/                   # Dossier des routes API
│   │   ├── products/
│   │   │   ├── route.ts       # GET/POST /api/products
│   │   │   ├── count/
│   │   │   │   └── route.ts   # GET /api/products/count
│   │   │   └── [id]/
│   │   │       └── route.ts   # GET/PUT/DELETE /api/products/[id]
│   │   └── swagger/
│   │       └── route.ts       # GET /api/swagger
│   ├── products/              # Pages interface utilisateur
│   │   ├── page.tsx          # Liste produits (/products)
│   │   ├── [id]/
│   │   │   ├── page.tsx      # Détail produit (/products/123)
│   │   │   └── edit/
│   │   │       └── page.tsx  # Edition (/products/123/edit)
│   │   └── new/
│   │       └── page.tsx      # Nouveau produit (/products/new)
│   └── api-docs/
│       └── page.tsx          # Documentation Swagger (/api-docs)
├── lib/
├── prisma/
└── autres fichiers...
```

### Même projet en Pages Router (hypothétique)

```
laboratoire2/
├── pages/
│   ├── _app.tsx               # Layout global unique
│   ├── _document.tsx          # Configuration HTML
│   ├── index.tsx              # Page d'accueil (/)
│   ├── api/                   # Routes API (même principe)
│   │   ├── products/
│   │   │   ├── index.ts       # GET/POST /api/products
│   │   │   ├── count.ts       # GET /api/products/count
│   │   │   └── [id].ts        # GET/PUT/DELETE /api/products/[id]
│   │   └── swagger.ts         # GET /api/swagger
│   ├── products/              # Pages interface utilisateur
│   │   ├── index.tsx          # Liste produits (/products)
│   │   ├── [id].tsx           # Détail produit (/products/123)
│   │   ├── [id]/
│   │   │   └── edit.tsx       # Edition (/products/123/edit)
│   │   └── new.tsx            # Nouveau produit (/products/new)
│   └── api-docs.tsx           # Documentation Swagger (/api-docs)
├── styles/
│   └── globals.css            # Styles dans un dossier séparé
├── lib/
├── prisma/
└── autres fichiers...
```

## Fichiers spéciaux et conventions

### App Router - Fichiers spéciaux

| Fichier | Rôle | Exemple d'utilisation |
|---------|------|----------------------|
| `layout.tsx` | Layout partagé | Navigation, header, footer |
| `page.tsx` | Page accessible publiquement | Contenu de la page |
| `loading.tsx` | Interface de chargement | Skeleton, spinner |
| `error.tsx` | Page d'erreur | Gestion des erreurs |
| `not-found.tsx` | Page 404 | Erreur page non trouvée |
| `route.ts` | Route API | Endpoints REST |
| `middleware.ts` | Middleware | Authentification, redirections |
| `global-error.tsx` | Erreur globale | Erreurs non capturées |

### Pages Router - Fichiers spéciaux

| Fichier | Rôle | Équivalent App Router |
|---------|------|----------------------|
| `_app.tsx` | Layout global unique | `app/layout.tsx` |
| `_document.tsx` | Structure HTML | `app/layout.tsx` |
| `_error.tsx` | Page d'erreur personnalisée | `error.tsx` |
| `404.tsx` | Page 404 personnalisée | `not-found.tsx` |
| `500.tsx` | Page erreur serveur | `global-error.tsx` |
| `[...slug].tsx` | Catch-all routes | `[...slug]/page.tsx` |

## Routing et navigation

### App Router - Convention de nommage

```
app/
├── page.tsx                    → /
├── products/
│   ├── page.tsx               → /products
│   ├── [id]/
│   │   ├── page.tsx           → /products/123
│   │   └── edit/
│   │       └── page.tsx       → /products/123/edit
│   ├── new/
│   │   └── page.tsx           → /products/new
│   └── [category]/
│       └── [id]/
│           └── page.tsx       → /products/electronique/123
```

### Pages Router - Convention de nommage

```
pages/
├── index.tsx                  → /
├── products/
│   ├── index.tsx              → /products
│   ├── [id].tsx               → /products/123
│   ├── [id]/
│   │   └── edit.tsx           → /products/123/edit
│   ├── new.tsx                → /products/new
│   └── [category]/
│       └── [id].tsx           → /products/electronique/123
```

## Gestion des layouts

### App Router - Layouts imbriqués (Notre approche)

#### Layout racine (app/layout.tsx)
```tsx
import './globals.css'

export const metadata = {
  title: 'Laboratoire 2',
  description: 'Gestion de produits avec Next.js'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <nav className="container mx-auto p-4">
            <h1 className="text-xl font-bold">Laboratoire 2</h1>
          </nav>
        </header>
        <main className="container mx-auto p-4">
          {children}
        </main>
        <footer className="bg-gray-800 text-white p-4 mt-8">
          <p className="text-center">© 2024 Laboratoire 2</p>
        </footer>
      </body>
    </html>
  )
}
```

#### Layout spécifique produits (app/products/layout.tsx)
```tsx
export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="products-container">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Gestion des produits</h2>
        <nav className="flex space-x-4">
          <a href="/products" className="text-blue-600 hover:underline">
            Liste
          </a>
          <a href="/products/new" className="text-blue-600 hover:underline">
            Nouveau
          </a>
        </nav>
      </div>
      {children}
    </div>
  )
}
```

### Pages Router - Layout unique

#### Layout global uniquement (pages/_app.tsx)
```tsx
import '../styles/globals.css'
import type { AppProps } from 'next/app'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <header className="bg-white shadow">
        <nav className="container mx-auto p-4">
          <h1 className="text-xl font-bold">Laboratoire 2</h1>
        </nav>
      </header>
      
      <main className="container mx-auto p-4">
        {/* Pour avoir une navigation spécifique aux produits, 
             il faut l'ajouter dans chaque page de produit */}
        <Component {...pageProps} />
      </main>
      
      <footer className="bg-gray-800 text-white p-4 mt-8">
        <p className="text-center">© 2024 Laboratoire 2</p>
      </footer>
    </>
  )
}
```

## Routes API - Comparaison détaillée

### App Router - Routes API (Notre méthode)

#### Fichier app/api/products/route.ts
```tsx
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Fonction dédiée pour GET
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json({
      success: true,
      data: products,
      message: `${products.length} produit(s) trouvé(s)`
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// Fonction dédiée pour POST
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, price } = body

    // Validation
    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Nom invalide' },
        { status: 400 }
      )
    }

    const product = await prisma.product.create({
      data: { name: name.trim(), price }
    })

    return NextResponse.json(
      {
        success: true,
        data: product,
        message: 'Produit créé avec succès'
      },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// PUT et DELETE seraient dans des fonctions séparées également
```

#### Fichier app/api/products/[id]/route.ts
```tsx
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id)
  
  if (isNaN(id)) {
    return NextResponse.json(
      { success: false, error: 'ID invalide' },
      { status: 400 }
    )
  }

  const product = await prisma.product.findUnique({
    where: { id }
  })

  if (!product) {
    return NextResponse.json(
      { success: false, error: 'Produit non trouvé' },
      { status: 404 }
    )
  }

  return NextResponse.json({
    success: true,
    data: product,
    message: 'Produit trouvé'
  })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Logique de mise à jour...
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Logique de suppression...
}
```

### Pages Router - Routes API (Alternative)

#### Fichier pages/api/products/index.ts
```tsx
import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Une seule fonction pour toutes les méthodes HTTP
  switch (req.method) {
    case 'GET':
      try {
        const products = await prisma.product.findMany({
          orderBy: { createdAt: 'desc' }
        })
        
        return res.status(200).json({
          success: true,
          data: products,
          message: `${products.length} produit(s) trouvé(s)`
        })
      } catch (error) {
        return res.status(500).json({
          success: false,
          error: 'Erreur serveur'
        })
      }

    case 'POST':
      try {
        const { name, price } = req.body

        // Validation
        if (!name || typeof name !== 'string') {
          return res.status(400).json({
            success: false,
            error: 'Nom invalide'
          })
        }

        const product = await prisma.product.create({
          data: { name: name.trim(), price }
        })

        return res.status(201).json({
          success: true,
          data: product,
          message: 'Produit créé avec succès'
        })
      } catch (error) {
        return res.status(500).json({
          success: false,
          error: 'Erreur serveur'
        })
      }

    default:
      // Méthode HTTP non autorisée
      res.setHeader('Allow', ['GET', 'POST'])
      return res.status(405).json({
        success: false,
        error: `Méthode ${req.method} non autorisée`
      })
  }
}
```

#### Fichier pages/api/products/[id].ts
```tsx
import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query
  const productId = parseInt(id as string)

  if (isNaN(productId)) {
    return res.status(400).json({
      success: false,
      error: 'ID invalide'
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
        return res.status(500).json({
          success: false,
          error: 'Erreur serveur'
        })
      }

    case 'PUT':
      // Logique de mise à jour...
      break

    case 'DELETE':
      // Logique de suppression...
      break

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
      return res.status(405).json({
        success: false,
        error: `Méthode ${req.method} non autorisée`
      })
  }
}
```

## Documentation Swagger - Impact du routing

### App Router - Documentation plus claire

Avec App Router, chaque méthode HTTP est une fonction séparée, donc la documentation JSDoc est plus précise :

```tsx
/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Récupérer tous les produits
 *     description: Retourne la liste complète des produits
 *     tags: [Produits]
 *     responses:
 *       200:
 *         description: Succès
 */
export async function GET() {
  // Logique GET uniquement
}

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Créer un produit
 *     description: Crée un nouveau produit
 *     tags: [Produits]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductInput'
 */
export async function POST(request: NextRequest) {
  // Logique POST uniquement
}
```

### Pages Router - Documentation groupée

Avec Pages Router, toutes les méthodes sont dans une fonction, donc documentation plus complexe :

```tsx
/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Récupérer tous les produits
 *     responses:
 *       200:
 *         description: Succès
 *   post:
 *     summary: Créer un produit
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductInput'
 */
export default async function handler(req, res) {
  switch (req.method) {
    case 'GET':
      // Logique GET
    case 'POST':
      // Logique POST
  }
}
```

## Composants et pages

### App Router - Composants serveur par défaut

```tsx
// app/products/page.tsx - Composant serveur par défaut
import { prisma } from '@/lib/prisma'

// Cette fonction s'exécute côté serveur
export default async function ProductsPage() {
  // Fetch direct en base de données côté serveur
  const products = await prisma.product.findMany()

  return (
    <div>
      <h1>Liste des produits</h1>
      <div className="grid gap-4">
        {products.map(product => (
          <div key={product.id} className="p-4 border rounded">
            <h2>{product.name}</h2>
            <p>{product.price}€</p>
          </div>
        ))}
      </div>
    </div>
  )
}
```

### Pages Router - Composants client avec getServerSideProps

```tsx
// pages/products/index.tsx
import { GetServerSideProps } from 'next'
import { prisma } from '@/lib/prisma'

interface ProductsPageProps {
  products: Array<{
    id: number
    name: string
    price: number
  }>
}

export default function ProductsPage({ products }: ProductsPageProps) {
  return (
    <div>
      <h1>Liste des produits</h1>
      <div className="grid gap-4">
        {products.map(product => (
          <div key={product.id} className="p-4 border rounded">
            <h2>{product.name}</h2>
            <p>{product.price}€</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// Cette fonction s'exécute côté serveur à chaque requête
export const getServerSideProps: GetServerSideProps = async () => {
  const products = await prisma.product.findMany()

  return {
    props: {
      products: JSON.parse(JSON.stringify(products))
    }
  }
}
```

## Performance et optimisations

### App Router - Avantages performance

**1. Streaming et Suspense**
```tsx
// app/products/loading.tsx
export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded mb-4"></div>
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-20 bg-gray-200 rounded"></div>
        ))}
      </div>
    </div>
  )
}
```

**2. Composants serveur (réduction du JavaScript côté client)**
```tsx
// Ce composant ne génère pas de JavaScript côté client
export default async function ServerComponent() {
  const data = await fetch('https://api.exemple.com/data')
  return <div>{data}</div>
}
```

**3. Optimisations automatiques**
- Tree-shaking amélioré
- Bundle splitting automatique
- Lazy loading des composants

### Pages Router - Méthodes d'optimisation

**1. Static Site Generation (SSG)**
```tsx
export const getStaticProps: GetStaticProps = async () => {
  const products = await prisma.product.findMany()
  
  return {
    props: { products },
    revalidate: 60 // Revalidation toutes les 60 secondes
  }
}
```

**2. Incremental Static Regeneration (ISR)**
```tsx
export const getStaticPaths: GetStaticPaths = async () => {
  const products = await prisma.product.findMany()
  
  const paths = products.map(product => ({
    params: { id: product.id.toString() }
  }))

  return {
    paths,
    fallback: 'blocking'
  }
}
```

## Migration d'un système à l'autre

### De Pages Router vers App Router

**Étapes principales :**

1. **Créer le dossier app/**
```bash
mkdir app
```

2. **Migrer les layouts**
```tsx
// pages/_app.tsx → app/layout.tsx
// pages/_document.tsx → intégré dans app/layout.tsx
```

3. **Migrer les pages**
```tsx
// pages/index.tsx → app/page.tsx
// pages/products/index.tsx → app/products/page.tsx
// pages/products/[id].tsx → app/products/[id]/page.tsx
```

4. **Migrer les APIs**
```tsx
// pages/api/products.ts → app/api/products/route.ts
// Séparer les méthodes HTTP en fonctions distinctes
```

5. **Mise à jour des imports et configurations**

### D'App Router vers Pages Router (non recommandé)

L'inverse est possible mais non recommandé car vous perdriez :
- Les composants serveur
- Les layouts imbriqués
- Les optimisations modernes
- Le support futur

## Comparaison finale - Tableau récapitulatif

| Aspect | App Router (Notre choix) | Pages Router |
|--------|--------------------------|--------------|
| **Introduction** | Next.js 13+ (2022) | Next.js 1+ (2016) |
| **Statut** | Recommandé, futur | Maintenance |
| **Structure** | app/ folder | pages/ folder |
| **Layouts** | Imbriqués, multiples niveaux | Un seul niveau (_app.tsx) |
| **Routes API** | Fonctions HTTP séparées | Une fonction avec switch |
| **Performance** | Composants serveur, streaming | SSG, ISR, CSR |
| **Documentation Swagger** | Plus claire (fonctions séparées) | Groupée (une fonction) |
| **Courbe d'apprentissage** | Moyenne | Facile |
| **Ressources/Exemples** | Moins nombreuses | Très nombreuses |
| **Support long terme** | Excellent | Limité |
| **Compatibilité bibliothèques** | Excellente (amélioration continue) | Parfaite |

## Recommandations

### Pour nouveaux projets (Notre cas)
**Choisir App Router si :**
- Nouveau projet ou refactoring majeur
- Équipe prête à apprendre les nouvelles concepts
- Performance et SEO critiques
- Projet destiné à évoluer sur plusieurs années

### Pour projets existants
**Garder Pages Router si :**
- Projet en production stable
- Équipe pressée par les délais
- Beaucoup de dépendances spécifiques à Pages Router
- Migration non justifiée par les bénéfices

## Conclusion

Dans notre laboratoire, nous utilisons **App Router** car :

1. **Apprentissage moderne** : Les étudiants apprennent les technologies actuelles
2. **Documentation Swagger optimale** : Fonctions HTTP séparées = documentation plus claire
3. **Performance** : Composants serveur, streaming, optimisations automatiques
4. **Évolutivité** : Support à long terme garanti par Vercel
5. **Structure logique** : Layouts imbriqués, organisation par fonctionnalité

App Router représente l'avenir de Next.js et prépare mieux les étudiants aux projets professionnels modernes. Bien que Pages Router reste valide, App Router offre une expérience de développement supérieure et des performances améliorées.

Notre choix pédagogique d'App Router permet aux étudiants d'acquérir des compétences alignées sur les standards actuels de l'industrie.
