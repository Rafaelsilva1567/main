"use client"

import { useEffect } from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Global Error:", error)
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="flex justify-center mb-4">
              <AlertTriangle className="h-12 w-12 text-red-500" />
            </div>
            <h1 className="text-xl font-bold text-gray-800 mb-2">Erro Crítico do Sistema</h1>
            <p className="text-gray-600 mb-6">Ocorreu um erro crítico. Por favor, recarregue a página.</p>
            <button
              onClick={reset}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 mx-auto"
            >
              <RefreshCw className="h-4 w-4" />
              Recarregar Página
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
