import { z } from "zod"

import { findUserByEmail } from "@/lib/auth-store"
import { createFinanceMovement } from "@/lib/finance-store"
import { getPool } from "@/lib/postgres"

export const friendAccountInputSchema = z.object({
  friendName: z.string().trim().min(1).max(120),
  friendEmail: z.email(),
  description: z.string().trim().min(1).max(160),
  totalAmount: z.number().positive(),
  installments: z.number().int().min(1).max(120),
})

export const friendAccountPaymentSchema = z.object({
  accountId: z.string().min(1),
})

export type FriendAccount = {
  id: string
  friendName: string
  friendEmail: string
  description: string
  totalAmount: number
  installments: number
  paidInstallments: number
  installmentValue: number
  status: "Em aberto" | "Quitado"
}

type FriendAccountRow = {
  id: string
  friend_name: string
  friend_email: string
  description: string
  total_amount: string
  installments: number
  paid_installments: number
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
        friend_name text not null,
        friend_email text not null,
        description text not null,
        total_amount numeric(12, 2) not null,
        installments integer not null,
        paid_installments integer not null default 0,
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
  const paidInstallments = row.paid_installments

  return {
    id: row.id,
    friendName: row.friend_name,
    friendEmail: row.friend_email,
    description: row.description,
    totalAmount,
    installments: row.installments,
    paidInstallments,
    installmentValue: totalAmount / row.installments,
    status: paidInstallments >= row.installments ? "Quitado" : "Em aberto",
  }
}

export async function listFriendAccounts(userId: string) {
  await ensureSchema()

  const database = getPool()
  const result = await database.query<FriendAccountRow>(
    `
      select id, friend_name, friend_email, description, total_amount,
        installments, paid_installments
      from friend_accounts
      where owner_user_id = $1
      order by created_at desc
    `,
    [userId]
  )

  return result.rows.map(mapFriendAccount)
}

export async function createFriendAccount(
  userId: string,
  input: z.infer<typeof friendAccountInputSchema>
) {
  await ensureSchema()

  const parsedInput = friendAccountInputSchema.parse(input)
  const database = getPool()
  const id = crypto.randomUUID()
  await database.query(
    `
      insert into friend_accounts
        (id, owner_user_id, friend_name, friend_email, description, total_amount, installments)
      values ($1, $2, $3, $4, $5, $6, $7)
    `,
    [
      id,
      userId,
      parsedInput.friendName,
      parsedInput.friendEmail.toLowerCase(),
      parsedInput.description,
      parsedInput.totalAmount,
      parsedInput.installments,
    ]
  )

  return listFriendAccounts(userId)
}

export async function payFriendAccountInstallment(userId: string, accountId: string) {
  await ensureSchema()

  const database = getPool()
  const result = await database.query<FriendAccountRow>(
    `
      update friend_accounts
      set paid_installments = paid_installments + 1, updated_at = now()
      where id = $1 and owner_user_id = $2 and paid_installments < installments
      returning id, friend_name, friend_email, description, total_amount,
        installments, paid_installments
    `,
    [accountId, userId]
  )

  const account = result.rows[0] ? mapFriendAccount(result.rows[0]) : null

  if (!account) {
    return listFriendAccounts(userId)
  }

  const paymentDate = new Date().toISOString().slice(0, 10)
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

  const friendUser = await findUserByEmail(account.friendEmail)

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
