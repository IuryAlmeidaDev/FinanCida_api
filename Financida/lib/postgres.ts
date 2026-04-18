import { Pool } from "pg"

let pool: Pool | undefined

type PgLikeError = {
  code?: string
  message?: string
}

export function hasDatabaseUrl() {
  return Boolean(process.env.DATABASE_URL)
}

export function getPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL nao configurada.")
  }

  pool ??= new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 3,
    idleTimeoutMillis: 20_000,
    connectionTimeoutMillis: 10_000,
    ssl:
      process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : undefined,
  })

  return pool
}

function isSchemaPermissionError(error: unknown) {
  const pgError = error as PgLikeError

  if (pgError?.code === "42501") {
    return true
  }

  const message = pgError?.message?.toLowerCase() ?? ""

  return (
    message.includes("must be owner of table") ||
    message.includes("permission denied")
  )
}

export async function runSchemaBootstrap(sql: string) {
  const database = getPool()

  try {
    await database.query(sql)
  } catch (error) {
    if (isSchemaPermissionError(error)) {
      return
    }

    throw error
  }
}
