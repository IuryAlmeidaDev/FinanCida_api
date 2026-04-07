import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { Pool } from "pg"

import type {
  ExpenseCategory,
  FinanceDataset,
  FixedExpenseStatus,
  MonthYear,
} from "@/lib/finance"
import { calculateFinancialSummary } from "@/lib/finance"
import { addMovementToDataset, type MovementInput } from "@/lib/finance-movements"
import { financeDataset } from "@/lib/finance-sample-data"

let writeQueue = Promise.resolve()
let pool: Pool | undefined
let schemaReady: Promise<void> | undefined

function hasDatabaseUrl() {
  return Boolean(process.env.DATABASE_URL)
}

function getPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL nao configurada.")
  }

  pool ??= new Pool({
    connectionString: process.env.DATABASE_URL,
  })

  return pool
}

function getStorePath() {
  return (
    process.env.FINANCE_STORE_PATH ??
    path.join(process.cwd(), "data", "finance-store.json")
  )
}

async function ensureStore() {
  const storePath = getStorePath()

  await mkdir(path.dirname(storePath), { recursive: true })

  try {
    await readFile(storePath, "utf8")
  } catch {
    await writeFile(storePath, JSON.stringify(financeDataset, null, 2), "utf8")
  }
}

async function ensureDatabase() {
  if (schemaReady) {
    return schemaReady
  }

  schemaReady = (async () => {
    const database = getPool()

    await database.query(`
      create table if not exists fixed_expenses (
        id text primary key,
        transaction_date date,
        description text not null,
        category text not null,
        value numeric(12, 2) not null,
        status text not null,
        created_at timestamptz not null default now()
      );

      create table if not exists variable_expenses (
        id text primary key,
        date date not null,
        description text not null,
        category text not null,
        value numeric(12, 2) not null,
        created_at timestamptz not null default now()
      );

      create table if not exists monthly_revenues (
        id text primary key,
        date date not null,
        value numeric(12, 2) not null,
        created_at timestamptz not null default now()
      );
    `)

    const result = await database.query<{ total: string }>(`
      select
        (select count(*) from fixed_expenses) +
        (select count(*) from variable_expenses) +
        (select count(*) from monthly_revenues) as total
    `)

    if (Number(result.rows[0]?.total ?? 0) > 0) {
      return
    }

    await seedDatabase(financeDataset)
  })()

  return schemaReady
}

async function seedDatabase(dataset: FinanceDataset) {
  const database = getPool()
  const client = await database.connect()

  try {
    await client.query("begin")

    for (const expense of dataset.fixedExpenses) {
      await client.query(
        `
          insert into fixed_expenses
            (id, transaction_date, description, category, value, status)
          values ($1, $2, $3, $4, $5, $6)
          on conflict (id) do nothing
        `,
        [
          expense.id,
          expense.transactionDate ?? null,
          expense.description,
          expense.category,
          expense.value,
          expense.status,
        ]
      )
    }

    for (const expense of dataset.variableExpenses) {
      await client.query(
        `
          insert into variable_expenses (id, date, description, category, value)
          values ($1, $2, $3, $4, $5)
          on conflict (id) do nothing
        `,
        [
          expense.id,
          expense.date,
          expense.description,
          expense.category,
          expense.value,
        ]
      )
    }

    for (const revenue of dataset.monthlyRevenues) {
      await client.query(
        `
          insert into monthly_revenues (id, date, value)
          values ($1, $2, $3)
          on conflict (id) do nothing
        `,
        [revenue.id, revenue.date, revenue.value]
      )
    }

    await client.query("commit")
  } catch (error) {
    await client.query("rollback")
    throw error
  } finally {
    client.release()
  }
}

function formatDatabaseDate(value: Date | string | null) {
  if (!value) {
    return undefined
  }

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10)
  }

  return value.slice(0, 10)
}

async function readFinanceDatasetFromDatabase(): Promise<FinanceDataset> {
  await ensureDatabase()

  const database = getPool()
  const [fixedExpenses, variableExpenses, monthlyRevenues] = await Promise.all([
    database.query<{
      id: string
      transaction_date: Date | string | null
      description: string
      category: ExpenseCategory
      value: string
      status: FixedExpenseStatus
    }>(
      "select id, transaction_date, description, category, value, status from fixed_expenses order by transaction_date nulls last, created_at"
    ),
    database.query<{
      id: string
      date: Date | string
      description: string
      category: ExpenseCategory
      value: string
    }>(
      "select id, date, description, category, value from variable_expenses order by date, created_at"
    ),
    database.query<{
      id: string
      date: Date | string
      value: string
    }>("select id, date, value from monthly_revenues order by date, created_at"),
  ])

  return {
    fixedExpenses: fixedExpenses.rows.map((expense) => ({
      id: expense.id,
      transactionDate: formatDatabaseDate(expense.transaction_date),
      description: expense.description,
      category: expense.category,
      value: Number(expense.value),
      status: expense.status,
    })),
    variableExpenses: variableExpenses.rows.map((expense) => ({
      id: expense.id,
      date: formatDatabaseDate(expense.date) ?? expense.date.toString(),
      description: expense.description,
      category: expense.category,
      value: Number(expense.value),
    })),
    monthlyRevenues: monthlyRevenues.rows.map((revenue) => ({
      id: revenue.id,
      date: formatDatabaseDate(revenue.date) ?? revenue.date.toString(),
      value: Number(revenue.value),
    })),
  }
}

async function createFinanceMovementInDatabase(input: MovementInput) {
  await ensureDatabase()

  const database = getPool()
  const client = await database.connect()
  const id = crypto.randomUUID()

  try {
    await client.query("begin")

    const nextDataset = addMovementToDataset(
      {
        fixedExpenses: [],
        variableExpenses: [],
        monthlyRevenues: [],
      },
      input,
      id
    )

    for (const revenue of nextDataset.monthlyRevenues) {
      await client.query(
        `
          insert into monthly_revenues (id, date, value)
          values ($1, $2, $3)
        `,
        [revenue.id, revenue.date, revenue.value]
      )
    }

    for (const expense of nextDataset.fixedExpenses) {
      await client.query(
        `
          insert into fixed_expenses
            (id, transaction_date, description, category, value, status)
          values ($1, $2, $3, $4, $5, $6)
        `,
        [
          expense.id,
          expense.transactionDate ?? null,
          expense.description,
          expense.category,
          expense.value,
          expense.status,
        ]
      )
    }

    for (const expense of nextDataset.variableExpenses) {
      await client.query(
        `
          insert into variable_expenses (id, date, description, category, value)
          values ($1, $2, $3, $4, $5)
        `,
        [
          expense.id,
          expense.date,
          expense.description,
          expense.category,
          expense.value,
        ]
      )
    }

    await client.query("commit")
  } catch (error) {
    await client.query("rollback")
    throw error
  } finally {
    client.release()
  }

  return readFinanceDatasetFromDatabase()
}

export async function readFinanceDataset(): Promise<FinanceDataset> {
  if (hasDatabaseUrl()) {
    return readFinanceDatasetFromDatabase()
  }

  await ensureStore()

  const storeContent = await readFile(getStorePath(), "utf8")
  return JSON.parse(storeContent) as FinanceDataset
}

export async function writeFinanceDataset(dataset: FinanceDataset) {
  if (hasDatabaseUrl()) {
    await seedDatabase(dataset)
    return readFinanceDatasetFromDatabase()
  }

  await mkdir(path.dirname(getStorePath()), { recursive: true })
  await writeFile(getStorePath(), JSON.stringify(dataset, null, 2), "utf8")
  return dataset
}

export async function createFinanceMovement(input: MovementInput) {
  if (hasDatabaseUrl()) {
    return createFinanceMovementInDatabase(input)
  }

  const writeOperation = writeQueue.then(async () => {
    const dataset = await readFinanceDataset()
    const nextDataset = addMovementToDataset(dataset, input)

    await writeFinanceDataset(nextDataset)

    return nextDataset
  })

  writeQueue = writeOperation.then(
    () => undefined,
    () => undefined
  )

  return writeOperation
}

export async function getFinancialSummary(range: MonthYear) {
  const dataset = await readFinanceDataset()

  return calculateFinancialSummary(dataset, range, new Date())
}
