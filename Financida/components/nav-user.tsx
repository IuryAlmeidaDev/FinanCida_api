"use client"

import * as React from "react"
import Link from "next/link"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { EllipsisVerticalIcon, LogOutIcon, UserPenIcon } from "lucide-react"

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
  }
}) {
  const { isMobile } = useSidebar()
  const [profileOpen, setProfileOpen] = React.useState(false)
  const [displayName, setDisplayName] = React.useState(user.name)
  const [draftName, setDraftName] = React.useState(user.name)
  const [avatarUrl, setAvatarUrl] = React.useState<string | undefined>()
  const [avatarPositionX, setAvatarPositionX] = React.useState(50)
  const [avatarPositionY, setAvatarPositionY] = React.useState(50)
  const [avatarZoom, setAvatarZoom] = React.useState(1)
  const avatarStyle = {
    objectPosition: `${avatarPositionX}% ${avatarPositionY}%`,
    transform: `scale(${avatarZoom})`,
  } satisfies React.CSSProperties

  function handleAvatarUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    setAvatarUrl(URL.createObjectURL(file))
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                {avatarUrl ? (
                  <AvatarImage src={avatarUrl} alt={displayName} style={avatarStyle} />
                ) : null}
                <AvatarFallback className="rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                  {displayName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{displayName}</span>
                <span className="truncate text-xs text-sidebar-foreground/80">
                  {user.email}
                </span>
              </div>
              <EllipsisVerticalIcon className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  {avatarUrl ? (
                    <AvatarImage src={avatarUrl} alt={displayName} style={avatarStyle} />
                  ) : null}
                  <AvatarFallback className="rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                    {displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{displayName}</span>
                  <span className="truncate text-xs text-sidebar-foreground/80">
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault()
                setDraftName(displayName)
                setProfileOpen(true)
              }}
            >
              <UserPenIcon />
              Editar perfil
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/api/auth/logout">
                <LogOutIcon />
                Deslogar
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
      {profileOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-2xl">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold tracking-tight">
                Editar perfil
              </h2>
              <p className="text-sm text-muted-foreground">
                Atualize sua foto e nome exibido no painel.
              </p>
            </div>
            <div className="mt-5 space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-16 w-16 overflow-hidden rounded-xl">
                  {avatarUrl ? (
                    <AvatarImage src={avatarUrl} alt={displayName} style={avatarStyle} />
                  ) : null}
                  <AvatarFallback className="rounded-xl bg-emerald-100 text-emerald-700">
                    {displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Input type="file" accept="image/*" onChange={handleAvatarUpload} />
              </div>
              <div className="grid gap-3 text-sm">
                <label className="grid gap-1">
                  Centralizar horizontal
                  <Input
                    type="range"
                    min={0}
                    max={100}
                    value={avatarPositionX}
                    onChange={(event) =>
                      setAvatarPositionX(Number(event.target.value))
                    }
                  />
                </label>
                <label className="grid gap-1">
                  Centralizar vertical
                  <Input
                    type="range"
                    min={0}
                    max={100}
                    value={avatarPositionY}
                    onChange={(event) =>
                      setAvatarPositionY(Number(event.target.value))
                    }
                  />
                </label>
                <label className="grid gap-1">
                  Zoom
                  <Input
                    type="range"
                    min={1}
                    max={2}
                    step={0.05}
                    value={avatarZoom}
                    onChange={(event) => setAvatarZoom(Number(event.target.value))}
                  />
                </label>
              </div>
              <Input
                value={draftName}
                onChange={(event) => setDraftName(event.target.value)}
                placeholder="Nome de exibicao"
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setProfileOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setDisplayName(draftName.trim() || user.name)
                    setProfileOpen(false)
                  }}
                >
                  Salvar
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </SidebarMenu>
  )
}
