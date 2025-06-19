"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useOfflineSync } from "./useOfflineSync"

export function useRealtimeSync() {
  const [activeUsers, setActiveUsers] = useState<number>(0)
  const [lastUpdate, setLastUpdate] = useState<{ table: string; action: string; user?: string } | null>(null)
  const { isOnline } = useOfflineSync()

  useEffect(() => {
    if (!isOnline) return

    // Escutar mudanças em tempo real nas tabelas
    const equipamentosChannel = supabase
      .channel("equipamentos_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "equipamentos_logistica",
        },
        (payload) => {
          console.log("🔄 Mudança em equipamentos:", payload)
          setLastUpdate({
            table: "Equipamentos",
            action:
              payload.eventType === "INSERT"
                ? "adicionado"
                : payload.eventType === "UPDATE"
                  ? "atualizado"
                  : "removido",
            user: payload.new?.modified_by || "Usuário",
          })

          // Disparar evento customizado para outros componentes
          window.dispatchEvent(new CustomEvent("equipamentos_updated", { detail: payload }))
        },
      )
      .subscribe()

    const tanquesChannel = supabase
      .channel("tanques_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tanques_disponiveis",
        },
        (payload) => {
          console.log("🔄 Mudança em tanques:", payload)
          setLastUpdate({
            table: "Tanques",
            action:
              payload.eventType === "INSERT"
                ? "adicionado"
                : payload.eventType === "UPDATE"
                  ? "atualizado"
                  : "removido",
          })

          window.dispatchEvent(new CustomEvent("tanques_updated", { detail: payload }))
        },
      )
      .subscribe()

    const dollysChannel = supabase
      .channel("dollys_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "dollys_disponiveis",
        },
        (payload) => {
          console.log("🔄 Mudança em dollys:", payload)
          setLastUpdate({
            table: "Dollys",
            action:
              payload.eventType === "INSERT"
                ? "adicionado"
                : payload.eventType === "UPDATE"
                  ? "atualizado"
                  : "removido",
          })

          window.dispatchEvent(new CustomEvent("dollys_updated", { detail: payload }))
        },
      )
      .subscribe()

    const pendenciasChannel = supabase
      .channel("pendencias_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "pendencias_equipamentos",
        },
        (payload) => {
          console.log("🔄 Mudança em pendências:", payload)
          setLastUpdate({
            table: "Pendências",
            action:
              payload.eventType === "INSERT"
                ? "adicionada"
                : payload.eventType === "UPDATE"
                  ? "atualizada"
                  : "removida",
          })

          window.dispatchEvent(new CustomEvent("pendencias_updated", { detail: payload }))
        },
      )
      .subscribe()

    // Simular contagem de usuários ativos (em produção, isso seria mais sofisticado)
    const userPresenceChannel = supabase
      .channel("user_presence")
      .on("presence", { event: "sync" }, () => {
        const state = userPresenceChannel.presenceState()
        setActiveUsers(Object.keys(state).length)
      })
      .on("presence", { event: "join" }, ({ key, newPresences }) => {
        console.log("👤 Usuário entrou:", key, newPresences)
      })
      .on("presence", { event: "leave" }, ({ key, leftPresences }) => {
        console.log("👋 Usuário saiu:", key, leftPresences)
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await userPresenceChannel.track({
            user_id: `user_${Date.now()}`,
            online_at: new Date().toISOString(),
          })
        }
      })

    // Cleanup
    return () => {
      equipamentosChannel.unsubscribe()
      tanquesChannel.unsubscribe()
      dollysChannel.unsubscribe()
      pendenciasChannel.unsubscribe()
      userPresenceChannel.unsubscribe()
    }
  }, [isOnline])

  return {
    activeUsers,
    lastUpdate,
  }
}
