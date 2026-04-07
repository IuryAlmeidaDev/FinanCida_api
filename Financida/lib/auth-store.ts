import { getPool } from "@/lib/postgres"
import { normalizeEmail, type AuthUser } from "@/lib/auth"

export type AuthUserRecord = AuthUser & {
  passwordHash: string
}

type UserRow = {
  id: string
  name: string
  email: string
  password_hash: string
}

let authSchemaReady: Promise<void> | undefined

function mapUser(row: UserRow): AuthUserRecord {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
  }
}

async function ensureAuthSchema() {
  if (authSchemaReady) {
    return authSchemaReady
  }

  authSchemaReady = (async () => {
    const database = getPool()

    await database.query(`
      create table if not exists app_users (
        id text primary key,
        name text not null,
        email text not null unique,
        password_hash text not null,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
      );
    `)
  })()

  return authSchemaReady
}

export async function findUserByEmail(email: string) {
  await ensureAuthSchema()

  const database = getPool()
  const result = await database.query<UserRow>(
    `select id, name, email, password_hash from app_users where email = $1 limit 1`,
    [normalizeEmail(email)]
  )

  return result.rows[0] ? mapUser(result.rows[0]) : null
}

export async function findUserById(id: string) {
  await ensureAuthSchema()

  const database = getPool()
  const result = await database.query<UserRow>(
    `select id, name, email, password_hash from app_users where id = $1 limit 1`,
    [id]
  )

  return result.rows[0] ? mapUser(result.rows[0]) : null
}

export async function createUser(input: {
  name: string
  email: string
  passwordHash: string
}) {
  await ensureAuthSchema()

  const database = getPool()
  const id = crypto.randomUUID()
  const normalizedEmail = normalizeEmail(input.email)

  const result = await database.query<UserRow>(
    `
      insert into app_users (id, name, email, password_hash)
      values ($1, $2, $3, $4)
      returning id, name, email, password_hash
    `,
    [id, input.name.trim(), normalizedEmail, input.passwordHash]
  )

  return mapUser(result.rows[0])
}