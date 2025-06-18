"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"

type PendingOperation = {
  id: string
  type: "create" | "update" | "delete"
  table: "equipamentos_logistica" | "tanques_disponiveis" | "dollys_disponiveis" | "pendencias_equipamentos"
  data: any
  timestamp: number
}

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(true)
  const [pendingOperations, setPendingOperations] = useState<PendingOperation[]>([])
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)

  // Verificar status da conexão
  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine)
    }

    window.addEventListener("online", updateOnlineStatus)
    window.addEventListener("offline", updateOnlineStatus)

    // Carregar operações pendentes do localStorage
    const savedOperations = localStorage.getItem("pendingOperations")
    if (savedOperations) {
      setPendingOperations(JSON.parse(savedOperations))
    }

    const lastSync = localStorage.getItem("lastSyncTime")
    if (lastSync) {
      setLastSyncTime(new Date(lastSync))
    }

    return () => {
      window.removeEventListener("online", updateOnlineStatus)
      window.removeEventListener("offline", updateOnlineStatus)
    }
  }, [])

  // Salvar operações pendentes no localStorage
  useEffect(() => {
    localStorage.setItem("pendingOperations", JSON.stringify(pendingOperations))
  }, [pendingOperations])

  // Adicionar operação à fila
  const addPendingOperation = useCallback(
    (type: PendingOperation["type"], table: PendingOperation["table"], data: any) => {
      const operation: PendingOperation = {
        id: crypto.randomUUID(),
        type,
        table,
        data,
        timestamp: Date.now(),
      }
      setPendingOperations((prev) => [...prev, operation])
      console.log(`📝 Operação ${type} adicionada à fila offline para ${table}:`, data)
    },
    [],
  )

  // Sincronizar operações pendentes
  const syncPendingOperations = useCallback(async () => {
    if (!isOnline || pendingOperations.length === 0 || isSyncing) return

    console.log(`🔄 Iniciando sincronização de ${pendingOperations.length} operações...`)
    setIsSyncing(true)
    const successfulOperations: string[] = []
    const errors: string[] = []

    try {
      for (const operation of pendingOperations) {
        try {
          console.log(`🔄 Sincronizando ${operation.type} em ${operation.table}:`, operation.data)

          switch (operation.type) {
            case "create":
              const { error: createError } = await supabase.from(operation.table).insert([operation.data])
              if (createError) throw createError
              break

            case "update":
              const { error: updateError } = await supabase
                .from(operation.table)
                .update(operation.data.updates)
                .eq("id", operation.data.id)
              if (updateError) throw updateError
              break

            case "delete":
              const { error: deleteError } = await supabase.from(operation.table).delete().eq("id", operation.data.id)
              if (deleteError) throw deleteError
              break
          }

          successfulOperations.push(operation.id)
          console.log(`✅ Operação ${operation.id} sincronizada com sucesso`)
        } catch (error) {
          console.error(`❌ Erro ao sincronizar operação ${operation.id}:`, error)
          errors.push(
            `${operation.type} em ${operation.table}: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
          )
        }
      }

      // Remover operações bem-sucedidas
      setPendingOperations((prev) => prev.filter((op) => !successfulOperations.includes(op.id)))

      // Atualizar tempo da última sincronização
      const now = new Date()
      setLastSyncTime(now)
      localStorage.setItem("lastSyncTime", now.toISOString())

      console.log(`🎉 Sincronização concluída: ${successfulOperations.length} sucessos, ${errors.length} erros`)
    } finally {
      setIsSyncing(false)
    }

    return {
      successful: successfulOperations.length,
      errors: errors.length,
      errorMessages: errors,
    }
  }, [isOnline, pendingOperations, isSyncing])

  // Sincronizar automaticamente quando ficar online
  useEffect(() => {
    if (isOnline && pendingOperations.length > 0) {
      const timer = setTimeout(() => {
        console.log("🌐 Conexão restaurada! Iniciando sincronização automática...")
        syncPendingOperations()
      }, 2000) // Aguarda 2 segundos após ficar online

      return () => clearTimeout(timer)
    }
  }, [isOnline, pendingOperations.length, syncPendingOperations])

  // Função para salvar dados no cache local
  const saveToCache = useCallback((key: string, data: any) => {
    try {
      localStorage.setItem(
        `cache_${key}`,
        JSON.stringify({
          data,
          timestamp: Date.now(),
        }),
      )
    } catch (error) {
      console.error("Erro ao salvar no cache:", error)
    }
  }, [])

  // Função para carregar dados do cache local
  const loadFromCache = useCallback((key: string) => {
    try {
      const cached = localStorage.getItem(`cache_${key}`)
      if (cached) {
        const { data, timestamp } = JSON.parse(cached)
        // Cache válido por 24 horas
        if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
          return data
        }
      }
    } catch (error) {
      console.error("Erro ao carregar do cache:", error)
    }
    return null
  }, [])

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
