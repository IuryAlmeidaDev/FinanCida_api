"use client"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { CirclePlusIcon } from "lucide-react"

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
              tooltip="adicionar"
              className="min-w-8 border border-black bg-white text-black duration-200 ease-linear hover:bg-white hover:text-black active:bg-white active:text-black"
              onClick={() => onItemSelect?.("lançamentos")}
            >
              <CirclePlusIcon />
              <span>adicionar</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                tooltip={item.title}
                isActive={activeItem === item.title}
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
