import Image from "next/image"

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
        src="/brand/financida-logo.png"
        alt="FinanCida"
        fill
        priority={priority}
        className="object-contain"
        sizes="176px"
      />
    </div>
  )
}
