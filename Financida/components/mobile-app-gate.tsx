import { BrandLogo } from "@/components/brand-logo"
import { Button } from "@/components/ui/button"

export function MobileAppGate() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#F1F4EF] p-6 md:hidden">
      <div className="w-full max-w-sm rounded-3xl border border-emerald-100 bg-white p-8 text-center shadow-2xl shadow-emerald-950/5">
        <div className="flex justify-center">
          <BrandLogo className="h-16 w-52" />
        </div>
        <h1 className="mt-8 text-2xl font-bold text-foreground">
          Versao mobile em breve
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          O FinanCida para celular ainda esta em desenvolvimento. Enquanto isso,
          acesse pelo computador e acompanhe o lancamento do app mobile.
        </p>
        <Button
          type="button"
          className="mt-6 w-full bg-[#007A55] hover:bg-[#006346]"
          disabled
        >
          App mobile em breve
        </Button>
      </div>
    </div>
  )
}
