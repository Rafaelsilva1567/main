"use client"

import { useState, useEffect } from "react"
import { supabase, type EquipamentoLogistica } from "@/lib/supabase"
import { useOfflineSync } from "./useOfflineSync"

export function useEquipamentos() {
  const [equipamentos, setEquipamentos] = useState<EquipamentoLogistica[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { isOnline, addPendingOperation } = useOfflineSync()

  // Carregar dados do cache local
  const loadFromCache = () => {
    const cached = localStorage.getItem("equipamentos_cache")
    if (cached) {
      setEquipamentos(JSON.parse(cached))
    }
  }

  // Salvar no cache local
  const saveToCache = (data: EquipamentoLogistica[]) => {
    localStorage.setItem("equipamentos_cache", JSON.stringify(data))
  }

  const fetchEquipamentos = async () => {
    try {
      setLoading(true)

      if (!isOnline) {
        loadFromCache()
        return
      }

      const { data, error } = await supabase
        .from("equipamentos_logistica")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error

      const equipamentosData = data || []
      setEquipamentos(equipamentosData)
      saveToCache(equipamentosData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar equipamentos")
      // Se falhar, tenta carregar do cache
      loadFromCache()
    } finally {
      setLoading(false)
    }
  }

  const addEquipamento = async (equipamento: Omit<EquipamentoLogistica, "id" | "created_at">) => {
    try {
      // Criar um ID temporário para uso offline
      const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const newEquipamento: EquipamentoLogistica = {
        ...equipamento,
        id: tempId,
        created_at: new Date().toISOString(),
      }

      // Adicionar imediatamente à lista local
      setEquipamentos((prev) => [newEquipamento, ...prev])

      // Atualizar cache
      const updatedList = [newEquipamento, ...equipamentos]
      saveToCache(updatedList)

      if (isOnline) {
        try {
          // Preparar dados para inserção (converter dolly null para null explicitamente)
          const dataToInsert = {
            ...equipamento,
            dolly: equipamento.dolly || null
          }
          
          const { data, error } = await supabase.from("equipamentos_logistica").insert([dataToInsert]).select()
          if (error) throw error

          // Substituir o item temporário pelo real
          if (data && data[0]) {
            setEquipamentos((prev) => prev.map((eq) => (eq.id === tempId ? data[0] : eq)))
            const finalList = equipamentos.map((eq) => (eq.id === tempId ? data[0] : eq))
            saveToCache(finalList)
          }
        } catch (err) {
          // Se falhar online, adiciona à fila de sincronização
          addPendingOperation("create", { ...equipamento, dolly: equipamento.dolly || null })
        }
      } else {
        // Modo offline: adiciona à fila de sincronização
        addPendingOperation("create", { ...equipamento, dolly: equipamento.dolly || null })
      }

      return { success: true }
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Erro ao salvar equipamento",
      }
    }
  }

  const updateEquipamento = async (id: string, equipamento: Omit<EquipamentoLogistica, "id" | "created_at">) => {
    try {
      // Atualizar imediatamente na lista local
      setEquipamentos((prev) => prev.map((eq) => (eq.id === id ? { ...eq, ...equipamento } : eq)))

      // Atualizar cache
      const updatedList = equipamentos.map((eq) => (eq.id === id ? { ...eq, ...equipamento } : eq))
      saveToCache(updatedList)

      if (isOnline) {
        try {
          const { data, error } = await supabase
            .from("equipamentos_logistica")
            .update(equipamento)
            .eq("id", id)
            .select()
          if (error) throw error

          if (data && data[0]) {
            setEquipamentos((prev) => prev.map((eq) => (eq.id === id ? data[0] : eq)))
            const finalList = equipamentos.map((eq) => (eq.id === id ? data[0] : eq))
            saveToCache(finalList)
          }
        } catch (err) {
          addPendingOperation("update", { id, updates: equipamento })
        }
      } else {
        addPendingOperation("update", { id, updates: equipamento })
      }

      return { success: true }
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Erro ao atualizar equipamento",
      }
    }
  }

  const deleteEquipamento = async (id: string) => {
    try {
      // Remover imediatamente da lista local
      setEquipamentos((prev) => prev.filter((eq) => eq.id !== id))

      // Atualizar cache
      const updatedList = equipamentos.filter((eq) => eq.id !== id)
      saveToCache(updatedList)

      if (isOnline) {
        try {
          const { error } = await supabase.from("equipamentos_logistica").delete().eq("id", id)
          if (error) throw error
        } catch (err) {
          addPendingOperation("delete", { id })
        }
      } else {
        addPendingOperation("delete", { id })
      }

      return { success: true }
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Erro ao deletar equipamento",
      }
    }
  }

  useEffect(() => {
    fetchEquipamentos()
  }, [isOnline])

  return {
    equipamentos,
    loading,
    error,
    addEquipamento,
    updateEquipamento,
    deleteEquipamento,
    refetch: fetchEquipamentos,
  }
}
