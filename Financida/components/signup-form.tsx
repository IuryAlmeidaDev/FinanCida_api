"use client"

import { useRouter } from "next/navigation"

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

export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {
  const router = useRouter()

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Criar conta</CardTitle>
        <CardDescription>
          Informe seus dados para criar sua conta.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            router.push("/dashboard")
          }}
        >
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Nome completo</FieldLabel>
              <Input id="name" type="text" placeholder="Joao Silva" required />
            </Field>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
              />
              <FieldDescription>
                Vamos usar este email para entrar em contato com voce.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Senha</FieldLabel>
              <Input id="password" type="password" required minLength={8} />
              <FieldDescription>
                A senha precisa ter pelo menos 8 caracteres.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="confirm-password">
                Confirmar senha
              </FieldLabel>
              <Input id="confirm-password" type="password" required />
              <FieldDescription>Confirme sua senha.</FieldDescription>
            </Field>
            <FieldGroup>
              <Field>
                <Button type="submit" className="w-full">
                  Criar conta
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  className="w-full"
                  onClick={() => router.push("/dashboard")}
                >
                  Cadastrar com Google
                </Button>
                <FieldDescription className="px-6 text-center">
                  Ja tem uma conta?{" "}
                  <button
                    type="button"
                    className="underline underline-offset-4"
                    onClick={() => router.push("/")}
                  >
                    Entrar
                  </button>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
