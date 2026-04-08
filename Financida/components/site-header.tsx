import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

function getHeaderTitle(activeSection: string) {
  if (activeSection.startsWith("lan")) {
    return "Gerenciamento de Transações"
  }

  if (activeSection.startsWith("relat")) {
    return "Relatórios e Exportação"
  }

  if (activeSection.startsWith("limite")) {
    return "Controle de Metas e Limites"
  }

  if (activeSection.startsWith("cripto")) {
    return "Mercado de Criptomoedas"
  }

  if (activeSection.startsWith("amigos")) {
    return "Rede de Amigos"
  }

  if (activeSection.startsWith("contas")) {
    return "Contas Compartilhadas"
  }

  return "Dashboard financeiro"
}

export function SiteHeader({ activeSection }: { activeSection: string }) {
  const title = getHeaderTitle(activeSection)

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b border-border bg-background/95 backdrop-blur transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <div>
          <h1 className="text-base font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          <p className="text-xs text-muted-foreground">
            Visao mensal de receitas, despesas e saldo
          </p>
        </div>
      </div>
    </header>
  )
}
