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
        viewBox="0 0 720 150"
        role="img"
        aria-hidden="true"
        className="h-full w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <path
          d="M28 24H132L118 57H45C36 57 31 48 35 40L28 24Z"
          fill={secondaryGreen}
        />
        <path
          d="M35 75H117L104 108H28L35 75Z"
          fill={primaryGreen}
        />
        <path d="M28 108H62V138H28V108Z" fill={darkGreen} />

        <text
          x="138"
          y="109"
          fill={textColor}
          fontSize="92"
          fontWeight="800"
          letterSpacing="-3"
          style={{ fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
        >
          inan
        </text>

        <path
          d="M390 35H455L438 58H407L390 35Z"
          fill={secondaryGreen}
        />
        <path
          d="M390 35V115L427 147H507L489 121H448V58L390 35Z"
          fill={primaryGreen}
        />
        <path d="M455 35L487 66L455 84L438 58L455 35Z" fill={darkGreen} />
        <path d="M448 121H489L507 147H427L448 121Z" fill={secondaryGreen} />

        <text
          x="506"
          y="109"
          fill={textColor}
          fontSize="92"
          fontWeight="800"
          letterSpacing="-3"
          style={{ fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
        >
          ida
        </text>
      </svg>
    </div>
  )
}
