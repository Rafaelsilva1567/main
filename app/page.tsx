"use client"

import { useState, useEffect } from "react"
import { Truck, WifiOff, Plus, AlertTriangle, Container, Menu, X, Activity, Zap } from "lucide-react"
import { ConnectionStatus } from "@/components/connection-status"
import { PWAInstallPrompt } from "@/components/pwa-install-prompt"
import { RealtimeIndicator } from "@/components/realtime-indicator"
import { EquipamentosCadastrados } from "@/components/tabs/equipamentos-cadastrados"
import { NovoEquipamento } from "@/components/tabs/novo-equipamento"
import { TanquesDisponiveis } from "@/components/tabs/tanques-disponiveis"
import { DollysDisponiveis } from "@/components/tabs/dollys-disponiveis"
import { Pendencias } from "@/components/tabs/pendencias"
import { ErrorBoundary } from "@/components/error-boundary"

type TabType = "equipamentos" | "novo" | "tanques" | "dollys" | "pendencias"

export default function LogisticsControl() {
  const [activeTab, setActiveTab] = useState<TabType>("equipamentos")
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)

    // Verificar se há uma aba específica na URL
    const urlParams = new URLSearchParams(window.location.search)
    const tabParam = urlParams.get("tab") as TabType
    if (tabParam && ["equipamentos", "novo", "tanques", "dollys", "pendencias"].includes(tabParam)) {
      setActiveTab(tabParam)
    }
  }, [])

  const tabs = [
    {
      id: "equipamentos" as TabType,
      label: "Equipamentos em Operação",
      icon: Truck,
      component: EquipamentosCadastrados,
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-700",
    },
    {
      id: "novo" as TabType,
      label: "Novo Equipamento",
      icon: Plus,
      component: NovoEquipamento,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
    },
    {
      id: "tanques" as TabType,
      label: "Tanques Disponíveis",
      icon: Container,
      component: TanquesDisponiveis,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-700",
    },
    {
      id: "dollys" as TabType,
      label: "Dollys Disponíveis",
      icon: Container,
      component: DollysDisponiveis,
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      textColor: "text-orange-700",
    },
    {
      id: "pendencias" as TabType,
      label: "Pendências",
      icon: AlertTriangle,
      component: Pendencias,
      color: "from-red-500 to-red-600",
      bgColor: "bg-red-50",
      textColor: "text-red-700",
    },
  ]

  const activeTabData = tabs.find((tab) => tab.id === activeTab)
  const ActiveComponent = activeTabData?.component || EquipamentosCadastrados

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
      {/* PWA Install Prompt */}
      <PWAInstallPrompt />

      {/* Header Dinâmico */}
      <div className="relative overflow-hidden">
        {/* Background animado */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-blue-600 to-emerald-700">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-white/5 animate-pulse"></div>
          </div>
        </div>

        {/* Conteúdo do Header */}
        <div className="relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-8">
              {/* Logo e Título */}
              <div className="text-center mb-8">
                <div
                  className={`flex items-center justify-center gap-6 mb-6 transform transition-all duration-1000 ${
                    isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
                  }`}
                >
                  {/* Logo com animação */}
                  <div className="relative group">
                    <div className="absolute -inset-2 bg-white/20 rounded-xl blur-lg group-hover:blur-xl transition-all duration-300"></div>
                    <div className="relative bg-white/90 backdrop-blur-sm p-3 rounded-xl shadow-2xl transform group-hover:scale-105 transition-all duration-300">
                      <div className="h-12 w-32 bg-emerald-600 rounded flex items-center justify-center text-white font-bold text-sm">
                        BRANCO PERES
                      </div>
                    </div>
                  </div>

                  {/* Separador animado */}
                  <div className="hidden sm:block">
                    <div className="w-px h-16 bg-gradient-to-b from-transparent via-white/50 to-transparent"></div>
                  </div>

                  {/* Ícone principal animado */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-white/20 rounded-full animate-ping"></div>
                    <div className="relative bg-white/90 backdrop-blur-sm p-4 rounded-full shadow-2xl">
                      <Truck className="h-10 w-10 text-emerald-600 animate-bounce" />
                    </div>
                  </div>
                </div>

                {/* Título principal */}
                <div
                  className={`transform transition-all duration-1000 delay-300 ${
                    isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
                  }`}
                >
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
                    <span className="bg-gradient-to-r from-white to-emerald-100 bg-clip-text text-transparent">
                      Controle de Logística
                    </span>
                  </h1>
                  <p className="text-xl md:text-2xl text-emerald-100 font-medium mb-6">
                    Gerenciamento Inteligente de Frotas, Tanques e Dollys
                  </p>

                  {/* Indicadores dinâmicos */}
                  <div className="flex items-center justify-center gap-6 text-white/90">
                    <div className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-emerald-300 animate-pulse" />
                      <span className="text-sm font-medium">Sistema Ativo</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-yellow-300 animate-pulse" />
                      <span className="text-sm font-medium">Tempo Real</span>
                    </div>
                  </div>
                </div>

                {/* Status de Conexão */}
                <div
                  className={`mt-8 flex justify-center gap-4 transform transition-all duration-1000 delay-500 ${
                    isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
                  }`}
                >
                  <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20 shadow-xl">
                    <ConnectionStatus />
                  </div>
                  <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20 shadow-xl">
                    <RealtimeIndicator />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ondas decorativas */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            className="w-full h-20 text-slate-50"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            fill="currentColor"
          >
            <path d="M0,60 C300,120 900,0 1200,60 L1200,120 L0,120 Z" className="animate-pulse" />
          </svg>
        </div>
      </div>

      {/* Aviso sobre modo offline */}
      {typeof window !== "undefined" && typeof navigator !== "undefined" && !navigator.onLine && (
        <div className="bg-gradient-to-r from-amber-400 to-orange-500 border-b border-orange-600 text-white px-4 py-4 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center gap-3">
            <WifiOff className="h-6 w-6 animate-pulse" />
            <div className="flex-1">
              <div className="font-semibold">Modo Offline Ativado</div>
              <div className="text-sm text-orange-100">
                Continue trabalhando normalmente. Sincronização automática quando a conexão for restaurada.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navegação Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Menu Mobile */}
        <div className="lg:hidden mb-6">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-full bg-white rounded-xl shadow-lg p-4 flex items-center justify-between border border-gray-200 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center gap-3">
              {activeTabData && <activeTabData.icon className={`h-6 w-6 ${activeTabData.textColor}`} />}
              <span className="font-semibold text-gray-800">{activeTabData?.label}</span>
            </div>
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {/* Menu Dropdown */}
          {isMenuOpen && (
            <div className="mt-4 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
              {tabs.map((tab, index) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id)
                      setIsMenuOpen(false)
                    }}
                    className={`w-full p-4 flex items-center gap-3 transition-all duration-300 ${
                      activeTab === tab.id
                        ? `bg-gradient-to-r ${tab.color} text-white shadow-lg`
                        : "hover:bg-gray-50 text-gray-700"
                    } ${index !== tabs.length - 1 ? "border-b border-gray-100" : ""}`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Menu Desktop */}
        <div className="hidden lg:grid lg:grid-cols-5 gap-6 mb-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group relative overflow-hidden rounded-2xl p-6 transition-all duration-500 transform hover:scale-105 ${
                  activeTab === tab.id
                    ? `bg-gradient-to-br ${tab.color} text-white shadow-2xl scale-105`
                    : "bg-white text-gray-700 shadow-lg hover:shadow-2xl border border-gray-200"
                }`}
              >
                {/* Background animado */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${tab.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                ></div>

                {/* Conteúdo */}
                <div className="relative z-10 flex flex-col items-center gap-4">
                  <div
                    className={`p-3 rounded-xl transition-all duration-300 ${
                      activeTab === tab.id ? "bg-white/20 backdrop-blur-sm" : `${tab.bgColor} group-hover:scale-110`
                    }`}
                  >
                    <Icon
                      className={`h-8 w-8 transition-all duration-300 ${
                        activeTab === tab.id ? "text-white" : tab.textColor
                      }`}
                    />
                  </div>
                  <span className="text-sm font-semibold text-center leading-tight">{tab.label}</span>
                </div>

                {/* Indicador ativo */}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/50 rounded-full"></div>
                )}
              </button>
            )
          })}
        </div>

        {/* Conteúdo Principal */}
        <div
          className={`transform transition-all duration-700 ${
            isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <ErrorBoundary>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/50 overflow-hidden">
              <div className="p-6 lg:p-8">
                <ActiveComponent />
              </div>
            </div>
          </ErrorBoundary>
        </div>
      </div>

      {/* Footer decorativo */}
      <div className="mt-16 bg-gradient-to-r from-emerald-600 via-blue-600 to-emerald-700 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-white/80 text-sm">© 2024 Branco Peres Agribusiness - Sistema de Controle de Logística</p>
        </div>
      </div>
    </div>
  )
}
