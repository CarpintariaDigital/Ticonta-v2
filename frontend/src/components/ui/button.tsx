import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        default:
          "bg-emerald-600 text-white shadow-md hover:bg-emerald-500 active:scale-98",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-zinc-200 bg-white/80 shadow-sm hover:bg-zinc-100 hover:text-zinc-900 text-zinc-800",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-zinc-100 hover:text-zinc-900 text-zinc-700",
        link: "text-emerald-400 underline-offset-4 hover:underline",
        
        /* 3D Mechanical Tactile Keycap Variants */
        retro: "key-mechanical key-num",
        "retro-primary": "key-mechanical key-enter",
        "retro-operator": "key-mechanical key-op",
        "retro-destructive": "key-mechanical key-clear",
        "retro-action": "key-mechanical key-action",
        "retro-cash": "key-mechanical key-cash",
        "retro-mpesa": "key-mechanical key-mpesa",
        "retro-card": "key-mechanical key-card",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-11 rounded-xl px-6 text-base",
        icon: "h-9 w-9",
        keypad: "h-14 text-lg p-0 font-mono",
        "keypad-sm": "h-10 text-xs px-2 uppercase tracking-wider",
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

