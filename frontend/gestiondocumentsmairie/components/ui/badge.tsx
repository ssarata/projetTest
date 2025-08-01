import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Définir les variantes pour Badge
const badgeVariants = cva("inline-flex items-center rounded-full text-sm font-medium", {
  variants: {
    variant: {
      default: "bg-primary text-primary-foreground",
      outline: "border border-input bg-background text-foreground",
      secondary: "bg-green-50 text-green-700 border border-green-200",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

// Définir les props pour Badge
export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

// Composant Badge
const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div ref={ref} className={cn(badgeVariants({ variant }), className)} {...props} />
    )
  }
)
Badge.displayName = "Badge"

export { Badge }
