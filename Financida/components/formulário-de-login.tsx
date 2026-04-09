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
import { Separator } from "@/components/ui/separator"

const socialProviders = [
  {
    name: "Google",
    icon: (
      <svg aria-hidden="true" className="size-4" viewBox="0 0 24 24">
        <path
          d="M21.8 12.2c0-.72-.06-1.26-.2-1.82H12v3.44h5.64c-.11.86-.72 2.16-2.07 3.03l-.02.11 3 2.32.2.02c1.82-1.68 2.87-4.14 2.87-7.1Z"
          fill="#4285F4"
        />
        <path
          d="M12 22c2.76 0 5.08-.9 6.78-2.43l-3.23-2.5c-.86.6-2.02 1.01-3.55 1.01-2.7 0-4.98-1.78-5.8-4.25l-.1.01-3.12 2.4-.03.1A10.24 10.24 0 0 0 12 22Z"
          fill="#34A853"
        />
        <path
          d="M6.2 13.83A6.13 6.13 0 0 1 5.88 12c0-.64.11-1.26.3-1.83l-.01-.12-3.15-2.43-.1.05A10 10 0 0 0 2 12c0 1.6.38 3.11 1.06 4.44l3.14-2.61Z"
          fill="#FBBC05"
        />
        <path
          d="M12 5.92c1.93 0 3.23.83 3.97 1.53l2.9-2.83C17.07 2.96 14.76 2 12 2a10.24 10.24 0 0 0-8.98 5.56l3.26 2.5c.84-2.47 3.12-4.14 5.72-4.14Z"
          fill="#EA4335"
        />
      </svg>
    ),
  },
  {
    name: "iCloud",
    icon: (
      <svg
        aria-hidden="true"
        className="size-4 text-foreground"
        viewBox="0 0 24 24"
      >
        <path
          d="M7.5 18.5a4.5 4.5 0 1 1 .87-8.92A5.5 5.5 0 0 1 19 11.5h.25a3.25 3.25 0 0 1 0 6.5H7.5Z"
          fill="currentColor"
          opacity="0.82"
        />
      </svg>
    ),
  },
  {
    name: "GitHub",
    icon: (
      <svg
        aria-hidden="true"
        className="size-4 text-foreground"
        viewBox="0 0 24 24"
      >
        <path
          d="M12 2C6.48 2 2 6.6 2 12.27c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-1.04-.01-1.88-2.78.62-3.37-1.2-3.37-1.2-.45-1.18-1.11-1.5-1.11-1.5-.9-.64.07-.63.07-.63 1 .07 1.52 1.05 1.52 1.05.88 1.56 2.3 1.11 2.86.85.09-.66.35-1.11.63-1.36-2.22-.26-4.56-1.15-4.56-5.14 0-1.14.4-2.08 1.04-2.82-.1-.26-.45-1.3.1-2.72 0 0 .85-.28 2.8 1.07A9.43 9.43 0 0 1 12 6.68c.85 0 1.7.12 2.5.37 1.95-1.35 2.8-1.07 2.8-1.07.56 1.42.21 2.46.1 2.72.65.74 1.04 1.68 1.04 2.82 0 4-2.35 4.87-4.59 5.13.36.32.69.95.69 1.92 0 1.38-.01 2.5-.01 2.84 0 .27.18.59.69.49A10.16 10.16 0 0 0 22 12.27C22 6.6 17.52 2 12 2Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
]

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
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 tracking-[0.16em] text-muted-foreground">
                      Em breve
                    </span>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {socialProviders.map((provider) => (
                    <Button
                      key={provider.name}
                      type="button"
                      variant="outline"
                      className="w-full justify-center border-dashed text-muted-foreground opacity-80"
                      disabled
                      aria-label={`${provider.name} em breve`}
                    >
                      {provider.icon}
                      <span className="hidden sm:inline">{provider.name}</span>
                    </Button>
                  ))}
                </div>
              </div>
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
