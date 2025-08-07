import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// DELETE /api/products/[id] - Supprimer un produit par ID
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

// PUT /api/products/[id] - Modifier un produit par ID
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

// GET /api/products/[id] - Obtenir un produit par ID (bonus)
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