import { SignupForm } from "@/components/signup-form"
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
    <main className="relative flex min-h-svh w-full items-center justify-center bg-[#007A55] p-6 text-foreground md:p-10">
      <div className="w-full max-w-5xl">
        <SignupForm />
      </div>
    </main>
  )
}
