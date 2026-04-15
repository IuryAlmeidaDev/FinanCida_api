import { randomUUID } from "node:crypto"

import bcrypt from "bcryptjs"
import { jwtVerify, SignJWT } from "jose"
import type { NextResponse } from "next/server"

export const authCookieName = "financida_auth_token"
export const authTokenMaxAgeInSeconds = 60 * 60 * 24 * 7
const authTokenIssuer = "financida"
const authTokenAudience = "financida-web"

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

type JwtPayload = AuthUser & {
  email: string
  name: string
  handle: string
}

function getJwtSecret() {
  const secret =
    process.env.AUTH_JWT_SECRET ??
    (process.env.NODE_ENV === "production"
      ? ""
      : "financida-development-secret")

  if (!secret) {
    throw new Error("AUTH_JWT_SECRET nao configurada.")
  }

  return new TextEncoder().encode(secret)
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash)
}

export async function signAuthToken(user: AuthUser) {
  return new SignJWT({
    id: user.id,
    name: user.name,
    email: user.email,
    handle: user.handle,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setJti(randomUUID())
    .setIssuer(authTokenIssuer)
    .setAudience(authTokenAudience)
    .setSubject(user.id)
    .setExpirationTime(`${authTokenMaxAgeInSeconds}s`)
    .sign(getJwtSecret())
}

export async function verifyAuthToken(token: string) {
  const { payload } = await jwtVerify(token, getJwtSecret(), {
    issuer: authTokenIssuer,
    audience: authTokenAudience,
  })
  const typedPayload = payload as Partial<JwtPayload>

  if (
    typeof typedPayload.id !== "string" ||
    typeof typedPayload.name !== "string" ||
    typeof typedPayload.email !== "string" ||
    typeof typedPayload.handle !== "string"
  ) {
    throw new Error("Token de autenticacao invalido.")
  }

  return {
    id: typedPayload.id,
    name: typedPayload.name,
    email: typedPayload.email,
    handle: typedPayload.handle,
  } satisfies AuthUser
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

export async function getAuthUserFromToken(token?: string | null) {
  if (!token) {
    return null
  }

  try {
    return await verifyAuthToken(token)
  } catch {
    return null
  }
}

export function setAuthCookie(response: NextResponse, token: string) {
  response.cookies.set(authCookieName, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: authTokenMaxAgeInSeconds,
  })
}

export function clearAuthCookie(response: NextResponse) {
  response.cookies.set(authCookieName, "", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  })
}
