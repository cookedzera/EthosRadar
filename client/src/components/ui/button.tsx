import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "neo-button inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold transition-all duration-300 focus:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "text-white hover:scale-105 active:scale-95",
        destructive:
          "text-red-100 glow-accent-red hover:scale-105 active:scale-95",
        outline:
          "border border-slate-600/50 bg-slate-800/30 text-slate-300 hover:bg-slate-700/50 hover:scale-105",
        secondary:
          "bg-slate-700/50 text-slate-200 hover:bg-slate-600/60 hover:scale-105",
        ghost: "bg-transparent hover:bg-slate-700/30 text-slate-300 hover:scale-105",
        link: "text-blue-400 underline-offset-4 hover:underline bg-transparent",
      },
      size: {
        default: "h-12 px-6 py-3 rounded-2xl",
        sm: "h-10 px-4 py-2 rounded-xl text-xs",
        lg: "h-14 px-8 py-4 rounded-2xl text-base",
        icon: "h-12 w-12 rounded-2xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
