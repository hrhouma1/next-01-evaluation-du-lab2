import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/products/count - Compter le nombre total de produits
export async function GET() {
  try {
    // Compter tous les produits en base
    const total = await prisma.product.count()
    
    return NextResponse.json({
      success: true,
      data: {
        total: total
      },
      message: `${total} produit(s) en base`
    })
  } catch (error) {
    console.error('Erreur lors du comptage des produits:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors du comptage des produits'
      },
      { status: 500 }
    )
  }
}