// Utilitário para tratamento de erros
export class ErrorHandler {
  static logError(error: Error, context?: string) {
    console.error(`[${context || "Unknown"}] Error:`, error)

    if (typeof window !== "undefined") {
      try {
        const errorLog = {
          message: error.message,
          stack: error.stack,
          context,
          timestamp: new Date().toISOString(),
          url: window.location.href,
        }

        const logs = JSON.parse(localStorage.getItem("app_errors") || "[]")
        logs.push(errorLog)

        // Manter apenas os últimos 20 erros
        if (logs.length > 20) {
          logs.splice(0, logs.length - 20)
        }

        localStorage.setItem("app_errors", JSON.stringify(logs))
      } catch (e) {
        console.warn("Não foi possível salvar log de erro:", e)
      }
    }
  }

  static async handleAsyncError<T>(
    operation: () => Promise<T>,
    context?: string,
    fallback?: T,
  ): Promise<T | undefined> {
    try {
      return await operation()
    } catch (error) {
      this.logError(error as Error, context)
      return fallback
    }
  }

  static handleSyncError<T>(operation: () => T, context?: string, fallback?: T): T | undefined {
    try {
      return operation()
    } catch (error) {
      this.logError(error as Error, context)
      return fallback
    }
  }

  static getErrorLogs(): any[] {
    if (typeof window === "undefined") return []

    try {
      return JSON.parse(localStorage.getItem("app_errors") || "[]")
    } catch {
      return []
    }
  }

  static clearErrorLogs() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("app_errors")
      localStorage.removeItem("error_logs")
      localStorage.removeItem("component_errors")
    }
  }
}
