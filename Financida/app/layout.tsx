import "./globals.css"
import type { Metadata } from "next"
import { Nunito } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"

import { MobileAppGate } from "@/components/mobile-app-gate"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
})

export const metadata: Metadata = {
  title: "FinanCida",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${nunito.variable} font-sans antialiased`}
    >
      <body>
        <ThemeProvider>
          {children}
          <MobileAppGate />
          <Toaster />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
