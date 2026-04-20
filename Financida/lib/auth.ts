import type { NextResponse } from "next/server"

import { upsertUserFromAuthProvider } from "@/lib/auth-store"
import {
  getSupabaseUser,
  refreshSupabaseSession,
  signInWithSupabasePassword,
  signOutSupabase,
  signUpWithSupabase,
  type SupabaseAuthSession,
} from "@/lib/supabase-auth"

export const authCookieName = "financida_auth_token"
export const authRefreshCookieName = "financida_auth_refresh_token"
export const authTokenMaxAgeInSeconds = 60 * 60 * 24 * 7

export type AuthUser = {
  id: string
  name: string
  email: string
  handle: string
}

export function toPublicAuthUser(user: AuthUser): AuthUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    handle: user.handle,
  }
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

export function readAuthTokenFromCookieHeader(cookieHeader: string | null) {
  if (!cookieHeader) {
    return undefined
  }

  const tokenPair = cookieHeader
    .split(";")
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(`${authCookieName}=`))

  if (!tokenPair) {
    return undefined
  }

  return tokenPair.slice(authCookieName.length + 1)
}

export function readRefreshTokenFromCookieHeader(cookieHeader: string | null) {
  if (!cookieHeader) {
    return undefined
  }

  const tokenPair = cookieHeader
    .split(";")
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(`${authRefreshCookieName}=`))

  if (!tokenPair) {
    return undefined
  }

  return tokenPair.slice(authRefreshCookieName.length + 1)
}

export function setAuthCookie(
  response: NextResponse,
  accessToken: string,
  refreshToken?: string
) {
  response.cookies.set(authCookieName, accessToken, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: authTokenMaxAgeInSeconds,
  })

  if (refreshToken) {
    response.cookies.set(authRefreshCookieName, refreshToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: authTokenMaxAgeInSeconds,
    })
  }
}

export function clearAuthCookie(response: NextResponse) {
  response.cookies.set(authCookieName, "", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  })

  response.cookies.set(authRefreshCookieName, "", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  })
}

export async function getAuthUserFromToken(token?: string | null) {
  if (!token) {
    return null
  }

  const supabaseUser = await getSupabaseUser(token)

  if (!supabaseUser?.id || !supabaseUser.email) {
    return null
  }

  const name =
    supabaseUser.user_metadata?.name?.trim() ||
    supabaseUser.user_metadata?.full_name?.trim() ||
    normalizeEmail(supabaseUser.email).split("@")[0] ||
    "Usuario"

  const appUser = await upsertUserFromAuthProvider({
    id: supabaseUser.id,
    email: normalizeEmail(supabaseUser.email),
    name,
  })

  return toPublicAuthUser(appUser)
}

export async function tryRefreshAuthSession(refreshToken?: string | null) {
  if (!refreshToken) {
    return null
  }

  return refreshSupabaseSession(refreshToken)
}

export async function loginWithSupabase(input: {
  email: string
  password: string
}) {
  const result = await signInWithSupabasePassword(input.email, input.password)
  const user = await getAuthUserFromToken(result.session.access_token)

  if (!user) {
    throw new Error("Nao foi possivel carregar perfil do usuario.")
  }

  return {
    user,
    session: result.session,
  }
}

export async function signupWithSupabase(input: {
  name: string
  email: string
  password: string
}) {
  await signUpWithSupabase(input.email, input.password, input.name)
  return loginWithSupabase({
    email: input.email,
    password: input.password,
  })
}

export async function logoutFromSupabase(accessToken?: string | null) {
  if (!accessToken) {
    return
  }

  await signOutSupabase(accessToken)
}

export function applySessionCookies(
  response: NextResponse,
  session: SupabaseAuthSession
) {
  setAuthCookie(response, session.access_token, session.refresh_token)
}
