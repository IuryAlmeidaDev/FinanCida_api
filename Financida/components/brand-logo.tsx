import { cn } from "@/lib/utils"

export function BrandLogo({
  className,
  priority: _priority = false,
  variant = "default",
}: {
  className?: string
  priority?: boolean
  variant?: "default" | "sidebar"
}) {
  const isSidebar = variant === "sidebar"
  const textColor = isSidebar ? "#E5EEF7" : "#1F2937"
  const primaryGreen = isSidebar ? "#8AE28F" : "#15B789"
  const secondaryGreen = isSidebar ? "#BDF1BE" : "#9DE7B2"
  const darkGreen = isSidebar ? "#4DBB63" : "#007A55"

  return (
    <div className={cn("flex items-center", className)} aria-label="FinanCida">
      <svg
        viewBox="0 0 650 150"
        role="img"
        aria-hidden="true"
        className="h-full w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <path
          d="M26 28H118L103 52H52C42 52 37 46 39 39L26 28Z"
          fill={secondaryGreen}
        />
        <path
          d="M39 67H112L99 93H39V67Z"
          fill={primaryGreen}
        />
        <path d="M39 93H71V132H39V93Z" fill={darkGreen} />
        <path d="M103 52L119 68H112L96 52H103Z" fill={darkGreen} />

        <text
          x="109"
          y="104"
          fill={textColor}
          fontSize="84"
          fontWeight="800"
          letterSpacing="-2.8"
          style={{ fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
        >
          inan
        </text>

        <path
          d="M344 36H400L386 56H360L344 36Z"
          fill={secondaryGreen}
        />
        <path
          d="M344 36V110L380 137H453L438 118H392V55L344 36Z"
          fill={primaryGreen}
        />
        <path d="M400 36L428 64L400 82L386 56L400 36Z" fill={darkGreen} />
        <path d="M392 118H438L453 137H380L392 118Z" fill={secondaryGreen} />
        <path d="M428 64L444 80L438 118L420 100L428 64Z" fill={darkGreen} />

        <text
          x="430"
          y="104"
          fill={textColor}
          fontSize="84"
          fontWeight="800"
          letterSpacing="-2.8"
          style={{ fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
        >
          ida
        </text>
      </svg>
    </div>
  )
}
