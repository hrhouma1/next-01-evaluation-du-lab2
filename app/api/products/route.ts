import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/products - Obtenir tous les produits
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

// POST /api/products - Ajouter un nouveau produit
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