"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { formatMoney } from "@/lib/utils";
import { POSITIONS } from "@/types";
import type { GamePlayer, NBAPlayer } from "@/types";

interface RosterGridProps {
  players: Record<string, GamePlayer>;
  playerIds: string[];
  nbaPlayers: Map<string, NBAPlayer>;
  currentUserId?: string;
  compact?: boolean;
}

export function RosterGrid({ players, playerIds, nbaPlayers, currentUserId, compact }: RosterGridProps) {
  return (
    <div className={`grid gap-3 ${compact ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2"}`}>
      {playerIds.map((pid) => {
        const gp = players[pid];
        if (!gp) return null;
        const isMe = pid === currentUserId;

        return (
          <div
            key={pid}
            className={`rounded-xl border p-3 ${isMe ? "border-nba-gold/20 bg-nba-gold/5" : "border-white/5 bg-surface-light"}`}
          >
            <p className={`text-sm font-bold mb-2 ${isMe ? "text-nba-gold" : "text-white"}`}>
              {gp.username}
            </p>
            <div className="space-y-1.5">
              {POSITIONS.map((pos) => {
                const drafted = gp.roster.find((r) => r.position === pos);
                const nba = drafted ? nbaPlayers.get(drafted.playerId) : null;

                return (
                  <div key={pos} className="flex items-center gap-2 rounded-lg bg-black/20 px-2 py-1.5">
                    <Badge variant="position" position={pos}>{pos}</Badge>
                    {nba ? (
                      <>
                        <div className="relative h-6 w-6 rounded-full overflow-hidden shrink-0">
                          <Image src={nba.photoUrl} alt={nba.name} fill className="object-cover" unoptimized />
                        </div>
                        <span className="text-xs text-white truncate flex-1">{nba.name}</span>
                        <span className="text-[10px] text-nba-gold font-mono">{formatMoney(drafted!.bidAmount)}</span>
                      </>
                    ) : (
                      <span className="text-xs text-gray-600 italic">Empty</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
