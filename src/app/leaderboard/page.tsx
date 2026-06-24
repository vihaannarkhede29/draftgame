"use client";

import { useEffect, useState } from "react";
import { subscribeToLeaderboard } from "@/lib/firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { LeaderboardSkeleton } from "@/components/ui/Skeleton";
import { Trophy } from "lucide-react";
import type { LeaderboardEntry } from "@/types";

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToLeaderboard(setEntries, 100);
    setLoading(false);
    return unsub;
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-black text-white mb-6 flex items-center gap-3">
        <Trophy className="h-8 w-8 text-nba-gold" />
        Global Leaderboard
      </h1>

      <Card glow>
        <CardHeader><CardTitle>Top Players by ELO</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <LeaderboardSkeleton />
          ) : entries.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No players ranked yet</p>
          ) : (
            <div className="space-y-1">
              {entries.map((entry, i) => (
                <div
                  key={entry.userId}
                  className={`flex items-center gap-4 rounded-xl px-4 py-3 ${
                    i < 3 ? "bg-nba-gold/5 border border-nba-gold/10" : "bg-black/20"
                  }`}
                >
                  <span className={`text-lg font-black w-8 ${i === 0 ? "text-nba-gold" : i < 3 ? "text-gray-300" : "text-gray-600"}`}>
                    {i + 1}
                  </span>
                  <Avatar src={entry.photoURL} name={entry.username} size="sm" />
                  <div className="flex-1">
                    <p className="font-semibold text-white">{entry.username}</p>
                    <p className="text-xs text-gray-500">{entry.wins}W - {entry.losses}L · {entry.gamesPlayed} games</p>
                  </div>
                  <span className="text-xl font-mono font-bold text-nba-gold">{entry.elo}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
