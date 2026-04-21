export type DashboardSectionKind =
  | "overview"
  | "movements"
  | "reports"
  | "limit"
  | "crypto"
  | "friends"
  | "sharedAccounts"

export const dashboardSections: Array<{
  kind: DashboardSectionKind
  title: string
}> = [
  { kind: "overview", title: "Visão Geral" },
  { kind: "movements", title: "Lançamentos" },
  { kind: "reports", title: "Relatórios" },
  { kind: "limit", title: "Limite de Gastos" },
  { kind: "crypto", title: "Criptomoedas" },
  { kind: "friends", title: "Amigos" },
  { kind: "sharedAccounts", title: "Contas Compartilhadas" },
]

export const dashboardDefaultSection = dashboardSections[0].title

function normalizeSectionLabel(section: string) {
  return section
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
}

export function getDashboardSectionKind(section: string): DashboardSectionKind {
  const normalizedSection = normalizeSectionLabel(section)

  if (normalizedSection.startsWith("lanc")) {
    return "movements"
  }

  if (normalizedSection.startsWith("relat")) {
    return "reports"
  }

  if (normalizedSection.startsWith("limite")) {
    return "limit"
  }

  if (normalizedSection.startsWith("cripto")) {
    return "crypto"
  }

  if (normalizedSection.startsWith("amigos")) {
    return "friends"
  }

  if (normalizedSection.startsWith("contas")) {
    return "sharedAccounts"
  }

  return "overview"
}

export function getDashboardHeaderTitle(activeSection: string) {
  const sectionKind = getDashboardSectionKind(activeSection)

  if (sectionKind === "movements") {
    return "Gerenciamento de Transações"
  }

  if (sectionKind === "reports") {
    return "Relatórios e exportação"
  }

  if (sectionKind === "limit") {
    return "Controle de metas e limites"
  }

  if (sectionKind === "crypto") {
    return "Mercado de criptomoedas"
  }

  if (sectionKind === "friends") {
    return "Rede de amigos"
  }

  if (sectionKind === "sharedAccounts") {
    return "Contas compartilhadas"
  }

  return "Painel financeiro"
}
