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

export const friendAccountAcceptSchema = z.object({
  accountId: z.string().min(1),
  action: z.enum(["accept", "reject"]),
})

export type FriendAccount = {
  id: string
  requesterUserId: string
  friendUserId: string
  counterpartName: string
  counterpartHandle: string
  description: string
  totalAmount: number
  installments: number
  installmentValue: number
  paymentDates: string[]
  status: "Pendente" | "Aceita" | "Recusada"
  role: "requester" | "recipient"
}

type FriendAccountRow = {
  id: string
  requester_user_id: string
  friend_user_id: string
  description: string
  total_amount: string
  installments: number
  payment_dates: string
  status: "pending" | "accepted" | "rejected"
  requester_name: string
  requester_handle: string
  friend_name: string
  friend_handle: string
}

let schemaReady: Promise<void> | undefined

async function notifySafely(input: Parameters<typeof createNotification>[0]) {
  try {
    await createNotification(input)
  } catch (error) {
    console.error("Falha ao criar notificacao de conta compartilhada.", error)
  }
}

async function ensureSchema() {
  if (schemaReady) {
    return schemaReady
  }

  schemaReady = (async () => {
    const database = getPool()

    await database.query(`
      create table if not exists friend_accounts (
        id text primary key,
        requester_user_id text not null,
        friend_user_id text not null,
        description text not null,
        total_amount numeric(12, 2) not null,
        installments integer not null,
        payment_dates jsonb not null,
        status text not null default 'pending',
        accepted_at timestamptz,
        finance_synced_at timestamptz,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
      );

      alter table friend_accounts add column if not exists owner_user_id text;
      alter table friend_accounts add column if not exists requester_user_id text;
      alter table friend_accounts add column if not exists friend_user_id text;
      alter table friend_accounts add column if not exists payment_dates jsonb;
      alter table friend_accounts add column if not exists status text not null default 'pending';
      alter table friend_accounts add column if not exists accepted_at timestamptz;
      alter table friend_accounts add column if not exists finance_synced_at timestamptz;

      update friend_accounts
      set requester_user_id = coalesce(requester_user_id, owner_user_id)
      where requester_user_id is null;

      update friend_accounts
      set owner_user_id = coalesce(owner_user_id, requester_user_id)
      where owner_user_id is null;

      update friend_accounts
      set payment_dates = '[]'::jsonb
      where payment_dates is null;

      alter table friend_accounts
      alter column payment_dates set not null;

      update friend_accounts
      set status = coalesce(status, 'accepted')
      where status is null or status = '';

      create index if not exists friend_accounts_requester_user_id_idx
        on friend_accounts (requester_user_id);

      create index if not exists friend_accounts_friend_user_id_idx
        on friend_accounts (friend_user_id);
    `)
  })()

  return schemaReady
}

function mapFriendAccount(row: FriendAccountRow, userId: string): FriendAccount {
  const role = row.requester_user_id === userId ? "requester" : "recipient"
  const counterpartName =
    role === "requester" ? row.friend_name : row.requester_name
  const counterpartHandle =
    role === "requester" ? row.friend_handle : row.requester_handle
  const totalAmount = Number(row.total_amount)

  return {
    id: row.id,
    requesterUserId: row.requester_user_id,
    friendUserId: row.friend_user_id,
    counterpartName,
    counterpartHandle,
    description: row.description,
    totalAmount,
    installments: row.installments,
    installmentValue: totalAmount / row.installments,
    paymentDates: JSON.parse(row.payment_dates) as string[],
    status:
      row.status === "accepted"
        ? "Aceita"
        : row.status === "rejected"
          ? "Recusada"
          : "Pendente",
    role,
  }
}

export async function listFriendAccounts(userId: string) {
  await ensureSchema()

  const database = getPool()
  const result = await database.query<FriendAccountRow>(
    `
      select
        fa.id,
        fa.requester_user_id,
        fa.friend_user_id,
        fa.description,
        fa.total_amount,
        fa.installments,
        fa.payment_dates::text as payment_dates,
        fa.status,
        requester.name as requester_name,
        requester.handle as requester_handle,
        friend.name as friend_name,
        friend.handle as friend_handle
      from friend_accounts fa
      join app_users requester on requester.id = fa.requester_user_id
      join app_users friend on friend.id = fa.friend_user_id
      where fa.requester_user_id = $1 or fa.friend_user_id = $1
      order by fa.created_at desc
    `,
    [userId]
  )

  return result.rows.map((row) => mapFriendAccount(row, userId))
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
        (id, owner_user_id, requester_user_id, friend_user_id, description, total_amount, installments, payment_dates, status)
      values ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, 'pending')
    `,
    [
      id,
      userId,
      userId,
      parsedInput.friendUserId,
      parsedInput.description,
      parsedInput.totalAmount,
      parsedInput.installments,
      JSON.stringify(parsedInput.paymentDates),
    ]
  )

  const requester = await findUserById(userId)

  if (requester) {
    await notifySafely({
      userId: parsedInput.friendUserId,
      type: "shared-transaction",
      title: "Conta compartilhada pendente",
      message: `${requester.name} criou "${parsedInput.description}" e aguarda seu aceite.`,
      link: "Contas Compartilhadas",
    })
  }

  return listFriendAccounts(userId)
}

async function syncAcceptedAccountToFinance(row: FriendAccountRow) {
  const paymentDates = JSON.parse(row.payment_dates) as string[]
  const installmentValue = Number(row.total_amount) / row.installments

  for (const [index, paymentDate] of paymentDates.entries()) {
    const description = `${row.description} - parcela ${index + 1}/${row.installments}`

    await createFinanceMovement(row.requester_user_id, {
      type: "expense",
      recurrence: "unique",
      date: paymentDate,
      description,
      category: "Outros",
      value: installmentValue,
      status: "Em aberto",
    })

    await createFinanceMovement(row.friend_user_id, {
      type: "revenue",
      recurrence: "unique",
      date: paymentDate,
      description,
      category: "Outros",
      value: installmentValue,
    })
  }
}

export async function handleFriendAccountDecision(
  userId: string,
  input: z.infer<typeof friendAccountAcceptSchema>
) {
  await ensureSchema()

  const database = getPool()
  const result = await database.query<FriendAccountRow>(
    `
      update friend_accounts fa
      set status = $3,
          accepted_at = case when $3 = 'accepted' then now() else accepted_at end,
          updated_at = now()
      from app_users requester, app_users friend
      where fa.id = $1
        and fa.friend_user_id = $2
        and fa.status = 'pending'
        and requester.id = fa.requester_user_id
        and friend.id = fa.friend_user_id
      returning
        fa.id,
        fa.requester_user_id,
        fa.friend_user_id,
        fa.description,
        fa.total_amount,
        fa.installments,
        fa.payment_dates::text as payment_dates,
        fa.status,
        requester.name as requester_name,
        requester.handle as requester_handle,
        friend.name as friend_name,
        friend.handle as friend_handle
    `,
    [input.accountId, userId, input.action === "accept" ? "accepted" : "rejected"]
  )

  const account = result.rows[0]

  if (!account) {
    return listFriendAccounts(userId)
  }

  if (input.action === "accept") {
    await syncAcceptedAccountToFinance(account)

    await database.query(
      `
        update friend_accounts
        set finance_synced_at = now(), updated_at = now()
        where id = $1
      `,
      [input.accountId]
    )

    await notifySafely({
      userId: account.requester_user_id,
      type: "shared-transaction",
      title: "Conta compartilhada aceita",
      message: `${account.friend_name} aceitou "${account.description}".`,
      link: "Contas Compartilhadas",
    })
  } else {
    await notifySafely({
      userId: account.requester_user_id,
      type: "shared-transaction",
      title: "Conta compartilhada recusada",
      message: `${account.friend_name} recusou "${account.description}".`,
      link: "Contas Compartilhadas",
    })
  }

  return listFriendAccounts(userId)
}
