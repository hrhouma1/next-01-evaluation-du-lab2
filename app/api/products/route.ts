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

/**
 * @swagger
 * /api/products:
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
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, price } = body

    // Validation des données
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Le nom du produit est requis et doit être une chaîne non vide'
        },
        { status: 400 }
      )
    }

    if (!price || typeof price !== 'number' || price <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Le prix doit être un nombre positif'
        },
        { status: 400 }
      )
    }

    // Créer le produit
    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        price: price
      }
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
    console.error('Erreur lors de la création du produit:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la création du produit'
      },
      { status: 500 }
    )
  }
}