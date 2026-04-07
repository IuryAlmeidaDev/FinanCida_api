import { LoginForm } from "@/components/formulário-de-login"

export default function Page() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/30 p-6">
      <div className="w-full max-w-sm">
        <LoginForm />
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Ainda nao tem uma conta?{" "}
          <a className="underline underline-offset-4" href="/signup">
            Cadastre-se
          </a>
        </p>
      </div>
    </main>
  )
}
