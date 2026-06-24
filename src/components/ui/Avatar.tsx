import { cn } from "@/lib/utils";
import Image from "next/image";

interface AvatarProps {
  src?: string;
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  online?: boolean;
}

const sizes = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-lg",
};

export function Avatar({ src, name, size = "md", className, online }: AvatarProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className={cn("relative inline-flex shrink-0", className)}>
      <div
        className={cn(
          "relative overflow-hidden rounded-full bg-gradient-to-br from-nba-red to-nba-gold flex items-center justify-center font-bold text-white",
          sizes[size]
        )}
      >
        {src ? (
          <Image src={src} alt={name} fill className="object-cover" unoptimized />
        ) : (
          initials
        )}
      </div>
      {online !== undefined && (
        <span
          className={cn(
            "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-surface",
            online ? "bg-emerald-400" : "bg-gray-500"
          )}
        />
      )}
    </div>
  );
}
