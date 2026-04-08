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

type FriendAccount = {
  id: string
  friendName: string
  friendEmail: string
  description: string
  totalAmount: number
  installments: number
  paidInstallments: number
  installmentValue: number
  status: "Em aberto" | "Quitado"
}

const moneyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
})

export function FriendAccountsDashboard() {
  const [accounts, setAccounts] = React.useState<FriendAccount[]>([])
  const [friendName, setFriendName] = React.useState("")
  const [friendEmail, setFriendEmail] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [totalAmount, setTotalAmount] = React.useState("")
  const [installments, setInstallments] = React.useState("2")

  async function loadAccounts() {
    const response = await fetch("/api/friend-accounts", { cache: "no-store" })

    if (response.ok) {
      const payload = (await response.json()) as { accounts: FriendAccount[] }
      setAccounts(payload.accounts)
    }
  }

  React.useEffect(() => {
    loadAccounts()
  }, [])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const response = await fetch("/api/friend-accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        friendName,
        friendEmail,
        description,
        totalAmount: Number(totalAmount.replace(",", ".")),
        installments: Number(installments),
      }),
    })

    if (!response.ok) {
      return
    }

    const payload = (await response.json()) as { accounts: FriendAccount[] }
    setAccounts(payload.accounts)
    setFriendName("")
    setFriendEmail("")
    setDescription("")
    setTotalAmount("")
    setInstallments("2")
  }

  async function handlePay(accountId: string) {
    const response = await fetch("/api/friend-accounts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accountId }),
    })

    if (response.ok) {
      const payload = (await response.json()) as { accounts: FriendAccount[] }
      setAccounts(payload.accounts)
    }
  }

  return (
    <div className="grid gap-4 px-4 py-4 lg:grid-cols-[380px_1fr] lg:px-6">
      <Card className="border-emerald-100">
        <CardHeader>
          <CardTitle>Adicionar amigo e conta</CardTitle>
          <CardDescription>
            Registre uma conta parcelada para confirmar pagamentos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3" onSubmit={handleSubmit}>
            <Input
              value={friendName}
              onChange={(event) => setFriendName(event.target.value)}
              placeholder="Nome do amigo"
              required
            />
            <Input
              type="email"
              value={friendEmail}
              onChange={(event) => setFriendEmail(event.target.value)}
              placeholder="email@amigo.com"
              required
            />
            <Input
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Ex: Emprestimo pessoal"
              required
            />
            <Input
              inputMode="decimal"
              value={totalAmount}
              onChange={(event) => setTotalAmount(event.target.value)}
              placeholder="Valor total"
              required
            />
            <Input
              type="number"
              min={1}
              value={installments}
              onChange={(event) => setInstallments(event.target.value)}
              placeholder="Parcelas"
              required
            />
            <Button type="submit">Salvar conta</Button>
          </form>
        </CardContent>
      </Card>
      <Card className="border-emerald-100">
        <CardHeader>
          <CardTitle>Contas com amigos</CardTitle>
          <CardDescription>
            Ao confirmar uma parcela, ela entra como despesa para voce e receita para o amigo se ele tiver cadastro.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {accounts.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma conta cadastrada ainda.
            </p>
          ) : (
            accounts.map((account) => (
              <div
                key={account.id}
                className="grid gap-3 rounded-2xl border border-emerald-100 p-4 md:grid-cols-[1fr_auto]"
              >
                <div>
                  <p className="font-semibold">{account.friendName}</p>
                  <p className="text-sm text-muted-foreground">
                    {account.description} - {account.friendEmail}
                  </p>
                  <p className="mt-2 text-sm">
                    {account.paidInstallments}/{account.installments} parcelas pagas de{" "}
                    {moneyFormatter.format(account.installmentValue)}
                  </p>
                </div>
                <Button
                  type="button"
                  disabled={account.status === "Quitado"}
                  onClick={() => handlePay(account.id)}
                >
                  Confirmar pagamento
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
