"use client"

import {
  BellIcon,
  CheckCheckIcon,
  CircleAlertIcon,
  HandCoinsIcon,
  UserPlusIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useNotifications } from "@/hooks/use-notifications"

function getNotificationIcon(type: string) {
  if (type === "friend-request") {
    return <UserPlusIcon className="size-4 text-sky-600" />
  }

  if (type === "shared-transaction") {
    return <HandCoinsIcon className="size-4 text-emerald-600" />
  }

  return <CircleAlertIcon className="size-4 text-amber-600" />
}

export function NotificationsMenu() {
  const { notifications, unreadCount, markAsRead } = useNotifications()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="relative rounded-full"
        >
          <BellIcon className="size-4" />
          {unreadCount > 0 ? (
            <span className="absolute -top-1 -right-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-semibold text-white">
              {unreadCount}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96">
        <DropdownMenuLabel className="flex items-center justify-between gap-3">
          <span>Notificacoes</span>
          <span className="text-xs text-muted-foreground">
            {unreadCount} nao lidas
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="px-3 py-6 text-sm text-muted-foreground">
              Nenhuma notificacao no momento.
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className="grid gap-2 border-b border-border px-3 py-3 last:border-b-0"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5">{getNotificationIcon(notification.type)}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium">{notification.title}</p>
                      {!notification.read ? (
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                      ) : null}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {notification.message}
                    </p>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <span className="text-xs text-muted-foreground">
                        {new Date(notification.createdAt).toLocaleString("pt-BR")}
                      </span>
                      {!notification.read ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-emerald-700"
                          onClick={() => void markAsRead(notification.id)}
                        >
                          <CheckCheckIcon className="size-4" />
                          Lido
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
