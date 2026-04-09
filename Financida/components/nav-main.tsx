"use client"

import { CirclePlusIcon } from "lucide-react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
  activeItem,
  onItemSelect,
}: {
  items: {
    title: string
    url: string
    icon?: React.ReactNode
  }[]
  activeItem?: string
  onItemSelect?: (item: string) => void
}) {
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem
            className="flex items-center gap-2"
            onClickCapture={(event) => {
              event.stopPropagation()
              onItemSelect?.("adicionar")
            }}
          >
            <SidebarMenuButton
              tooltip="Adicionar"
              className="min-w-8 bg-emerald-600 text-white shadow-sm shadow-emerald-900/10 duration-200 ease-linear hover:bg-emerald-700 hover:text-white active:bg-emerald-700 active:text-white"
              onClick={() => onItemSelect?.("Lançamentos")}
            >
              <CirclePlusIcon />
              <span>Adicionar</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                tooltip={item.title}
                isActive={activeItem === item.title}
                className="data-[active=true]:bg-emerald-50 data-[active=true]:text-emerald-800 hover:bg-emerald-50 hover:text-emerald-800"
                onClick={() => onItemSelect?.(item.title)}
              >
                {item.icon}
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
