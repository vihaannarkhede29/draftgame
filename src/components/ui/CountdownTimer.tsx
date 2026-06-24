"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface CountdownTimerProps {
  endsAt: number;
  onComplete?: () => void;
  size?: "sm" | "lg";
  className?: string;
}

export function CountdownTimer({ endsAt, onComplete, size = "lg", className }: CountdownTimerProps) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    const tick = () => {
      const left = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
      setRemaining(left);
      if (left === 0 && onComplete) onComplete();
    };
    tick();
    const id = setInterval(tick, 100);
    return () => clearInterval(id);
  }, [endsAt, onComplete]);

  const urgent = remaining <= 5;
  const pct = Math.min(100, (remaining / 15) * 100);

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div
        className={cn(
          "relative flex items-center justify-center rounded-full border-4 font-mono font-bold transition-colors",
          size === "lg" ? "h-24 w-24 text-3xl" : "h-12 w-12 text-lg",
          urgent ? "border-red-500 text-red-400 animate-pulse" : "border-nba-gold text-nba-gold"
        )}
      >
        {remaining}
      </div>
      <div className="h-1.5 w-full max-w-[120px] overflow-hidden rounded-full bg-white/10">
        <div
          className={cn("h-full transition-all duration-100 rounded-full", urgent ? "bg-red-500" : "bg-nba-gold")}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
