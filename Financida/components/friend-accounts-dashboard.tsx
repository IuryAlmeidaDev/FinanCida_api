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
import { useSharedTransactions } from "@/hooks/use-shared-transactions"

const moneyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
})

export function FriendAccountsDashboard() {
  const {
    accounts,
    friends,
    createSharedTransaction,
    acceptSharedTransaction,
  } = useSharedTransactions()
  const [friendUserId, setFriendUserId] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [totalAmount, setTotalAmount] = React.useState("")
  const [installments, setInstallments] = React.useState(2)
  const [paymentDates, setPaymentDates] = React.useState<string[]>(["", ""])

  const incomingPendingAccounts = accounts.filter(
    (account) => account.role === "recipient" && account.status === "Pendente"
  )
  const historyAccounts = accounts.filter(
    (account) =>
      account.role === "requester" || account.status === "Aceita"
  )

  React.useEffect(() => {
    setPaymentDates((currentDates) =>
      Array.from({ length: installments }, (_, index) => currentDates[index] ?? "")
    )
  }, [installments])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    await createSharedTransaction({
      friendUserId,
      description,
      totalAmount: Number(totalAmount.replace(",", ".")),
      installments,
      paymentDates,
    })

    setFriendUserId("")
    setDescription("")
    setTotalAmount("")
    setInstallments(2)
    setPaymentDates(["", ""])
  }

  return (
    <div className="grid gap-4 px-4 py-4 lg:grid-cols-[420px_1fr] lg:px-6">
      <Card className="border-emerald-100">
        <CardHeader>
          <CardTitle>Criar conta compartilhada</CardTitle>
          <CardDescription>
            A conta fica pendente ate o amigo aceitar. Depois disso, ela entra como despesa para voce e receita para ele.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3" onSubmit={handleSubmit}>
            <select
              className="h-10 rounded-xl border border-input bg-card px-3 text-sm"
              value={friendUserId}
              onChange={(event) => setFriendUserId(event.target.value)}
              required
            >
              <option value="">Selecione um amigo</option>
              {friends.map((friend) => (
                <option key={friend.id} value={friend.id}>
                  {friend.name} ({friend.handle})
                </option>
              ))}
            </select>
            <Input
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Ex: Divida de 500 reais"
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
              onChange={(event) => setInstallments(Number(event.target.value))}
              placeholder="Parcelas"
              required
            />
            <div className="grid gap-2">
              {paymentDates.map((date, index) => (
                <Input
                  key={index}
                  type="date"
                  value={date}
                  onChange={(event) =>
                    setPaymentDates((currentDates) =>
                      currentDates.map((currentDate, currentIndex) =>
                        currentIndex === index ? event.target.value : currentDate
                      )
                    )
                  }
                  required
                />
              ))}
            </div>
            <Button type="submit">Salvar conta</Button>
          </form>
        </CardContent>
      </Card>
      <div className="grid gap-4">
        <Card className="border-emerald-100">
          <CardHeader>
            <CardTitle>Solicitacoes recebidas</CardTitle>
            <CardDescription>
              Aceite aqui as contas compartilhadas enviadas por amigos.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {incomingPendingAccounts.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhuma solicitacao pendente no momento.
              </p>
            ) : (
              incomingPendingAccounts.map((account) => (
                <div
                  key={account.id}
                  className="grid gap-3 rounded-2xl border border-emerald-100 p-4 md:grid-cols-[1fr_auto]"
                >
                  <div>
                    <p className="font-semibold">
                      {account.counterpartName} ({account.counterpartHandle})
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {account.description}
                    </p>
                    <p className="mt-2 text-sm">
                      {account.installments} parcelas de{" "}
                      {moneyFormatter.format(account.installmentValue)}
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={() => void acceptSharedTransaction(account.id)}
                  >
                    Aceitar conta
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
        <Card className="border-emerald-100">
          <CardHeader>
            <CardTitle>Historico de contas</CardTitle>
            <CardDescription>
              Contas criadas por voce e contas aceitas entre amigos.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {historyAccounts.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhuma conta compartilhada cadastrada ainda.
              </p>
            ) : (
              historyAccounts.map((account) => (
                <div key={account.id} className="rounded-2xl border border-emerald-100 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">
                        {account.counterpartName} ({account.counterpartHandle})
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {account.description}
                      </p>
                    </div>
                    <span
                      className={
                        account.status === "Aceita"
                          ? "rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700"
                          : "rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700"
                      }
                    >
                      {account.status}
                    </span>
                  </div>
                  <p className="mt-3 text-sm">
                    {account.installments} parcelas de{" "}
                    {moneyFormatter.format(account.installmentValue)}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
