"use client"

import * as React from "react"
import { toast } from "sonner"

import { handleUnauthorizedResponse } from "@/lib/client-auth"
import type { AppNotification } from "@/lib/notifications-store"

export function useNotifications() {
  const [notifications, setNotifications] = React.useState<AppNotification[]>([])
  const seenIdsRef = React.useRef<Set<string>>(new Set())
  const hydratedRef = React.useRef(false)

  const loadNotifications = React.useCallback(async () => {
    const response = await fetch("/api/notifications", { cache: "no-store" })

    if (handleUnauthorizedResponse(response)) {
      return
    }

    if (!response.ok) {
      return
    }

    const payload = (await response.json()) as {
      notifications: AppNotification[]
    }

    const nextIds = new Set(payload.notifications.map((notification) => notification.id))

    if (hydratedRef.current) {
      payload.notifications
        .filter((notification) => !notification.read)
        .filter((notification) => !seenIdsRef.current.has(notification.id))
        .slice(0, 3)
        .forEach((notification) => {
          toast(notification.title, {
            description: notification.message,
          })
        })
    }

    seenIdsRef.current = nextIds
    hydratedRef.current = true
    setNotifications(payload.notifications)
  }, [])

  React.useEffect(() => {
    void loadNotifications()

    const eventSource = new EventSource("/api/notifications-stream")
    let fallbackInterval: number | undefined

    eventSource.onmessage = (event) => {
      const payload = JSON.parse(event.data) as {
        notifications: AppNotification[]
      }

      const nextIds = new Set(payload.notifications.map((notification) => notification.id))

      if (hydratedRef.current) {
        payload.notifications
          .filter((notification) => !notification.read)
          .filter((notification) => !seenIdsRef.current.has(notification.id))
          .slice(0, 3)
          .forEach((notification) => {
            toast(notification.title, {
              description: notification.message,
            })
          })
      }

      seenIdsRef.current = nextIds
      hydratedRef.current = true
      setNotifications(payload.notifications)
    }

    eventSource.onerror = () => {
      eventSource.close()
      void loadNotifications()

      if (!fallbackInterval) {
        fallbackInterval = window.setInterval(() => {
          void loadNotifications()
        }, 15000)
      }
    }

    return () => {
      eventSource.close()
      if (fallbackInterval) {
        window.clearInterval(fallbackInterval)
      }
    }
  }, [loadNotifications])

  const markAsRead = React.useCallback(
    async (notificationId: string) => {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notificationId }),
      })

      if (handleUnauthorizedResponse(response)) {
        return
      }

      if (!response.ok) {
        return
      }

      setNotifications((currentNotifications) =>
        currentNotifications.map((notification) =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      )
    },
    []
  )

  const unreadCount = notifications.filter((notification) => !notification.read).length

  return {
    notifications,
    unreadCount,
    markAsRead,
    reloadNotifications: loadNotifications,
  }
}
