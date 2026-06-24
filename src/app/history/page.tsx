"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { History } from "lucide-react";
import { gradeColor } from "@/lib/utils";

export default function HistoryPage() {
  const { profile } = useAuth();

  if (!profile) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center text-gray-400">
        Sign in to view match history
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-3xl font-black text-white mb-6 flex items-center gap-3">
        <History className="h-8 w-8 text-gray-400" />
        Match History
      </h1>

      <Card>
        <CardHeader><CardTitle>Recent Games</CardTitle></CardHeader>
        <CardContent>
          {profile.gamesPlayed === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No games played yet. <a href="/" className="text-nba-gold hover:underline">Start a draft!</a>
            </p>
          ) : (
            <div className="space-y-3">
              <div className="rounded-lg bg-black/20 px-4 py-3 flex justify-between items-center">
                <div>
                  <p className="text-white font-semibold">Career Stats</p>
                  <p className="text-xs text-gray-500">{profile.gamesPlayed} games · {profile.wins}W {profile.losses}L</p>
                </div>
                <span className={`text-2xl font-black ${gradeColor("A")}`}>{profile.elo}</span>
              </div>
              <p className="text-xs text-gray-600 text-center">
                Detailed per-game history is saved after each ranked match
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
