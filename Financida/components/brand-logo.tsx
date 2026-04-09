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
  const textColor = isSidebar ? "#E5EEF7" : "#22313A"
  const accentColor = isSidebar ? "#95F0A0" : "#007A55"
  const primaryGreen = isSidebar ? "#7FDE8B" : "#15B789"
  const secondaryGreen = isSidebar ? "#C7F6C9" : "#A9EFC5"

  return (
    <div className={cn("flex items-center", className)} aria-label="FinanCida">
      <svg
        viewBox="0 0 700 150"
        role="img"
        aria-hidden="true"
        className="h-full w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <g transform="translate(18 23)">
          <path
            d="M10 22L92 22L76 44L0 44L10 22Z"
            fill={secondaryGreen}
          />
          <path
            d="M0 52L84 52L70 76L0 76L0 52Z"
            fill={primaryGreen}
          />
          <path
            d="M0 76H34V112H0V76Z"
            fill={accentColor}
          />
          <path
            d="M84 52L98 36L110 48L96 64L84 52Z"
            fill={accentColor}
          />
        </g>

        <text
          x="145"
          y="101"
          fill={textColor}
          fontSize="84"
          fontWeight="900"
          letterSpacing="-2"
          style={{ fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
        >
          <tspan fill={accentColor}>Finan</tspan>
          <tspan dx="-4" fill={textColor}>
            Cida
          </tspan>
        </text>
      </svg>
    </div>
  )
}
