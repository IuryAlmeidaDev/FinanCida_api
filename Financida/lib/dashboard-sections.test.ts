import { describe, expect, it } from "vitest"

import {
  getDashboardHeaderTitle,
  getDashboardSectionKind,
} from "@/lib/dashboard-sections"

describe("dashboard sections", () => {
  it("classifica secoes da sidebar com e sem acento", () => {
    expect(getDashboardSectionKind("Lançamentos")).toBe("movements")
    expect(getDashboardSectionKind("Lancamentos")).toBe("movements")
    expect(getDashboardSectionKind("Relatórios")).toBe("reports")
    expect(getDashboardSectionKind("Limite de Gastos")).toBe("limit")
    expect(getDashboardSectionKind("Criptomoedas")).toBe("crypto")
    expect(getDashboardSectionKind("Amigos")).toBe("friends")
    expect(getDashboardSectionKind("Contas Compartilhadas")).toBe("sharedAccounts")
    expect(getDashboardSectionKind("Visão Geral")).toBe("overview")
  })

  it("retorna titulo correto para cabecalho", () => {
    expect(getDashboardHeaderTitle("Relatórios")).toBe("Relatórios e exportação")
    expect(getDashboardHeaderTitle("Visão Geral")).toBe("Painel financeiro")
  })
})
