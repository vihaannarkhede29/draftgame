import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
  hover?: boolean;
}

export function Card({ className, glow, hover, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-white/10 bg-surface/80 backdrop-blur-sm",
        glow && "shadow-lg shadow-nba-red/10",
        hover && "transition-all duration-300 hover:border-white/20 hover:shadow-xl hover:shadow-nba-gold/5",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("px-5 pt-5 pb-2", className)} {...props}>
      {children}
    </div>
  );
}

export function CardContent({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("px-5 pb-5", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("text-lg font-bold text-white", className)} {...props}>
      {children}
    </h3>
  );
}
