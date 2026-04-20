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

function getSupabaseAdminConfig() {
  const supabaseUrl = process.env.SUPABASE_URL ?? ""
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ""

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY devem estar configuradas."
    )
  }

  return {
    supabaseUrl: supabaseUrl.replace(/\/$/, ""),
    serviceRoleKey,
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

export async function createSupabaseUserWithPasswordIfMissing(input: {
  email: string
  password: string
  name: string
}) {
  const { supabaseUrl, serviceRoleKey } = getSupabaseAdminConfig()
  const response = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: input.email,
      password: input.password,
      email_confirm: true,
      user_metadata: {
        name: input.name,
        full_name: input.name,
      },
    }),
  })

  if (response.ok) {
    return
  }

  const error = await parseSupabaseError(response)

  if (
    error.status === 422 ||
    error.code === "user_already_exists" ||
    error.message.toLowerCase().includes("already been registered")
  ) {
    return
  }

  throw error
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
