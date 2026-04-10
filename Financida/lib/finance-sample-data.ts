import { defaultFinanceCategories, type FinanceDataset, type MonthYear } from "@/lib/finance"

export const currentFinanceRange: MonthYear = {
  month: 4,
  year: 2026,
}

export const financeDataset: FinanceDataset = {
  categories: defaultFinanceCategories,
  fixedExpenses: [
    {
      id: "fix-001",
      transactionDate: "2026-04-05",
      description: "Aluguel",
      category: "Moradia",
      value: 2200,
      status: "Pago",
    },
    {
      id: "fix-002",
      transactionDate: "2026-04-10",
      description: "Escola",
      category: "Educacao",
      value: 780,
      status: "Pendente",
    },
    {
      id: "fix-003",
      transactionDate: "2026-04-12",
      description: "Internet",
      category: "Comunicacao",
      value: 129.9,
      status: "Pendente",
    },
    {
      id: "fix-004",
      transactionDate: "2026-04-01",
      description: "Plano de saude",
      category: "Saude",
      value: 510,
      status: "Pendente",
    },
    {
      id: "fix-005",
      transactionDate: "2026-03-05",
      description: "Aluguel",
      category: "Moradia",
      value: 2200,
      status: "Pago",
    },
    {
      id: "fix-006",
      transactionDate: "2026-03-10",
      description: "Escola",
      category: "Educacao",
      value: 760,
      status: "Pago",
    },
  ],
  variableExpenses: [
    {
      id: "var-001",
      date: "2026-04-03",
      description: "Supermercado",
      category: "Alimentacao",
      value: 640.45,
    },
    {
      id: "var-002",
      date: "2026-04-07",
      description: "Combustivel",
      category: "Transporte",
      value: 230,
    },
    {
      id: "var-003",
      date: "2026-04-14",
      description: "Cinema",
      category: "Lazer",
      value: 96,
    },
    {
      id: "var-004",
      date: "2026-03-12",
      description: "Supermercado",
      category: "Alimentacao",
      value: 590,
    },
    {
      id: "var-005",
      date: "2026-03-20",
      description: "Farmacia",
      category: "Saude",
      value: 180,
    },
  ],
  monthlyRevenues: [
    {
      id: "rev-001",
      date: "2026-04-01",
      value: 7200,
    },
    {
      id: "rev-002",
      date: "2026-03-01",
      value: 6900,
    },
  ],
}
