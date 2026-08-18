import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-md border px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-emerald-600/20 text-emerald-300 border-emerald-500/40",
        secondary:
          "border-[#1a2f4c] bg-[#132238] text-zinc-300",
        destructive:
          "border-red-500/30 bg-red-500/20 text-red-400",
        outline: "border-zinc-800 text-zinc-300",
        success: "border-emerald-500/30 bg-emerald-500/20 text-emerald-400",
        warning: "border-amber-500/30 bg-amber-500/20 text-amber-400",
        vfd: "border-emerald-500/50 bg-[#060e1a] text-emerald-400 font-mono shadow-[0_0_10px_rgba(45,196,160,0.3)]",
        led: "border-emerald-500/30 bg-[#0d1d33] text-emerald-300 before:content-[''] before:inline-block before:w-2 before:h-2 before:rounded-full before:bg-emerald-400 before:shadow-[0_0_6px_#2dc4a0]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };

