import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Controle de Logística - Branco Peres Agribusiness",
  description: "Sistema de Controle de Logística para Frotas, Tanques e Dollys",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Logística BP",
    startupImage: [
      {
        url: "/apple-splash-2048-2732.png",
        media:
          "(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
      },
      {
        url: "/apple-splash-1668-2224.png",
        media:
          "(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
      },
      {
        url: "/apple-splash-1536-2048.png",
        media:
          "(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
      },
      {
        url: "/apple-splash-1125-2436.png",
        media:
          "(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
      },
      {
        url: "/apple-splash-1242-2208.png",
        media:
          "(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
      },
      {
        url: "/apple-splash-750-1334.png",
        media:
          "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
      },
      {
        url: "/apple-splash-640-1136.png",
        media:
          "(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
      },
    ],
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "Controle de Logística",
    title: "Controle de Logística - Branco Peres",
    description: "Sistema de Controle de Logística para Frotas, Tanques e Dollys",
  },
  twitter: {
    card: "summary",
    title: "Controle de Logística - Branco Peres",
    description: "Sistema de Controle de Logística para Frotas, Tanques e Dollys",
  },
  generator: "v0.dev",
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#059669" },
    { media: "(prefers-color-scheme: dark)", color: "#059669" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        {/* PWA Meta Tags */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="application-name" content="Logística BP" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Logística BP" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#059669" />
        <meta name="msapplication-tap-highlight" content="no" />

        {/* Favicons */}
        <link rel="apple-touch-icon" href="/custom-icon.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/custom-icon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/custom-icon.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/custom-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/custom-icon.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/custom-icon.png" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#059669" />
        <link rel="shortcut icon" href="/custom-icon.png" />

        {/* Microsoft */}
        <meta name="msapplication-TileImage" content="/custom-icon.png" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
