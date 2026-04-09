"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"

type FriendProfile = {
  id: string
  name: string
  email: string
  handle: string
}

type PendingFriendRequest = {
  friendshipId: string
  requesterId: string
  requesterName: string
  requesterHandle: string
}

type FriendsPayload = {
  currentHandle: string
  friends: FriendProfile[]
  pendingRequests: PendingFriendRequest[]
}

export function FriendsDashboard() {
  const [payload, setPayload] = React.useState<FriendsPayload | null>(null)
  const [handle, setHandle] = React.useState("")

  async function loadFriends() {
    const response = await fetch("/api/friends", { cache: "no-store" })

    if (response.ok) {
      setPayload((await response.json()) as FriendsPayload)
    }
  }

  React.useEffect(() => {
    loadFriends()
  }, [])

  async function sendRequest() {
    const response = await fetch("/api/friends", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ handle }),
    })

    if (response.ok) {
      setHandle("")
      await loadFriends()
    }
  }

  async function acceptRequest(friendshipId: string) {
    const response = await fetch("/api/friends", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ friendshipId }),
    })

    if (response.ok) {
      setPayload((await response.json()) as FriendsPayload)
    }
  }

  return (
    <div className="grid gap-4 px-4 py-4 lg:grid-cols-[360px_1fr] lg:px-6">
      <Card className="border-emerald-100">
        <CardHeader>
          <CardTitle>Seu identificador</CardTitle>
          <CardDescription>
            Compartilhe este código para receber convites.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-lg font-semibold text-emerald-800">
            {payload?.currentHandle ?? "carregando..."}
          </div>
          <div className="grid gap-3">
            <Input
              value={handle}
              onChange={(event) => setHandle(event.target.value)}
              placeholder="exemplo#1234"
            />
            <Button type="button" onClick={sendRequest}>
              Enviar convite
            </Button>
          </div>
        </CardContent>
      </Card>
      <div className="grid gap-4">
        <Card className="border-emerald-100">
          <CardHeader>
            <CardTitle>Solicitações pendentes</CardTitle>
            <CardDescription>
              Aceite um convite para adicionar a pessoa na sua lista de amigos.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {payload?.pendingRequests.length ? (
              payload.pendingRequests.map((request) => (
                <div
                  key={request.friendshipId}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-100 p-4"
                >
                  <div>
                    <p className="font-semibold">{request.requesterName}</p>
                    <p className="text-sm text-muted-foreground">
                      {request.requesterHandle}
                    </p>
                  </div>
                  <Button onClick={() => acceptRequest(request.friendshipId)}>
                    Aceitar
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                Nenhum convite pendente.
              </p>
            )}
          </CardContent>
        </Card>
        <Card className="border-emerald-100">
          <CardHeader>
            <CardTitle>Lista de amigos</CardTitle>
            <CardDescription>
              Apenas amigos confirmados podem participar de contas compartilhadas.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {payload?.friends.length ? (
              payload.friends.map((friend) => (
                <div
                  key={friend.id}
                  className="rounded-2xl border border-emerald-100 p-4"
                >
                  <p className="font-semibold">{friend.name}</p>
                  <p className="text-sm text-muted-foreground">{friend.handle}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                Você ainda não tem amigos confirmados.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
