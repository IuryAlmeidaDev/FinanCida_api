"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { BrandLogo } from "@/components/brand-logo"
import { useBrandLogoReady } from "@/hooks/use-brand-logo-ready"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
  const isBrandLogoReady = useBrandLogoReady()
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (password !== confirmPassword) {
      setError("As senhas nao conferem.")
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
        setError(payload?.error ?? "Nao foi possivel criar a conta.")
        return
      }

      router.push("/dashboard")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isBrandLogoReady) {
    return (
      <div
        className={cn(
          "flex min-h-[660px] items-center justify-center rounded-3xl bg-background",
          className
        )}
        {...props}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="size-10 animate-pulse rounded-full bg-[#007A55]/15" />
          <p className="text-sm text-muted-foreground">Carregando FinanCida...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("w-full", className)} {...props}>
      <Card className="overflow-hidden border-slate-200 shadow-2xl shadow-slate-900/5">
        <div className="grid min-h-[660px] md:grid-cols-2">
          <div className="relative hidden bg-[#2C2D2D] md:flex">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(14,165,233,0.2),_transparent_42%),linear-gradient(145deg,_rgba(44,45,45,0.98),_rgba(0,122,85,0.95))]" />
            <div className="relative flex h-full flex-col justify-between p-10 text-white">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm backdrop-blur">
                Organize metas, contas e compartilhamentos
              </div>
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.24em] text-white/70">
                    Sua rotina financeira
                  </p>
                  <h2 className="mt-3 text-4xl font-semibold leading-tight">
                    Crie sua conta e centralize sua vida financeira em um so lugar.
                  </h2>
                </div>
                <div className="grid gap-3 text-sm text-white/80">
                  <div className="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur-sm">
                    Controle despesas, receitas e limites com uma visao simples.
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur-sm">
                    Compartilhe contas com amigos e acompanhe tudo em tempo real.
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-center p-8 md:p-10">
            <div className="mb-10 flex justify-center">
              <BrandLogo className="h-28 w-[22rem] max-w-full" priority />
            </div>
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-3xl">Crie sua conta</CardTitle>
              <CardDescription className="text-base">
                Informe seus dados para comecar a organizar sua vida financeira.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <form onSubmit={handleSubmit}>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="name">Nome completo</FieldLabel>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Joao Silva"
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
                    <FieldDescription>Confirme sua senha.</FieldDescription>
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
                Ja tem uma conta?{" "}
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
