"use client"

import * as React from "react"

import { AppSidebar } from "@/components/app-sidebar"
import { FinanceDashboard } from "@/components/finance-dashboard"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export function DashboardShell() {
  const [activeSection, setActiveSection] = React.useState("vis\u00e3o geral")
  const [addDialogOpen, setAddDialogOpen] = React.useState(false)

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
        variant="inset"
        activeItem={activeSection}
        onItemSelect={handleItemSelect}
      />
      <SidebarInset>
        <SiteHeader />
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
