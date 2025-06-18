"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Download, X, Smartphone } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed"
    platform: string
  }>
  prompt(): Promise<void>
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Verificar se já está instalado
    const checkIfInstalled = () => {
      if (window.matchMedia("(display-mode: standalone)").matches) {
        setIsInstalled(true)
        return
      }

      if ((window.navigator as any).standalone === true) {
        setIsInstalled(true)
        return
      }
    }

    checkIfInstalled()

    // Listener para o evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)

      // Mostrar o prompt após um delay para não ser intrusivo
      setTimeout(() => {
        if (!isInstalled) {
          setShowPrompt(true)
        }
      }, 3000)
    }

    // Listener para quando o app é instalado
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowPrompt(false)
      setDeferredPrompt(null)
      console.log("PWA foi instalado com sucesso!")
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.addEventListener("appinstalled", handleAppInstalled)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("appinstalled", handleAppInstalled)
    }
  }, [isInstalled])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice

      if (outcome === "accepted") {
        console.log("Usuário aceitou instalar o PWA")
      } else {
        console.log("Usuário recusou instalar o PWA")
      }

      setDeferredPrompt(null)
      setShowPrompt(false)
    } catch (error) {
      console.error("Erro ao tentar instalar PWA:", error)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    // Não mostrar novamente nesta sessão
    sessionStorage.setItem("pwa-prompt-dismissed", "true")
  }

  // Não mostrar se já está instalado ou foi dispensado nesta sessão
  if (isInstalled || !showPrompt || sessionStorage.getItem("pwa-prompt-dismissed")) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <Card className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white shadow-2xl border-0">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Smartphone className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm mb-1">Instalar Aplicativo</h3>
              <p className="text-xs text-emerald-100 mb-3">
                Adicione o Controle de Logística à sua área de trabalho para acesso rápido!
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={handleInstallClick}
                  size="sm"
                  className="bg-white text-emerald-600 hover:bg-emerald-50 text-xs font-medium"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Instalar
                </Button>
                <Button
                  onClick={handleDismiss}
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20 text-xs"
                >
                  Agora não
                </Button>
              </div>
            </div>
            <button onClick={handleDismiss} className="text-white/70 hover:text-white p-1">
              <X className="h-4 w-4" />
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
