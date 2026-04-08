import { readFinanceDataset } from "@/lib/finance-store"
import { getPool } from "@/lib/postgres"

export type NotificationType =
  | "friend-request"
  | "shared-transaction"
  | "overdue-bill"

export type AppNotification = {
  id: string
  type: NotificationType
  title: string
  message: string
  link: string
  read: boolean
  createdAt: string
}

type NotificationRow = {
  id: string
  type: NotificationType
  title: string
  message: string
  link: string
  is_read: boolean
  created_at: string | Date
}

let schemaReady: Promise<void> | undefined

async function ensureSchema() {
  if (schemaReady) {
    return schemaReady
  }

  schemaReady = (async () => {
    const database = getPool()

    await database.query(`
      create table if not exists notifications (
        id text primary key,
        user_id text not null,
        type text not null,
        title text not null,
        message text not null,
        link text not null,
        is_read boolean not null default false,
        created_at timestamptz not null default now()
      );

      create index if not exists notifications_user_id_idx on notifications (user_id, created_at desc);
    `)
  })()

  return schemaReady
}

function mapNotification(row: NotificationRow): AppNotification {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    message: row.message,
    link: row.link,
    read: row.is_read,
    createdAt:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : row.created_at,
  }
}

async function listOverdueBillNotifications(userId: string) {
  const dataset = await readFinanceDataset(userId)
  const now = new Date()
  const currentDate = now.toISOString().slice(0, 10)

  return dataset.fixedExpenses
    .filter(
      (expense) =>
        expense.status !== "Pago" &&
        Boolean(expense.transactionDate) &&
        expense.transactionDate! < currentDate
    )
    .map((expense) => ({
      id: `overdue-${expense.id}`,
      type: "overdue-bill" as const,
      title: "Conta vencida",
      message: `${expense.description} venceu e ainda nao foi paga.`,
      link: "Limite de Gastos",
      read: false,
      createdAt: `${expense.transactionDate}T00:00:00.000Z`,
    }))
}

export async function createNotification(input: {
  userId: string
  type: NotificationType
  title: string
  message: string
  link: string
}) {
  await ensureSchema()

  const database = getPool()
  await database.query(
    `
      insert into notifications (id, user_id, type, title, message, link)
      values ($1, $2, $3, $4, $5, $6)
    `,
    [
      crypto.randomUUID(),
      input.userId,
      input.type,
      input.title,
      input.message,
      input.link,
    ]
  )
}

export async function listNotifications(userId: string) {
  await ensureSchema()

  const database = getPool()
  const result = await database.query<NotificationRow>(
    `
      select id, type, title, message, link, is_read, created_at
      from notifications
      where user_id = $1
      order by created_at desc
      limit 30
    `,
    [userId]
  )

  const persisted = result.rows.map(mapNotification)
  const overdue = await listOverdueBillNotifications(userId)

  return [...overdue, ...persisted].sort((left, right) =>
    right.createdAt.localeCompare(left.createdAt)
  )
}

export async function markNotificationAsRead(userId: string, notificationId: string) {
  await ensureSchema()

  if (notificationId.startsWith("overdue-")) {
    return
  }

  const database = getPool()
  await database.query(
    `
      update notifications
      set is_read = true
      where id = $1 and user_id = $2
    `,
    [notificationId, userId]
  )
}
