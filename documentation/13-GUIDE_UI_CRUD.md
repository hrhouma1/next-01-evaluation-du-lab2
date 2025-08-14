# Guide pratique – Interfaces UI pour le CRUD Produits

Ce document donne un mode opératoire exhaustif, étapes et codes complets à copier, pour implémenter les pages d’interface suivantes:

- Liste: `/products`
- Création: `/products/new`
- Détail: `/products/[id]`
- Édition: `/products/[id]/edit`

Prérequis: les endpoints API correspondants doivent déjà être opérationnels (voir `11-GUIDE_COMPLET_PROJET.md`). Tailwind 3 doit être configuré (globals.css importé dans `app/layout.tsx`).

---

## Étape 0 – Préparer la navigation

Dans `app/page.tsx`, ajouter un lien visible vers l’interface:

```tsx
<p className="mt-2">
  Interface web: <a className="underline" href="/products">/products</a>
</p>
```

---

## Étape 1 – Page de liste `/products`

Créer le fichier `app/products/page.tsx` puis coller ce code. Enregistrer et tester sur `http://localhost:3000/products`.

```tsx
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

type Product = {
  id: number
  name: string
  price: number
  createdAt: string
  updatedAt: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    try {
      setLoading(true)
      const res = await fetch("/api/products", { cache: "no-store" })
      const json = await res.json()
      if (!res.ok || json.success !== true) {
        throw new Error(json.error || "Erreur lors du chargement")
      }
      setProducts(json.data as Product[])
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function handleDelete(id: number) {
    if (!confirm("Supprimer ce produit ?")) return
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" })
    if (res.ok) {
      await load()
    } else {
      const j = await res.json().catch(() => ({}))
      alert(j.error || "Suppression impossible")
    }
  }

  return (
    <main className="container mx-auto p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Produits</h1>
        <Link className="underline" href="/products/new">Nouveau produit</Link>
      </div>

      {loading && <p>Chargement...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && products.length === 0 && (
        <p>Aucun produit.</p>
      )}

      <ul className="space-y-3">
        {products.map((p) => (
          <li key={p.id} className="flex items-center justify-between border p-3 rounded">
            <div>
              <Link className="font-medium underline" href={`/products/${p.id}`}>{p.name}</Link>
              <div className="text-sm text-gray-600">{p.price.toFixed(2)} $</div>
            </div>
            <div className="flex items-center gap-3">
              <Link className="underline" href={`/products/${p.id}/edit`}>Modifier</Link>
              <button onClick={() => handleDelete(p.id)} className="text-red-700">Supprimer</button>
            </div>
          </li>
        ))}
      </ul>
    </main>
  )
}
```

Tests rapides:
- Si la liste est vide: créer d’abord un produit (voir Étape 2) puis revenir.
- Vérifier que le bouton Supprimer met bien à jour la liste.

---

## Étape 2 – Page de création `/products/new`

Créer `app/products/new/page.tsx` et coller le code suivant. Tester la création, puis vérifier la redirection vers la liste.

```tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function NewProductPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [price, setPrice] = useState<string>("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const body = { name: name.trim(), price: Number(price) }
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      })
      const json = await res.json()
      if (!res.ok || json.success !== true) {
        throw new Error(json.error || "Création impossible")
      }
      router.push("/products")
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="container mx-auto p-8 max-w-lg">
      <h1 className="text-2xl font-semibold mb-6">Nouveau produit</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Nom</label>
          <input className="border rounded w-full p-2" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label className="block mb-1">Prix</label>
          <input className="border rounded w-full p-2" type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required />
        </div>
        {error && <p className="text-red-700">{error}</p>}
        <button disabled={submitting} className="bg-black text-white px-4 py-2 rounded">
          {submitting ? "En cours..." : "Créer"}
        </button>
      </form>
    </main>
  )
}
```

Tests rapides:
- Créer plusieurs produits avec des prix différents.
- Vérifier qu’ils apparaissent dans la liste (Étape 1).

---

## Étape 3 – Page de détail `/products/[id]`

Créer `app/products/[id]/page.tsx` et coller le code ci-dessous. Ce handler construit une URL absolue côté serveur pour éviter l’erreur `ERR_INVALID_URL`.

```tsx
import Link from "next/link"
import { headers } from "next/headers"

async function fetchProduct(id: string) {
  const h = headers()
  const host = h.get("host")
  const proto = h.get("x-forwarded-proto") ?? "http"
  const baseUrl = host ? `${proto}://${host}` : "http://localhost:3000"

  const res = await fetch(`${baseUrl}/api/products/${id}`, { cache: "no-store" })
  if (!res.ok) return null
  const json = await res.json()
  return json?.data ?? null
}

export default async function ProductDetail({ params }: { params: { id: string } }) {
  const product = await fetchProduct(params.id)

  if (!product) {
    return (
      <main className="container mx-auto p-8">
        <p>Produit introuvable.</p>
        <Link className="underline" href="/products">Retour</Link>
      </main>
    )
  }

  return (
    <main className="container mx-auto p-8 max-w-2xl">
      <h1 className="text-2xl font-semibold mb-4">{product.name}</h1>
      <div className="space-y-2">
        <div>Prix: {product.price?.toFixed?.(2) ?? product.price} $</div>
        <div className="text-sm text-gray-600">Créé le {new Date(product.createdAt).toLocaleString()}</div>
        <div className="text-sm text-gray-600">Mis à jour le {new Date(product.updatedAt).toLocaleString()}</div>
      </div>
      <div className="mt-6 flex items-center gap-3">
        <Link className="underline" href={`/products/${product.id}/edit`}>Modifier</Link>
        <Link className="underline" href="/products">Retour à la liste</Link>
      </div>
    </main>
  )
}
```

Tests rapides:
- À partir de la liste, cliquer sur un produit pour afficher la fiche.
- Revenir à la liste en utilisant le lien.

---

## Étape 4 – Page d’édition `/products/[id]/edit`

Créer `app/products/[id]/edit/page.tsx` et coller le code. Modifier nom et prix, puis vérifier la sauvegarde.

```tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

type Product = {
  id: number
  name: string
  price: number
}

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [name, setName] = useState("")
  const [price, setPrice] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/products/${params.id}`)
        const json = await res.json()
        if (!res.ok || json.success !== true) throw new Error(json.error || "Produit introuvable")
        setProduct(json.data)
        setName(json.data.name)
        setPrice(String(json.data.price))
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [params.id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/products/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), price: Number(price) })
      })
      const json = await res.json()
      if (!res.ok || json.success !== true) throw new Error(json.error || "Modification impossible")
      router.push(`/products/${params.id}`)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <main className="container mx-auto p-8">Chargement...</main>
  if (error) return <main className="container mx-auto p-8 text-red-700">{error}</main>
  if (!product) return null

  return (
    <main className="container mx-auto p-8 max-w-lg">
      <h1 className="text-2xl font-semibold mb-6">Modifier le produit</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Nom</label>
          <input className="border rounded w-full p-2" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label className="block mb-1">Prix</label>
          <input className="border rounded w-full p-2" type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required />
        </div>
        {error && <p className="text-red-700">{error}</p>}
        <button disabled={saving} className="bg-black text-white px-4 py-2 rounded">
          {saving ? "Enregistrement..." : "Enregistrer"}
        </button>
      </form>
    </main>
  )
}
```

Tests rapides:
- Modifier un produit existant, vérifier sur la page de détail puis dans la liste.

---

## Étape 5 – Vérifier l’ensemble du parcours

1. Aller sur `/products`.
2. Créer un nouveau produit via `/products/new`.
3. Cliquer sur ce produit pour ouvrir `/products/[id]`.
4. Cliquer sur Modifier pour aller sur `/products/[id]/edit`.
5. Enregistrer, revenir au détail, puis à la liste.
6. Supprimer depuis la liste et vérifier la mise à jour.

---

## Dépannage ciblé

- Si Tailwind ne s’applique pas: vérifier `tailwind.config.js` (clés `content`), `app/globals.css`, import dans `app/layout.tsx`, et relancer `npm run dev`.
- Si une page serveur affiche "Failed to parse URL": utiliser la version avec `headers()` et URL absolue (Étape 3).
- Si la liste ne se rafraîchit pas après suppression: vérifier que `handleDelete` rappelle bien `load()`.

---

## Conclusion

Avec ces quatre pages et les endpoints REST, le CRUD complet est opérationnel. Les blocs fournis peuvent être collés tels quels dans les fichiers indiqués, puis testés immédiatement dans le navigateur.
