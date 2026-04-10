import { z } from "zod"

import { findUserById } from "@/lib/auth-store"
import { expenseCategories } from "@/lib/finance-movements"
import { ensureConfirmedFriendship, listFriends } from "@/lib/friends-store"
import { createFinanceMovement } from "@/lib/finance-store"
import { createNotification } from "@/lib/notifications-store"
import { getPool } from "@/lib/postgres"

export const friendAccountInputSchema = z.object({
  friendUserId: z.string().min(1),
  description: z.string().trim().min(1).max(160),
  category: z.enum(expenseCategories),
  note: z.string().trim().max(280).optional().default(""),
  totalAmount: z.number().positive(),
  recurrenceType: z.enum(["unique", "installment", "recurring"]),
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
  category: (typeof expenseCategories)[number]
  note: string
  totalAmount: number
  installments: number
  installmentValue: number
  paymentDates: string[]
  recurrenceType: "unique" | "installment" | "recurring"
  status: "Pendente" | "Aceita" | "Recusada"
  role: "requester" | "recipient"
}

type FriendAccountRow = {
  id: string
  requester_user_id: string
  friend_user_id: string
  description: string
  category: (typeof expenseCategories)[number]
  note: string | null
  total_amount: string
  installments: number
  payment_dates: string
  recurrence_type: "unique" | "installment" | "recurring"
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
        category text not null default 'Outros',
        note text not null default '',
        total_amount numeric(12, 2) not null,
        installments integer not null,
        payment_dates jsonb not null,
        recurrence_type text not null default 'installment',
        status text not null default 'pending',
        accepted_at timestamptz,
        finance_synced_at timestamptz,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
      );

      alter table friend_accounts add column if not exists owner_user_id text;
      alter table friend_accounts add column if not exists requester_user_id text;
      alter table friend_accounts add column if not exists friend_user_id text;
      alter table friend_accounts add column if not exists category text;
      alter table friend_accounts add column if not exists note text;
      alter table friend_accounts add column if not exists payment_dates jsonb;
      alter table friend_accounts add column if not exists recurrence_type text;
      alter table friend_accounts add column if not exists requester_name text;
      alter table friend_accounts add column if not exists requester_handle text;
      alter table friend_accounts add column if not exists requester_email text;
      alter table friend_accounts add column if not exists friend_name text;
      alter table friend_accounts add column if not exists friend_handle text;
      alter table friend_accounts add column if not exists friend_email text;
      alter table friend_accounts add column if not exists description text;
      alter table friend_accounts add column if not exists total_amount numeric(12, 2);
      alter table friend_accounts add column if not exists installments integer;
      alter table friend_accounts add column if not exists payment_dates jsonb;
      alter table friend_accounts add column if not exists status text not null default 'pending';
      alter table friend_accounts add column if not exists accepted_at timestamptz;
      alter table friend_accounts add column if not exists finance_synced_at timestamptz;
      alter table friend_accounts add column if not exists created_at timestamptz not null default now();
      alter table friend_accounts add column if not exists updated_at timestamptz not null default now();

      update friend_accounts
      set requester_user_id = coalesce(requester_user_id, owner_user_id)
      where requester_user_id is null;

      update friend_accounts
      set owner_user_id = coalesce(owner_user_id, requester_user_id)
      where owner_user_id is null;

      update friend_accounts
      set category = coalesce(category, 'Outros')
      where category is null or category = '';

      update friend_accounts
      set note = coalesce(note, '')
      where note is null;

      update friend_accounts
      set recurrence_type = coalesce(
        recurrence_type,
        case
          when installments <= 1 then 'unique'
          else 'installment'
        end
      )
      where recurrence_type is null or recurrence_type = '';

      update friend_accounts fa
      set requester_name = coalesce(fa.requester_name, requester.name),
          requester_handle = coalesce(fa.requester_handle, requester.handle),
          requester_email = coalesce(fa.requester_email, requester.email)
      from app_users requester
      where requester.id = fa.requester_user_id
        and (
          fa.requester_name is null
          or fa.requester_handle is null
          or fa.requester_email is null
        );

      update friend_accounts fa
      set friend_name = coalesce(fa.friend_name, friend.name),
          friend_handle = coalesce(fa.friend_handle, friend.handle),
          friend_email = coalesce(fa.friend_email, friend.email)
      from app_users friend
      where friend.id = fa.friend_user_id
        and (
          fa.friend_name is null
          or fa.friend_handle is null
          or fa.friend_email is null
        );

      update friend_accounts
      set payment_dates = '[]'::jsonb
      where payment_dates is null;

      alter table friend_accounts
      alter column payment_dates set not null;

      alter table friend_accounts
      alter column category set not null;

      alter table friend_accounts
      alter column note set not null;

      alter table friend_accounts
      alter column recurrence_type set not null;

      update friend_accounts
      set installments = 1
      where installments is null;

      update friend_accounts
      set total_amount = 0
      where total_amount is null;

      update friend_accounts
      set description = 'Conta compartilhada'
      where description is null or description = '';

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
    category: row.category,
    note: row.note ?? "",
    totalAmount,
    installments: row.installments,
    installmentValue: totalAmount / row.installments,
    paymentDates: JSON.parse(row.payment_dates) as string[],
    recurrenceType: row.recurrence_type,
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
        fa.category,
        fa.note,
        fa.total_amount,
        fa.installments,
        fa.payment_dates::text as payment_dates,
        fa.recurrence_type,
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
  const requester = await findUserById(userId)
  const friend = await findUserById(parsedInput.friendUserId)

  await database.query(
    `
      insert into friend_accounts
        (
          id,
          owner_user_id,
          requester_user_id,
          friend_user_id,
          description,
          category,
          note,
          total_amount,
          installments,
          payment_dates,
          recurrence_type,
          status,
          requester_name,
          requester_handle,
          requester_email,
          friend_name,
          friend_handle,
          friend_email
        )
      values (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9,
        $10::jsonb,
        $11,
        'pending',
        $12,
        $13,
        $14,
        $15,
        $16,
        $17
      )
    `,
    [
      id,
      userId,
      userId,
      parsedInput.friendUserId,
      parsedInput.description,
      parsedInput.category,
      parsedInput.note,
      parsedInput.totalAmount,
      parsedInput.installments,
      JSON.stringify(parsedInput.paymentDates),
      parsedInput.recurrenceType,
      requester?.name ?? "",
      requester?.handle ?? "",
      requester?.email ?? "",
      friend?.name ?? "",
      friend?.handle ?? "",
      friend?.email ?? "",
    ]
  )

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
      category: row.category,
      value: installmentValue,
      status: "Pendente",
    })

    await createFinanceMovement(row.friend_user_id, {
      type: "revenue",
      recurrence: "unique",
      date: paymentDate,
      description,
      category: row.category,
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
        fa.category,
        fa.note,
        fa.total_amount,
        fa.installments,
        fa.payment_dates::text as payment_dates,
        fa.recurrence_type,
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
