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
    confirmSharedPayment,
  } = useSharedTransactions()
  const [friendUserId, setFriendUserId] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [totalAmount, setTotalAmount] = React.useState("")
  const [installments, setInstallments] = React.useState(2)
  const [paymentDates, setPaymentDates] = React.useState<string[]>(["", ""])

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

  async function handlePay(accountId: string) {
    await confirmSharedPayment(accountId)
  }

  return (
    <div className="grid gap-4 px-4 py-4 lg:grid-cols-[420px_1fr] lg:px-6">
      <Card className="border-emerald-100">
        <CardHeader>
          <CardTitle>Criar conta compartilhada</CardTitle>
          <CardDescription>
            Apenas amigos confirmados podem participar de contas parceladas.
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
              placeholder="Ex: Emprestimo de 500 reais"
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
      <Card className="border-emerald-100">
        <CardHeader>
          <CardTitle>Contas compartilhadas</CardTitle>
          <CardDescription>
            Cada pagamento confirma a parcela, vira despesa para voce e receita para o amigo.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {accounts.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma conta compartilhada cadastrada ainda.
            </p>
          ) : (
            accounts.map((account) => (
              <div
                key={account.id}
                className="grid gap-3 rounded-2xl border border-emerald-100 p-4 md:grid-cols-[1fr_auto]"
              >
                <div>
                  <p className="font-semibold">
                    {account.friendName} ({account.friendHandle})
                  </p>
                  <p className="text-sm text-muted-foreground">{account.description}</p>
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
