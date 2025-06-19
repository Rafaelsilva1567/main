"use client"

import { Users, Activity, Bell, Eye } from "lucide-react"
import { useRealtimeSync } from "@/hooks/useRealtimeSync"
import { useState, useEffect } from "react"

export function RealtimeIndicator() {
  const { activeUsers, lastUpdate } = useRealtimeSync()
  const [showNotification, setShowNotification] = useState(false)

  useEffect(() => {
    if (lastUpdate) {
      setShowNotification(true)
      const timer = setTimeout(() => setShowNotification(false), 4000)
      return () => clearTimeout(timer)
    }
  }, [lastUpdate])

  return (
    <div className="flex items-center gap-4 text-sm">
      {/* Usuários Ativos */}
      <div className="flex items-center gap-2 text-blue-300">
        <div className="relative">
          <Users className="h-5 w-5" />
          {activeUsers > 1 && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-blue-900">{activeUsers}</span>
            </div>
          )}
        </div>
        <span className="font-medium">{activeUsers === 1 ? "Só você" : `${activeUsers} usuários`}</span>
      </div>

      {/* Indicador de Atividade */}
      <div className="flex items-center gap-2 text-green-300">
        <Activity className="h-5 w-5 animate-pulse" />
        <span className="font-medium">Tempo Real</span>
      </div>

      {/* Notificação de Mudanças */}
      {showNotification && lastUpdate && (
        <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-3 py-1 text-white animate-slide-in">
          <Bell className="h-4 w-4 text-yellow-300" />
          <span className="text-sm font-medium">
            {lastUpdate.table} {lastUpdate.action}
            {lastUpdate.user && ` por ${lastUpdate.user}`}
          </span>
        </div>
      )}

      {/* Indicador Visual de Sincronização */}
      <div className="flex items-center gap-2 text-emerald-300">
        <div className="relative">
          <Eye className="h-5 w-5" />
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full animate-ping"></div>
        </div>
        <span className="font-medium text-xs">Sincronizado</span>
      </div>
    </div>
  )
}
