import Image from "next/image"

import brandLogo from "@/public/brand/financida-logo.png"
import { cn } from "@/lib/utils"

export function BrandLogo({
  className,
  priority = false,
}: {
  className?: string
  priority?: boolean
}) {
  return (
    <div className={cn("relative h-12 w-44", className)}>
      <Image
        src={brandLogo}
        alt="FinanCida"
        fill
        priority={priority}
        placeholder="blur"
        className="object-contain"
        sizes="176px"
      />
    </div>
  )
}
