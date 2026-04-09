"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { BrandLogo } from "@/components/brand-logo"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (password !== confirmPassword) {
      setError("As senhas não conferem.")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
        credentials: "include",
      })

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null
        setError(payload?.error ?? "Não foi possível criar a conta.")
        return
      }

      router.push("/dashboard")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={cn("w-full", className)} {...props}>
      <Card className="overflow-hidden border-0 bg-transparent p-0 shadow-2xl shadow-[#007A55]/10">
        <div className="grid min-h-[660px] md:grid-cols-2">
          <div className="hidden bg-[#007A55] md:flex">
            <div className="flex h-full flex-col justify-between bg-[#007A55] p-10 text-white">
              <div className="space-y-5">
                <div className="inline-flex w-fit items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm font-medium backdrop-blur">
                  Plataforma Financeira
                </div>
                <div className="space-y-4">
                  <h2 className="text-4xl font-semibold leading-tight">
                    Crie sua conta e acompanhe tudo em um único lugar.
                  </h2>
                  <p className="max-w-md text-base leading-7 text-white/85">
                    Organize receitas, despesas, limites e contas compartilhadas
                    com a mesma experiência visual da tela de login.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-center bg-white p-8 md:p-10">
            <div className="mb-10 flex flex-col items-center gap-3 text-center">
              <BrandLogo className="h-48 w-[37rem] max-w-full" priority />
            </div>
            <CardContent className="px-0 pb-0">
              <div className="mb-6 space-y-2">
                <h1 className="text-3xl font-semibold text-foreground">
                  Crie sua conta
                </h1>
                <p className="text-base text-muted-foreground">
                  Informe seus dados para começar a organizar sua vida
                  financeira.
                </p>
              </div>
              <form onSubmit={handleSubmit}>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="name">Nome completo</FieldLabel>
                    <Input
                      id="name"
                      type="text"
                      placeholder="João Silva"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      required
                    />
                    <FieldDescription>
                      Vamos usar este email para acessar sua conta.
                    </FieldDescription>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="password">Senha</FieldLabel>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                      minLength={8}
                    />
                    <FieldDescription>
                      A senha precisa ter pelo menos 8 caracteres.
                    </FieldDescription>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="confirm-password">
                      Confirmar senha
                    </FieldLabel>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      required
                    />
                    <FieldDescription>Confirme sua senha</FieldDescription>
                  </Field>
                  <Field>
                    <Button
                      type="submit"
                      className="w-full bg-[#007A55] hover:bg-[#006346]"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Criando..." : "Criar conta"}
                    </Button>
                    {error ? (
                      <p className="text-sm text-destructive">{error}</p>
                    ) : null}
                  </Field>
                </FieldGroup>
              </form>
              <p className="mt-6 text-sm text-muted-foreground">
                Já tem uma conta?{" "}
                <Link
                  href="/"
                  className="font-medium text-foreground underline underline-offset-4"
                >
                  Entrar
                </Link>
              </p>
            </CardContent>
          </div>
        </div>
      </Card>
    </div>
  )
}
