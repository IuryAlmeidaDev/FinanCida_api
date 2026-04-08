import { getPool } from "@/lib/postgres"
import { normalizeEmail, type AuthUser } from "@/lib/auth"

export type AuthUserRecord = AuthUser & {
  passwordHash: string
}

type UserRow = {
  id: string
  name: string
  email: string
  handle: string
  password_hash: string
}

let authSchemaReady: Promise<void> | undefined

function mapUser(row: UserRow): AuthUserRecord {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    handle: row.handle,
    passwordHash: row.password_hash,
  }
}

function createHandleBase(name: string) {
  const normalized = name
    .normalize("NFD")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")

  return normalized || "financida"
}

async function generateUniqueHandle(name: string) {
  const database = getPool()
  const base = createHandleBase(name)

  while (true) {
    const discriminator = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0")
    const handle = `${base}#${discriminator}`
    const existing = await database.query<{ id: string }>(
      "select id from app_users where handle = $1 limit 1",
      [handle]
    )

    if (existing.rowCount === 0) {
      return handle
    }
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
        handle text unique,
        password_hash text not null,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
      );

      alter table app_users add column if not exists handle text;
      create unique index if not exists app_users_handle_key on app_users (handle);
    `)

    const usersWithoutHandle = await database.query<Pick<UserRow, "id" | "name">>(
      "select id, name from app_users where handle is null or handle = ''"
    )

    for (const user of usersWithoutHandle.rows) {
      const handle = await generateUniqueHandle(user.name)

      await database.query("update app_users set handle = $1 where id = $2", [
        handle,
        user.id,
      ])
    }
  })()

  return authSchemaReady
}

export async function findUserByEmail(email: string) {
  await ensureAuthSchema()

  const database = getPool()
  const result = await database.query<UserRow>(
    `select id, name, email, handle, password_hash from app_users where email = $1 limit 1`,
    [normalizeEmail(email)]
  )

  return result.rows[0] ? mapUser(result.rows[0]) : null
}

export async function findUserById(id: string) {
  await ensureAuthSchema()

  const database = getPool()
  const result = await database.query<UserRow>(
    `select id, name, email, handle, password_hash from app_users where id = $1 limit 1`,
    [id]
  )

  return result.rows[0] ? mapUser(result.rows[0]) : null
}

export async function findUserByHandle(handle: string) {
  await ensureAuthSchema()

  const database = getPool()
  const result = await database.query<UserRow>(
    `select id, name, email, handle, password_hash from app_users where handle = $1 limit 1`,
    [handle.trim().toLowerCase()]
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
  const handle = await generateUniqueHandle(input.name)

  const result = await database.query<UserRow>(
    `
      insert into app_users (id, name, email, handle, password_hash)
      values ($1, $2, $3, $4, $5)
      returning id, name, email, handle, password_hash
    `,
    [id, input.name.trim(), normalizedEmail, handle, input.passwordHash]
  )

  return mapUser(result.rows[0])
}
