import { z } from "zod"

import { findUserByHandle, findUserById } from "@/lib/auth-store"
import { createNotification } from "@/lib/notifications-store"
import { getPool } from "@/lib/postgres"

export const friendRequestInputSchema = z.object({
  handle: z.string().trim().min(3).max(80),
})

export const friendRequestActionSchema = z.object({
  friendshipId: z.string().min(1),
})

export type FriendProfile = {
  id: string
  name: string
  email: string
  handle: string
}

export type FriendRequest = {
  friendshipId: string
  requesterId: string
  requesterName: string
  requesterHandle: string
}

type FriendshipRow = {
  id: string
  requester_id: string
  requester_name: string
  requester_handle: string
  friend_id: string
  friend_name: string
  friend_email: string
  friend_handle: string
  status: "pending" | "accepted"
}

let schemaReady: Promise<void> | undefined

async function ensureSchema() {
  if (schemaReady) {
    return schemaReady
  }

  schemaReady = (async () => {
    const database = getPool()

    await database.query(`
      create table if not exists friendships (
        id text primary key,
        requester_user_id text not null,
        addressee_user_id text not null,
        status text not null,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
      );

      create unique index if not exists friendships_unique_pair_idx
        on friendships (
          least(requester_user_id, addressee_user_id),
          greatest(requester_user_id, addressee_user_id)
        );
    `)
  })()

  return schemaReady
}

function mapFriend(row: FriendshipRow, userId: string): FriendProfile {
  const isRequester = row.requester_id === userId

  return {
    id: isRequester ? row.friend_id : row.requester_id,
    name: isRequester ? row.friend_name : row.requester_name,
    email: isRequester ? row.friend_email : "",
    handle: isRequester ? row.friend_handle : row.requester_handle,
  }
}

export async function listFriends(userId: string) {
  await ensureSchema()

  const database = getPool()
  const result = await database.query<FriendshipRow>(
    `
      select
        f.id,
        f.requester_user_id as requester_id,
        requester.name as requester_name,
        requester.handle as requester_handle,
        addressee.id as friend_id,
        addressee.name as friend_name,
        addressee.email as friend_email,
        addressee.handle as friend_handle,
        f.status
      from friendships f
      join app_users requester on requester.id = f.requester_user_id
      join app_users addressee on addressee.id = f.addressee_user_id
      where (f.requester_user_id = $1 or f.addressee_user_id = $1)
        and f.status = 'accepted'
      order by f.created_at desc
    `,
    [userId]
  )

  return result.rows.map((row) => mapFriend(row, userId))
}

export async function listPendingFriendRequests(userId: string) {
  await ensureSchema()

  const database = getPool()
  const result = await database.query<FriendshipRow>(
    `
      select
        f.id,
        f.requester_user_id as requester_id,
        requester.name as requester_name,
        requester.handle as requester_handle,
        addressee.id as friend_id,
        addressee.name as friend_name,
        addressee.email as friend_email,
        addressee.handle as friend_handle,
        f.status
      from friendships f
      join app_users requester on requester.id = f.requester_user_id
      join app_users addressee on addressee.id = f.addressee_user_id
      where f.addressee_user_id = $1
        and f.status = 'pending'
      order by f.created_at desc
    `,
    [userId]
  )

  return result.rows.map((row) => ({
    friendshipId: row.id,
    requesterId: row.requester_id,
    requesterName: row.requester_name,
    requesterHandle: row.requester_handle,
  }))
}

export async function sendFriendRequest(userId: string, handle: string) {
  await ensureSchema()

  const requester = await findUserById(userId)
  const targetUser = await findUserByHandle(handle.toLowerCase())

  if (!requester || !targetUser || targetUser.id === userId) {
    throw new Error("Amigo invalido.")
  }

  const database = getPool()
  const id = crypto.randomUUID()

  await database.query(
    `
      insert into friendships (id, requester_user_id, addressee_user_id, status)
      values ($1, $2, $3, 'pending')
      on conflict do nothing
    `,
    [id, userId, targetUser.id]
  )

  await createNotification({
    userId: targetUser.id,
    type: "friend-request",
    title: "Novo pedido de amizade",
    message: `${requester.name} (${requester.handle}) quer se conectar com voce.`,
    link: "Amigos",
  })
}

export async function acceptFriendRequest(userId: string, friendshipId: string) {
  await ensureSchema()

  const database = getPool()
  await database.query(
    `
      update friendships
      set status = 'accepted', updated_at = now()
      where id = $1 and addressee_user_id = $2 and status = 'pending'
    `,
    [friendshipId, userId]
  )
}

export async function ensureConfirmedFriendship(userId: string, friendUserId: string) {
  await ensureSchema()

  const database = getPool()
  const result = await database.query<{ id: string }>(
    `
      select id from friendships
      where status = 'accepted'
        and (
          (requester_user_id = $1 and addressee_user_id = $2) or
          (requester_user_id = $2 and addressee_user_id = $1)
        )
      limit 1
    `,
    [userId, friendUserId]
  )

  return (result.rowCount ?? 0) > 0
}
