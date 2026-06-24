"use client";

import { Suspense, useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useGame } from "@/hooks/useGame";
import { NBAPlayerCard } from "@/components/game/NBAPlayerCard";
import { AuctionPanel } from "@/components/game/AuctionPanel";
import { BudgetBar } from "@/components/game/BudgetBar";
import { RosterGrid } from "@/components/game/RosterGrid";
import { BidHistoryPanel } from "@/components/game/BidHistoryPanel";
import { CountdownTimer } from "@/components/ui/CountdownTimer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { PlayerCardSkeleton } from "@/components/ui/Skeleton";
import { getGameByCode } from "@/lib/firebase/firestore";
import { submitBid, resolveAuctionClient } from "@/lib/firebase/game-actions";
import { lobbyUrl, resultsUrl } from "@/lib/paths";
import nbaPlayers from "@/data/nba-players.json";
import type { NBAPlayer } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { formatMoney } from "@/lib/utils";

const allPlayers = nbaPlayers as NBAPlayer[];
const playerMap = new Map(allPlayers.map((p) => [p.id, p]));

function GameContent() {
  const searchParams = useSearchParams();
  const code = (searchParams.get("code") || "").toUpperCase();
  const router = useRouter();
  const { user } = useAuth();
  const [gameId, setGameId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const resolving = useRef(false);

  const { game } = useGame(gameId, user?.uid);

  useEffect(() => {
    if (!code) {
      router.push("/");
      return;
    }
    getGameByCode(code).then((g) => {
      if (!g) { router.push("/"); return; }
      if (g.status === "lobby") { router.push(lobbyUrl(code)); return; }
      if (g.status === "completed") { router.push(resultsUrl(g.id)); return; }
      setGameId(g.id);
      setLoading(false);
    });
  }, [code, router]);

  useEffect(() => {
    if (game?.status === "completed") {
      router.push(resultsUrl(game.id));
    }
  }, [game, router]);

  const handleResolve = useCallback(async () => {
    if (!gameId || resolving.current) return;
    resolving.current = true;
    try {
      await resolveAuctionClient(gameId);
    } catch {
      // Another client may have resolved
    } finally {
      setTimeout(() => { resolving.current = false; }, 3000);
    }
  }, [gameId]);

  useEffect(() => {
    if (!game || game.auctionPhase !== "bidding" || !game.auctionEndsAt) return;
    const remaining = game.auctionEndsAt - Date.now();
    if (remaining <= 0) {
      handleResolve();
      return;
    }
    const timer = setTimeout(handleResolve, remaining + 500);
    return () => clearTimeout(timer);
  }, [game?.auctionEndsAt, game?.auctionPhase, handleResolve, game]);

  const handleBid = async (amount: number) => {
    if (!gameId || !user) return;
    await submitBid(gameId, user.uid, amount);
  };

  const nbaPlayerMap = useMemo(() => playerMap, []);

  if (!code) return null;
  if (loading || !game || !user) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <PlayerCardSkeleton />
      </div>
    );
  }

  const me = game.players[user.uid];
  const currentNbaPlayer = game.currentNbaPlayerId
    ? nbaPlayerMap.get(game.currentNbaPlayerId)
    : null;
  const hasBid = game.bids[user.uid] !== undefined;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <span className="text-sm text-gray-500">Round</span>
          <p className="text-2xl font-black text-white">
            {game.currentRound}<span className="text-gray-500 text-lg">/{game.totalRounds}</span>
          </p>
        </div>
        <div className="text-right">
          <span className="text-sm text-gray-500">Room</span>
          <p className="font-mono text-nba-gold">{code}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-5 space-y-4">
          <AnimatePresence mode="wait">
            {currentNbaPlayer && (
              <motion.div
                key={currentNbaPlayer.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <NBAPlayerCard player={currentNbaPlayer} />
              </motion.div>
            )}
          </AnimatePresence>

          {game.auctionPhase === "revealing" && game.revealedBids && (
            <Card className="border-nba-gold/30">
              <CardHeader><CardTitle>Bid Results</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {game.playerIds.map((pid) => {
                  const p = game.players[pid];
                  const bid = game.revealedBids?.[pid];
                  const isWinner = pid === game.winnerId;
                  return (
                    <div key={pid} className={`flex justify-between rounded-lg px-3 py-2 ${isWinner ? "bg-emerald-500/10 border border-emerald-500/30" : "bg-black/20"}`}>
                      <span className={isWinner ? "text-emerald-400 font-bold" : "text-white"}>{p?.username}</span>
                      <span className="font-mono">{bid !== undefined ? formatMoney(bid) : "—"}</span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {game.auctionEndsAt && game.auctionPhase === "bidding" && (
            <div className="flex justify-center">
              <CountdownTimer endsAt={game.auctionEndsAt} onComplete={handleResolve} />
            </div>
          )}

          {me && currentNbaPlayer && (
            <AuctionPanel
              player={me}
              nbaPlayer={currentNbaPlayer}
              hasBid={hasBid}
              phase={game.auctionPhase}
              onSubmitBid={handleBid}
            />
          )}
        </div>

        <div className="lg:col-span-4 space-y-4">
          <Card>
            <CardHeader><CardTitle>Budgets</CardTitle></CardHeader>
            <CardContent><BudgetBar players={game.players} playerIds={game.playerIds} currentUserId={user.uid} /></CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Rosters</CardTitle></CardHeader>
            <CardContent>
              <RosterGrid
                players={game.players}
                playerIds={game.playerIds}
                nbaPlayers={nbaPlayerMap}
                currentUserId={user.uid}
                compact
              />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <Card>
            <CardHeader><CardTitle>Bid History</CardTitle></CardHeader>
            <CardContent><BidHistoryPanel history={game.bidHistory} currentUserId={user.uid} /></CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function GamePage() {
  return (
    <Suspense fallback={<div className="p-8"><PlayerCardSkeleton /></div>}>
      <GameContent />
    </Suspense>
  );
}
