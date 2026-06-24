export type Position = "PG" | "SG" | "SF" | "PF" | "C";

export type GameStatus = "lobby" | "drafting" | "evaluating" | "completed";

export type GameMode = "casual" | "ranked";

export type AuctionPhase = "waiting" | "bidding" | "revealing" | "complete";

export type PlayStyle = "scorer" | "playmaker" | "defender" | "shooter" | "versatile";

export type MessageType = "lobby" | "game" | "system";

export interface NBAPlayer {
  id: string;
  name: string;
  position: Position;
  overall: number;
  age: number;
  team: string;
  stats: {
    ppg: number;
    rpg: number;
    apg: number;
    spg: number;
    bpg: number;
  };
  offense: number;
  defense: number;
  playmaking: number;
  shooting: number;
  salaryEstimate: number;
  playStyle: PlayStyle;
  photoUrl: string;
}

export interface UserProfile {
  uid: string;
  username: string;
  email?: string;
  photoURL?: string;
  isGuest: boolean;
  wins: number;
  losses: number;
  gamesPlayed: number;
  elo: number;
  friends: string[];
  createdAt: number;
  lastSeen: number;
}

export interface DraftedPlayer {
  playerId: string;
  position: Position;
  bidAmount: number;
  round: number;
}

export interface FilledPositions {
  PG: boolean;
  SG: boolean;
  SF: boolean;
  PF: boolean;
  C: boolean;
}

export interface ChemistryBonus {
  label: string;
  value: number;
}

export interface TeamScore {
  overall: number;
  offense: number;
  defense: number;
  playmaking: number;
  shooting: number;
  chemistry: number;
  chemistryBonuses: ChemistryBonus[];
  total: number;
  grade: string;
  mvpPlayerId: string;
}

export interface GamePlayer {
  userId: string;
  username: string;
  photoURL?: string;
  isReady: boolean;
  isConnected: boolean;
  lastConnectedAt: number;
  budget: number;
  roster: DraftedPlayer[];
  filledPositions: FilledPositions;
  teamScore?: TeamScore;
  rank?: number;
  disconnectedAt?: number;
}

export interface BidHistoryEntry {
  round: number;
  playerId: string;
  playerName: string;
  position: Position;
  winnerId: string;
  winnerName: string;
  winningBid: number;
  allBids: Record<string, number>;
  timestamp: number;
}

export interface GameSettings {
  bidTimerSeconds: number;
  salaryCap: number;
}

export interface Game {
  id: string;
  roomCode: string;
  hostId: string;
  status: GameStatus;
  mode: GameMode;
  maxPlayers: number;
  playerIds: string[];
  players: Record<string, GamePlayer>;
  currentRound: number;
  totalRounds: number;
  playerPool: string[];
  currentPlayerIndex: number;
  currentNbaPlayerId?: string;
  auctionPhase: AuctionPhase;
  auctionEndsAt?: number;
  bids: Record<string, number>;
  revealedBids?: Record<string, number>;
  winnerId?: string;
  bidHistory: BidHistoryEntry[];
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  settings: GameSettings;
}

export interface Message {
  id: string;
  gameId: string;
  userId: string;
  username: string;
  text: string;
  type: MessageType;
  createdAt: number;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  photoURL?: string;
  elo: number;
  wins: number;
  losses: number;
  gamesPlayed: number;
}

export interface MatchHistoryEntry {
  id: string;
  gameId: string;
  mode: GameMode;
  rank: number;
  totalPlayers: number;
  teamScore: number;
  grade: string;
  completedAt: number;
  roster: DraftedPlayer[];
}

export interface DailyChallenge {
  id: string;
  date: string;
  title: string;
  description: string;
  constraint: string;
  bonusPoints: number;
  completedBy: string[];
}

export interface MatchmakingEntry {
  userId: string;
  username: string;
  mode: GameMode;
  joinedAt: number;
}

export const POSITIONS: Position[] = ["PG", "SG", "SF", "PF", "C"];

export const EMPTY_POSITIONS: FilledPositions = {
  PG: false,
  SG: false,
  SF: false,
  PF: false,
  C: false,
};
