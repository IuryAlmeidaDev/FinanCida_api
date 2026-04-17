import { z } from "zod"

import { getPool, hasDatabaseUrl, runSchemaBootstrap } from "@/lib/postgres"

export const profileUpdateSchema = z.object({
  displayName: z.string().trim().min(1).max(120),
  avatarUrl: z.string().url().nullable(),
  avatarOffsetX: z.number().int().min(-500).max(500),
  avatarOffsetY: z.number().int().min(-500).max(500),
  avatarZoom: z.number().min(1).max(3),
})

export type UserProfile = {
  displayName: string
  avatarUrl: string | null
  avatarOffsetX: number
  avatarOffsetY: number
  avatarZoom: number
}

type UserProfileRow = {
  name: string
  display_name: string | null
  avatar_url: string | null
  avatar_offset_x: number | null
  avatar_offset_y: number | null
  avatar_zoom: string | number | null
}

let schemaReady: Promise<void> | undefined

async function ensureSchema() {
  if (schemaReady) {
    return schemaReady
  }

  schemaReady = (async () => {
    await runSchemaBootstrap(`
      alter table app_users add column if not exists display_name text;
      alter table app_users add column if not exists avatar_url text;
      alter table app_users add column if not exists avatar_offset_x integer default 0;
      alter table app_users add column if not exists avatar_offset_y integer default 0;
      alter table app_users add column if not exists avatar_zoom numeric(4,2) default 1;
    `)
  })()

  return schemaReady
}

function mapUserProfile(row: UserProfileRow): UserProfile {
  return {
    displayName: row.display_name?.trim() || row.name,
    avatarUrl: row.avatar_url,
    avatarOffsetX: row.avatar_offset_x ?? 0,
    avatarOffsetY: row.avatar_offset_y ?? 0,
    avatarZoom: Number(row.avatar_zoom ?? 1),
  }
}

export async function readUserProfile(userId: string) {
  if (!hasDatabaseUrl()) {
    throw new Error("DATABASE_URL nao configurada.")
  }

  await ensureSchema()

  const database = getPool()
  const result = await database.query<UserProfileRow>(
    `
      select
        name,
        display_name,
        avatar_url,
        avatar_offset_x,
        avatar_offset_y,
        avatar_zoom
      from app_users
      where id = $1
      limit 1
    `,
    [userId]
  )

  if (!result.rows[0]) {
    throw new Error("Usuario nao encontrado.")
  }

  return mapUserProfile(result.rows[0])
}

export async function updateUserProfile(
  userId: string,
  input: z.infer<typeof profileUpdateSchema>
) {
  if (!hasDatabaseUrl()) {
    throw new Error("DATABASE_URL nao configurada.")
  }

  await ensureSchema()

  const parsedInput = profileUpdateSchema.parse(input)
  const database = getPool()

  await database.query(
    `
      update app_users
      set
        name = $1,
        display_name = $1,
        avatar_url = $2,
        avatar_offset_x = $3,
        avatar_offset_y = $4,
        avatar_zoom = $5,
        updated_at = now()
      where id = $6
    `,
    [
      parsedInput.displayName,
      parsedInput.avatarUrl,
      parsedInput.avatarOffsetX,
      parsedInput.avatarOffsetY,
      parsedInput.avatarZoom,
      userId,
    ]
  )

  return readUserProfile(userId)
}
