import { z } from "zod"

import { calculateFinancialSummary, getCurrentMonthYear } from "@/lib/finance"
import { readFinanceDataset } from "@/lib/finance-store"
import { getPool, hasDatabaseUrl, runSchemaBootstrap } from "@/lib/postgres"

export const spendingLimitInputSchema = z.object({
  monthlyLimit: z.number().int().min(1000).max(1000000),
})

let schemaReady: Promise<void> | undefined

async function ensureSchema() {
  if (schemaReady) {
    return schemaReady
  }

  schemaReady = (async () => {
    await runSchemaBootstrap(`
      create table if not exists spending_limits (
        user_id text primary key,
        monthly_limit integer not null,
        updated_at timestamptz not null default now()
      );
    `)
  })()

  return schemaReady
}

export async function readSpendingLimit(userId: string) {
  if (!hasDatabaseUrl()) {
    throw new Error("DATABASE_URL nao configurada.")
  }

  await ensureSchema()

  const database = getPool()
  const result = await database.query<{ monthly_limit: number }>(
    `
      select monthly_limit
      from spending_limits
      where user_id = $1
      limit 1
    `,
    [userId]
  )

  if (result.rows[0]?.monthly_limit) {
    return result.rows[0].monthly_limit
  }

  const dataset = await readFinanceDataset(userId)
  const summary = calculateFinancialSummary(dataset, getCurrentMonthYear())

  return Math.max(Math.round(summary.totalRevenue), 1000)
}

export async function writeSpendingLimit(
  userId: string,
  input: z.infer<typeof spendingLimitInputSchema>
) {
  if (!hasDatabaseUrl()) {
    throw new Error("DATABASE_URL nao configurada.")
  }

  await ensureSchema()

  const parsedInput = spendingLimitInputSchema.parse(input)
  const database = getPool()

  await database.query(
    `
      insert into spending_limits (user_id, monthly_limit, updated_at)
      values ($1, $2, now())
      on conflict (user_id)
      do update set monthly_limit = excluded.monthly_limit, updated_at = now()
    `,
    [userId, parsedInput.monthlyLimit]
  )

  return readSpendingLimit(userId)
}
