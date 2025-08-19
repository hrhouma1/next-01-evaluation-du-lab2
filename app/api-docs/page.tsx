'use client'

import dynamic from 'next/dynamic'
import React from 'react'
import 'swagger-ui-react/swagger-ui.css'

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
