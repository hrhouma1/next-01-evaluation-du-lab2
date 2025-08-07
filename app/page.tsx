export default function Home() {
  return (
    <main className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">
        Laboratoire 2 - Services Web REST
      </h1>
      <div className="space-y-4">
        <p>
          Cette application propose 4 services web REST pour gérer des produits :
        </p>
        <ul className="list-disc list-inside space-y-2">
          <li><strong>GET /api/products</strong> - Obtenir la liste des produits</li>
          <li><strong>POST /api/products</strong> - Ajouter un nouveau produit</li>
          <li><strong>PUT /api/products/[id]</strong> - Modifier un produit par ID</li>
          <li><strong>DELETE /api/products/[id]</strong> - Supprimer un produit par ID</li>
        </ul>
        <p className="mt-6">
          Utilisez Postman ou un autre client REST pour tester ces endpoints.
        </p>
      </div>
    </main>
  )
}