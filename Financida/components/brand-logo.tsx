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
        viewBox="0 0 670 150"
        role="img"
        aria-hidden="true"
        className="h-full w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <path
          d="M28 26H120L109 52H46C37 52 32 46 35 39L28 26Z"
          fill={secondaryGreen}
        />
        <path
          d="M35 70H111L101 96H35V70Z"
          fill={primaryGreen}
        />
        <path d="M35 96H67V136H35V96Z" fill={darkGreen} />

        <text
          x="115"
          y="106"
          fill={textColor}
          fontSize="86"
          fontWeight="800"
          letterSpacing="-2"
          style={{ fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
        >
          inan
        </text>

        <path
          d="M340 36H394L380 56H354L340 36Z"
          fill={secondaryGreen}
        />
        <path
          d="M340 36V110L371 138H438L424 118H388V56L340 36Z"
          fill={primaryGreen}
        />
        <path d="M394 36L421 63L394 80L380 56L394 36Z" fill={darkGreen} />
        <path d="M388 118H424L438 138H371L388 118Z" fill={secondaryGreen} />

        <text
          x="426"
          y="106"
          fill={textColor}
          fontSize="86"
          fontWeight="800"
          letterSpacing="-2"
          style={{ fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
        >
          ida
        </text>
      </svg>
    </div>
  )
}
