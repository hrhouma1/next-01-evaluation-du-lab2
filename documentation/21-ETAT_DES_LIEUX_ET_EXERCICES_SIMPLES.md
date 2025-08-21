# État des lieux et exercices simples - Documentation Swagger

## Entités existantes

### Product (Unique entité)
Structure dans `prisma/schema.prisma` :
```prisma
model Product {
  id        Int      @id @default(autoincrement())
  name      String
  price     Float
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## Endpoints entièrement documentés

### CRUD Products - Tous documentés
| Endpoint | Méthode | Description | Statut |
|----------|---------|-------------|--------|
| `/api/products` | GET | Liste tous les produits | Documenté complet |
| `/api/products` | POST | Créer un nouveau produit | Documenté complet |
| `/api/products/[id]` | GET | Obtenir un produit par ID | Documenté complet |
| `/api/products/[id]` | PUT | Modifier un produit | Documenté complet |
| `/api/products/[id]` | DELETE | Supprimer un produit | Documenté complet |
| `/api/products/count` | GET | Compter les produits | Documenté complet |

### Endpoints utilitaires
| Endpoint | Méthode | Description | Statut |
|----------|---------|-------------|--------|
| `/api/swagger` | GET | Configuration Swagger | Technique (pas de doc nécessaire) |

## Éléments de documentation existants

### Schémas définis dans lib/swagger.ts
- `Product` : Objet produit complet
- `ProductInput` : Données de création/modification
- `SuccessResponse` : Structure de réponse de succès
- `ErrorResponse` : Structure de réponse d'erreur

### Tags organisés
- `Produits` : Opérations CRUD
- `Statistiques` : Comptage et métriques

## Constat : Documentation complète

Tous les endpoints métier existants sont parfaitement documentés avec :
- Descriptions complètes
- Schémas de requête et réponse
- Exemples multiples
- Codes d'erreur documentés
- Interface Swagger fonctionnelle

## Exercices pratiques - Nouveaux endpoints simples

### Exercice 1 : Endpoint de recherche par nom

**Objectif :** Créer un endpoint de recherche simple
**Difficulté :** Facile
**Durée :** 30 minutes

#### Étape 1 : Créer l'endpoint (15 min)
Fichier : `app/api/products/search/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''

    const products = await prisma.product.findMany({
      where: {
        name: {
          contains: query,
          mode: 'insensitive'
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: products,
      message: `${products.length} produit(s) trouvé(s) pour "${query}"`
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la recherche'
      },
      { status: 500 }
    )
  }
}
```

#### Étape 2 : Documenter avec Swagger (15 min)
Ajouter AVANT la fonction GET :

```typescript
/**
 * @swagger
 * /api/products/search:
 *   get:
 *     summary: Rechercher des produits par nom
 *     description: Recherche des produits dont le nom contient la chaîne fournie
 *     tags:
 *       - Produits
 *     parameters:
 *       - name: q
 *         in: query
 *         required: false
 *         description: Terme de recherche
 *         schema:
 *           type: string
 *           example: iPhone
 *     responses:
 *       200:
 *         description: Recherche effectuée avec succès
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
 *                   example: "2 produit(s) trouvé(s) pour \"iPhone\""
 */
```

#### Étape 3 : Tester
1. Redémarrer : `npm run dev`
2. Aller sur `/api-docs`
3. Tester l'endpoint avec différents termes de recherche

### Exercice 2 : Endpoint de prix minimum et maximum

**Objectif :** Endpoint qui retourne le prix min et max
**Difficulté :** Facile
**Durée :** 25 minutes

#### Étape 1 : Créer l'endpoint (15 min)
Fichier : `app/api/products/price-range/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const result = await prisma.product.aggregate({
      _min: {
        price: true
      },
      _max: {
        price: true
      },
      _avg: {
        price: true
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        minPrice: result._min.price || 0,
        maxPrice: result._max.price || 0,
        avgPrice: result._avg.price || 0
      },
      message: 'Analyse des prix effectuée'
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de l\'analyse des prix'
      },
      { status: 500 }
    )
  }
}
```

#### Étape 2 : Documenter (10 min)
```typescript
/**
 * @swagger
 * /api/products/price-range:
 *   get:
 *     summary: Obtenir la gamme des prix
 *     description: Retourne le prix minimum, maximum et moyen
 *     tags:
 *       - Statistiques
 *     responses:
 *       200:
 *         description: Analyse des prix effectuée avec succès
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
 *                     minPrice:
 *                       type: number
 *                       example: 19.99
 *                     maxPrice:
 *                       type: number
 *                       example: 1399.99
 *                     avgPrice:
 *                       type: number
 *                       example: 456.78
 *                 message:
 *                   type: string
 *                   example: "Analyse des prix effectuée"
 */
```

### Exercice 3 : Endpoint pour les produits récents

**Objectif :** Obtenir les X produits les plus récents
**Difficulté :** Facile
**Durée :** 30 minutes

#### Étape 1 : Créer l'endpoint (20 min)
Fichier : `app/api/products/recent/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limitParam = searchParams.get('limit')
    const limit = limitParam ? parseInt(limitParam) : 5

    // Valider la limite
    if (limit <= 0 || limit > 50) {
      return NextResponse.json(
        {
          success: false,
          error: 'La limite doit être entre 1 et 50'
        },
        { status: 400 }
      )
    }

    const products = await prisma.product.findMany({
      take: limit,
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: products,
      message: `${products.length} produit(s) récent(s) récupéré(s)`
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la récupération des produits récents'
      },
      { status: 500 }
    )
  }
}
```

#### Étape 2 : Documenter (10 min)
```typescript
/**
 * @swagger
 * /api/products/recent:
 *   get:
 *     summary: Obtenir les produits récents
 *     description: Retourne les produits les plus récemment créés
 *     tags:
 *       - Produits
 *     parameters:
 *       - name: limit
 *         in: query
 *         required: false
 *         description: Nombre de produits à retourner (max 50)
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 5
 *           example: 10
 *     responses:
 *       200:
 *         description: Produits récents récupérés avec succès
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
 *                   example: "5 produit(s) récent(s) récupéré(s)"
 *       400:
 *         description: Paramètre limite invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
```

## Exercices bonus (si temps restant)

### Bonus 1 : Endpoint de suppression en masse
`DELETE /api/products/bulk`
- Supprimer plusieurs produits par leurs IDs
- Documentation avec tableau d'IDs en entrée

### Bonus 2 : Endpoint de mise à jour de prix en pourcentage
`PATCH /api/products/[id]/price`
- Augmenter/diminuer le prix d'un pourcentage
- Documentation avec paramètre percentage

### Bonus 3 : Endpoint de produits par gamme de prix
`GET /api/products/by-price-range`
- Paramètres min et max en query
- Documentation avec validation des paramètres

## Instructions pour les exercices

### Organisation
1. Travail individuel ou en binômes
2. Faire les exercices dans l'ordre
3. Tester chaque endpoint avant de passer au suivant

### Validation
Pour chaque exercice :
1. Code fonctionne sans erreur
2. Documentation Swagger complète
3. Test réussi dans l'interface `/api-docs`
4. Exemples testés avec différentes valeurs

### Aide
- Utiliser les endpoints existants comme modèles
- Consulter les schémas dans `lib/swagger.ts`
- Redémarrer le serveur après chaque modification
- Vérifier la console pour les erreurs

### Critères de réussite
- Endpoint accessible et fonctionnel
- Documentation visible dans Swagger UI
- Bouton "Try it out" fonctionne
- Réponses conformes aux exemples documentés
