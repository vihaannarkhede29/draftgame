import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  collection,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  deleteDoc,
  getDocs,
  type Unsubscribe,
} from "firebase/firestore";
import { getClientDb } from "./config";
import type {
  Game,
  Message,
  LeaderboardEntry,
  MatchmakingEntry,
  UserProfile,
  GameMode,
} from "@/types";
import { generateRoomCode } from "@/lib/utils";
import { createInitialPlayer } from "@/lib/game/auction";
import {
  SALARY_CAP,
  BID_TIMER_SECONDS,
  MAX_PLAYERS,
  MIN_PLAYERS,
} from "@/lib/game/constants";

export function subscribeToGame(
  gameId: string,
  callback: (game: Game | null) => void
): Unsubscribe {
  return onSnapshot(doc(getClientDb(), "games", gameId), (snap) => {
    callback(snap.exists() ? (snap.data() as Game) : null);
  });
}

export function subscribeToMessages(
  gameId: string,
  callback: (messages: Message[]) => void
): Unsubscribe {
  const q = query(
    collection(getClientDb(), "messages"),
    where("gameId", "==", gameId),
    orderBy("createdAt", "asc"),
    limit(200)
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ ...d.data(), id: d.id }) as Message));
  });
}

export function subscribeToLeaderboard(
  callback: (entries: LeaderboardEntry[]) => void,
  count = 50
): Unsubscribe {
  const q = query(
    collection(getClientDb(), "leaderboards"),
    orderBy("elo", "desc"),
    limit(count)
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => d.data() as LeaderboardEntry));
  });
}

export function subscribeToMatchmaking(
  mode: GameMode,
  callback: (entries: MatchmakingEntry[]) => void
): Unsubscribe {
  const q = query(
    collection(getClientDb(), "matchmaking"),
    where("mode", "==", mode),
    orderBy("joinedAt", "asc")
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ ...d.data(), userId: d.id }) as MatchmakingEntry));
  });
}

export async function createGame(
  hostId: string,
  username: string,
  photoURL: string | undefined,
  mode: GameMode,
  maxPlayers: number = MAX_PLAYERS
): Promise<{ gameId: string; roomCode: string }> {
  let roomCode = generateRoomCode();
  let attempts = 0;

  while (attempts < 10) {
    const existing = await getDocs(
      query(collection(getClientDb(), "games"), where("roomCode", "==", roomCode), where("status", "==", "lobby"))
    );
    if (existing.empty) break;
    roomCode = generateRoomCode();
    attempts++;
  }

  const gameId = doc(collection(getClientDb(), "games")).id;
  const hostPlayer = createInitialPlayer(hostId, username, photoURL);

  const game: Game = {
    id: gameId,
    roomCode,
    hostId,
    status: "lobby",
    mode,
    maxPlayers: Math.min(Math.max(maxPlayers, MIN_PLAYERS), MAX_PLAYERS),
    playerIds: [hostId],
    players: { [hostId]: hostPlayer },
    currentRound: 0,
    totalRounds: 0,
    playerPool: [],
    currentPlayerIndex: -1,
    auctionPhase: "waiting",
    bids: {},
    bidHistory: [],
    createdAt: Date.now(),
    settings: { bidTimerSeconds: BID_TIMER_SECONDS, salaryCap: SALARY_CAP },
  };

  await setDoc(doc(getClientDb(), "games", gameId), game);
  return { gameId, roomCode };
}

export async function joinGameByCode(
  roomCode: string,
  userId: string,
  username: string,
  photoURL?: string
): Promise<string> {
  const q = query(
    collection(getClientDb(), "games"),
    where("roomCode", "==", roomCode.toUpperCase()),
    where("status", "==", "lobby")
  );
  const snap = await getDocs(q);

  if (snap.empty) throw new Error("Game not found");
  const gameDoc = snap.docs[0];
  const game = gameDoc.data() as Game;

  if (game.playerIds.includes(userId)) return game.id;
  if (game.playerIds.length >= game.maxPlayers) throw new Error("Game is full");

  const player = createInitialPlayer(userId, username, photoURL);
  await updateDoc(doc(getClientDb(), "games", game.id), {
    playerIds: [...game.playerIds, userId],
    [`players.${userId}`]: player,
  });

  return game.id;
}

export async function setPlayerReady(gameId: string, userId: string, ready: boolean): Promise<void> {
  await updateDoc(doc(getClientDb(), "games", gameId), {
    [`players.${userId}.isReady`]: ready,
  });
}

export async function kickPlayer(gameId: string, playerId: string, currentGame: Game): Promise<void> {
  const { [playerId]: _, ...remainingPlayers } = currentGame.players;
  await updateDoc(doc(getClientDb(), "games", gameId), {
    playerIds: currentGame.playerIds.filter((id) => id !== playerId),
    players: remainingPlayers,
  });
}

export async function updateConnectionStatus(
  gameId: string,
  userId: string,
  connected: boolean
): Promise<void> {
  const updates: Record<string, unknown> = {
    [`players.${userId}.isConnected`]: connected,
    [`players.${userId}.lastConnectedAt`]: Date.now(),
  };
  if (!connected) {
    updates[`players.${userId}.disconnectedAt`] = Date.now();
  } else {
    updates[`players.${userId}.disconnectedAt`] = null;
  }
  await updateDoc(doc(getClientDb(), "games", gameId), updates);
}

export async function sendMessage(
  gameId: string,
  userId: string,
  username: string,
  text: string,
  type: Message["type"] = "lobby"
): Promise<void> {
  await addDoc(collection(getClientDb(), "messages"), {
    gameId,
    userId,
    username,
    text,
    type,
    createdAt: Date.now(),
  });
}

export async function joinMatchmaking(
  userId: string,
  username: string,
  mode: GameMode
): Promise<void> {
  await setDoc(doc(getClientDb(), "matchmaking", userId), {
    userId,
    username,
    mode,
    joinedAt: Date.now(),
  });
}

export async function leaveMatchmaking(userId: string): Promise<void> {
  await deleteDoc(doc(getClientDb(), "matchmaking", userId));
}

export async function getGameByCode(roomCode: string): Promise<Game | null> {
  const q = query(collection(getClientDb(), "games"), where("roomCode", "==", roomCode.toUpperCase()));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return snap.docs[0].data() as Game;
}

export async function getGameById(gameId: string): Promise<Game | null> {
  const snap = await getDoc(doc(getClientDb(), "games", gameId));
  return snap.exists() ? (snap.data() as Game) : null;
}

export async function syncLeaderboardEntry(profile: UserProfile): Promise<void> {
  const entry: LeaderboardEntry = {
    userId: profile.uid,
    username: profile.username,
    photoURL: profile.photoURL,
    elo: profile.elo,
    wins: profile.wins,
    losses: profile.losses,
    gamesPlayed: profile.gamesPlayed,
  };
  await setDoc(doc(getClientDb(), "leaderboards", profile.uid), entry);
}
