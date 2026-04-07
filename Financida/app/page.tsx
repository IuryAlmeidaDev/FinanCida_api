import { LoginForm } from "@/components/formulário-de-login"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Page() {
  return (
    <main className="relative flex min-h-svh items-center justify-center bg-background p-6 text-foreground">
      <div className="absolute right-6 top-6">
        <ThemeToggle />
      </div>
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
