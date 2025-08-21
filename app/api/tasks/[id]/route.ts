import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * @swagger
 * /api/products/{id}:
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
 *             example:
 *               success: true
 *               message: "Produit \"iPhone 15 Pro\" supprimé avec succès"
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
 *       500:
 *         description: Erreur serveur lors de la suppression
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "Erreur lors de la suppression du produit"
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)

    // Validation de l'ID
    if (isNaN(id) || id <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID du produit invalide'
        },
        { status: 400 }
      )
    }

    // Vérifier si le produit existe
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    })

    if (!existingProduct) {
      return NextResponse.json(
        {
          success: false,
          error: 'Produit non trouvé'
        },
        { status: 404 }
      )
    }

    // Supprimer le produit
    await prisma.product.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: `Produit "${existingProduct.name}" supprimé avec succès`
    })
  } catch (error) {
    console.error('Erreur lors de la suppression du produit:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la suppression du produit'
      },
      { status: 500 }
    )
  }
}

/**
 * @swagger
 * /api/products/{id}:
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
 *             changement_prix:
 *               summary: Changement de prix seulement
 *               value:
 *                 name: "iPhone 15 Pro"
 *                 price: 1099.99
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
 *             example:
 *               success: true
 *               data:
 *                 id: 1
 *                 name: "iPhone 15 Pro Max"
 *                 price: 1399.99
 *                 createdAt: "2024-01-15T10:30:00.000Z"
 *                 updatedAt: "2024-01-15T11:45:00.000Z"
 *               message: "Produit modifié avec succès"
 *       400:
 *         description: Données invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               id_invalide:
 *                 summary: ID invalide
 *                 value:
 *                   success: false
 *                   error: "ID du produit invalide"
 *               nom_vide:
 *                 summary: Nom vide
 *                 value:
 *                   success: false
 *                   error: "Le nom du produit est requis et doit être une chaîne non vide"
 *               prix_negatif:
 *                 summary: Prix négatif
 *                 value:
 *                   success: false
 *                   error: "Le prix doit être un nombre positif"
 *       404:
 *         description: Produit non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "Produit non trouvé"
 *       500:
 *         description: Erreur serveur lors de la modification
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "Erreur lors de la modification du produit"
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)

    // Validation de l'ID
    if (isNaN(id) || id <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID du produit invalide'
        },
        { status: 400 }
      )
    }

    // Vérifier si le produit existe
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    })

    if (!existingProduct) {
      return NextResponse.json(
        {
          success: false,
          error: 'Produit non trouvé'
        },
        { status: 404 }
      )
    }

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

    // Mettre à jour le produit
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name: name.trim(),
        price: price
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedProduct,
      message: 'Produit modifié avec succès'
    })
  } catch (error) {
    console.error('Erreur lors de la modification du produit:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la modification du produit'
      },
      { status: 500 }
    )
  }
}

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
 *       500:
 *         description: Erreur serveur lors de la récupération
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "Erreur lors de la récupération du produit"
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)

    // Validation de l'ID
    if (isNaN(id) || id <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID du produit invalide'
        },
        { status: 400 }
      )
    }

    // Récupérer le produit
    const product = await prisma.product.findUnique({
      where: { id }
    })

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: 'Produit non trouvé'
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: product,
      message: 'Produit trouvé'
    })
  } catch (error) {
    console.error('Erreur lors de la récupération du produit:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la récupération du produit'
      },
      { status: 500 }
    )
  }
}