"use client"

import * as React from "react"

import { handleUnauthorizedResponse } from "@/lib/client-auth"
import { getSharedAccountsLoadErrorMessage } from "@/lib/finance-dashboard-queries"

export function usePendingSharedAccounts(onLoadError: (message: string) => void) {
  const [pendingSharedAccountsCount, setPendingSharedAccountsCount] =
    React.useState(0)

  React.useEffect(() => {
    let ignore = false

    async function loadSharedAccountWarnings() {
      const response = await fetch("/api/friend-accounts", { cache: "no-store" })

      if (handleUnauthorizedResponse(response)) {
        return
      }

      if (!response.ok) {
        if (!ignore) {
          onLoadError(getSharedAccountsLoadErrorMessage())
        }
        return
      }

      const payload = (await response.json()) as {
        accounts: Array<{
          role: "requester" | "recipient"
          status: "Pendente" | "Aceita" | "Recusada"
        }>
      }

      if (!ignore) {
        setPendingSharedAccountsCount(
          payload.accounts.filter(
            (account) =>
              account.role === "recipient" && account.status === "Pendente"
          ).length
        )
      }
    }

    void loadSharedAccountWarnings()

    const interval = window.setInterval(() => {
      void loadSharedAccountWarnings()
    }, 15000)

    return () => {
      ignore = true
      window.clearInterval(interval)
    }
  }, [onLoadError])

  return {
    pendingSharedAccountsCount,
  }
}
