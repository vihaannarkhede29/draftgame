"use client";

import { Suspense, useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { subscribeToGame } from "@/lib/firebase/firestore";
import { TeamResults } from "@/components/results/TeamResults";
import { ConfettiCelebration } from "@/components/results/ConfettiCelebration";
import { Button } from "@/components/ui/Button";
import { PlayerCardSkeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/contexts/AuthContext";
import nbaPlayers from "@/data/nba-players.json";
import type { Game, NBAPlayer } from "@/types";
import { Home, Share2 } from "lucide-react";

const allPlayers = nbaPlayers as NBAPlayer[];

function ResultsContent() {
  const searchParams = useSearchParams();
  const gameId = searchParams.get("gameId") || "";
  const { user } = useAuth();
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);

  const playerMap = useMemo(() => new Map(allPlayers.map((p) => [p.id, p])), []);

  useEffect(() => {
    if (!gameId) {
      setLoading(false);
      return;
    }
    const unsub = subscribeToGame(gameId, (g) => {
      setGame(g);
      setLoading(false);
    });
    return unsub;
  }, [gameId]);

  if (!gameId) return <div className="p-8 text-center text-red-400">Missing game ID</div>;
  if (loading) return <div className="p-8"><PlayerCardSkeleton /></div>;
  if (!game) return <div className="p-8 text-center text-red-400">Game not found</div>;

  const myRank = user ? game.players[user.uid]?.rank : undefined;
  const won = myRank === 1;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <ConfettiCelebration trigger={won ?? false} />

      <div className="text-center mb-8">
        <h1 className="text-4xl font-black text-white">Draft Complete</h1>
        {myRank && (
          <p className="mt-2 text-lg text-gray-400">
            You finished <span className="text-nba-gold font-bold">#{myRank}</span> of {game.playerIds.length}
          </p>
        )}
      </div>

      <TeamResults game={game} nbaPlayers={playerMap} currentUserId={user?.uid} />

      <div className="mt-8 flex justify-center gap-4">
        <Link href="/">
          <Button variant="gold"><Home className="h-4 w-4" /> Back to Home</Button>
        </Link>
        <Button variant="secondary" onClick={() => navigator.share?.({ title: "My NBA Auction Draft Team", url: window.location.href })}>
          <Share2 className="h-4 w-4" /> Share Results
        </Button>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="p-8"><PlayerCardSkeleton /></div>}>
      <ResultsContent />
    </Suspense>
  );
}
