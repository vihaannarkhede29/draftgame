"use client";

import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { gradeColor } from "@/lib/utils";
import type { Game, GamePlayer, NBAPlayer, TeamScore } from "@/types";

interface TeamResultsProps {
  game: Game;
  nbaPlayers: Map<string, NBAPlayer>;
  currentUserId?: string;
}

export function TeamResults({ game, nbaPlayers, currentUserId }: TeamResultsProps) {
  const ranked = game.playerIds
    .map((pid) => ({ pid, player: game.players[pid] }))
    .filter((x): x is { pid: string; player: GamePlayer & { teamScore: TeamScore } } =>
      x.player?.teamScore !== undefined
    )
    .sort((a, b) => (a.player.rank ?? 99) - (b.player.rank ?? 99));

  return (
    <div className="space-y-4">
      {ranked.map(({ pid, player }) => {
        const isMe = pid === currentUserId;
        const score = player.teamScore!;
        const mvp = nbaPlayers.get(score.mvpPlayerId);

        return (
          <Card key={pid} glow={player.rank === 1} className={isMe ? "ring-2 ring-nba-gold/30" : ""}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-black text-nba-gold">#{player.rank}</span>
                  <div>
                    <CardTitle>{player.username}{isMe && " (You)"}</CardTitle>
                    <p className="text-sm text-gray-400">Total Score: {score.total}</p>
                  </div>
                </div>
                <span className={`text-4xl font-black ${gradeColor(score.grade)}`}>{score.grade}</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                <ScoreItem label="Overall" value={score.overall} weight="50%" />
                <ScoreItem label="Offense" value={score.offense} weight="15%" />
                <ScoreItem label="Defense" value={score.defense} weight="15%" />
                <ScoreItem label="Playmaking" value={score.playmaking} weight="10%" />
                <ScoreItem label="Shooting" value={score.shooting} weight="5%" />
                <ScoreItem label="Chemistry" value={score.chemistry} weight="5%" />
              </div>

              {score.chemistryBonuses.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {score.chemistryBonuses.map((b) => (
                    <Badge key={b.label} variant={b.value > 0 ? "gold" : "default"}>
                      {b.value > 0 ? "+" : ""}{b.value} {b.label}
                    </Badge>
                  ))}
                </div>
              )}

              {mvp && (
                <div className="flex items-center gap-3 rounded-lg bg-nba-gold/10 border border-nba-gold/20 p-3">
                  <Badge variant="gold">MVP</Badge>
                  <div className="relative h-10 w-10 rounded-full overflow-hidden">
                    <Image src={mvp.photoUrl} alt={mvp.name} fill className="object-cover" unoptimized />
                  </div>
                  <div>
                    <p className="font-bold text-white">{mvp.name}</p>
                    <p className="text-xs text-gray-400">{mvp.overall} OVR · {mvp.position}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function ScoreItem({ label, value, weight }: { label: string; value: number; weight: string }) {
  return (
    <div className="rounded-lg bg-black/30 p-3 text-center">
      <p className="text-xs text-gray-500">{label} ({weight})</p>
      <p className="text-xl font-bold text-white">{value}</p>
    </div>
  );
}
