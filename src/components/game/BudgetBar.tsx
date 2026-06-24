"use client";

import { formatMoney } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import type { GamePlayer } from "@/types";

interface BudgetBarProps {
  players: Record<string, GamePlayer>;
  playerIds: string[];
  currentUserId?: string;
}

export function BudgetBar({ players, playerIds, currentUserId }: BudgetBarProps) {
  return (
    <div className="space-y-2">
      {playerIds.map((pid) => {
        const p = players[pid];
        if (!p) return null;
        const pct = (p.budget / 100_000_000) * 100;
        const isMe = pid === currentUserId;

        return (
          <div
            key={pid}
            className={`rounded-lg border p-3 ${isMe ? "border-nba-gold/30 bg-nba-gold/5" : "border-white/5 bg-surface-light"}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Avatar src={p.photoURL} name={p.username} size="sm" online={p.isConnected} />
                <span className={`text-sm font-semibold ${isMe ? "text-nba-gold" : "text-white"}`}>
                  {p.username}{isMe && " (You)"}
                </span>
              </div>
              <span className="font-mono text-sm font-bold text-white">{formatMoney(p.budget)}</span>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${pct > 50 ? "bg-emerald-500" : pct > 25 ? "bg-yellow-500" : "bg-red-500"}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
