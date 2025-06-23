"use client"

import { useEffect } from "react"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log do erro para debugging
    console.error("Application Error:", error)

    // Enviar erro para serviço de monitoramento (opcional)
    if (typeof window !== "undefined") {
      // Salvar erro no localStorage para análise
      const errorLog = {
        message: error.message,
        stack: error.stack,
        digest: error.digest,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      }

      try {
        const existingLogs = JSON.parse(localStorage.getItem("error_logs") || "[]")
        existingLogs.push(errorLog)
        // Manter apenas os últimos 10 erros
        if (existingLogs.length > 10) {
          existingLogs.splice(0, existingLogs.length - 10)
        }
        localStorage.setItem("error_logs", JSON.stringify(existingLogs))
      } catch (e) {
        console.warn("Não foi possível salvar log de erro:", e)
      }
    }
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl border border-red-200 overflow-hidden">
        {/* Header do erro */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 text-white text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-white/20 p-3 rounded-full">
              <AlertTriangle className="h-8 w-8" />
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-2">Oops! Algo deu errado</h1>
          <p className="text-red-100">Ocorreu um erro inesperado no sistema</p>
        </div>

        {/* Conteúdo do erro */}
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Detalhes do Erro:</h2>
            <div className="bg-gray-50 rounded-lg p-4 border">
              <p className="text-sm text-gray-600 font-mono break-words">{error.message || "Erro desconhecido"}</p>
              {error.digest && <p className="text-xs text-gray-500 mt-2">ID: {error.digest}</p>}
            </div>
          </div>

          {/* Sugestões de solução */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">Possíveis soluções:</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                Recarregue a página usando o botão abaixo
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                Verifique sua conexão com a internet
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                Limpe o cache do navegador
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                Tente novamente em alguns minutos
              </li>
            </ul>
          </div>

          {/* Botões de ação */}
          <div className="space-y-3">
            <Button onClick={reset} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>

            <Button onClick={() => (window.location.href = "/")} variant="outline" className="w-full">
              <Home className="h-4 w-4 mr-2" />
              Voltar ao Início
            </Button>
          </div>

          {/* Informações de suporte */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Se o problema persistir, entre em contato com o suporte técnico
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
