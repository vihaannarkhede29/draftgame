import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "gold" | "position";
  position?: string;
  className?: string;
}

export function Badge({ children, variant = "default", position, className }: BadgeProps) {
  const positionColors: Record<string, string> = {
    PG: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    SG: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    SF: "bg-green-500/20 text-green-300 border-green-500/30",
    PF: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    C: "bg-red-500/20 text-red-300 border-red-500/30",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        variant === "gold" && "border-nba-gold/30 bg-nba-gold/10 text-nba-gold",
        variant === "default" && "border-white/10 bg-white/5 text-gray-300",
        variant === "position" && position && positionColors[position],
        className
      )}
    >
      {children}
    </span>
  );
}
