import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "warp-button inline-flex items-center justify-center gap-3 whitespace-nowrap text-base font-bold transition-all duration-300 focus:outline-none focus-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "text-white hover:scale-105 active:scale-95",
        destructive:
          "bg-gradient-to-r from-red-500 to-pink-500 text-white hover:scale-105 active:scale-95 state-error",
        outline:
          "border-2 border-white/20 bg-white/5 text-white hover:bg-white/10 hover:scale-105 hover:border-purple-400/40",
        secondary:
          "bg-gradient-to-r from-gray-600/50 to-gray-700/50 text-white hover:from-gray-500/60 hover:to-gray-600/60 hover:scale-105",
        ghost: "bg-transparent hover:bg-white/10 text-white hover:scale-105",
        link: "text-purple-400 underline-offset-4 hover:underline bg-transparent hover:text-purple-300",
      },
      size: {
        default: "h-14 px-8 py-4 rounded-2xl text-base",
        sm: "h-12 px-6 py-3 rounded-xl text-sm",
        lg: "h-16 px-10 py-5 rounded-2xl text-lg",
        icon: "h-14 w-14 rounded-2xl",
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
