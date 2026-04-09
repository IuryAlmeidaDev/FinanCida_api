"use client"

import * as React from "react"
import {
  BitcoinIcon,
  ChartBarIcon,
  HandCoinsIcon,
  LayoutDashboardIcon,
  ListIcon,
  PiggyBankIcon,
  UsersIcon,
} from "lucide-react"

import { BrandLogo } from "@/components/brand-logo"
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import type { AuthUser } from "@/lib/auth"

const data = {
  navMain: [
    {
      title: "Visão Geral",
      url: "#",
      icon: <LayoutDashboardIcon />,
    },
    {
      title: "Lançamentos",
      url: "#",
      icon: <ListIcon />,
    },
    {
      title: "Relatórios",
      url: "#",
      icon: <ChartBarIcon />,
    },
    {
      title: "Limite de Gastos",
      url: "#",
      icon: <PiggyBankIcon />,
    },
    {
      title: "Criptomoedas",
      url: "#",
      icon: <BitcoinIcon />,
    },
    {
      title: "Amigos",
      url: "#",
      icon: <UsersIcon />,
    },
    {
      title: "Contas Compartilhadas",
      url: "#",
      icon: <HandCoinsIcon />,
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
              <a href="#" className="h-12 text-white">
                <BrandLogo className="h-11 w-40 shrink-0" />
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
