import { cn } from "@/lib/utils";
import { forwardRef, type InputHTMLAttributes } from "react";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-lg border border-white/10 bg-surface-light px-4 py-2.5",
        "text-white placeholder:text-gray-500",
        "focus:border-nba-gold/50 focus:outline-none focus:ring-2 focus:ring-nba-gold/20",
        "transition-all duration-200",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
