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
  const iconColor = isSidebar ? "#95F0A0" : "#007A55"

  return (
    <div
      className={cn("flex items-center justify-center", className)}
      aria-label="FinanCida"
    >
      <svg
        viewBox="0 0 560 120"
        role="img"
        aria-hidden="true"
        className="h-full w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <g transform="translate(26 10) scale(0.19)">
          <path
            d="M0 385.49L63.1 448 191.74 319.73 255.42 383.18 387.69 250.34 419.73 281.84 512 89.6 320.91 122.78 353.54 154.87 255.41 253.76 191.74 190.31 0 385.49Z"
            fill={iconColor}
          />
        </g>
        <text
          x="114"
          y="78"
          fill={textColor}
          fontSize="68"
          fontWeight="800"
          letterSpacing="-1.5"
          style={{ fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
        >
          FinanCida
        </text>
      </svg>
    </div>
  )
}
