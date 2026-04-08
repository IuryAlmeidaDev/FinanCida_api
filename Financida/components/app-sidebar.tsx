"use client"

import * as React from "react"
import {
  BitcoinIcon,
  ChartBarIcon,
  CircleDollarSign,
  HandCoinsIcon,
  LayoutDashboardIcon,
  ListIcon,
  PiggyBankIcon,
  UsersIcon,
} from "lucide-react"

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
      title: "Visao Geral",
      url: "#",
      icon: <LayoutDashboardIcon />,
    },
    {
      title: "Lancamentos",
      url: "#",
      icon: <ListIcon />,
    },
    {
      title: "Relatorios",
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
              <a href="#" className="h-11 text-white">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white shadow-sm ring-1 ring-white/15">
                  <CircleDollarSign
                    className="size-5 shrink-0"
                    color="#34d399"
                    aria-hidden="true"
                  />
                </span>
                <span className="text-base font-bold tracking-tight">
                  <span className="text-emerald-300">Finan</span>
                  <span className="text-sky-300">Cida</span>
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
