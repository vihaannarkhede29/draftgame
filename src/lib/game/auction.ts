import type { Game, GamePlayer, NBAPlayer, Position, BidHistoryEntry } from "@/types";
import { POSITIONS } from "@/types";
import nbaPlayers from "@/data/nba-players.json";

const allNbaPlayers = nbaPlayers as NBAPlayer[];
import { shuffleArray } from "@/lib/utils";
import { SALARY_CAP, BID_TIMER_SECONDS } from "./constants";

export function createInitialPlayer(
  userId: string,
  username: string,
  photoURL?: string
): GamePlayer {
  return {
    userId,
    username,
    photoURL,
    isReady: false,
    isConnected: true,
    lastConnectedAt: Date.now(),
    budget: SALARY_CAP,
    roster: [],
    filledPositions: { PG: false, SG: false, SF: false, PF: false, C: false },
  };
}

export function buildPlayerPool(allPlayers: NBAPlayer[], totalRounds: number): string[] {
  const byPosition: Record<Position, NBAPlayer[]> = {
    PG: [], SG: [], SF: [], PF: [], C: [],
  };
  allPlayers.forEach((p) => byPosition[p.position].push(p));

  const pool: string[] = [];
  const roundsPerPosition = Math.ceil(totalRounds / POSITIONS.length);

  for (let round = 0; round < roundsPerPosition; round++) {
    for (const pos of POSITIONS) {
      const available = byPosition[pos];
      if (available.length > 0) {
        const idx = round % available.length;
        pool.push(available[idx].id);
      }
    }
  }

  return shuffleArray(pool).slice(0, totalRounds);
}

export function canBidOnPlayer(
  player: GamePlayer,
  nbaPlayer: NBAPlayer
): boolean {
  return !player.filledPositions[nbaPlayer.position] && player.budget > 0;
}

export function resolveAuction(
  game: Game,
  nbaPlayer: NBAPlayer
): {
  winnerId: string | null;
  winningBid: number;
  revealedBids: Record<string, number>;
  historyEntry: BidHistoryEntry | null;
} {
  const revealedBids = { ...game.bids };
  const eligibleBidders = game.playerIds.filter((pid) => {
    const gp = game.players[pid];
    return gp && canBidOnPlayer(gp, nbaPlayer) && revealedBids[pid] !== undefined;
  });

  if (eligibleBidders.length === 0) {
    return { winnerId: null, winningBid: 0, revealedBids, historyEntry: null };
  }

  let maxBid = 0;
  for (const pid of eligibleBidders) {
    const bid = revealedBids[pid] ?? 0;
    if (bid > maxBid) maxBid = bid;
  }

  const winners = eligibleBidders.filter((pid) => (revealedBids[pid] ?? 0) === maxBid);
  const winnerId = winners[Math.floor(Math.random() * winners.length)];
  const winner = game.players[winnerId];

  const historyEntry: BidHistoryEntry = {
    round: game.currentRound,
    playerId: nbaPlayer.id,
    playerName: nbaPlayer.name,
    position: nbaPlayer.position,
    winnerId,
    winnerName: winner?.username ?? "Unknown",
    winningBid: maxBid,
    allBids: revealedBids,
    timestamp: Date.now(),
  };

  return { winnerId, winningBid: maxBid, revealedBids, historyEntry };
}

export function applyWin(
  player: GamePlayer,
  nbaPlayer: NBAPlayer,
  bidAmount: number,
  round: number
): GamePlayer {
  return {
    ...player,
    budget: player.budget - bidAmount,
    roster: [
      ...player.roster,
      { playerId: nbaPlayer.id, position: nbaPlayer.position, bidAmount, round },
    ],
    filledPositions: {
      ...player.filledPositions,
      [nbaPlayer.position]: true,
    },
  };
}

export function getNextAuctionState(game: Game): Partial<Game> {
  const nextIndex = game.currentPlayerIndex + 1;
  const isComplete = nextIndex >= game.playerPool.length;

  if (isComplete) {
    return {
      auctionPhase: "complete",
      status: "evaluating",
      currentNbaPlayerId: undefined,
      bids: {},
      revealedBids: undefined,
      winnerId: undefined,
    };
  }

  const nextPlayerId = game.playerPool[nextIndex];
  const endsAt = Date.now() + BID_TIMER_SECONDS * 1000;

  return {
    currentRound: game.currentRound + 1,
    currentPlayerIndex: nextIndex,
    currentNbaPlayerId: nextPlayerId,
    auctionPhase: "bidding",
    auctionEndsAt: endsAt,
    bids: {},
    revealedBids: undefined,
    winnerId: undefined,
  };
}

export function allPlayersReady(game: Game): boolean {
  return game.playerIds.every((pid) => game.players[pid]?.isReady);
}

export function getNewHostId(game: Game, disconnectedHostId: string): string | null {
  const remaining = game.playerIds.filter(
    (pid) => pid !== disconnectedHostId && game.players[pid]?.isConnected
  );
  return remaining.length > 0 ? remaining[0] : null;
}

export function prepareGameStart(game: Game): Partial<Game> {
  const totalRounds = game.playerIds.length * 5;
  const playerPool = buildPlayerPool(allNbaPlayers, totalRounds);
  const firstPlayerId = playerPool[0];
  const endsAt = Date.now() + BID_TIMER_SECONDS * 1000;

  const resetPlayers: Game["players"] = {};
  for (const pid of game.playerIds) {
    const p = game.players[pid];
    resetPlayers[pid] = {
      ...createInitialPlayer(pid, p.username, p.photoURL),
      isReady: true,
      isConnected: p.isConnected,
      lastConnectedAt: p.lastConnectedAt,
    };
  }

  return {
    status: "drafting",
    totalRounds,
    playerPool,
    currentRound: 1,
    currentPlayerIndex: 0,
    currentNbaPlayerId: firstPlayerId,
    auctionPhase: "bidding",
    auctionEndsAt: endsAt,
    bids: {},
    startedAt: Date.now(),
    players: resetPlayers,
  };
}
