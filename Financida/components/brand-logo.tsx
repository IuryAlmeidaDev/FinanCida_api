import { Oxanium } from "next/font/google"

import { cn } from "@/lib/utils"

const oxanium = Oxanium({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
})

export function BrandLogo({
  className,
  variant = "default",
}: {
  className?: string
  priority?: boolean
  variant?: "default" | "sidebar"
}) {
  const isSidebar = variant === "sidebar"

  return (
    <div
      className={cn(
        oxanium.className,
        "flex items-center font-extrabold tracking-tight",
        isSidebar ? "text-slate-100" : "text-slate-800",
        className
      )}
      aria-label="FinanCida"
    >
      <span
        className={cn(
          "mr-0.5 text-[#007A55]",
          isSidebar && "text-emerald-300"
        )}
      >
        F
      </span>
      <span>inan</span>
      <span
        className={cn(
          "mx-0.5 text-[#007A55]",
          isSidebar && "text-emerald-300"
        )}
      >
        C
      </span>
      <span>ida</span>
    </div>
  )
}
