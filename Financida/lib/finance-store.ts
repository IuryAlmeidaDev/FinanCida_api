import type {
  CategoryIconName,
  FinanceDataset,
  FixedExpenseStatus,
  MonthYear,
} from "@/lib/finance"
import { createEmptyFinanceDataset, normalizeFinanceDataset } from "@/lib/finance"
import { calculateFinancialSummary } from "@/lib/finance"
import {
  addMovementToDataset,
  type MovementDeleteInput,
  type MovementInput,
  type MovementUpdateInput,
} from "@/lib/finance-movements"
import { getPool, hasDatabaseUrl } from "@/lib/postgres"

let schemaReady: Promise<void> | undefined

async function ensureDatabase() {
  if (schemaReady) {
    return schemaReady
  }

  schemaReady = (async () => {
    const database = getPool()

    await database.query(`
      create table if not exists fixed_expenses (
        id text primary key,
        user_id text,
        transaction_date date,
        description text not null,
        category text not null,
        value numeric(12, 2) not null,
        status text not null,
        created_at timestamptz not null default now()
      );

      create table if not exists variable_expenses (
        id text primary key,
        user_id text,
        date date not null,
        description text not null,
        category text not null,
        value numeric(12, 2) not null,
        created_at timestamptz not null default now()
      );

      create table if not exists monthly_revenues (
        id text primary key,
        user_id text,
        date date not null,
        value numeric(12, 2) not null,
        created_at timestamptz not null default now()
      );

      create table if not exists finance_categories (
        user_id text not null,
        name text not null,
        color text not null,
        icon text not null,
        created_at timestamptz not null default now(),
        primary key (user_id, name)
      );

      alter table fixed_expenses add column if not exists user_id text;
      alter table variable_expenses add column if not exists user_id text;
      alter table monthly_revenues add column if not exists user_id text;

      create index if not exists fixed_expenses_user_id_idx on fixed_expenses (user_id);
      create index if not exists variable_expenses_user_id_idx on variable_expenses (user_id);
      create index if not exists monthly_revenues_user_id_idx on monthly_revenues (user_id);
      create index if not exists finance_categories_user_id_idx on finance_categories (user_id);
    `)
  })()

  return schemaReady
}

async function replaceDatabaseContents(userId: string, dataset: FinanceDataset) {
  const normalizedDataset = normalizeFinanceDataset(dataset)
  const database = getPool()
  const client = await database.connect()

  try {
    await client.query("begin")

    await client.query("delete from monthly_revenues where user_id = $1", [userId])
    await client.query("delete from fixed_expenses where user_id = $1", [userId])
    await client.query("delete from variable_expenses where user_id = $1", [userId])
    await client.query("delete from finance_categories where user_id = $1", [userId])

    for (const category of normalizedDataset.categories) {
      await client.query(
        `
          insert into finance_categories (user_id, name, color, icon)
          values ($1, $2, $3, $4)
          on conflict (user_id, name) do update
          set color = excluded.color,
              icon = excluded.icon
        `,
        [userId, category.name, category.color, category.icon]
      )
    }

    for (const expense of normalizedDataset.fixedExpenses) {
      await client.query(
        `
          insert into fixed_expenses
            (id, user_id, transaction_date, description, category, value, status)
          values ($1, $2, $3, $4, $5, $6, $7)
          on conflict (id) do nothing
        `,
        [
          expense.id,
          userId,
          expense.transactionDate ?? null,
          expense.description,
          expense.category,
          expense.value,
          expense.status,
        ]
      )
    }

    for (const expense of normalizedDataset.variableExpenses) {
      await client.query(
        `
          insert into variable_expenses (id, user_id, date, description, category, value)
          values ($1, $2, $3, $4, $5, $6)
          on conflict (id) do nothing
        `,
        [
          expense.id,
          userId,
          expense.date,
          expense.description,
          expense.category,
          expense.value,
        ]
      )
    }

    for (const revenue of normalizedDataset.monthlyRevenues) {
      await client.query(
        `
          insert into monthly_revenues (id, user_id, date, value)
          values ($1, $2, $3, $4)
          on conflict (id) do nothing
        `,
        [revenue.id, userId, revenue.date, revenue.value]
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

async function readFinanceDatasetFromDatabase(userId: string): Promise<FinanceDataset> {
  await ensureDatabase()

  const database = getPool()
  const [categories, fixedExpenses, variableExpenses, monthlyRevenues] = await Promise.all([
    database.query<{
      name: string
      color: string
      icon: string
    }>(
      "select name, color, icon from finance_categories where user_id = $1 order by created_at, name",
      [userId]
    ),
    database.query<{
      id: string
      transaction_date: Date | string | null
      description: string
      category: string
      value: string
      status: FixedExpenseStatus
    }>(
      "select id, transaction_date, description, category, value, status from fixed_expenses where user_id = $1 order by transaction_date nulls last, created_at",
      [userId]
    ),
    database.query<{
      id: string
      date: Date | string
      description: string
      category: string
      value: string
    }>(
      "select id, date, description, category, value from variable_expenses where user_id = $1 order by date, created_at",
      [userId]
    ),
    database.query<{
      id: string
      date: Date | string
      value: string
    }>(
      "select id, date, value from monthly_revenues where user_id = $1 order by date, created_at",
      [userId]
    ),
  ])

  return normalizeFinanceDataset({
    categories: categories.rows.map((category) => ({
      name: category.name,
      color: category.color,
      icon: category.icon as CategoryIconName,
    })),
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
  })
}

async function createFinanceMovementInDatabase(userId: string, input: MovementInput) {
  await ensureDatabase()

  const database = getPool()
  const client = await database.connect()
  const id = crypto.randomUUID()

  try {
    await client.query("begin")

    const nextDataset = addMovementToDataset(
      createEmptyFinanceDataset(),
      input,
      id
    )

    for (const category of nextDataset.categories) {
      await client.query(
        `
          insert into finance_categories (user_id, name, color, icon)
          values ($1, $2, $3, $4)
          on conflict (user_id, name) do update
          set color = excluded.color,
              icon = excluded.icon
        `,
        [userId, category.name, category.color, category.icon]
      )
    }

    for (const revenue of nextDataset.monthlyRevenues) {
      await client.query(
        `
          insert into monthly_revenues (id, user_id, date, value)
          values ($1, $2, $3, $4)
        `,
        [revenue.id, userId, revenue.date, revenue.value]
      )
    }

    for (const expense of nextDataset.fixedExpenses) {
      await client.query(
        `
          insert into fixed_expenses
            (id, user_id, transaction_date, description, category, value, status)
          values ($1, $2, $3, $4, $5, $6, $7)
        `,
        [
          expense.id,
          userId,
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
          insert into variable_expenses (id, user_id, date, description, category, value)
          values ($1, $2, $3, $4, $5, $6)
        `,
        [
          expense.id,
          userId,
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

  return readFinanceDatasetFromDatabase(userId)
}

export async function readFinanceDataset(userId: string): Promise<FinanceDataset> {
  if (!hasDatabaseUrl()) {
    throw new Error("DATABASE_URL nao configurada.")
  }

  return readFinanceDatasetFromDatabase(userId)
}

export async function writeFinanceDataset(userId: string, dataset: FinanceDataset) {
  if (!hasDatabaseUrl()) {
    throw new Error("DATABASE_URL nao configurada.")
  }

  await replaceDatabaseContents(userId, dataset)
  return readFinanceDatasetFromDatabase(userId)
}

export async function createFinanceMovement(userId: string, input: MovementInput) {
  if (!hasDatabaseUrl()) {
    throw new Error("DATABASE_URL nao configurada.")
  }

  return createFinanceMovementInDatabase(userId, input)
}

export async function deleteFinanceMovement(
  userId: string,
  input: MovementDeleteInput
) {
  if (!hasDatabaseUrl()) {
    throw new Error("DATABASE_URL nao configurada.")
  }

  await ensureDatabase()

  const database = getPool()
  const tableBySource = {
    revenue: "monthly_revenues",
    "fixed-expense": "fixed_expenses",
    "variable-expense": "variable_expenses",
  } satisfies Record<MovementDeleteInput["source"], string>
  const table = tableBySource[input.source]

  await database.query(`delete from ${table} where id = $1 and user_id = $2`, [
    input.id,
    userId,
  ])

  return readFinanceDatasetFromDatabase(userId)
}

export async function updateFinanceMovement(
  userId: string,
  input: MovementUpdateInput
) {
  if (!hasDatabaseUrl()) {
    throw new Error("DATABASE_URL nao configurada.")
  }

  await ensureDatabase()

  const database = getPool()

  if (input.source === "revenue") {
    await database.query(
      `
        update monthly_revenues
        set date = $1, value = $2
        where id = $3 and user_id = $4
      `,
      [input.date, input.value, input.id, userId]
    )
  }

  if (input.source === "fixed-expense") {
    await database.query(
      `
        update fixed_expenses
        set transaction_date = $1,
            description = $2,
            category = $3,
            value = $4,
            status = $5
        where id = $6 and user_id = $7
      `,
      [
        input.date,
        input.description ?? "Despesa fixa",
        input.category ?? "Outros",
        input.value,
        input.status ?? "Pendente",
        input.id,
        userId,
      ]
    )
  }

  if (input.source === "variable-expense") {
    await database.query(
      `
        update variable_expenses
        set date = $1,
            description = $2,
            category = $3,
            value = $4
        where id = $5 and user_id = $6
      `,
      [
        input.date,
        input.description ?? "Despesa variável",
        input.category ?? "Outros",
        input.value,
        input.id,
        userId,
      ]
    )
  }

  return readFinanceDatasetFromDatabase(userId)
}

export async function getFinancialSummary(userId: string, range: MonthYear) {
  if (!hasDatabaseUrl()) {
    throw new Error("DATABASE_URL nao configurada.")
  }

  const dataset = await readFinanceDataset(userId)

  return calculateFinancialSummary(dataset, range, new Date())
}
