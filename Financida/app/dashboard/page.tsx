import { DashboardShell } from "@/components/dashboard-shell"
import { authCookieName, getAuthUserFromToken } from "@/lib/auth"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default async function Page() {
  const cookieStore = await cookies()
  const token = cookieStore.get(authCookieName)?.value
  const user = await getAuthUserFromToken(token)

  if (!user) {
    redirect("/")
  }

  return <DashboardShell user={user} />
}
