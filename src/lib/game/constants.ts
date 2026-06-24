export const SALARY_CAP = 100_000_000;
export const BID_TIMER_SECONDS = 15;
export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 8;
export const ROSTER_SIZE = 5;
export const RECONNECT_WINDOW_MS = 2 * 60 * 1000;
export const HOST_TRANSFER_MS = 30 * 1000;
export const STARTING_ELO = 1200;
export const K_FACTOR = 32;

export const POSITION_LABELS: Record<string, string> = {
  PG: "Point Guard",
  SG: "Shooting Guard",
  SF: "Small Forward",
  PF: "Power Forward",
  C: "Center",
};

export const POSITION_COLORS: Record<string, string> = {
  PG: "bg-blue-500",
  SG: "bg-cyan-500",
  SF: "bg-green-500",
  PF: "bg-orange-500",
  C: "bg-red-500",
};

export const SCORE_WEIGHTS = {
  overall: 0.5,
  offense: 0.15,
  defense: 0.15,
  playmaking: 0.1,
  shooting: 0.05,
  chemistry: 0.05,
};
