"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import type { AuthUser } from "@/lib/auth"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  ChartBarIcon,
  CircleDollarSign,
  LayoutDashboardIcon,
  ListIcon,
  PiggyBankIcon,
} from "lucide-react"

const data = {
  navMain: [
    {
      title: "visão geral",
      url: "#",
      icon: <LayoutDashboardIcon />,
    },
    {
      title: "lançamentos",
      url: "#",
      icon: <ListIcon />,
    },
    {
      title: "relatórios",
      url: "#",
      icon: <ChartBarIcon />,
    },
    {
      title: "limite de gastos",
      url: "#",
      icon: <PiggyBankIcon />,
    },
  ],
}

export function AppSidebar({
  activeItem,
  user,
  onItemSelect,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  activeItem?: string
  user: AuthUser
  onItemSelect?: (item: string) => void
}) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="#">
                <span className="flex size-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 shadow-sm dark:bg-emerald-950 dark:text-emerald-300">
                  <CircleDollarSign
                    className="size-5"
                    color="#007A55"
                    aria-hidden="true"
                  />
                </span>
                <span className="text-base font-bold tracking-tight text-emerald-700 dark:text-emerald-300">
                  FinanCida
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain
          items={data.navMain}
          activeItem={activeItem}
          onItemSelect={onItemSelect}
        />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: user.name,
            email: user.email,
          }}
        />
      </SidebarFooter>
    </Sidebar>
  )
}
