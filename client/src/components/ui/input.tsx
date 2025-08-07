import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "base-input flex h-16 w-full px-6 py-4 text-lg font-medium placeholder:text-white/40 focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 focus-ring",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
