"use client"

import { useState, useEffect } from "react"
import { supabase, type TanqueDisponivel } from "@/lib/supabase"
import { useOfflineSync } from "./useOfflineSync"

export function useTanquesDisponiveis() {
  const [tanques, setTanques] = useState<TanqueDisponivel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { isOnline, addPendingOperation, saveToCache, loadFromCache } = useOfflineSync()

  const fetchTanques = async () => {
    try {
      setLoading(true)
      setError(null)

      if (!isOnline) {
        // Carregar do cache quando offline
        const cached = loadFromCache("tanques_disponiveis")
        if (cached) {
          setTanques(cached)
          console.log("📱 Tanques carregados do cache offline")
        }
        return
      }

      const { data, error } = await supabase
        .from("tanques_disponiveis")
        .select("*")
        .order("numero_tanque", { ascending: true })

      if (error) {
        console.error("Erro ao buscar tanques:", error)
        throw error
      }

      const tanquesData = data || []
      setTanques(tanquesData)
      saveToCache("tanques_disponiveis", tanquesData)
      console.log("🌐 Tanques carregados do servidor")
    } catch (error) {
      console.error("Erro ao carregar tanques:", error)
      setError(error instanceof Error ? error.message : "Erro ao carregar tanques")

      // Tentar carregar do cache em caso de erro
      const cached = loadFromCache("tanques_disponiveis")
      if (cached) {
        setTanques(cached)
        console.log("📱 Tanques carregados do cache após erro")
      }
    } finally {
      setLoading(false)
    }
  }

  const addTanque = async (tanque: Omit<TanqueDisponivel, "id" | "created_at" | "updated_at">) => {
    try {
      // Validar dados obrigatórios
      if (!tanque.numero_tanque) {
        throw new Error("Número do tanque é obrigatório")
      }

      // Verificar se o tanque já existe
      const existingTanque = tanques.find((t) => t.numero_tanque === tanque.numero_tanque)
      if (existingTanque) {
        throw new Error(`Tanque ${tanque.numero_tanque} já existe`)
      }

      // Criar ID temporário para uso offline
      const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const newTanque: TanqueDisponivel = {
        ...tanque,
        id: tempId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      // Adicionar imediatamente à lista local
      const updatedTanques = [...tanques, newTanque].sort((a, b) => a.numero_tanque - b.numero_tanque)
      setTanques(updatedTanques)
      saveToCache("tanques_disponiveis", updatedTanques)

      if (isOnline) {
        try {
          // Preparar dados para inserção
          const dataToInsert = {
            numero_tanque: tanque.numero_tanque,
            capacidade: tanque.capacidade || null,
            tipo: tanque.tipo || null,
            status: tanque.status || "disponivel",
            localizacao: tanque.localizacao || null,
            observacoes: tanque.observacoes || null,
          }

          const { data, error } = await supabase.from("tanques_disponiveis").insert([dataToInsert]).select()

          if (error) throw error

          // Substituir o item temporário pelo real
          if (data && data[0]) {
            const finalTanques = tanques.map((t) => (t.id === tempId ? data[0] : t))
            setTanques(finalTanques)
            saveToCache("tanques_disponiveis", finalTanques)
          }
        } catch (err) {
          // Se falhar online, adiciona à fila de sincronização
          addPendingOperation("create", "tanques_disponiveis", {
            numero_tanque: tanque.numero_tanque,
            capacidade: tanque.capacidade || null,
            tipo: tanque.tipo || null,
            status: tanque.status || "disponivel",
            localizacao: tanque.localizacao || null,
            observacoes: tanque.observacoes || null,
          })
        }
      } else {
        // Modo offline: adiciona à fila de sincronização
        addPendingOperation("create", "tanques_disponiveis", {
          numero_tanque: tanque.numero_tanque,
          capacidade: tanque.capacidade || null,
          tipo: tanque.tipo || null,
          status: tanque.status || "disponivel",
          localizacao: tanque.localizacao || null,
          observacoes: tanque.observacoes || null,
        })
      }

      return { success: true }
    } catch (error) {
      console.error("Erro ao adicionar tanque:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido ao adicionar tanque",
      }
    }
  }

  const updateTanque = async (id: string, updates: Partial<TanqueDisponivel>) => {
    try {
      // Atualizar imediatamente na lista local
      const updatedTanques = tanques.map((t) => (t.id === id ? { ...t, ...updates } : t))
      setTanques(updatedTanques)
      saveToCache("tanques_disponiveis", updatedTanques)

      if (isOnline) {
        try {
          const { data, error } = await supabase.from("tanques_disponiveis").update(updates).eq("id", id).select()
          if (error) throw error

          if (data && data[0]) {
            const finalTanques = tanques.map((t) => (t.id === id ? data[0] : t))
            setTanques(finalTanques)
            saveToCache("tanques_disponiveis", finalTanques)
          }
        } catch (err) {
          addPendingOperation("update", "tanques_disponiveis", { id, updates })
        }
      } else {
        addPendingOperation("update", "tanques_disponiveis", { id, updates })
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Erro ao atualizar tanque" }
    }
  }

  const deleteTanque = async (id: string) => {
    try {
      // Remover imediatamente da lista local
      const updatedTanques = tanques.filter((t) => t.id !== id)
      setTanques(updatedTanques)
      saveToCache("tanques_disponiveis", updatedTanques)

      if (isOnline) {
        try {
          const { error } = await supabase.from("tanques_disponiveis").delete().eq("id", id)
          if (error) throw error
        } catch (err) {
          addPendingOperation("delete", "tanques_disponiveis", { id })
        }
      } else {
        addPendingOperation("delete", "tanques_disponiveis", { id })
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Erro ao deletar tanque" }
    }
  }

  useEffect(() => {
    fetchTanques()
  }, [isOnline])

  // Adicionar listener para mudanças em tempo real
  useEffect(() => {
    const handleRealtimeUpdate = (event: CustomEvent) => {
      const payload = event.detail

      if (payload.eventType === "INSERT" && payload.new) {
        setTanques((prev) => {
          const exists = prev.find((t) => t.id === payload.new.id)
          if (!exists) {
            return [...prev, payload.new].sort((a, b) => a.numero_tanque - b.numero_tanque)
          }
          return prev
        })
      } else if (payload.eventType === "UPDATE" && payload.new) {
        setTanques((prev) => prev.map((t) => (t.id === payload.new.id ? payload.new : t)))
      } else if (payload.eventType === "DELETE" && payload.old) {
        setTanques((prev) => prev.filter((t) => t.id !== payload.old.id))
      }
    }

    window.addEventListener("tanques_updated", handleRealtimeUpdate as EventListener)

    return () => {
      window.removeEventListener("tanques_updated", handleRealtimeUpdate as EventListener)
    }
  }, [])

  return {
    tanques,
    loading,
    error,
    addTanque,
    updateTanque,
    deleteTanque,
    refetch: fetchTanques,
  }
}
