"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { BrandLogo } from "@/components/brand-logo"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
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
    name: "LinkedIn",
    icon: (
      <svg
        aria-hidden="true"
        className="size-4 text-foreground"
        viewBox="0 0 24 24"
      >
        <path
          d="M5.75 4A1.75 1.75 0 0 0 4 5.75v12.5C4 19.22 4.78 20 5.75 20h12.5c.97 0 1.75-.78 1.75-1.75V5.75C20 4.78 19.22 4 18.25 4H5.75Zm2.06 4.31a1.19 1.19 0 1 1 0 2.38a1.19 1.19 0 0 1 0-2.38Zm-1.03 3.56H8.9V17H6.78v-5.13Zm3.45 0h2.03v.7h.03c.28-.5.98-.86 2.02-.86c2.16 0 2.56 1.42 2.56 3.26V17h-2.12v-2.84c0-.68-.01-1.55-.95-1.55c-.95 0-1.1.74-1.1 1.5V17h-2.12v-5.13Z"
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
      <Card className="overflow-hidden border-0 bg-transparent p-0 shadow-2xl shadow-[#007A55]/10">
        <div className="grid min-h-[620px] md:grid-cols-2">
          <div className="hidden bg-[#007A55] md:flex">
            <div className="flex h-full flex-col justify-between bg-[#007A55] p-10 text-white">
              <div className="space-y-5">
                <div className="inline-flex w-fit items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm font-medium backdrop-blur">
                  Plataforma Financeira
                </div>
                <div className="space-y-4">
                  <h2 className="text-4xl font-semibold leading-tight">
                    Organize seu dinheiro com mais clareza e menos atrito.
                  </h2>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-center bg-white p-8 md:p-10">
            <div className="mb-10 flex flex-col items-center gap-3 text-center">
              <BrandLogo className="h-48 w-[37rem] max-w-full" priority />
            </div>
            <CardContent className="px-0 pb-0">
              <form onSubmit={handleSubmit}>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                      id="email"
                      type="email"
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
        </div>
      </Card>
    </div>
  )
}
