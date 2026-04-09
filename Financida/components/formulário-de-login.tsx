"use client"

import * as React from "react"
import { CircleDollarSign } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { cn } from "@/lib/utils"
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
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      })

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null
        setError(payload?.error ?? "Nao foi possivel autenticar.")
        return
      }

      router.push("/dashboard")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={cn("w-full", className)} {...props}>
      <Card className="overflow-hidden border-slate-200 shadow-2xl shadow-slate-900/5">
        <div className="grid min-h-[620px] md:grid-cols-2">
          <div className="flex flex-col justify-center p-8 md:p-10">
            <div className="mb-8 flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 shadow-sm">
                <CircleDollarSign
                  className="size-7"
                  color="#007A55"
                  aria-hidden="true"
                />
              </span>
              <div className="flex items-center text-3xl font-bold tracking-tight">
                <span className="text-foreground">Finan</span>
                <span className="text-sky-600">Cida</span>
              </div>
            </div>
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-3xl">Bem-vindo de volta</CardTitle>
              <CardDescription className="text-base">
                Entre na sua conta para acompanhar receitas, despesas e metas.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <form onSubmit={handleSubmit}>
                <FieldGroup>
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
                  </Field>
                  <Field>
                    <div className="flex items-center">
                      <FieldLabel htmlFor="password">Senha</FieldLabel>
                      <a
                        href="#"
                        className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                      >
                        Esqueceu sua senha?
                      </a>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                    />
                  </Field>
                  <Field>
                    <Button
                      type="submit"
                      className="w-full bg-[#007A55] hover:bg-[#006346]"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Entrando..." : "Entrar"}
                    </Button>
                    {error ? (
                      <p className="text-sm text-destructive">{error}</p>
                    ) : null}
                  </Field>
                </FieldGroup>
              </form>
              <p className="mt-6 text-sm text-muted-foreground">
                Ainda nao tem uma conta?{" "}
                <Link
                  className="font-medium text-foreground underline underline-offset-4"
                  href="/signup"
                >
                  Cadastre-se
                </Link>
              </p>
            </CardContent>
          </div>
          <div className="relative hidden bg-[#2C2D2D] md:flex">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.22),_transparent_42%),linear-gradient(135deg,_rgba(0,122,85,0.95),_rgba(44,45,45,0.98))]" />
            <div className="relative flex h-full flex-col justify-between p-10 text-white">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm backdrop-blur">
                <CircleDollarSign className="size-4" />
                Controle financeiro com clareza
              </div>
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.24em] text-white/70">
                    Plataforma Financeira
                  </p>
                  <h2 className="mt-3 text-4xl font-semibold leading-tight">
                    Organize seu dinheiro com uma experiencia leve e objetiva.
                  </h2>
                </div>
                <div className="grid gap-3 text-sm text-white/80">
                  <div className="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur-sm">
                    Acompanhe metas, limites e movimentacoes em um unico painel.
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur-sm">
                    Tenha visao rapida das contas compartilhadas e do calendario financeiro.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
