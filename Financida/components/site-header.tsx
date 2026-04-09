import { NotificationsMenu } from "@/components/notifications-menu"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

function getHeaderTitle(activeSection: string) {
  const normalizedSection = activeSection.toLowerCase()

  if (normalizedSection.startsWith("lanc")) {
    return "Gerenciamento de Transacoes"
  }

  if (normalizedSection.startsWith("relat")) {
    return "Relatorios e Exportacao"
  }

  if (normalizedSection.startsWith("limite")) {
    return "Controle de Metas e Limites"
  }

  if (normalizedSection.startsWith("cripto")) {
    return "Mercado de Criptomoedas"
  }

  if (normalizedSection.startsWith("amigos")) {
    return "Rede de Amigos"
  }

  if (normalizedSection.startsWith("contas")) {
    return "Contas Compartilhadas"
  }

  return "Dashboard financeiro"
}

export function SiteHeader({ activeSection }: { activeSection: string }) {
  const title = getHeaderTitle(activeSection)

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b border-border bg-background/95 backdrop-blur transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center justify-between gap-4 px-4 lg:gap-2 lg:px-6">
        <div className="flex items-center gap-1">
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
              Visão mensal de receitas, despesas e saldo
            </p>
          </div>
        </div>
        <NotificationsMenu />
      </div>
    </header>
  )
}
