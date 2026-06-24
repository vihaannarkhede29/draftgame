"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { formatMoney } from "@/lib/utils";
import { POSITION_LABELS } from "@/lib/game/constants";
import type { NBAPlayer } from "@/types";

interface NBAPlayerCardProps {
  player: NBAPlayer;
  showSalary?: boolean;
  size?: "sm" | "lg";
}

export function NBAPlayerCard({ player, showSalary = true, size = "lg" }: NBAPlayerCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-surface to-surface-light"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-nba-red/5 via-transparent to-nba-gold/5" />
      <div className={`relative flex ${size === "lg" ? "gap-6 p-6" : "gap-4 p-4"}`}>
        <div className={`relative shrink-0 overflow-hidden rounded-xl border-2 border-nba-gold/30 ${size === "lg" ? "h-32 w-32" : "h-20 w-20"}`}>
          <Image src={player.photoUrl} alt={player.name} fill className="object-cover" unoptimized />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 text-center">
            <span className="text-2xl font-black text-nba-gold">{player.overall}</span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className={`font-black text-white truncate ${size === "lg" ? "text-2xl" : "text-lg"}`}>
                {player.name}
              </h2>
              <p className="text-sm text-gray-400">{player.team} · Age {player.age}</p>
            </div>
            <Badge variant="position" position={player.position}>{player.position}</Badge>
          </div>

          <p className="mt-1 text-xs text-gray-500">{POSITION_LABELS[player.position]}</p>

          <div className="mt-3 grid grid-cols-5 gap-2">
            <Stat label="PPG" value={player.stats.ppg} />
            <Stat label="RPG" value={player.stats.rpg} />
            <Stat label="APG" value={player.stats.apg} />
            <Stat label="SPG" value={player.stats.spg} />
            <Stat label="BPG" value={player.stats.bpg} />
          </div>

          <div className="mt-3 grid grid-cols-4 gap-2">
            <AttrBar label="OFF" value={player.offense} color="bg-orange-500" />
            <AttrBar label="DEF" value={player.defense} color="bg-blue-500" />
            <AttrBar label="PM" value={player.playmaking} color="bg-green-500" />
            <AttrBar label="SHT" value={player.shooting} color="bg-purple-500" />
          </div>

          {showSalary && (
            <p className="mt-3 text-sm">
              <span className="text-gray-500">Est. Salary: </span>
              <span className="font-bold text-nba-gold">{formatMoney(player.salaryEstimate)}</span>
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-bold text-white">{value}</p>
    </div>
  );
}

function AttrBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-[10px]">
        <span className="text-gray-500">{label}</span>
        <span className="text-white font-semibold">{value}</span>
      </div>
      <div className="mt-0.5 h-1.5 rounded-full bg-white/10">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
