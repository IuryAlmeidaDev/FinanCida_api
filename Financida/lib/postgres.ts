import { Pool } from "pg"

let pool: Pool | undefined

export function hasDatabaseUrl() {
  return Boolean(process.env.DATABASE_URL)
}

export function getPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL nao configurada.")
  }

  pool ??= new Pool({
    connectionString: process.env.DATABASE_URL,
  })

  return pool
}