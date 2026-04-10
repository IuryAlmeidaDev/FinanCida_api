"use client"

let redirectScheduled = false

export function redirectToLogin() {
  if (typeof window === "undefined" || redirectScheduled) {
    return
  }

  redirectScheduled = true
  window.location.replace("/")
}

export function handleUnauthorizedResponse(response: Response) {
  if (response.status === 401) {
    redirectToLogin()
    return true
  }

  return false
}
