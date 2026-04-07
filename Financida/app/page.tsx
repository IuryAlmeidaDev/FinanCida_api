import { LoginForm } from "@/components/formulário-de-login"
import { ThemeToggle } from "@/components/theme-toggle"
import { authCookieName, getAuthUserFromToken } from "@/lib/auth"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default async function Page() {
  const cookieStore = await cookies()
  const token = cookieStore.get(authCookieName)?.value
  const user = await getAuthUserFromToken(token)

  if (user) {
    redirect("/dashboard")
  }

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
