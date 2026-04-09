import { LoginForm } from "@/components/formulário-de-login"
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
    <main className="relative flex min-h-svh items-center justify-center bg-slate-50 p-6 text-foreground md:p-10">
      <div className="w-full max-w-5xl">
        <LoginForm />
      </div>
    </main>
  )
}
