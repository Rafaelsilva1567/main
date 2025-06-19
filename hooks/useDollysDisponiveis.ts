"use client"

import { useState, useEffect } from "react"
import { supabase, type DollyDisponivel } from "@/lib/supabase"
import { useOfflineSync } from "./useOfflineSync"

export function useDollysDisponiveis() {
  const [dollys, setDollys] = useState<DollyDisponivel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { isOnline, addPendingOperation, saveToCache, loadFromCache } = useOfflineSync()

  const fetchDollys = async () => {
    try {
      setLoading(true)
      setError(null)

      if (!isOnline) {
        const cached = loadFromCache("dollys_disponiveis")
        if (cached) {
          setDollys(cached)
          console.log("📱 Dollys carregados do cache offline")
        }
        return
      }

      const { data, error } = await supabase
        .from("dollys_disponiveis")
        .select("*")
        .order("numero_dolly", { ascending: true })

      if (error) {
        console.error("Erro ao buscar dollys:", error)
        throw error
      }

      const dollysData = data || []
      setDollys(dollysData)
      saveToCache("dollys_disponiveis", dollysData)
      console.log("🌐 Dollys carregados do servidor")
    } catch (error) {
      console.error("Erro ao carregar dollys:", error)
      setError(error instanceof Error ? error.message : "Erro ao carregar dollys")

      const cached = loadFromCache("dollys_disponiveis")
      if (cached) {
        setDollys(cached)
        console.log("📱 Dollys carregados do cache após erro")
      }
    } finally {
      setLoading(false)
    }
  }

  const addDolly = async (dolly: Omit<DollyDisponivel, "id" | "created_at" | "updated_at">) => {
    try {
      const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const newDolly: DollyDisponivel = {
        ...dolly,
        id: tempId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const updatedDollys = [...dollys, newDolly].sort((a, b) => a.numero_dolly - b.numero_dolly)
      setDollys(updatedDollys)
      saveToCache("dollys_disponiveis", updatedDollys)

      if (isOnline) {
        try {
          const { data, error } = await supabase.from("dollys_disponiveis").insert([dolly]).select()
          if (error) throw error

          if (data && data[0]) {
            const finalDollys = dollys.map((d) => (d.id === tempId ? data[0] : d))
            setDollys(finalDollys)
            saveToCache("dollys_disponiveis", finalDollys)
          }
        } catch (err) {
          addPendingOperation("create", "dollys_disponiveis", dolly)
        }
      } else {
        addPendingOperation("create", "dollys_disponiveis", dolly)
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Erro ao adicionar dolly" }
    }
  }

  const updateDolly = async (id: string, updates: Partial<DollyDisponivel>) => {
    try {
      const updatedDollys = dollys.map((d) => (d.id === id ? { ...d, ...updates } : d))
      setDollys(updatedDollys)
      saveToCache("dollys_disponiveis", updatedDollys)

      if (isOnline) {
        try {
          const { data, error } = await supabase.from("dollys_disponiveis").update(updates).eq("id", id).select()
          if (error) throw error

          if (data && data[0]) {
            const finalDollys = dollys.map((d) => (d.id === id ? data[0] : d))
            setDollys(finalDollys)
            saveToCache("dollys_disponiveis", finalDollys)
          }
        } catch (err) {
          addPendingOperation("update", "dollys_disponiveis", { id, updates })
        }
      } else {
        addPendingOperation("update", "dollys_disponiveis", { id, updates })
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Erro ao atualizar dolly" }
    }
  }

  const deleteDolly = async (id: string) => {
    try {
      const updatedDollys = dollys.filter((d) => d.id !== id)
      setDollys(updatedDollys)
      saveToCache("dollys_disponiveis", updatedDollys)

      if (isOnline) {
        try {
          const { error } = await supabase.from("dollys_disponiveis").delete().eq("id", id)
          if (error) throw error
        } catch (err) {
          addPendingOperation("delete", "dollys_disponiveis", { id })
        }
      } else {
        addPendingOperation("delete", "dollys_disponiveis", { id })
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Erro ao deletar dolly" }
    }
  }

  useEffect(() => {
    fetchDollys()
  }, [isOnline])

  // Adicionar listener para mudanças em tempo real
  useEffect(() => {
    const handleRealtimeUpdate = (event: CustomEvent) => {
      const payload = event.detail

      if (payload.eventType === "INSERT" && payload.new) {
        setDollys((prev) => {
          const exists = prev.find((d) => d.id === payload.new.id)
          if (!exists) {
            return [...prev, payload.new].sort((a, b) => a.numero_dolly - b.numero_dolly)
          }
          return prev
        })
      } else if (payload.eventType === "UPDATE" && payload.new) {
        setDollys((prev) => prev.map((d) => (d.id === payload.new.id ? payload.new : d)))
      } else if (payload.eventType === "DELETE" && payload.old) {
        setDollys((prev) => prev.filter((d) => d.id !== payload.old.id))
      }
    }

    window.addEventListener("dollys_updated", handleRealtimeUpdate as EventListener)

    return () => {
      window.removeEventListener("dollys_updated", handleRealtimeUpdate as EventListener)
    }
  }, [])

  return {
    dollys,
    loading,
    error,
    addDolly,
    updateDolly,
    deleteDolly,
    refetch: fetchDollys,
  }
}
