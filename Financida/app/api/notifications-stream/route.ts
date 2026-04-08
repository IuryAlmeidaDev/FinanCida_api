import { getAuthUserFromToken, readAuthTokenFromCookieHeader } from "@/lib/auth"
import { listNotifications } from "@/lib/notifications-store"

export const runtime = "nodejs"

async function getRequestUser(request: Request) {
  const token = readAuthTokenFromCookieHeader(request.headers.get("cookie"))
  return getAuthUserFromToken(token)
}

export async function GET(request: Request) {
  const user = await getRequestUser(request)

  if (!user) {
    return new Response("Nao autenticado.", { status: 401 })
  }

  const authUser = user

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()

      async function pushNotifications() {
        const notifications = await listNotifications(authUser.id)

        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ notifications })}\n\n`)
        )
      }

      await pushNotifications()

      const interval = setInterval(() => {
        void pushNotifications()
      }, 10000)

      const heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(": heartbeat\n\n"))
      }, 15000)

      request.signal.addEventListener("abort", () => {
        clearInterval(interval)
        clearInterval(heartbeat)
        controller.close()
      })
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  })
}
