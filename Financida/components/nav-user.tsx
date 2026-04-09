"use client"

import * as React from "react"
import Link from "next/link"
import { EllipsisVerticalIcon, LogOutIcon, UserPenIcon, ZoomInIcon } from "lucide-react"
import { toast } from "sonner"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

type DragState = {
  pointerId: number
  startX: number
  startY: number
  initialOffsetX: number
  initialOffsetY: number
}

type ProfilePayload = {
  profile: {
    displayName: string
    avatarUrl: string | null
    avatarOffsetX: number
    avatarOffsetY: number
    avatarZoom: number
  }
}

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
  const [avatarOffsetX, setAvatarOffsetX] = React.useState(0)
  const [avatarOffsetY, setAvatarOffsetY] = React.useState(0)
  const [avatarZoom, setAvatarZoom] = React.useState(1)
  const [selectedAvatarFile, setSelectedAvatarFile] = React.useState<File | null>(null)
  const [isSaving, setIsSaving] = React.useState(false)
  const dragStateRef = React.useRef<DragState | null>(null)

  React.useEffect(() => {
    let ignore = false

    async function loadProfile() {
      const response = await fetch("/api/profile", { cache: "no-store" })

      if (!response.ok) {
        return
      }

      const payload = (await response.json()) as ProfilePayload

      if (!ignore) {
        setDisplayName(payload.profile.displayName)
        setDraftName(payload.profile.displayName)
        setAvatarUrl(payload.profile.avatarUrl ?? undefined)
        setAvatarOffsetX(payload.profile.avatarOffsetX)
        setAvatarOffsetY(payload.profile.avatarOffsetY)
        setAvatarZoom(payload.profile.avatarZoom)
      }
    }

    void loadProfile()

    return () => {
      ignore = true
    }
  }, [])

  const avatarStyle = {
    transform: `translate(${avatarOffsetX}px, ${avatarOffsetY}px) scale(${avatarZoom})`,
    transformOrigin: "center center",
  } satisfies React.CSSProperties

  function handleAvatarUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    const previewUrl = URL.createObjectURL(file)

    setSelectedAvatarFile(file)
    setAvatarUrl(previewUrl)
    setAvatarOffsetX(0)
    setAvatarOffsetY(0)
    setAvatarZoom(1)
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (!avatarUrl) {
      return
    }

    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      initialOffsetX: avatarOffsetX,
      initialOffsetY: avatarOffsetY,
    }

    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const dragState = dragStateRef.current

    if (!dragState || dragState.pointerId !== event.pointerId) {
      return
    }

    setAvatarOffsetX(dragState.initialOffsetX + (event.clientX - dragState.startX))
    setAvatarOffsetY(dragState.initialOffsetY + (event.clientY - dragState.startY))
  }

  function handlePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    if (dragStateRef.current?.pointerId === event.pointerId) {
      dragStateRef.current = null
    }
  }

  async function handleSaveProfile() {
    setIsSaving(true)

    try {
      let nextAvatarUrl = avatarUrl ?? null

      if (selectedAvatarFile) {
        const formData = new FormData()
        formData.append("file", selectedAvatarFile)

        const uploadResponse = await fetch("/api/profile/avatar", {
          method: "POST",
          body: formData,
        })

        if (!uploadResponse.ok) {
          throw new Error("Não foi possível enviar a imagem de perfil.")
        }

        const uploadPayload = (await uploadResponse.json()) as { avatarUrl: string }
        nextAvatarUrl = uploadPayload.avatarUrl
      }

      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          displayName: draftName.trim() || user.name,
          avatarUrl: nextAvatarUrl,
          avatarOffsetX,
          avatarOffsetY,
          avatarZoom,
        }),
      })

      if (!response.ok) {
        throw new Error("Não foi possível salvar o perfil.")
      }

      const payload = (await response.json()) as ProfilePayload

      setDisplayName(payload.profile.displayName)
      setDraftName(payload.profile.displayName)
      setAvatarUrl(payload.profile.avatarUrl ?? undefined)
      setAvatarOffsetX(payload.profile.avatarOffsetX)
      setAvatarOffsetY(payload.profile.avatarOffsetY)
      setAvatarZoom(payload.profile.avatarZoom)
      setSelectedAvatarFile(null)
      setProfileOpen(false)
      toast.success("Perfil salvo com sucesso.")
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Não foi possível salvar o perfil."
      )
    } finally {
      setIsSaving(false)
    }
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
                <AvatarFallback className="rounded-lg bg-emerald-100 text-emerald-700">
                  {displayName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium text-sidebar-foreground">
                  {displayName}
                </span>
                <span className="truncate text-xs text-white/75">{user.email}</span>
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
                  <AvatarFallback className="rounded-lg bg-emerald-100 text-emerald-700">
                    {displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{displayName}</span>
                  <span className="truncate text-xs text-muted-foreground">
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
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-5 shadow-2xl">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold tracking-tight">Editar perfil</h2>
              <p className="text-sm text-muted-foreground">
                A imagem sera enviada para o Supabase Storage e o enquadramento sera salvo no banco.
              </p>
            </div>
            <div className="mt-5 grid gap-5 md:grid-cols-[260px_1fr]">
              <div className="space-y-3">
                <div
                  className="relative flex h-[260px] w-[260px] cursor-grab items-center justify-center overflow-hidden rounded-2xl border border-emerald-100 bg-slate-100 active:cursor-grabbing"
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      className="max-w-none select-none object-cover"
                      style={{
                        width: 220,
                        height: 220,
                        ...avatarStyle,
                      }}
                      draggable={false}
                    />
                  ) : (
                    <Avatar className="h-32 w-32 rounded-2xl">
                      <AvatarFallback className="rounded-2xl bg-emerald-100 text-4xl text-emerald-700">
                        {displayName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
                <Input type="file" accept="image/*" onChange={handleAvatarUpload} />
              </div>
              <div className="space-y-4">
                <Input
                  value={draftName}
                  onChange={(event) => setDraftName(event.target.value)}
                  placeholder="Nome de exibicao"
                />
                <label className="grid gap-2 text-sm">
                  <span className="flex items-center gap-2 font-medium">
                    <ZoomInIcon className="size-4" />
                    Zoom
                  </span>
                  <Input
                    type="range"
                    min={1}
                    max={2.4}
                    step={0.05}
                    value={avatarZoom}
                    onChange={(event) => setAvatarZoom(Number(event.target.value))}
                  />
                </label>
                <p className="text-sm text-muted-foreground">
                  Clique e arraste a imagem dentro do quadro para reposicionar.
                </p>
                <div className="rounded-xl border border-emerald-100 p-3">
                  <p className="text-sm font-medium">Preview</p>
                  <Avatar className="mt-3 h-20 w-20 rounded-2xl">
                    {avatarUrl ? (
                      <AvatarImage src={avatarUrl} alt={displayName} style={avatarStyle} />
                    ) : null}
                    <AvatarFallback className="rounded-2xl bg-emerald-100 text-emerald-700">
                      {displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setProfileOpen(false)}>
                Cancelar
              </Button>
              <Button type="button" disabled={isSaving} onClick={() => void handleSaveProfile()}>
                {isSaving ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </SidebarMenu>
  )
}
