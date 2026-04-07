"use client"

import * as React from "react"

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
import {
  ChartBarIcon,
  LayoutDashboardIcon,
  ListIcon,
  PiggyBankIcon,
  WalletCardsIcon,
} from "lucide-react"

const data = {
  user: {
    name: "Usuario",
    email: "usuario@financida.app",
    avatar: "/avatars/shadcn.jpg",
  },
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
  onItemSelect,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  activeItem?: string
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
                <WalletCardsIcon className="size-5! text-emerald-600 dark:text-emerald-300" />
                  <span className="text-base font-semibold">
                  <span className="text-emerald-700 dark:text-emerald-300">Finan</span>
                  <span className="text-sky-600 dark:text-sky-300">Cida</span>
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
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
