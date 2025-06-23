"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { ErrorHandler } from "@/lib/error-handler"

type PendingOperation = {
  id: string
  type: "create" | "update" | "delete"
  table: "equipamentos_logistica" | "tanques_disponiveis" | "dollys_disponiveis" | "pendencias_equipamentos"
  data: any
  timestamp: number
}

/**
 * Hook responsável por:
 * 1. Detectar estado online/offline
 * 2. Enfileirar operações quando offline
 * 3. Sincronizar automaticamente quando a conexão volta
 * 4. Cachear dados (saveToCache / loadFromCache)
 */
export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== "undefined" ? navigator.onLine : true)
  const [pendingOperations, setPendingOperations] = useState<PendingOperation[]>([])
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)

  /* ----------------------------------------
   * 1. MONITORAR CONEXÃO
   * ------------------------------------- */
  useEffect(() => {
    const goOnline = () => setIsOnline(true)
    const goOffline = () => setIsOnline(false)

    window.addEventListener("online", goOnline)
    window.addEventListener("offline", goOffline)

    // Restaurar fila e timestamp do localStorage
    try {
      const saved = localStorage.getItem("pendingOperations")
      if (saved) setPendingOperations(JSON.parse(saved))
      const last = localStorage.getItem("lastSyncTime")
      if (last) setLastSyncTime(new Date(last))
    } catch (err) {
      ErrorHandler.logError(err as Error, "useOfflineSync — loadStorage")
    }

    return () => {
      window.removeEventListener("online", goOnline)
      window.removeEventListener("offline", goOffline)
    }
  }, [])

  /* ----------------------------------------
   * 2. PERSISTIR FILA NO LOCALSTORAGE
   * ------------------------------------- */
  useEffect(() => {
    try {
      localStorage.setItem("pendingOperations", JSON.stringify(pendingOperations))
    } catch (err) {
      ErrorHandler.logError(err as Error, "useOfflineSync — saveStorage")
    }
  }, [pendingOperations])

  /* ----------------------------------------
   * 3. ADICIONAR À FILA
   * ------------------------------------- */
  const addPendingOperation = useCallback(
    (type: PendingOperation["type"], table: PendingOperation["table"], data: any) => {
      const op: PendingOperation = {
        id: crypto.randomUUID(),
        type,
        table,
        data,
        timestamp: Date.now(),
      }
      setPendingOperations((prev) => [...prev, op])
      console.log(`📝 Operação OFFLINE adicionada (${type} em ${table})`, data)
    },
    [],
  )

  /* ----------------------------------------
   * 4. SINCRONIZAÇÃO
   * ------------------------------------- */
  const syncPendingOperations = useCallback(async () => {
    if (!isOnline || isSyncing || pendingOperations.length === 0) return

    console.log(`🔄 Sincronizando ${pendingOperations.length} operação(ões)…`)
    setIsSyncing(true)

    const okIds: string[] = []

    try {
      for (const op of pendingOperations) {
        try {
          switch (op.type) {
            case "create": {
              const { error } = await supabase.from(op.table).insert([op.data])
              if (error) throw error
              break
            }
            case "update": {
              const { error } = await supabase.from(op.table).update(op.data.updates).eq("id", op.data.id)
              if (error) throw error
              break
            }
            case "delete": {
              const { error } = await supabase.from(op.table).delete().eq("id", op.data.id)
              if (error) throw error
              break
            }
          }
          okIds.push(op.id)
        } catch (err) {
          ErrorHandler.logError(err as Error, `Sync-${op.table}`)
          // mantém na fila para próxima tentativa
        }
      }
    } finally {
      // remover bem-sucedidos
      if (okIds.length) {
        setPendingOperations((prev) => prev.filter((o) => !okIds.includes(o.id)))
      }
      const now = new Date()
      setLastSyncTime(now)
      localStorage.setItem("lastSyncTime", now.toISOString())
      setIsSyncing(false)
    }
  }, [isOnline, isSyncing, pendingOperations])

  /* ----------------------------------------
   * 5. AUTO-SYNC AO VOLTAR ONLINE
   * ------------------------------------- */
  useEffect(() => {
    if (isOnline && pendingOperations.length) {
      const t = setTimeout(() => syncPendingOperations(), 1500)
      return () => clearTimeout(t)
    }
  }, [isOnline, pendingOperations, syncPendingOperations])

  /* ----------------------------------------
   * 6. CACHE UTIL
   * ------------------------------------- */
  const saveToCache = useCallback((key: string, data: unknown) => {
    try {
      localStorage.setItem(`cache_${key}`, JSON.stringify({ data, timestamp: Date.now() }))
    } catch (err) {
      ErrorHandler.logError(err as Error, "saveToCache")
    }
  }, [])

  const loadFromCache = useCallback((key: string) => {
    try {
      const cached = localStorage.getItem(`cache_${key}`)
      if (!cached) return null
      const { data, timestamp } = JSON.parse(cached)
      // 24 h de validade
      if (Date.now() - timestamp < 86_400_000) return data
      return null
    } catch (err) {
      ErrorHandler.logError(err as Error, "loadFromCache")
      return null
    }
  }, [])

  /* --------- API --------- */
  return {
    isOnline,
    pendingOperations,
    isSyncing,
    lastSyncTime,
    addPendingOperation,
    syncPendingOperations,
    saveToCache,
    loadFromCache,
  }
}

/* Export default opcional para quem importa dessa forma */
export default useOfflineSync
