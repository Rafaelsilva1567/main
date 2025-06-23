"use client"

import type React from "react"
import { Component, type ReactNode } from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo)

    // Log do erro
    if (typeof window !== "undefined") {
      const errorLog = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
      }

      try {
        const logs = JSON.parse(localStorage.getItem("component_errors") || "[]")
        logs.push(errorLog)
        localStorage.setItem("component_errors", JSON.stringify(logs.slice(-5)))
      } catch (e) {
        console.warn("Não foi possível salvar log de erro do componente:", e)
      }
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex items-center justify-center p-8">
          <div className="bg-white rounded-lg shadow-lg border border-red-200 p-6 max-w-md w-full text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Erro no Componente</h3>
            <p className="text-gray-600 mb-4 text-sm">Este componente encontrou um erro e não pode ser exibido.</p>
            <Button onClick={() => this.setState({ hasError: false, error: undefined })} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
