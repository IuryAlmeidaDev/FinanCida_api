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
        viewBox="0 0 620 150"
        role="img"
        aria-hidden="true"
        className="h-full w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <path
          d="M30 28H116L106 50H47C39 50 34 45 36 39L30 28Z"
          fill={secondaryGreen}
        />
        <path
          d="M36 68H108L99 92H36V68Z"
          fill={primaryGreen}
        />
        <path d="M36 92H66V130H36V92Z" fill={darkGreen} />

        <text
          x="101"
          y="103"
          fill={textColor}
          fontSize="82"
          fontWeight="800"
          letterSpacing="-2.5"
          style={{ fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
        >
          inan
        </text>

        <path
          d="M308 38H358L346 55H322L308 38Z"
          fill={secondaryGreen}
        />
        <path
          d="M308 38V108L338 134H404L392 116H352V55L308 38Z"
          fill={primaryGreen}
        />
        <path d="M358 38L383 62L358 78L346 55L358 38Z" fill={darkGreen} />
        <path d="M352 116H392L404 134H338L352 116Z" fill={secondaryGreen} />

        <text
          x="389"
          y="103"
          fill={textColor}
          fontSize="82"
          fontWeight="800"
          letterSpacing="-2.5"
          style={{ fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
        >
          ida
        </text>
      </svg>
    </div>
  )
}
