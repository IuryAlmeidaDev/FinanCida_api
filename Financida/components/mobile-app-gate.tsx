import { BrandLogo } from "@/components/brand-logo"
import { Button } from "@/components/ui/button"

export function MobileAppGate() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#F1F4EF] p-6 md:hidden">
      <div className="w-full max-w-sm rounded-3xl border border-emerald-100 bg-white p-8 text-center shadow-2xl shadow-emerald-950/5">
        <div className="mx-auto flex size-28 items-center justify-center rounded-[2rem] bg-[#15B789]/10">
          <svg
            aria-hidden="true"
            viewBox="0 0 512 512"
            className="size-20"
            fill="none"
          >
            <path
              d="M188 70h136c11 0 18 11 13 21l-21 43H196l-21-43c-5-10 2-21 13-21Z"
              fill="#7BC74D"
            />
            <rect x="206" y="134" width="100" height="16" rx="8" fill="#5D95DA" />
            <path
              d="M256 472c134 0 207-78 207-173c0-79-57-170-139-227H188C106 129 49 220 49 299c0 95 73 173 207 173Z"
              fill="#7BC74D"
            />
            <path
              d="M279 367c0 18-13 31-31 34v14c0 7-5 12-12 12s-12-5-12-12v-14c-18-3-31-15-37-33c-2-7 2-14 9-16c7-2 14 2 16 9c4 12 14 18 29 18c16 0 26-8 26-21c0-12-9-19-32-25c-31-8-44-22-44-45c0-20 14-35 33-40v-14c0-7 5-12 12-12s12 5 12 12v13c15 3 27 12 34 26c4 6 1 14-5 17c-6 4-14 1-17-5c-6-10-14-15-27-15c-14 0-23 7-23 18c0 11 8 17 31 23c33 9 46 23 46 46Z"
              fill="#FFFFFF"
            />
          </svg>
        </div>
        <div className="mt-6 flex justify-center">
          <BrandLogo className="h-16 w-52" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-foreground">
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
