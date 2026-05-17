import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium border",
  {
    variants: {
      variant: {
        default: "border-ink-200 bg-white text-ink-700",
        solid: "border-transparent bg-ink-900 text-white",
        accent:
          "border-accent-100 bg-accent-50 text-accent-700",
        success:
          "border-emerald-100 bg-emerald-50 text-emerald-700",
        warn: "border-amber-100 bg-amber-50 text-amber-700",
        danger: "border-rose-100 bg-rose-50 text-rose-700",
        muted: "border-ink-100 bg-ink-50 text-ink-600",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
