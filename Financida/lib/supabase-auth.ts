type SupabaseAuthSession = {
  access_token: string
  refresh_token: string
}

type SupabaseAuthUser = {
  id: string
  email?: string | null
  user_metadata?: {
    name?: string
    full_name?: string
  } | null
}

type SupabaseErrorResponse = {
  error_description?: string
  msg?: string
  error?: string
  message?: string
  error_code?: string
}

export class SupabaseAuthError extends Error {
  status: number
  code?: string

  constructor(message: string, status: number, code?: string) {
    super(message)
    this.name = "SupabaseAuthError"
    this.status = status
    this.code = code
  }
}

function getSupabaseAuthConfig() {
  const supabaseUrl = process.env.SUPABASE_URL ?? ""
  const apiKey =
    process.env.SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    ""

  if (!supabaseUrl || !apiKey) {
    throw new Error(
      "SUPABASE_URL e SUPABASE_ANON_KEY (ou NEXT_PUBLIC_SUPABASE_ANON_KEY) devem estar configuradas."
    )
  }

  return {
    supabaseUrl: supabaseUrl.replace(/\/$/, ""),
    apiKey,
  }
}

async function parseSupabaseError(response: Response) {
  const payload = (await response.json().catch(() => null)) as
    | SupabaseErrorResponse
    | null

  const message = (
    payload?.error_description ??
    payload?.msg ??
    payload?.message ??
    payload?.error ??
    "Falha na autenticacao com Supabase."
  )

  return new SupabaseAuthError(message, response.status, payload?.error_code)
}

async function parseAuthPayload(response: Response) {
  const payload = (await response.json()) as {
    access_token?: string
    refresh_token?: string
    user?: SupabaseAuthUser
  }

  if (!payload.access_token || !payload.refresh_token) {
    throw new Error("Sessao do Supabase nao retornou tokens validos.")
  }

  return {
    session: {
      access_token: payload.access_token,
      refresh_token: payload.refresh_token,
    } satisfies SupabaseAuthSession,
    user: payload.user ?? null,
  }
}

export async function signInWithSupabasePassword(email: string, password: string) {
  const { supabaseUrl, apiKey } = getSupabaseAuthConfig()
  const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      apikey: apiKey,
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  })

  if (!response.ok) {
    throw await parseSupabaseError(response)
  }

  return parseAuthPayload(response)
}

export async function signUpWithSupabase(email: string, password: string, name: string) {
  const { supabaseUrl, apiKey } = getSupabaseAuthConfig()
  const response = await fetch(`${supabaseUrl}/auth/v1/signup`, {
    method: "POST",
    headers: {
      apikey: apiKey,
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
      data: {
        name,
        full_name: name,
      },
    }),
  })

  if (!response.ok) {
    throw await parseSupabaseError(response)
  }
}

export async function getSupabaseUser(accessToken: string) {
  const { supabaseUrl, apiKey } = getSupabaseAuthConfig()
  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: apiKey,
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  })

  if (!response.ok) {
    return null
  }

  return (await response.json()) as SupabaseAuthUser
}

export async function refreshSupabaseSession(refreshToken: string) {
  const { supabaseUrl, apiKey } = getSupabaseAuthConfig()
  const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=refresh_token`, {
    method: "POST",
    headers: {
      apikey: apiKey,
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
  })

  if (!response.ok) {
    return null
  }

  return parseAuthPayload(response)
}

export async function signOutSupabase(accessToken: string) {
  const { supabaseUrl, apiKey } = getSupabaseAuthConfig()

  await fetch(`${supabaseUrl}/auth/v1/logout`, {
    method: "POST",
    headers: {
      apikey: apiKey,
      Authorization: `Bearer ${accessToken}`,
    },
  }).catch(() => null)
}

export type { SupabaseAuthSession, SupabaseAuthUser }
