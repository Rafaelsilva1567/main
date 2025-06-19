"use client"

import { useState, useEffect } from "react"
import { supabase, type PendenciaEquipamento } from "@/lib/supabase"
import { useOfflineSync } from "./useOfflineSync"

export function usePendencias() {
  const [pendencias, setPendencias] = useState<PendenciaEquipamento[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { isOnline, addPendingOperation, saveToCache, loadFromCache } = useOfflineSync()

  const fetchPendencias = async () => {
    try {
      setLoading(true)
      setError(null)

      if (!isOnline) {
        const cached = loadFromCache("pendencias_equipamentos")
        if (cached) {
          setPendencias(cached)
          console.log("📱 Pendências carregadas do cache offline")
        }
        return
      }

      const { data, error } = await supabase
        .from("pendencias_equipamentos")
        .select("*")
        .order("data_abertura", { ascending: false })

      if (error) {
        console.error("Erro ao buscar pendências:", error)
        throw error
      }

      const pendenciasData = data || []
      setPendencias(pendenciasData)
      saveToCache("pendencias_equipamentos", pendenciasData)
      console.log("🌐 Pendências carregadas do servidor")
    } catch (error) {
      console.error("Erro ao carregar pendências:", error)
      setError(error instanceof Error ? error.message : "Erro ao carregar pendências")

      const cached = loadFromCache("pendencias_equipamentos")
      if (cached) {
        setPendencias(cached)
        console.log("📱 Pendências carregadas do cache após erro")
      }
    } finally {
      setLoading(false)
    }
  }

  const addPendencia = async (
    pendencia: Omit<PendenciaEquipamento, "id" | "created_at" | "updated_at" | "data_abertura">,
  ) => {
    try {
      const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const newPendencia: PendenciaEquipamento = {
        ...pendencia,
        id: tempId,
        data_abertura: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      // Atualizar o estado imediatamente ANTES de tentar salvar
      const updatedPendencias = [newPendencia, ...pendencias]
      setPendencias(updatedPendencias)
      saveToCache("pendencias_equipamentos", updatedPendencias)

      console.log("✅ Pendência adicionada ao estado local:", newPendencia)
      console.log("📊 Total de pendências agora:", updatedPendencias.length)

      if (isOnline) {
        try {
          // Preparar dados para inserção, convertendo datas vazias para null
          const dataToInsert = {
            ...pendencia,
            data_prevista: pendencia.data_prevista || null,
            data_conclusao: pendencia.data_conclusao || null,
          }

          console.log("🌐 Tentando salvar no servidor:", dataToInsert)

          const { data, error } = await supabase.from("pendencias_equipamentos").insert([dataToInsert]).select()

          if (error) throw error

          if (data && data[0]) {
            console.log("✅ Salvo no servidor, atualizando com ID real:", data[0])
            // Substituir o item temporário pelo real
            const finalPendencias = updatedPendencias.map((p) => (p.id === tempId ? data[0] : p))
            setPendencias(finalPendencias)
            saveToCache("pendencias_equipamentos", finalPendencias)
          }
        } catch (err) {
          console.log("⚠️ Erro ao salvar no servidor, adicionando à fila offline:", err)
          addPendingOperation("create", "pendencias_equipamentos", {
            ...pendencia,
            data_prevista: pendencia.data_prevista || null,
            data_conclusao: pendencia.data_conclusao || null,
          })
        }
      } else {
        console.log("📱 Modo offline, adicionando à fila de sincronização")
        addPendingOperation("create", "pendencias_equipamentos", {
          ...pendencia,
          data_prevista: pendencia.data_prevista || null,
          data_conclusao: pendencia.data_conclusao || null,
        })
      }

      return { success: true }
    } catch (error) {
      console.error("❌ Erro ao adicionar pendência:", error)
      return { success: false, error: error instanceof Error ? error.message : "Erro ao adicionar pendência" }
    }
  }

  const updatePendencia = async (id: string, updates: Partial<PendenciaEquipamento>) => {
    try {
      const updatedPendencias = pendencias.map((p) => (p.id === id ? { ...p, ...updates } : p))
      setPendencias(updatedPendencias)
      saveToCache("pendencias_equipamentos", updatedPendencias)

      if (isOnline) {
        try {
          const { data, error } = await supabase.from("pendencias_equipamentos").update(updates).eq("id", id).select()
          if (error) throw error

          if (data && data[0]) {
            const finalPendencias = pendencias.map((p) => (p.id === id ? data[0] : p))
            setPendencias(finalPendencias)
            saveToCache("pendencias_equipamentos", finalPendencias)
          }
        } catch (err) {
          addPendingOperation("update", "pendencias_equipamentos", { id, updates })
        }
      } else {
        addPendingOperation("update", "pendencias_equipamentos", { id, updates })
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Erro ao atualizar pendência" }
    }
  }

  const deletePendencia = async (id: string) => {
    try {
      const updatedPendencias = pendencias.filter((p) => p.id !== id)
      setPendencias(updatedPendencias)
      saveToCache("pendencias_equipamentos", updatedPendencias)

      if (isOnline) {
        try {
          const { error } = await supabase.from("pendencias_equipamentos").delete().eq("id", id)
          if (error) throw error
        } catch (err) {
          addPendingOperation("delete", "pendencias_equipamentos", { id })
        }
      } else {
        addPendingOperation("delete", "pendencias_equipamentos", { id })
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Erro ao deletar pendência" }
    }
  }

  useEffect(() => {
    fetchPendencias()
  }, [isOnline])

  // Adicionar listener para mudanças em tempo real
  useEffect(() => {
    const handleRealtimeUpdate = (event: CustomEvent) => {
      const payload = event.detail

      if (payload.eventType === "INSERT" && payload.new) {
        setPendencias((prev) => {
          const exists = prev.find((p) => p.id === payload.new.id)
          if (!exists) {
            return [payload.new, ...prev]
          }
          return prev
        })
      } else if (payload.eventType === "UPDATE" && payload.new) {
        setPendencias((prev) => prev.map((p) => (p.id === payload.new.id ? payload.new : p)))
      } else if (payload.eventType === "DELETE" && payload.old) {
        setPendencias((prev) => prev.filter((p) => p.id !== payload.old.id))
      }
    }

    window.addEventListener("pendencias_updated", handleRealtimeUpdate as EventListener)

    return () => {
      window.removeEventListener("pendencias_updated", handleRealtimeUpdate as EventListener)
    }
  }, [])

  return {
    pendencias,
    loading,
    error,
    addPendencia,
    updatePendencia,
    deletePendencia,
    refetch: fetchPendencias,
  }
}
