"use client"

import { Wifi, WifiOff, FolderSyncIcon as Sync, Clock, AlertCircle, CheckCircle, Zap } from "lucide-react"
import { useOfflineSync } from "@/hooks/useOfflineSync"
import { useState, useEffect } from "react"

export function ConnectionStatus() {
  const { isOnline, pendingOperations, isSyncing, syncPendingOperations, lastSyncTime } = useOfflineSync()
  const [supabaseStatus, setSupabaseStatus] = useState<"checking" | "connected" | "error">("checking")
  const [showDetails, setShowDetails] = useState(false)

  // Verificar conexão com Supabase
  useEffect(() => {
    const checkSupabase = async () => {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        if (!supabaseUrl || !supabaseKey) {
          setSupabaseStatus("error")
          return
        }

        const response = await fetch(`${supabaseUrl}/rest/v1/`, {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
        })

        if (response.ok) {
          setSupabaseStatus("connected")
        } else {
          setSupabaseStatus("error")
        }
      } catch (error) {
        console.error("Erro ao verificar Supabase:", error)
        setSupabaseStatus("error")
      }
    }

    if (isOnline) {
      checkSupabase()
    }
  }, [isOnline])

  const formatLastSync = () => {
    if (!lastSyncTime) return "Nunca"
    const now = new Date()
    const diff = now.getTime() - lastSyncTime.getTime()
    const minutes = Math.floor(diff / 60000)

    if (minutes < 1) return "Agora mesmo"
    if (minutes < 60) return `${minutes}min atrás`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h atrás`
    return lastSyncTime.toLocaleDateString()
  }

  const getOperationsByTable = () => {
    const grouped = pendingOperations.reduce(
      (acc, op) => {
        const tableName = op.table.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())
        acc[tableName] = (acc[tableName] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )
    return grouped
  }

  return (
    <div className="flex items-center gap-4 text-sm">
      {/* Status da Internet */}
      {isOnline ? (
        <div className="flex items-center gap-2 text-emerald-300">
          <div className="relative">
            <Wifi className="h-5 w-5" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
          </div>
          <span className="font-medium">Online</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-red-300">
          <WifiOff className="h-5 w-5 animate-pulse" />
          <span className="font-medium">Offline</span>
        </div>
      )}

      {/* Status do Supabase */}
      <div className="flex items-center gap-2">
        {supabaseStatus === "checking" && (
          <div className="text-blue-300 flex items-center gap-2">
            <Sync className="h-5 w-5 animate-spin" />
            <span className="font-medium">Verificando DB...</span>
          </div>
        )}
        {supabaseStatus === "connected" && (
          <div className="text-emerald-300 flex items-center gap-2">
            <div className="relative">
              <CheckCircle className="h-5 w-5" />
              <Zap className="h-3 w-3 absolute -top-1 -right-1 text-yellow-300 animate-pulse" />
            </div>
            <span className="font-medium">DB Conectado</span>
          </div>
        )}
        {supabaseStatus === "error" && (
          <div className="text-red-300 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 animate-pulse" />
            <span className="font-medium">Erro DB</span>
          </div>
        )}
      </div>

      {/* Operações Pendentes */}
      {pendingOperations.length > 0 && (
        <div className="flex items-center gap-2 text-amber-300">
          {isSyncing ? (
            <>
              <Sync className="h-5 w-5 animate-spin" />
              <span className="font-medium">Sincronizando...</span>
            </>
          ) : (
            <>
              <div className="relative">
                <Clock className="h-5 w-5" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-amber-900">{pendingOperations.length}</span>
                </div>
              </div>
              <button onClick={() => setShowDetails(!showDetails)} className="hover:underline font-medium">
                {pendingOperations.length} pendente(s)
              </button>
            </>
          )}
        </div>
      )}

      {/* Última Sincronização */}
      {lastSyncTime && (
        <div className="text-white/70 text-xs font-medium">
          <Clock className="h-4 w-4 inline mr-1" />
          Última sync: {formatLastSync()}
        </div>
      )}

      {/* Botão de Sincronização Manual */}
      {isOnline && pendingOperations.length > 0 && !isSyncing && (
        <button
          onClick={syncPendingOperations}
          className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 backdrop-blur-sm border border-white/30"
        >
          Sincronizar agora
        </button>
      )}

      {/* Detalhes das Operações Pendentes */}
      {showDetails && pendingOperations.length > 0 && (
        <div className="absolute top-full left-0 mt-2 bg-white/95 backdrop-blur-md border border-white/50 rounded-xl shadow-2xl p-4 z-50 min-w-[250px]">
          <h4 className="font-semibold text-sm mb-3 text-gray-800">Operações Pendentes:</h4>
          {Object.entries(getOperationsByTable()).map(([table, count]) => (
            <div key={table} className="text-sm text-gray-600 flex justify-between py-1">
              <span>{table}:</span>
              <span className="font-semibold">{count}</span>
            </div>
          ))}
          <button
            onClick={() => setShowDetails(false)}
            className="text-sm text-blue-600 mt-3 hover:underline font-medium"
          >
            Fechar
          </button>
        </div>
      )}
    </div>
  )
}
