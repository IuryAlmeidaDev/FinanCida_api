import { z } from "zod"

import { findUserById } from "@/lib/auth-store"
import { ensureConfirmedFriendship, listFriends } from "@/lib/friends-store"
import { createFinanceMovement } from "@/lib/finance-store"
import { createNotification } from "@/lib/notifications-store"
import { getPool } from "@/lib/postgres"

export const friendAccountInputSchema = z.object({
  friendUserId: z.string().min(1),
  description: z.string().trim().min(1).max(160),
  totalAmount: z.number().positive(),
  installments: z.number().int().min(1).max(120),
  paymentDates: z.array(z.iso.date()).min(1).max(120),
})

export const friendAccountPaymentSchema = z.object({
  accountId: z.string().min(1),
})

export type FriendAccount = {
  id: string
  friendUserId: string
  friendName: string
  friendHandle: string
  description: string
  totalAmount: number
  installments: number
  paidInstallments: number
  installmentValue: number
  paymentDates: string[]
  status: "Em aberto" | "Quitado"
}

type FriendAccountRow = {
  id: string
  friend_user_id: string
  description: string
  total_amount: string
  installments: number
  paid_installments: number
  payment_dates: string
  friend_name: string
  friend_handle: string
}

let schemaReady: Promise<void> | undefined

async function ensureSchema() {
  if (schemaReady) {
    return schemaReady
  }

  schemaReady = (async () => {
    const database = getPool()

    await database.query(`
      create table if not exists friend_accounts (
        id text primary key,
        owner_user_id text not null,
        friend_user_id text not null,
        description text not null,
        total_amount numeric(12, 2) not null,
        installments integer not null,
        paid_installments integer not null default 0,
        payment_dates jsonb not null,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
      );

      create index if not exists friend_accounts_owner_user_id_idx
        on friend_accounts (owner_user_id);
    `)
  })()

  return schemaReady
}

function mapFriendAccount(row: FriendAccountRow): FriendAccount {
  const totalAmount = Number(row.total_amount)
  const paymentDates = JSON.parse(row.payment_dates) as string[]

  return {
    id: row.id,
    friendUserId: row.friend_user_id,
    friendName: row.friend_name,
    friendHandle: row.friend_handle,
    description: row.description,
    totalAmount,
    installments: row.installments,
    paidInstallments: row.paid_installments,
    installmentValue: totalAmount / row.installments,
    paymentDates,
    status: row.paid_installments >= row.installments ? "Quitado" : "Em aberto",
  }
}

export async function listFriendAccounts(userId: string) {
  await ensureSchema()

  const database = getPool()
  const result = await database.query<FriendAccountRow>(
    `
      select
        fa.id,
        fa.friend_user_id,
        fa.description,
        fa.total_amount,
        fa.installments,
        fa.paid_installments,
        fa.payment_dates::text as payment_dates,
        u.name as friend_name,
        u.handle as friend_handle
      from friend_accounts fa
      join app_users u on u.id = fa.friend_user_id
      where fa.owner_user_id = $1
      order by fa.created_at desc
    `,
    [userId]
  )

  return result.rows.map(mapFriendAccount)
}

export async function listConfirmedFriendsForAccounts(userId: string) {
  return listFriends(userId)
}

export async function createFriendAccount(
  userId: string,
  input: z.infer<typeof friendAccountInputSchema>
) {
  await ensureSchema()

  const parsedInput = friendAccountInputSchema.parse(input)

  if (parsedInput.paymentDates.length !== parsedInput.installments) {
    throw new Error("Datas e parcelas precisam ter a mesma quantidade.")
  }

  const isConfirmed = await ensureConfirmedFriendship(userId, parsedInput.friendUserId)

  if (!isConfirmed) {
    throw new Error("Somente amigos confirmados podem participar.")
  }

  const database = getPool()
  const id = crypto.randomUUID()
  await database.query(
    `
      insert into friend_accounts
        (id, owner_user_id, friend_user_id, description, total_amount, installments, payment_dates)
      values ($1, $2, $3, $4, $5, $6, $7::jsonb)
    `,
    [
      id,
      userId,
      parsedInput.friendUserId,
      parsedInput.description,
      parsedInput.totalAmount,
      parsedInput.installments,
      JSON.stringify(parsedInput.paymentDates),
    ]
  )

  const owner = await findUserById(userId)

  if (owner) {
    await createNotification({
      userId: parsedInput.friendUserId,
      type: "shared-transaction",
      title: "Nova conta compartilhada",
      message: `${owner.name} criou "${parsedInput.description}" em ${parsedInput.installments} parcelas.`,
      link: "Contas Compartilhadas",
    })
  }

  return listFriendAccounts(userId)
}

export async function payFriendAccountInstallment(userId: string, accountId: string) {
  await ensureSchema()

  const database = getPool()
  const result = await database.query<FriendAccountRow>(
    `
      update friend_accounts
      set paid_installments = paid_installments + 1, updated_at = now()
      from app_users u
      where friend_accounts.id = $1
        and friend_accounts.owner_user_id = $2
        and friend_accounts.friend_user_id = u.id
        and friend_accounts.paid_installments < friend_accounts.installments
      returning
        friend_accounts.id,
        friend_accounts.friend_user_id,
        friend_accounts.description,
        friend_accounts.total_amount,
        friend_accounts.installments,
        friend_accounts.paid_installments,
        friend_accounts.payment_dates::text as payment_dates,
        u.name as friend_name,
        u.handle as friend_handle
    `,
    [accountId, userId]
  )

  const account = result.rows[0] ? mapFriendAccount(result.rows[0]) : null

  if (!account) {
    return listFriendAccounts(userId)
  }

  const paymentDate =
    account.paymentDates[account.paidInstallments - 1] ??
    new Date().toISOString().slice(0, 10)
  const description = `${account.description} - parcela ${account.paidInstallments}/${account.installments}`

  await createFinanceMovement(userId, {
    type: "expense",
    recurrence: "unique",
    date: paymentDate,
    description,
    category: "Outros",
    value: account.installmentValue,
    status: "Pago",
  })

  const friendUser = await findUserById(account.friendUserId)

  if (friendUser) {
    await createFinanceMovement(friendUser.id, {
      type: "revenue",
      recurrence: "unique",
      date: paymentDate,
      description,
      category: "Outros",
      value: account.installmentValue,
    })
  }

  return listFriendAccounts(userId)
}
