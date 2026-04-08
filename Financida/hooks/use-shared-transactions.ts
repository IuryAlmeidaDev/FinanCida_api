"use client"

import * as React from "react"
import { toast } from "sonner"

export type SharedFriendProfile = {
  id: string
  name: string
  email: string
  handle: string
}

export type SharedAccount = {
  id: string
  requesterUserId: string
  friendUserId: string
  counterpartName: string
  counterpartHandle: string
  description: string
  totalAmount: number
  installments: number
  installmentValue: number
  paymentDates: string[]
  status: "Pendente" | "Aceita" | "Recusada"
  role: "requester" | "recipient"
}

export function useSharedTransactions() {
  const [accounts, setAccounts] = React.useState<SharedAccount[]>([])
  const [friends, setFriends] = React.useState<SharedFriendProfile[]>([])

  const loadData = React.useCallback(async () => {
    const [accountsResponse, friendsResponse] = await Promise.all([
      fetch("/api/friend-accounts", { cache: "no-store" }),
      fetch("/api/friends", { cache: "no-store" }),
    ])

    if (accountsResponse.ok) {
      const payload = (await accountsResponse.json()) as {
        accounts: SharedAccount[]
      }
      setAccounts(payload.accounts)
    }

    if (friendsResponse.ok) {
      const payload = (await friendsResponse.json()) as {
        friends: SharedFriendProfile[]
      }
      setFriends(payload.friends)
    }
  }, [])

  React.useEffect(() => {
    void loadData()
  }, [loadData])

  const createSharedTransaction = React.useCallback(
    async (input: {
      friendUserId: string
      description: string
      totalAmount: number
      installments: number
      paymentDates: string[]
    }) => {
      const response = await fetch("/api/friend-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      })

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null
        throw new Error(payload?.error ?? "Nao foi possivel criar a conta compartilhada.")
      }

      const payload = (await response.json()) as { accounts: SharedAccount[] }
      setAccounts(payload.accounts)
      toast.success("Conta compartilhada enviada para aceite.")
    },
    []
  )

  const decideSharedTransaction = React.useCallback(async (input: {
    accountId: string
    action: "accept" | "reject"
  }) => {
    const response = await fetch("/api/friend-accounts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    })

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null
      throw new Error(payload?.error ?? "Nao foi possivel atualizar a conta compartilhada.")
    }

    const payload = (await response.json()) as { accounts: SharedAccount[] }
    setAccounts(payload.accounts)
    toast.success(
      input.action === "accept"
        ? "Conta compartilhada aceita."
        : "Conta compartilhada recusada."
    )
  }, [])

  return {
    accounts,
    friends,
    createSharedTransaction,
    decideSharedTransaction,
    reloadSharedTransactions: loadData,
  }
}
