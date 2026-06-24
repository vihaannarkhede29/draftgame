"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useGame } from "@/hooks/useGame";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { PlayerList } from "@/components/lobby/PlayerList";
import { PlayerCardSkeleton } from "@/components/ui/Skeleton";
import { getGameByCode, setPlayerReady, joinGameByCode } from "@/lib/firebase/firestore";
import { startGame, kickPlayer } from "@/lib/firebase/game-actions";
import { gameUrl, lobbyUrl, resultsUrl } from "@/lib/paths";
import { Copy, Play, Check, Link2, Share2 } from "lucide-react";

function LobbyContent() {
  const searchParams = useSearchParams();
  const code = (searchParams.get("code") || "").toUpperCase();
  const router = useRouter();
  const { user, profile } = useAuth();
  const [gameId, setGameId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const { game } = useGame(gameId, user?.uid);
  const inviteLink = code ? lobbyUrl(code) : "";

  useEffect(() => {
    if (!code) {
      setError("Missing room code");
      setLoading(false);
      return;
    }

    async function init() {
      try {
        let g = await getGameByCode(code);
        if (!g) {
          setError("Game not found");
          setLoading(false);
          return;
        }

        if (user && profile && !g.playerIds.includes(user.uid)) {
          await joinGameByCode(code, user.uid, profile.username, profile.photoURL);
          g = await getGameByCode(code);
        }

        setGameId(g!.id);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load lobby");
      } finally {
        setLoading(false);
      }
    }
    if (user) init();
  }, [code, user, profile]);

  useEffect(() => {
    if (game?.status === "drafting") {
      router.push(gameUrl(code));
    }
    if (game?.status === "completed") {
      router.push(resultsUrl(game.id));
    }
  }, [game, code, router]);

  const handleReady = async () => {
    if (!gameId || !user || !game) return;
    const me = game.players[user.uid];
    await setPlayerReady(gameId, user.uid, !me?.isReady);
  };

  const handleStart = async () => {
    if (!gameId || !user) return;
    try {
      await startGame(gameId, user.uid);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start");
    }
  };

  const handleKick = async (playerId: string) => {
    if (!gameId || !user) return;
    try {
      await kickPlayer(gameId, user.uid, playerId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to kick");
    }
  };

  const copyCode = async () => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(inviteLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const shareLink = async () => {
    if (navigator.share) {
      await navigator.share({ title: "Join my NBA Auction Draft", url: inviteLink });
    } else {
      await copyLink();
    }
  };

  if (!code) return <div className="p-8 text-center text-red-400">Missing room code</div>;
  if (loading) return <div className="p-8"><PlayerCardSkeleton /></div>;
  if (error) return <div className="p-8 text-center text-red-400">{error}</div>;
  if (!game) return <div className="p-8 text-center text-gray-400">Loading lobby...</div>;

  const isHost = user?.uid === game.hostId;
  const me = user ? game.players[user.uid] : null;
  const allReady = game.playerIds.every((pid) => game.players[pid]?.isReady);
  const canStart = isHost && allReady && game.playerIds.length >= 2;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8 text-center">
        <p className="text-sm text-gray-500 uppercase tracking-widest">Room Code</p>
        <button onClick={copyCode} className="mt-1 flex items-center gap-2 mx-auto group">
          <span className="text-4xl font-mono font-black tracking-[0.3em] text-nba-gold">{code}</span>
          {copiedCode ? <Check className="h-5 w-5 text-emerald-400" /> : <Copy className="h-5 w-5 text-gray-500 group-hover:text-white" />}
        </button>
        <p className="mt-2 text-sm text-gray-400">
          {game.playerIds.length}/{game.maxPlayers} players
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-nba-gold" />
            Invite Friends
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-400 break-all">{inviteLink}</p>
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={copyLink}>
              {copiedLink ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copiedLink ? "Copied!" : "Copy Link"}
            </Button>
            <Button variant="gold" className="flex-1" onClick={shareLink}>
              <Share2 className="h-4 w-4" /> Share
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Players</CardTitle>
        </CardHeader>
        <CardContent>
          <PlayerList game={game} currentUserId={user?.uid ?? ""} onKick={isHost ? handleKick : undefined} />
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button
          variant={me?.isReady ? "secondary" : "gold"}
          className="flex-1"
          onClick={handleReady}
        >
          {me?.isReady ? "Not Ready" : "Ready Up"}
        </Button>
        {isHost && (
          <Button variant="primary" className="flex-1" onClick={handleStart} disabled={!canStart}>
            <Play className="h-4 w-4" /> Start Draft
          </Button>
        )}
      </div>
    </div>
  );
}

export default function LobbyPage() {
  return (
    <Suspense fallback={<div className="p-8"><PlayerCardSkeleton /></div>}>
      <LobbyContent />
    </Suspense>
  );
}
