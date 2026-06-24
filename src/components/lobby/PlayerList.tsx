"use client";

import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Crown, Check, X } from "lucide-react";
import type { Game, GamePlayer } from "@/types";

interface PlayerListProps {
  game: Game;
  currentUserId: string;
  onKick?: (playerId: string) => void;
}

export function PlayerList({ game, currentUserId, onKick }: PlayerListProps) {
  const isHost = game.hostId === currentUserId;

  return (
    <div className="space-y-2">
      {game.playerIds.map((pid) => {
        const player = game.players[pid];
        if (!player) return null;
        const isMe = pid === currentUserId;
        const isHostPlayer = pid === game.hostId;

        return (
          <div
            key={pid}
            className={`flex items-center justify-between rounded-xl border p-3 ${
              isMe ? "border-nba-gold/30 bg-nba-gold/5" : "border-white/5 bg-surface-light"
            }`}
          >
            <div className="flex items-center gap-3">
              <Avatar src={player.photoURL} name={player.username} online={player.isConnected} />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">{player.username}</span>
                  {isMe && <Badge>YOU</Badge>}
                  {isHostPlayer && <Crown className="h-4 w-4 text-nba-gold" />}
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  {player.isReady ? (
                    <span className="flex items-center gap-1 text-xs text-emerald-400">
                      <Check className="h-3 w-3" /> Ready
                    </span>
                  ) : (
                    <span className="text-xs text-gray-500">Not ready</span>
                  )}
                  {!player.isConnected && (
                    <span className="text-xs text-red-400 ml-2">Disconnected</span>
                  )}
                </div>
              </div>
            </div>

            {isHost && !isMe && onKick && (
              <Button variant="ghost" size="sm" onClick={() => onKick(pid)}>
                <X className="h-4 w-4 text-red-400" />
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}
