"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { AppSidebar } from "@/components/app-sidebar"
import { FinanceDashboard } from "@/components/finance-dashboard"
import { SiteHeader } from "@/components/site-header"
import type { AuthUser } from "@/lib/auth"
import { handleUnauthorizedResponse } from "@/lib/client-auth"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export function DashboardShell({ user }: { user: AuthUser }) {
  const router = useRouter()
  const [activeSection, setActiveSection] = React.useState("Visao Geral")
  const [addDialogOpen, setAddDialogOpen] = React.useState(false)

  React.useEffect(() => {
    let ignore = false

    async function validateSession() {
      const response = await fetch("/api/auth/me", { cache: "no-store" })

      if (ignore) {
        return
      }

      if (handleUnauthorizedResponse(response)) {
        return
      }

      if (!response.ok) {
        router.replace("/")
      }
    }

    void validateSession()

    const interval = window.setInterval(() => {
      void validateSession()
    }, 30000)

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        void validateSession()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      ignore = true
      window.clearInterval(interval)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [router])

  function handleItemSelect(item: string) {
    if (item === "adicionar") {
      setAddDialogOpen(true)
      return
    }

    setActiveSection(item)
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar
        activeItem={activeSection}
        user={user}
        onItemSelect={handleItemSelect}
      />
      <SidebarInset>
        <SiteHeader activeSection={activeSection} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <FinanceDashboard
              activeSection={activeSection}
              addDialogOpen={addDialogOpen}
              onAddDialogOpenChange={setAddDialogOpen}
            />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
