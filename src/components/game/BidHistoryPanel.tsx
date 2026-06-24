"use client";

import { formatMoney } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import type { BidHistoryEntry } from "@/types";

interface BidHistoryProps {
  history: BidHistoryEntry[];
  currentUserId?: string;
}

export function BidHistoryPanel({ history, currentUserId }: BidHistoryProps) {
  if (history.length === 0) {
    return <p className="text-sm text-gray-500 text-center py-4">No bids yet</p>;
  }

  return (
    <div className="space-y-2 max-h-64 overflow-y-auto">
      {[...history].reverse().map((entry, i) => {
        const won = entry.winnerId === currentUserId;
        return (
          <div
            key={`${entry.round}-${i}`}
            className={`rounded-lg border px-3 py-2 text-sm ${won ? "border-emerald-500/20 bg-emerald-500/5" : "border-white/5 bg-black/20"}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">R{entry.round}</span>
                <Badge variant="position" position={entry.position}>{entry.position}</Badge>
                <span className="text-white font-medium truncate">{entry.playerName}</span>
              </div>
              <span className="text-nba-gold font-mono text-xs">{formatMoney(entry.winningBid)}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Won by <span className={won ? "text-emerald-400" : "text-gray-400"}>{entry.winnerName}</span>
            </p>
          </div>
        );
      })}
    </div>
  );
}
