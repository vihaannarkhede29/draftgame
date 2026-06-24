import {
  doc,
  getDoc,
  updateDoc,
  runTransaction,
} from "firebase/firestore";
import { getClientDb } from "./config";
import {
  canBidOnPlayer,
  resolveAuction,
  applyWin,
  getNextAuctionState,
  allPlayersReady,
  prepareGameStart,
  getNewHostId,
} from "@/lib/game/auction";
import { evaluateTeam } from "@/lib/game/team-score";
import nbaPlayers from "@/data/nba-players.json";
import type { Game, GamePlayer, NBAPlayer } from "@/types";

const players = nbaPlayers as NBAPlayer[];
const playerMap = new Map(players.map((p) => [p.id, p]));

export async function submitBid(gameId: string, userId: string, amount: number): Promise<void> {
  const gameRef = doc(getClientDb(), "games", gameId);

  await runTransaction(getClientDb(), async (tx) => {
    const snap = await tx.get(gameRef);
    if (!snap.exists()) throw new Error("Game not found");

    const game = snap.data() as Game;

    if (game.status !== "drafting" || game.auctionPhase !== "bidding") {
      throw new Error("Not in bidding phase");
    }
    if (Date.now() > (game.auctionEndsAt ?? 0)) throw new Error("Bidding closed");
    if (!game.playerIds.includes(userId)) throw new Error("Not in game");
    if (game.bids[userId] !== undefined) throw new Error("Already bid");

    const gp = game.players[userId];
    const nbaPlayer = playerMap.get(game.currentNbaPlayerId ?? "");
    if (!nbaPlayer) throw new Error("No player on auction");
    if (!canBidOnPlayer(gp, nbaPlayer)) throw new Error("Cannot bid on this position");
    if (amount > gp.budget) throw new Error("Insufficient budget");

    tx.update(gameRef, { [`bids.${userId}`]: amount });
  });
}

export async function startGame(gameId: string, userId: string): Promise<void> {
  const gameRef = doc(getClientDb(), "games", gameId);
  const snap = await getDoc(gameRef);
  if (!snap.exists()) throw new Error("Game not found");

  const game = snap.data() as Game;
  if (game.hostId !== userId) throw new Error("Only host can start");
  if (game.status !== "lobby") throw new Error("Game already started");
  if (game.playerIds.length < 2) throw new Error("Need at least 2 players");
  if (!allPlayersReady(game)) throw new Error("Not all players ready");

  await updateDoc(gameRef, prepareGameStart(game));
}

export async function kickPlayer(gameId: string, userId: string, targetUserId: string): Promise<void> {
  const gameRef = doc(getClientDb(), "games", gameId);
  const snap = await getDoc(gameRef);
  if (!snap.exists()) throw new Error("Game not found");

  const game = snap.data() as Game;
  if (game.hostId !== userId) throw new Error("Only host can kick");
  if (targetUserId === userId) throw new Error("Cannot kick yourself");

  const { [targetUserId]: _, ...remainingPlayers } = game.players;
  await updateDoc(gameRef, {
    playerIds: game.playerIds.filter((id) => id !== targetUserId),
    players: remainingPlayers,
  });
}

export async function transferHost(gameId: string): Promise<void> {
  const gameRef = doc(getClientDb(), "games", gameId);
  const snap = await getDoc(gameRef);
  if (!snap.exists()) return;

  const game = snap.data() as Game;
  const host = game.players[game.hostId];
  if (host?.isConnected) return;

  const newHostId = getNewHostId(game, game.hostId);
  if (!newHostId) return;

  await updateDoc(gameRef, { hostId: newHostId });
}

export async function resolveAuctionClient(gameId: string): Promise<void> {
  const gameRef = doc(getClientDb(), "games", gameId);

  await runTransaction(getClientDb(), async (tx) => {
    const snap = await tx.get(gameRef);
    if (!snap.exists()) throw new Error("Game not found");

    const game = snap.data() as Game;
    if (game.status !== "drafting") return;
    if (game.auctionPhase === "revealing") return;
    if (game.auctionPhase !== "bidding") return;

    const now = Date.now();
    const allBid = game.playerIds.every((pid) => {
      const gp = game.players[pid];
      const nba = playerMap.get(game.currentNbaPlayerId ?? "");
      if (!nba || !gp) return true;
      if (!gp.filledPositions[nba.position] && gp.budget > 0) {
        return game.bids[pid] !== undefined;
      }
      return true;
    });

    if (now < (game.auctionEndsAt ?? 0) && !allBid) return;

    const nbaPlayer = playerMap.get(game.currentNbaPlayerId ?? "");
    if (!nbaPlayer) return;

    const { winnerId, winningBid, revealedBids, historyEntry } = resolveAuction(game, nbaPlayer);

    const updates: Record<string, unknown> = {
      auctionPhase: "revealing",
      revealedBids,
    };

    if (historyEntry) {
      updates.bidHistory = [...game.bidHistory, historyEntry];
    }

    if (winnerId && winningBid >= 0) {
      const winner = game.players[winnerId];
      updates[`players.${winnerId}`] = applyWin(winner, nbaPlayer, winningBid, game.currentRound);
      updates.winnerId = winnerId;
    }

    tx.update(gameRef, updates);
  });

  await new Promise((r) => setTimeout(r, 2500));

  await runTransaction(getClientDb(), async (tx) => {
    const snap = await tx.get(gameRef);
    if (!snap.exists()) return;

    const game = snap.data() as Game;
    if (game.auctionPhase !== "revealing") return;

    const nextState = getNextAuctionState(game);

    if (nextState.status === "evaluating") {
      const updatedPlayers: Record<string, GamePlayer> = {};
      const scores: { pid: string; total: number }[] = [];

      for (const pid of game.playerIds) {
        const gp = game.players[pid];
        const teamScore = evaluateTeam(gp.roster, players);
        updatedPlayers[pid] = { ...gp, teamScore };
        scores.push({ pid, total: teamScore.total });
      }

      scores.sort((a, b) => b.total - a.total);
      scores.forEach((s, i) => {
        updatedPlayers[s.pid] = { ...updatedPlayers[s.pid], rank: i + 1 };
      });

      tx.update(gameRef, {
        ...nextState,
        players: updatedPlayers,
        status: "completed",
        auctionPhase: "complete",
        completedAt: Date.now(),
      });
    } else {
      tx.update(gameRef, nextState);
    }
  });
}
