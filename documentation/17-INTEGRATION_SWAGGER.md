# Intégration Swagger/OpenAPI - Documentation automatique des APIs

Ce guide détaille l'ajout de Swagger UI pour documenter automatiquement vos endpoints REST. Nous commencerons par documenter un seul endpoint (GET /api/products), puis étendrons progressivement à tous les autres.

Swagger UI est un outil standard dans l'industrie qui génère une interface web interactive pour tester et documenter les APIs REST. Il lit les annotations dans votre code et crée automatiquement une documentation complète.

---

## Objectif

Créer une documentation interactive et automatique de vos APIs REST accessible via une interface web, permettant de :
- Visualiser tous les endpoints disponibles
- Comprendre les formats de requête et réponse
- Tester directement les endpoints depuis le navigateur
- Voir des exemples concrets d'utilisation
- Valider les schémas de données

---

## 1. Installation des dépendances

### 1.1 Comprendre les packages requis

**swagger-ui-react :**
- Interface utilisateur web pour afficher la documentation
- Permet de tester les endpoints directement dans le navigateur
- Génère automatiquement des formulaires de test
- Affiche les schémas de données de manière lisible

**swagger-jsdoc :**
- Parse les commentaires JSDoc dans votre code TypeScript
- Génère un objet JSON conforme à la spécification OpenAPI 3.0
- Combine les annotations avec la configuration de base
- Crée le "spec" utilisé par Swagger UI

### 1.2 Installation étape par étape

**Commande 1 - Packages principaux :**
```bash
npm install swagger-ui-react swagger-jsdoc
```

**Commande 2 - Types TypeScript :**
```bash
npm install -D @types/swagger-ui-react @types/swagger-jsdoc
```

**Pourquoi les types ?**
- Permettent l'auto-complétion dans VS Code
- Détectent les erreurs de typage à la compilation
- Rendent le développement plus sûr et rapide

### 1.3 Vérification de l'installation

Après installation, votre `package.json` doit contenir :

```json
{
  "dependencies": {
    "swagger-jsdoc": "^6.2.8",
    "swagger-ui-react": "^5.10.5"
  },
  "devDependencies": {
    "@types/swagger-jsdoc": "^6.0.4",
    "@types/swagger-ui-react": "^5.0.1"
  }
}
```

**Vérification pratique :**
```bash
# Vérifier que les packages sont installés
npm list swagger-ui-react swagger-jsdoc
```

### 1.4 Redémarrage nécessaire

Après installation, redémarrez votre serveur de développement :
```bash
# Arrêter le serveur (Ctrl+C)
# Puis relancer
npm run dev
```

---

## 2. Configuration de base

### 2.1 Comprendre la structure Swagger/OpenAPI

**OpenAPI 3.0** est une spécification standardisée pour décrire les APIs REST. Elle définit :
- Les endpoints disponibles (chemins et méthodes HTTP)
- Les formats de requête et réponse
- Les codes d'erreur possibles
- Les schémas de données
- Les exemples d'utilisation

**Structure d'un spec OpenAPI :**
```yaml
openapi: 3.0.0
info:           # Métadonnées de l'API
servers:        # URLs des serveurs (dev, prod)
components:     # Schémas réutilisables
paths:          # Endpoints (généré depuis les commentaires JSDoc)
```

### 2.2 Créer le fichier de configuration Swagger

**Emplacement :** `lib/swagger.ts`
**Rôle :** Configuration centrale de la documentation API

Créer le fichier `lib/swagger.ts` et copier ce code :

```typescript
import swaggerJSDoc from 'swagger-jsdoc'

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Laboratoire 2 - API REST',
      version: '1.0.0',
      description: 'Documentation des services web REST pour la gestion de produits',
      contact: {
        name: 'Équipe de développement',
        email: 'contact@exemple.com'
      }
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://next-01-evaluation-du-lab2.vercel.app'
          : 'http://localhost:3000',
        description: process.env.NODE_ENV === 'production' 
          ? 'Serveur de production' 
          : 'Serveur de développement'
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
  apis: ['./app/api/**/*.ts']
}

export const swaggerSpec = swaggerJSDoc(options)
```

**Explication ligne par ligne :**

**Import :**
```typescript
import swaggerJSDoc from 'swagger-jsdoc'
```
Importe la fonction qui va parser nos commentaires JSDoc et générer le spec OpenAPI.

**Configuration info :**
```typescript
info: {
  title: 'Laboratoire 2 - API REST',
  version: '1.0.0',
  description: 'Documentation des services web REST pour la gestion de produits'
}
```
- `title` : Nom affiché en haut de la documentation
- `version` : Version de votre API (important pour le versioning)
- `description` : Description générale visible sur la page d'accueil

**Configuration serveurs :**
```typescript
servers: [
  {
    url: process.env.NODE_ENV === 'production' 
      ? 'https://next-01-evaluation-du-lab2.vercel.app'
      : 'http://localhost:3000',
    description: process.env.NODE_ENV === 'production' 
      ? 'Serveur de production' 
      : 'Serveur de développement'
  }
]
```
**Pourquoi cette logique ?**
- En développement : utilise `localhost:3000`
- En production : utilise l'URL Vercel
- Permet de tester sur le bon serveur selon l'environnement

**Schémas Product :**
```typescript
Product: {
  type: 'object',
  required: ['id', 'name', 'price', 'createdAt', 'updatedAt'],
  properties: {
    id: {
      type: 'integer',
      description: 'Identifiant unique du produit',
      example: 1
    }
  }
}
```
**Pourquoi définir des schémas ?**
- Réutilisables dans tous les endpoints
- Garantit la cohérence de la documentation
- Auto-complétion dans l'interface Swagger
- Validation automatique des formats

**APIs path :**
```typescript
apis: ['./app/api/**/*.ts']
```
Indique à swagger-jsdoc où chercher les commentaires de documentation (tous les fichiers .ts dans app/api/).

### 2.3 Créer la page Swagger UI

**Emplacement :** `app/api-docs/page.tsx`
**Rôle :** Interface web pour afficher la documentation

Créer le fichier `app/api-docs/page.tsx` et copier ce code :

```tsx
'use client'

import dynamic from 'next/dynamic'
import React from 'react'

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false })

async function getSwaggerSpec() {
  const response = await fetch('/api/swagger')
  return response.json()
}

export default function ApiDocsPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Documentation API REST</h1>
      <div className="bg-white rounded-lg shadow">
        <SwaggerUIComponent />
      </div>
    </div>
  )
}

function SwaggerUIComponent() {
  const [spec, setSpec] = React.useState(null)

  React.useEffect(() => {
    getSwaggerSpec().then(setSpec)
  }, [])

  if (!spec) {
    return <div className="p-8 text-center">Chargement de la documentation...</div>
  }

  return (
    <SwaggerUI
      spec={spec}
      deepLinking={true}
      displayRequestDuration={true}
    />
  )
}
```

**Explication détaillée du code :**

**'use client' :**
```tsx
'use client'
```
**Pourquoi ?** Swagger UI utilise des APIs du navigateur (DOM, fetch) qui ne sont pas disponibles côté serveur. Cette directive indique à Next.js d'exécuter ce composant côté client.

**Import dynamique :**
```tsx
const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false })
```
**Pourquoi dynamic ?**
- `swagger-ui-react` ne supporte pas le Server-Side Rendering
- `{ ssr: false }` force le chargement côté client uniquement
- Évite les erreurs "window is not defined" lors du build

**Fonction getSwaggerSpec :**
```tsx
async function getSwaggerSpec() {
  const response = await fetch('/api/swagger')
  return response.json()
}
```
**Rôle :** Récupère la configuration Swagger depuis l'endpoint `/api/swagger` que nous allons créer.

**Composant principal :**
```tsx
export default function ApiDocsPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Documentation API REST</h1>
      <div className="bg-white rounded-lg shadow">
        <SwaggerUIComponent />
      </div>
    </div>
  )
}
```
**Structure :**
- Container Tailwind pour le centrage
- Titre de la page
- Wrapper avec ombre pour Swagger UI

**Composant SwaggerUI :**
```tsx
function SwaggerUIComponent() {
  const [spec, setSpec] = React.useState(null)

  React.useEffect(() => {
    getSwaggerSpec().then(setSpec)
  }, [])

  if (!spec) {
    return <div className="p-8 text-center">Chargement de la documentation...</div>
  }

  return (
    <SwaggerUI
      spec={spec}
      deepLinking={true}
      displayRequestDuration={true}
    />
  )
}
```
**Logique :**
1. État `spec` pour stocker la configuration
2. `useEffect` charge la config au montage du composant
3. Affichage conditionnel : loading puis Swagger UI
4. Props Swagger UI :
   - `spec` : Configuration OpenAPI
   - `deepLinking` : URLs directes vers les endpoints
   - `displayRequestDuration` : Affiche le temps de réponse des tests

### 2.4 Créer l'endpoint pour servir le spec Swagger

**Emplacement :** `app/api/swagger/route.ts`
**Rôle :** Endpoint qui retourne la configuration Swagger en JSON

Créer le fichier `app/api/swagger/route.ts` et copier ce code :

```typescript
import { NextResponse } from 'next/server'
import { swaggerSpec } from '@/lib/swagger'

export async function GET() {
  return NextResponse.json(swaggerSpec)
}
```

**Explication :**

**Import du spec :**
```typescript
import { swaggerSpec } from '@/lib/swagger'
```
Importe la configuration générée par `swagger-jsdoc` depuis notre fichier `lib/swagger.ts`.

**Fonction GET :**
```typescript
export async function GET() {
  return NextResponse.json(swaggerSpec)
}
```
**Rôle :** 
- Endpoint accessible à `/api/swagger`
- Retourne la configuration OpenAPI en JSON
- Utilisé par la page `/api-docs` pour charger la documentation
- Génère automatiquement les `paths` depuis les commentaires JSDoc

**Flux de données :**
```
Commentaires JSDoc dans app/api/**/*.ts
          ↓
lib/swagger.ts (swaggerJSDoc parse les commentaires)
          ↓
app/api/swagger/route.ts (sert le JSON)
          ↓
app/api-docs/page.tsx (affiche l'interface)
```

---

## 3. Documentation d'un endpoint spécifique

### 3.1 Endpoint choisi : GET /api/products

**Pourquoi commencer par celui-ci ?**
- Endpoint simple sans paramètres
- Réponse prévisible (liste de produits)
- Pas de body de requête à documenter
- Bon exemple pour comprendre la syntaxe

**Ce que nous allons documenter :**
- Description de l'endpoint et son rôle
- Format de la réponse (succès et erreur)
- Exemples concrets de réponses
- Codes de statut HTTP
- Schémas des objets retournés

### 3.2 Comprendre la syntaxe JSDoc pour Swagger

**Format général :**
```javascript
/**
 * @swagger
 * /chemin/endpoint:
 *   methode:
 *     summary: Description courte
 *     description: Description détaillée
 *     responses:
 *       200:
 *         description: Réponse de succès
 *         content:
 *           application/json:
 *             schema: # Structure des données
 *             examples: # Exemples concrets
 */
```

**Règles importantes :**
- Commencer par `/**` et finir par `*/`
- Première ligne : `@swagger`
- Indentation avec espaces (pas de tabs)
- Syntaxe YAML dans les commentaires

### 3.3 Ajout des commentaires JSDoc détaillés

**Emplacement :** `app/api/products/route.ts`
**Action :** Ajouter les commentaires AVANT la fonction GET

Modifier le fichier `app/api/products/route.ts` en ajoutant ces commentaires juste avant la fonction `export async function GET()` :

```typescript
import { NextRequest, NextResponse } from 'next/server'
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
 */
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return NextResponse.json({
      success: true,
      data: products,
      message: `${products.length} produit(s) trouvé(s)`
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des produits:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la récupération des produits'
      },
      { status: 500 }
    )
  }
}

// Le reste du code POST reste inchangé pour l'instant
export async function POST(request: NextRequest) {
  // Code existant...
}
```

### 3.3 Explication de la documentation ajoutée

#### Balise @swagger
```yaml
@swagger
/api/products:
```
Définit le chemin de l'endpoint dans la documentation.

#### Métadonnées de l'endpoint
```yaml
summary: Récupérer la liste de tous les produits
description: |
  Retourne la liste complète de tous les produits...
tags:
  - Produits
```
- `summary` : Description courte
- `description` : Description détaillée (supporte markdown)
- `tags` : Groupement dans l'interface Swagger

#### Réponses documentées
```yaml
responses:
  200:
    description: Liste des produits récupérée avec succès
    content:
      application/json:
        schema:
          # Structure de la réponse
        examples:
          # Exemples concrets
```

#### Schémas réutilisables
```yaml
$ref: '#/components/schemas/Product'
```
Référence vers les schémas définis dans `lib/swagger.ts`.

#### Exemples multiples
```yaml
examples:
  liste_vide:
    summary: Liste vide
    value: { ... }
  liste_avec_produits:
    summary: Liste avec produits
    value: { ... }
```
Permet de montrer différents cas d'usage.

---

## 4. Test de la documentation

### 4.1 Démarrer le serveur

```bash
npm run dev
```

### 4.2 Accéder à Swagger UI

Ouvrir dans le navigateur :
- **Local :** http://localhost:3000/api-docs
- **Production :** https://next-01-evaluation-du-lab2.vercel.app/api-docs

### 4.3 Interface Swagger attendue

Vous devriez voir :
- Titre : "Laboratoire 2 - API REST"
- Section "Produits" avec l'endpoint GET /api/products
- Bouton "Try it out" pour tester directement
- Exemples de réponses (liste vide, liste avec produits)
- Schémas des objets Product

### 4.4 Test interactif

1. Cliquer sur "GET /api/products"
2. Cliquer sur "Try it out"
3. Cliquer sur "Execute"
4. Vérifier la réponse dans l'interface

---

## 5. Déploiement avec Swagger

### 5.1 Commit et push

```bash
git add -A
git commit -m "feat: add Swagger documentation for GET /api/products"
git push origin main
```

### 5.2 Vérification sur Vercel

Après le redéploiement automatique, tester :
- https://next-01-evaluation-du-lab2.vercel.app/api-docs

---

## 6. Prochaines étapes

Une fois cet endpoint documenté et testé, nous procéderons de la même manière pour :

1. POST /api/products (création)
2. GET /api/products/[id] (détail)
3. PUT /api/products/[id] (modification)
4. DELETE /api/products/[id] (suppression)
5. GET /api/products/count (comptage)

Chaque endpoint suivra le même pattern de documentation avec :
- Commentaires JSDoc détaillés
- Schémas de requête et réponse
- Exemples concrets
- Codes d'erreur documentés

---

## 7. Structure de la documentation

### 7.1 Organisation par tags

```yaml
tags:
  - Produits          # Opérations CRUD sur les produits
  - Statistiques      # Comptage, prix min/max
  - Utilitaires       # Recherche, export
```

### 7.2 Conventions de nommage

- **Opérations :** Verbes d'action clairs (Récupérer, Créer, Modifier, Supprimer)
- **Descriptions :** Phrases complètes avec contexte métier
- **Exemples :** Données réalistes et variées
- **Erreurs :** Messages explicites et codes HTTP appropriés

### 7.3 Schémas réutilisables

Tous les schémas sont définis dans `lib/swagger.ts` :
- `Product` : Objet produit complet
- `ProductInput` : Données de création/modification
- `SuccessResponse` : Structure de réponse de succès
- `ErrorResponse` : Structure de réponse d'erreur

---

## 8. Avantages de cette approche

### 8.1 Pour les développeurs

- Documentation toujours à jour (générée depuis le code)
- Tests interactifs directement dans l'interface
- Schémas TypeScript cohérents avec la documentation
- Exemples concrets pour chaque endpoint

### 8.2 Pour les étudiants

- Compréhension visuelle des APIs
- Possibilité de tester sans Postman
- Documentation professionnelle
- Apprentissage des standards OpenAPI

### 8.3 Pour l'enseignement

- Support visuel pour les démonstrations
- Validation immédiate du fonctionnement
- Documentation automatique des exercices
- Standard industrie enseigné

---

## 9. Dépannage

### Erreur "Module not found: swagger-ui-react"

```bash
# Réinstaller les dépendances
npm install swagger-ui-react swagger-jsdoc
npm install -D @types/swagger-ui-react @types/swagger-jsdoc
```

### Erreur "Cannot read property 'info' of undefined"

Vérifier que `lib/swagger.ts` exporte correctement `swaggerSpec` et que la structure `definition.info` est complète.

### Page Swagger vide

Vérifier que :
- Le serveur est démarré
- L'endpoint `/api/swagger` répond
- Les commentaires JSDoc sont correctement formatés

### Erreur de build en production

Ajouter dans `next.config.js` :

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['swagger-jsdoc']
  }
}

module.exports = nextConfig
```

---

## 10. Validation de l'implémentation

### Checklist technique

- [ ] Packages Swagger installés
- [ ] Fichier `lib/swagger.ts` créé avec configuration
- [ ] Page `/api-docs` créée et accessible
- [ ] Endpoint `/api/swagger` créé et fonctionnel
- [ ] Documentation JSDoc ajoutée à GET /api/products
- [ ] Interface Swagger affiche l'endpoint documenté
- [ ] Test "Try it out" fonctionne
- [ ] Déploiement Vercel réussi avec Swagger

### Résultat attendu

Une interface Swagger accessible qui permet de :
- Visualiser la documentation de GET /api/products
- Tester l'endpoint directement depuis l'interface
- Voir les exemples de réponses
- Comprendre la structure des données

Cette base servira de modèle pour documenter progressivement tous les autres endpoints du projet.

---

## 11. Test détaillé de l'implémentation

### 11.1 Vérification étape par étape

**Étape 1 - Packages installés :**
```bash
npm list swagger-ui-react swagger-jsdoc
```
**Résultat attendu :** Les deux packages doivent apparaître avec leurs versions.

**Étape 2 - Fichiers créés :**
Vérifier que ces 3 fichiers existent :
- `lib/swagger.ts` (configuration)
- `app/api-docs/page.tsx` (interface)
- `app/api/swagger/route.ts` (endpoint JSON)

**Étape 3 - Serveur démarré :**
```bash
npm run dev
```

**Étape 4 - Test de l'endpoint JSON :**
```bash
curl http://localhost:3000/api/swagger
```
**Résultat attendu :** JSON avec la structure OpenAPI (info, servers, components, paths).

**Étape 5 - Test de l'interface :**
Ouvrir http://localhost:3000/api-docs
**Résultat attendu :** Interface Swagger avec le titre "Laboratoire 2 - API REST".

### 11.2 Interface Swagger attendue

**En haut de la page :**
- Titre : "Laboratoire 2 - API REST"
- Version : "1.0.0"
- Description du projet
- Serveur sélectionné (localhost:3000 ou Vercel)

**Section "Produits" :**
- Endpoint GET /api/products visible
- Description : "Récupérer la liste de tous les produits"
- Bouton "Try it out"

**Détail de l'endpoint :**
- Paramètres : Aucun
- Réponses : 200 (succès) et 500 (erreur)
- Schéma de réponse avec structure Product
- Exemples : liste vide et liste avec produits

### 11.3 Test interactif complet

**Étape 1 - Ouvrir l'endpoint :**
1. Cliquer sur "GET /api/products"
2. La section se déploie avec tous les détails

**Étape 2 - Lancer un test :**
1. Cliquer sur "Try it out"
2. Cliquer sur "Execute"
3. Vérifier la réponse dans la section "Response"

**Étape 3 - Analyser la réponse :**
- Code de statut : 200
- Headers : Content-Type: application/json
- Body : Structure avec success, data, message
- Temps de réponse affiché

**Étape 4 - Vérifier les exemples :**
- Cliquer sur les exemples "liste_vide" et "liste_avec_produits"
- Vérifier que les formats correspondent à vos réponses réelles

### 11.4 Validation avec des données réelles

**Créer des produits de test :**
```bash
# Créer un produit via API
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Swagger", "price": 123.45}'
```

**Retester dans Swagger :**
1. Retourner sur `/api-docs`
2. Tester à nouveau GET /api/products
3. Vérifier que le produit créé apparaît dans la réponse
4. Comparer avec l'exemple "liste_avec_produits"

---

## 12. Déploiement avec Swagger sur Vercel

### 12.1 Préparation du déploiement

**Vérifier la configuration de production :**
Dans `lib/swagger.ts`, s'assurer que l'URL de production est correcte :
```typescript
servers: [
  {
    url: process.env.NODE_ENV === 'production' 
      ? 'https://next-01-evaluation-du-lab2.vercel.app'
      : 'http://localhost:3000'
  }
]
```

### 12.2 Commit et push

```bash
git add -A
git commit -m "feat: add Swagger UI documentation for GET /api/products endpoint"
git push origin main
```

### 12.3 Attendre le redéploiement Vercel

**Vérification du build :**
1. Aller sur https://vercel.com/dashboard
2. Vérifier que le build se lance automatiquement
3. Attendre la fin du déploiement (2-3 minutes)

### 12.4 Test en production

**URL de la documentation :**
https://next-01-evaluation-du-lab2.vercel.app/api-docs

**Tests à effectuer :**
1. Vérifier que l'interface s'affiche
2. Vérifier que le serveur sélectionné est l'URL Vercel
3. Tester GET /api/products avec "Try it out"
4. Vérifier que les données de votre base Neon s'affichent

---

## 13. Analyse de ce que nous avons accompli

### 13.1 Fichiers créés

| Fichier | Rôle | Lignes de code |
|---------|------|----------------|
| `lib/swagger.ts` | Configuration OpenAPI | ~100 lignes |
| `app/api-docs/page.tsx` | Interface Swagger UI | ~40 lignes |
| `app/api/swagger/route.ts` | Endpoint JSON du spec | ~5 lignes |
| Commentaires dans `app/api/products/route.ts` | Documentation JSDoc | ~50 lignes |

### 13.2 Fonctionnalités ajoutées

**Documentation automatique :**
- Interface web professionnelle
- Schémas de données visuels
- Exemples interactifs
- Tests en direct

**Standards industriels :**
- Spécification OpenAPI 3.0
- Documentation générée depuis le code
- Compatible avec tous les outils OpenAPI
- Exportable vers d'autres formats

### 13.3 Bénéfices pour l'enseignement

**Pour l'enseignant :**
- Support visuel pour les démonstrations
- Validation immédiate des endpoints
- Documentation toujours à jour
- Outil professionnel enseigné

**Pour les étudiants :**
- Compréhension visuelle des APIs
- Tests sans installation d'outils externes
- Apprentissage des standards
- Documentation de leurs propres projets

---

## 14. Prochaines étapes détaillées

### 14.1 Plan de documentation des autres endpoints

**Ordre recommandé :**
1. **POST /api/products** (création) - Prochaine session
2. **PUT /api/products/[id]** (modification)
3. **DELETE /api/products/[id]** (suppression)
4. **GET /api/products/count** (comptage)
5. **GET /api/products/[id]** (détail)

### 14.2 Complexité croissante

**POST** : Introduction des paramètres de body
**PUT** : Paramètres d'URL + body
**DELETE** : Gestion des erreurs 404
**COUNT** : Réponse simple avec nombre
**GET [id]** : Paramètres d'URL + erreurs 404

### 14.3 Méthodologie pour chaque endpoint

1. Analyser l'endpoint existant
2. Identifier les paramètres d'entrée
3. Lister les réponses possibles
4. Créer des exemples réalistes
5. Ajouter les commentaires JSDoc
6. Tester dans Swagger UI
7. Valider avec des données réelles

Cette approche progressive permet de maîtriser Swagger sans surcharge cognitive, en construisant sur les acquis de chaque endpoint documenté.

---

## 15. Problèmes courants et solutions détaillées

### 15.1 Interface Swagger vide ou mal affichée

**Symptôme précis :** 
- L'interface Swagger s'affiche avec le titre "Documentation API REST"
- Les informations du projet apparaissent (nom, version, description)
- La section "Produits" est visible avec la flèche
- MAIS la zone principale de contenu est vide ou très mal formatée
- Les boutons et formulaires Swagger n'apparaissent pas correctement
- L'interface semble "cassée" visuellement

**Exemple visuel du problème :**
```
Documentation API REST
Laboratoire 2 - API REST 1.0.0
[Zone vide ou mal formatée]
Produits ↓
  GET /api/products
  [Contenu manquant ou déformé]
```

**Cause racine :** CSS de Swagger UI non importé.

**Explication technique :**
Le package `swagger-ui-react` fournit les composants React mais PAS les styles CSS. Sans les styles, les composants s'affichent mais sont invisibles ou déformés. C'est un piège classique car l'interface "semble" fonctionner.

**Comment identifier ce problème spécifique :**

1. **Signes visuels caractéristiques :**
   - Titre "Documentation API REST" visible et bien formaté (Tailwind fonctionne)
   - Informations du projet affichées correctement
   - Section "Produits" visible avec flèche de développement
   - MAIS quand vous cliquez sur "Produits", le contenu est :
     - Soit complètement vide
     - Soit affiché avec une mise en page bizarre
     - Soit avec des éléments empilés sans structure

2. **Test diagnostic rapide :**
   - Clic droit sur la page → "Inspecter l'élément"
   - Chercher dans le HTML des éléments avec classe `swagger-ui`
   - Si les éléments existent MAIS sans styles appliqués → C'est ce problème

3. **Console navigateur (F12) :**
   - Aucune erreur JavaScript
   - Message "Swagger spec loaded:" visible
   - Mais l'interface reste visuellement cassée

**Solution étape par étape :**

1. **Modifier `app/api-docs/page.tsx`** en ajoutant l'import CSS :

```tsx
'use client'

import dynamic from 'next/dynamic'
import React from 'react'
import 'swagger-ui-react/swagger-ui.css'  // ← AJOUTER CETTE LIGNE
```

2. **Améliorer la gestion d'erreurs** dans le même fichier :

Remplacer la fonction `SwaggerUIComponent` par cette version plus robuste :

```tsx
function SwaggerUIComponent() {
  const [spec, setSpec] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(null)

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

3. **Redémarrer le serveur :**

```bash
# Arrêter le serveur (Ctrl+C dans le terminal)
npm run dev
```

4. **Vider le cache du navigateur :**
- Ctrl+F5 (Windows) ou Cmd+Shift+R (Mac)
- Ou F12 → Network → Cocher "Disable cache"

**Résultat après correction :**
- L'interface Swagger doit maintenant afficher correctement tous les éléments
- La section "Produits" doit être cliquable et se développer
- L'endpoint GET /api/products doit avoir tous ses détails visibles
- Les boutons "Try it out" doivent être bien formatés
- Les schémas en bas de page doivent être lisibles

**Avant/Après visuel :**

**AVANT (problème) :**
```
Documentation API REST
Laboratoire 2 - API REST 1.0.0
[Zone vide]
Produits ↓ [mal formaté]
```

**APRÈS (corrigé) :**
```
Documentation API REST
Laboratoire 2 - API REST 1.0.0
OAS 3.0
Documentation des services web REST...
Contact: Équipe de développement
Servers: http://localhost:3000 - Serveur de développement

Produits ↓ [bien formaté avec styles]
  GET /api/products [boutons visibles]
  Récupérer la liste de tous les produits
  [Bouton "Try it out" bien stylé]

Schemas ↓ [section bien formatée]
  Product
  ProductInput
  SuccessResponse
  ErrorResponse
```

### 15.2 Erreur "Module not found: swagger-jsdoc"

**Symptôme :** Erreur dans la console ou page d'erreur 500.

**Cause :** Packages Swagger mal installés.

**Solution complète :**

1. **Supprimer node_modules et réinstaller :**

```bash
# Arrêter le serveur
# Supprimer le cache
rm -rf node_modules package-lock.json
# Ou sur Windows PowerShell :
Remove-Item -Recurse -Force node_modules, package-lock.json

# Réinstaller tout
npm install

# Réinstaller Swagger spécifiquement
npm install swagger-jsdoc swagger-ui-react --save
npm install -D @types/swagger-jsdoc @types/swagger-ui-react
```

2. **Vérifier l'installation :**

```bash
npm list swagger-jsdoc swagger-ui-react
```

**Résultat attendu :**
```
├── swagger-jsdoc@6.2.8
└── swagger-ui-react@5.10.5
```

3. **Redémarrer :**

```bash
npm run dev
```

### 15.3 Interface Swagger affiche "Failed to load API definition"

**Symptôme :** Message d'erreur dans l'interface Swagger.

**Cause :** L'endpoint `/api/swagger` ne répond pas correctement.

**Diagnostic étape par étape :**

1. **Tester l'endpoint JSON directement :**

```bash
# Dans un autre terminal ou avec Postman
curl http://localhost:3000/api/swagger
```

**Résultat attendu :** JSON avec structure OpenAPI.

**Si erreur :** Vérifier que `app/api/swagger/route.ts` existe et contient :

```typescript
import { NextResponse } from 'next/server'
import { swaggerSpec } from '@/lib/swagger'

export async function GET() {
  return NextResponse.json(swaggerSpec)
}
```

2. **Vérifier la configuration dans `lib/swagger.ts` :**

**Problème fréquent :** Chemin `apis` incorrect.

```typescript
apis: ['./app/api/**/*.ts']  // ✅ Correct
// Pas : ['./app/api/*.ts']  // ❌ Manque les sous-dossiers
```

3. **Vérifier les commentaires JSDoc :**

Dans `app/api/products/route.ts`, s'assurer que :
- Les commentaires commencent par `/**` (pas `//`)
- La première ligne est `@swagger`
- L'indentation utilise des espaces (pas de tabs)
- La syntaxe YAML est correcte

### 15.4 Section "Produits" vide ou non cliquable

**Symptôme :** La section "Produits" apparaît mais ne contient aucun endpoint.

**Cause :** Commentaires JSDoc mal formatés ou non détectés.

**Solution détaillée :**

1. **Vérifier le format exact des commentaires** dans `app/api/products/route.ts` :

```typescript
/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Récupérer la liste de tous les produits
 *     tags:
 *       - Produits
 *     responses:
 *       200:
 *         description: Succès
 */
export async function GET() {
```

**Points critiques :**
- Espace après chaque `*`
- Indentation avec 2 espaces pour chaque niveau
- Pas de caractères spéciaux dans les descriptions
- Tag `- Produits` avec tiret et espace

2. **Tester la génération du spec :**

Ajouter des logs dans `lib/swagger.ts` pour debug :

```typescript
export const swaggerSpec = swaggerJSDoc(options)
console.log('Swagger spec generated:', JSON.stringify(swaggerSpec, null, 2))
```

3. **Redémarrer et vérifier les logs :**

```bash
npm run dev
```

Regarder dans la console du terminal si le spec est généré avec les `paths`.

### 15.5 Erreur CORS ou fetch échoue

**Symptôme :** Erreur dans la console "CORS" ou "Failed to fetch".

**Cause :** Problème de requête vers `/api/swagger`.

**Solution :**

1. **Modifier la fonction `getSwaggerSpec`** dans `app/api-docs/page.tsx` :

```tsx
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
```

### 15.6 Styles Tailwind qui interfèrent avec Swagger

**Symptôme :** Interface Swagger déformée ou styles étranges.

**Cause :** Conflits entre les styles Tailwind et Swagger UI.

**Solution :**

1. **Isoler Swagger UI** en modifiant `app/api-docs/page.tsx` :

```tsx
export default function ApiDocsPage() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Documentation API REST</h1>
      </div>
      {/* Wrapper sans classes Tailwind pour Swagger */}
      <div style={{ padding: '0 2rem' }}>
        <SwaggerUIComponent />
      </div>
    </div>
  )
}
```

2. **Alternative : CSS custom** pour Swagger

Ajouter dans `app/globals.css` :

```css
/* Styles spécifiques pour Swagger UI */
.swagger-ui {
  font-family: inherit;
}

.swagger-ui .info {
  margin: 20px 0;
}

.swagger-ui .scheme-container {
  background: #fafafa;
  padding: 10px;
  border-radius: 4px;
}
```

### 15.7 Endpoint non détecté par Swagger

**Symptôme :** L'endpoint existe et fonctionne mais n'apparaît pas dans Swagger.

**Diagnostic complet :**

1. **Vérifier l'emplacement du fichier :**

```
app/api/products/route.ts  ✅ Détecté
app/api/products/[id]/route.ts  ✅ Détecté
lib/api/products.ts  ❌ Non détecté (mauvais dossier)
```

2. **Vérifier le pattern dans `lib/swagger.ts` :**

```typescript
apis: ['./app/api/**/*.ts']  // Cherche dans tous les sous-dossiers
```

3. **Tester manuellement la génération :**

Créer un fichier de test `test-swagger.js` :

```javascript
const swaggerJSDoc = require('swagger-jsdoc')

const options = {
  definition: {
    openapi: '3.0.0',
    info: { title: 'Test', version: '1.0.0' }
  },
  apis: ['./app/api/**/*.ts']
}

const spec = swaggerJSDoc(options)
console.log('Paths found:', Object.keys(spec.paths || {}))
```

Exécuter :
```bash
node test-swagger.js
```

### 15.8 Problème avec les caractères spéciaux

**Symptôme :** Erreur de parsing YAML dans les commentaires JSDoc.

**Cause :** Caractères français (é, à, ç) ou guillemets mal échappés.

**Solution :**

1. **Échapper les caractères spéciaux :**

```yaml
# ❌ Problématique
description: Récupérer la liste des "produits"

# ✅ Correct
description: Récupérer la liste des produits
# ou
description: "Récupérer la liste des \"produits\""
```

2. **Utiliser la syntaxe YAML multiline :**

```yaml
description: |
  Retourne la liste complète de tous les produits enregistrés en base de données,
  triés par date de création décroissante (plus récent en premier).
```

---

## 16. Checklist de dépannage complète

### Avant de demander de l'aide

1. **Packages installés :**
```bash
npm list swagger-jsdoc swagger-ui-react
```

2. **Fichiers créés :**
- [ ] `lib/swagger.ts` existe et contient la configuration
- [ ] `app/api/swagger/route.ts` existe et importe de lib/swagger
- [ ] `app/api-docs/page.tsx` existe avec import CSS
- [ ] Commentaires JSDoc ajoutés dans `app/api/products/route.ts`

3. **Serveur redémarré :**
```bash
npm run dev
```

4. **Endpoint JSON fonctionne :**
```bash
curl http://localhost:3000/api/swagger
```

5. **Console navigateur :**
- F12 → Console
- Rechercher "Swagger spec loaded" ou erreurs

6. **Cache vidé :**
- Ctrl+F5 ou Cmd+Shift+R

### Si rien ne fonctionne

**Solution radicale :**

1. **Supprimer tous les fichiers Swagger :**
```bash
rm lib/swagger.ts
rm app/api/swagger/route.ts
rm -rf app/api-docs
```

2. **Désinstaller et réinstaller :**
```bash
npm uninstall swagger-jsdoc swagger-ui-react @types/swagger-jsdoc @types/swagger-ui-react
npm install swagger-jsdoc@6.2.8 swagger-ui-react@5.10.5
npm install -D @types/swagger-jsdoc@6.0.4 @types/swagger-ui-react@5.0.1
```

3. **Recréer les fichiers un par un** en suivant exactement le guide.

---

## 17. Version finale fonctionnelle garantie

### 17.1 Code final de `app/api-docs/page.tsx`

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
        <h1 className="text-3xl font-bold mb-6">Documentation API REST</h1>
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
  const [error, setError] = React.useState(null)

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

### 17.2 Vérification finale étape par étape

**Étape 1 - Packages :**
```bash
npm list swagger-jsdoc swagger-ui-react
```
**Résultat attendu :** Versions affichées sans erreur.

**Étape 2 - Endpoint JSON :**
```bash
curl http://localhost:3000/api/swagger
```
**Résultat attendu :** JSON avec `openapi: "3.0.0"`, `info`, `paths`.

**Étape 3 - Interface :**
Ouvrir http://localhost:3000/api-docs
**Résultat attendu :** Interface avec titre et contenu Swagger.

**Étape 4 - Console navigateur :**
F12 → Console
**Résultat attendu :** "Swagger spec loaded:" + objet JSON.

**Étape 5 - Test interactif :**
1. Cliquer sur "Produits" → section se développe
2. Cliquer sur "GET /api/products" → détails apparaissent
3. Cliquer sur "Try it out" → bouton "Execute" apparaît
4. Cliquer sur "Execute" → réponse de l'API s'affiche

### 17.3 Résultat final attendu

**Interface complète avec :**
- En-tête : "Laboratoire 2 - API REST v1.0.0"
- Serveur : "http://localhost:3000 - Serveur de développement"
- Section "Produits" développable
- Endpoint GET /api/products avec :
  - Description complète
  - Bouton "Try it out"
  - Schéma de réponse
  - Exemples (liste vide, liste avec produits)
  - Code de réponse 200 et 500
- Section "Schemas" en bas avec Product, ProductInput, etc.

**Test fonctionnel :**
- Cliquer "Try it out" → "Execute" retourne vos données réelles
- Temps de réponse affiché
- Possibilité de copier la réponse
- Curl command généré automatiquement

---

## 18. Commandes de validation rapide

### Script de test complet

Créer un fichier `test-swagger.sh` (ou `.bat` sur Windows) :

```bash
#!/bin/bash
echo "=== Test Swagger Integration ==="

echo "1. Vérification packages..."
npm list swagger-jsdoc swagger-ui-react

echo "2. Test endpoint JSON..."
curl -s http://localhost:3000/api/swagger | jq '.info.title' 2>/dev/null || echo "Erreur endpoint"

echo "3. Test interface..."
echo "Ouvrir http://localhost:3000/api-docs dans le navigateur"

echo "4. Test API..."
curl -s http://localhost:3000/api/products | jq '.success' 2>/dev/null || echo "API non accessible"

echo "=== Fin des tests ==="
```

### Commandes de réparation rapide

```bash
# Reset complet si problème
npm run build  # Test de build
rm -rf .next   # Supprimer cache Next.js
npm run dev    # Redémarrer
```

Cette documentation exhaustive couvre tous les problèmes possibles et leurs solutions détaillées. Les étudiants peuvent suivre pas à pas et résoudre les problèmes de mise en page et de configuration qu'ils rencontreront.

---

## 19. Focus spécial : Problème de CSS Swagger UI manquant

### 19.1 Reconnaissance du problème

**Ce que vous voyez exactement :**

Votre interface ressemble à ceci :
```
┌─────────────────────────────────────┐
│ Documentation API REST              │
│                                     │
│ Laboratoire 2 - API REST            │
│ 1.0.0                              │
│ OAS 3.0                            │
│ Documentation des services web...   │
│ Contact Équipe de développement     │
│ Servers                            │
│ http://localhost:3000 - Serveur...  │
│ Produits ↓                         │
│     GET                            │
│     /api/products                  │
│     Récupérer la liste de tous...  │
│ ↓                                  │
│ Schemas                            │
│ ↑                                  │
│ Product                            │
│ ProductInput                       │
│ SuccessResponse                    │
│ ErrorResponse                      │
└─────────────────────────────────────┘
```

**Problème :** Tout est là mais sans mise en forme, sans couleurs, sans boutons stylés.

### 19.2 Diagnostic précis

**Étape 1 - Vérifier l'HTML généré :**
1. F12 → Elements
2. Chercher `<div class="swagger-ui">`
3. Si vous trouvez ces éléments → Les composants sont rendus
4. Regarder les styles appliqués → Si vides ou basiques → CSS manquant

**Étape 2 - Vérifier les ressources :**
1. F12 → Network
2. Recharger la page
3. Chercher un fichier CSS de Swagger (swagger-ui.css)
4. Si absent → CSS non importé

**Étape 3 - Console d'erreurs :**
1. F12 → Console
2. Chercher des erreurs de type :
   - "Failed to load resource: swagger-ui.css"
   - "Module not found: swagger-ui-react/swagger-ui.css"

### 19.3 Solution garantie

**Méthode 1 - Import CSS simple (recommandée) :**

Dans `app/api-docs/page.tsx`, ajouter OBLIGATOIREMENT cette ligne :

```tsx
'use client'

import dynamic from 'next/dynamic'
import React from 'react'
import 'swagger-ui-react/swagger-ui.css'  // ← LIGNE CRUCIALE
```

**Méthode 2 - Si la méthode 1 ne fonctionne pas :**

Créer `app/api-docs/swagger-ui.css` et y copier les styles de base :

```css
/* Styles minimums pour Swagger UI */
.swagger-ui {
  font-family: sans-serif;
}

.swagger-ui .info {
  margin: 20px 0;
}

.swagger-ui .info .title {
  font-size: 36px;
  font-weight: bold;
  margin-bottom: 10px;
}

.swagger-ui .scheme-container {
  background: #fafafa;
  padding: 10px;
  border-radius: 4px;
  margin: 20px 0;
}

.swagger-ui .opblock-tag {
  border-bottom: 1px solid #d3d3d3;
  padding: 10px 0;
  margin: 20px 0;
}

.swagger-ui .opblock {
  border: 1px solid #d3d3d3;
  border-radius: 4px;
  margin: 10px 0;
}

.swagger-ui .opblock .opblock-summary {
  padding: 15px;
  cursor: pointer;
  background: #f7f7f7;
}

.swagger-ui .opblock .opblock-summary:hover {
  background: #e7e7e7;
}

.swagger-ui .btn {
  background: #4990e2;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.swagger-ui .btn:hover {
  background: #357abd;
}

.swagger-ui .response-col_status {
  font-weight: bold;
}

.swagger-ui .response-col_description {
  padding-left: 20px;
}
```

Puis l'importer dans `app/api-docs/page.tsx` :

```tsx
import './swagger-ui.css'  // Import du CSS local
```

**Méthode 3 - Import via CDN (dernière option) :**

Dans `app/api-docs/page.tsx`, ajouter dans le composant :

```tsx
export default function ApiDocsPage() {
  React.useEffect(() => {
    // Charger le CSS de Swagger UI via CDN
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/swagger-ui-dist@5.10.5/swagger-ui.css'
    document.head.appendChild(link)
  }, [])

  return (
    // ... reste du code
  )
}
```

### 19.4 Vérification de la correction

**Test immédiat après correction :**

1. **Redémarrer le serveur :**
```bash
npm run dev
```

2. **Vider le cache navigateur :**
Ctrl+F5 (force refresh)

3. **Recharger `/api-docs` :**
L'interface doit maintenant être complètement différente :
- Couleurs et styles Swagger UI appliqués
- Boutons bien formatés
- Sections développables avec animations
- Formulaires de test stylés

**Signes que la correction a fonctionné :**
- La page a maintenant l'apparence typique de Swagger UI (bleu/gris)
- Les sections se développent avec animation
- Les boutons "Try it out" sont bleus et bien stylés
- Les schémas sont dans des boîtes avec bordures
- L'interface ressemble aux documentations Swagger standard

### 19.5 Si le problème persiste

**Diagnostic avancé :**

1. **Vérifier l'import dans le navigateur :**
   - F12 → Network → Recharger
   - Chercher "swagger-ui.css" dans les requêtes
   - Si 404 → Le fichier CSS n'est pas trouvé
   - Si 200 → Le CSS est chargé mais peut-être pas appliqué

2. **Forcer l'application des styles :**
   
   Ajouter dans `app/globals.css` :
   ```css
   /* Force l'application des styles Swagger */
   @import url('swagger-ui-react/swagger-ui.css');
   ```

3. **Vérifier les conflits Tailwind :**
   
   Dans `app/api-docs/page.tsx`, isoler complètement Swagger :
   ```tsx
   <div className="swagger-wrapper" style={{ all: 'initial' }}>
     <SwaggerUI spec={spec} />
   </div>
   ```

Cette section détaillée permet aux étudiants d'identifier précisément le problème de CSS manquant et de le résoudre avec certitude.
