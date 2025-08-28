import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password } = body

    // Validation des données
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: "Tous les champs sont requis" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Le mot de passe doit contenir au moins 6 caractères" },
        { status: 400 }
      )
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "Adresse email invalide" },
        { status: 400 }
      )
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "Un compte avec cet email existe déjà" },
        { status: 409 }
      )
    }

    // Hasher le mot de passe
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: "user" // rôle par défaut
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    })

    return NextResponse.json(
      {
        success: true,
        data: user,
        message: "Compte créé avec succès"
      },
      { status: 201 }
    )

  } catch (error) {
    console.error("Erreur lors de l'inscription:", error)
    return NextResponse.json(
      { success: false, error: "Erreur serveur lors de l'inscription" },
      { status: 500 }
    )
  }
}
