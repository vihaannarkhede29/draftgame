import type { NBAPlayer, ChemistryBonus, TeamScore, DraftedPlayer } from "@/types";
import { SCORE_WEIGHTS } from "./constants";
import { gradeFromScore } from "@/lib/utils";

function getPlayerMap(players: NBAPlayer[]): Map<string, NBAPlayer> {
  return new Map(players.map((p) => [p.id, p]));
}

function calculateChemistry(
  rosterPlayers: NBAPlayer[]
): { chemistry: number; bonuses: ChemistryBonus[] } {
  const bonuses: ChemistryBonus[] = [];
  let chemistry = 70;

  const positions = new Set(rosterPlayers.map((p) => p.position));
  if (positions.size === 5) {
    chemistry += 5;
    bonuses.push({ label: "Strong positional balance", value: 5 });
  }

  const eliteShooters = rosterPlayers.filter((p) => p.shooting >= 85);
  if (eliteShooters.length >= 2) {
    chemistry += 3;
    bonuses.push({ label: "Multiple elite shooters", value: 3 });
  }

  const strongDefenders = rosterPlayers.filter((p) => p.defense >= 85);
  if (strongDefenders.length >= 3) {
    chemistry += 3;
    bonuses.push({ label: "Strong defensive lineup", value: 3 });
  }

  const nonShooters = rosterPlayers.filter((p) => p.shooting < 70);
  if (nonShooters.length >= 3) {
    chemistry -= 5;
    bonuses.push({ label: "Poor spacing", value: -5 });
  }

  const playStyles = rosterPlayers.map((p) => p.playStyle);
  const styleCounts = playStyles.reduce(
    (acc, style) => {
      acc[style] = (acc[style] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
  const duplicateStyles = Object.values(styleCounts).filter((c) => c >= 3);
  if (duplicateStyles.length > 0) {
    chemistry -= 5;
    bonuses.push({ label: "Duplicate play styles", value: -5 });
  }

  chemistry = Math.max(0, Math.min(100, chemistry));
  return { chemistry, bonuses };
}

export function evaluateTeam(
  roster: DraftedPlayer[],
  allPlayers: NBAPlayer[]
): TeamScore {
  const playerMap = getPlayerMap(allPlayers);
  const rosterPlayers = roster
    .map((d) => playerMap.get(d.playerId))
    .filter((p): p is NBAPlayer => p !== undefined);

  if (rosterPlayers.length === 0) {
    return {
      overall: 0,
      offense: 0,
      defense: 0,
      playmaking: 0,
      shooting: 0,
      chemistry: 0,
      chemistryBonuses: [],
      total: 0,
      grade: "F",
      mvpPlayerId: "",
    };
  }

  const avg = (key: keyof Pick<NBAPlayer, "overall" | "offense" | "defense" | "playmaking" | "shooting">) =>
    rosterPlayers.reduce((sum, p) => sum + p[key], 0) / rosterPlayers.length;

  const overall = avg("overall");
  const offense = avg("offense");
  const defense = avg("defense");
  const playmaking = avg("playmaking");
  const shooting = avg("shooting");
  const { chemistry, bonuses } = calculateChemistry(rosterPlayers);

  const total =
    overall * SCORE_WEIGHTS.overall +
    offense * SCORE_WEIGHTS.offense +
    defense * SCORE_WEIGHTS.defense +
    playmaking * SCORE_WEIGHTS.playmaking +
    shooting * SCORE_WEIGHTS.shooting +
    chemistry * SCORE_WEIGHTS.chemistry;

  const mvpPlayer = rosterPlayers.reduce((best, p) =>
    p.overall > best.overall ? p : best
  );

  return {
    overall: Math.round(overall * 10) / 10,
    offense: Math.round(offense * 10) / 10,
    defense: Math.round(defense * 10) / 10,
    playmaking: Math.round(playmaking * 10) / 10,
    shooting: Math.round(shooting * 10) / 10,
    chemistry,
    chemistryBonuses: bonuses,
    total: Math.round(total * 10) / 10,
    grade: gradeFromScore(total),
    mvpPlayerId: mvpPlayer.id,
  };
}

export function calculateEloChange(
  winnerElo: number,
  loserElo: number,
  won: boolean
): number {
  const expected = 1 / (1 + Math.pow(10, (loserElo - winnerElo) / 400));
  const actual = won ? 1 : 0;
  return Math.round(32 * (actual - expected));
}
