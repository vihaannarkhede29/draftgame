import { writeFileSync } from "fs";

const teams = [
  "LAL", "BOS", "GSW", "MIA", "DEN", "PHX", "MIL", "PHI", "DAL", "NYK",
  "CLE", "OKC", "MIN", "SAC", "LAC", "ATL", "CHI", "BKN", "TOR", "IND",
  "NOP", "ORL", "HOU", "MEM", "SAS", "POR", "UTA", "CHA", "DET", "WAS",
];

const playStyles = ["scorer", "playmaker", "defender", "shooter", "versatile"];

const roster = {
  PG: [
    ["Stephen Curry", 96, 36, 26.4, 4.5, 5.1, 0.9, 0.4],
    ["Luka Doncic", 97, 25, 33.9, 9.2, 9.8, 1.4, 0.5],
    ["Shai Gilgeous-Alexander", 96, 26, 30.1, 5.5, 6.2, 2.0, 0.9],
    ["Damian Lillard", 92, 34, 24.3, 4.4, 7.0, 0.9, 0.2],
    ["Tyrese Haliburton", 91, 24, 20.1, 3.9, 10.9, 1.2, 0.7],
    ["Trae Young", 90, 26, 25.7, 2.8, 10.8, 1.0, 0.2],
    ["Ja Morant", 89, 25, 25.1, 5.6, 8.1, 0.8, 0.3],
    ["De'Aaron Fox", 88, 27, 26.6, 4.6, 5.6, 1.5, 0.4],
    ["Jalen Brunson", 90, 28, 28.7, 3.6, 6.7, 0.9, 0.2],
    ["Devin Booker", 91, 28, 27.1, 4.5, 6.9, 0.9, 0.3],
    ["Cade Cunningham", 86, 23, 22.7, 4.3, 7.5, 0.9, 0.7],
    ["LaMelo Ball", 87, 23, 23.9, 5.1, 8.0, 1.1, 0.3],
    ["Derrick White", 84, 30, 15.2, 4.2, 5.2, 1.0, 1.2],
    ["Jrue Holiday", 85, 34, 12.5, 5.4, 4.9, 1.2, 0.8],
    ["Chris Paul", 83, 39, 9.2, 3.9, 6.8, 1.2, 0.2],
  ],
  SG: [
    ["Anthony Edwards", 94, 23, 25.9, 5.4, 5.1, 1.3, 0.5],
    ["Donovan Mitchell", 92, 28, 26.6, 4.1, 5.1, 1.5, 0.3],
    ["Jaylen Brown", 91, 28, 23.0, 5.5, 3.6, 1.0, 0.5],
    ["Devin Vassell", 84, 24, 19.5, 3.8, 2.9, 1.1, 0.5],
    ["Tyler Herro", 86, 25, 24.0, 5.3, 4.5, 0.8, 0.2],
    ["CJ McCollum", 85, 33, 20.0, 4.3, 4.3, 0.9, 0.3],
    ["Bradley Beal", 84, 31, 18.2, 4.4, 4.5, 0.9, 0.5],
    ["Zach LaVine", 85, 29, 19.5, 4.5, 3.9, 0.8, 0.3],
    ["Desmond Bane", 86, 26, 24.4, 4.6, 4.9, 1.0, 0.5],
    ["Jalen Green", 84, 22, 19.6, 3.2, 3.5, 0.8, 0.3],
    ["Klay Thompson", 82, 34, 17.9, 3.3, 2.1, 0.6, 0.5],
    ["Gary Trent Jr.", 80, 26, 14.2, 2.6, 1.4, 1.0, 0.2],
    ["Bogdan Bogdanovic", 81, 32, 16.9, 3.4, 3.1, 0.8, 0.2],
    ["Jordan Clarkson", 80, 32, 17.1, 3.4, 2.5, 0.6, 0.2],
    ["Malik Monk", 81, 26, 15.4, 2.9, 2.9, 0.6, 0.3],
  ],
  SF: [
    ["LeBron James", 96, 40, 25.7, 7.3, 8.3, 1.3, 0.5],
    ["Kevin Durant", 95, 36, 27.1, 6.7, 5.0, 0.9, 1.2],
    ["Jayson Tatum", 94, 27, 26.9, 8.1, 4.9, 1.0, 0.6],
    ["Kawhi Leonard", 93, 33, 23.7, 6.1, 3.6, 1.6, 0.9],
    ["Paul George", 90, 34, 22.6, 5.2, 3.5, 1.5, 0.5],
    ["Jimmy Butler", 90, 35, 20.8, 5.3, 5.0, 1.3, 0.6],
    ["Brandon Ingram", 87, 27, 20.8, 5.1, 5.7, 0.8, 0.6],
    ["Mikal Bridges", 86, 28, 19.6, 4.5, 3.6, 1.0, 0.5],
    ["DeMar DeRozan", 87, 35, 24.0, 4.3, 5.3, 1.1, 0.6],
    ["Paolo Banchero", 87, 22, 22.6, 6.9, 5.4, 0.9, 0.5],
    ["Scottie Barnes", 86, 23, 19.9, 8.2, 6.1, 1.3, 1.5],
    ["Franz Wagner", 85, 23, 19.7, 5.3, 3.7, 1.1, 0.5],
    ["OG Anunoby", 84, 27, 14.7, 4.2, 1.5, 1.4, 0.5],
    ["Khris Middleton", 83, 33, 15.1, 4.7, 5.3, 0.9, 0.3],
    ["Andrew Wiggins", 82, 29, 13.2, 4.5, 1.7, 0.8, 0.6],
  ],
  PF: [
    ["Giannis Antetokounmpo", 97, 30, 30.4, 11.5, 6.5, 1.2, 1.2],
    ["Anthony Davis", 94, 31, 24.7, 12.6, 3.5, 1.2, 2.3],
    ["Bam Adebayo", 91, 27, 19.3, 10.4, 3.9, 1.1, 0.9],
    ["Pascal Siakam", 88, 30, 22.2, 6.5, 4.9, 0.9, 0.3],
    ["Julius Randle", 87, 30, 24.0, 9.2, 5.0, 0.5, 0.3],
    ["Evan Mobley", 89, 23, 16.0, 9.0, 2.9, 0.8, 1.5],
    ["Jarrett Allen", 86, 26, 16.5, 10.5, 2.7, 0.7, 1.1],
    ["Jaren Jackson Jr.", 90, 25, 22.5, 5.5, 1.7, 1.0, 1.6],
    ["Lauri Markkanen", 87, 27, 23.2, 8.2, 2.0, 0.6, 0.5],
    ["Draymond Green", 84, 34, 8.6, 7.2, 7.0, 1.0, 1.0],
    ["Al Horford", 82, 38, 8.6, 6.4, 2.6, 0.6, 0.9],
    ["John Collins", 83, 27, 13.1, 6.8, 1.0, 0.6, 1.0],
    ["P.J. Washington", 81, 26, 14.7, 5.5, 2.2, 0.9, 0.8],
    ["Keegan Murray", 82, 24, 14.1, 6.6, 1.2, 0.8, 0.7],
    ["Grant Williams", 79, 26, 8.1, 4.6, 1.7, 0.5, 0.5],
  ],
  C: [
    ["Nikola Jokic", 98, 29, 26.4, 12.4, 9.0, 1.4, 0.9],
    ["Joel Embiid", 96, 30, 34.7, 11.0, 5.6, 1.0, 1.7],
    ["Victor Wembanyama", 92, 21, 21.4, 10.6, 3.9, 1.2, 3.6],
    ["Karl-Anthony Towns", 90, 29, 21.8, 8.3, 3.0, 0.7, 0.7],
    ["Rudy Gobert", 87, 32, 14.0, 12.9, 1.3, 0.7, 1.4],
    ["Domantas Sabonis", 89, 28, 19.4, 13.7, 8.2, 0.9, 0.6],
    ["Alperen Sengun", 87, 22, 21.1, 9.3, 5.0, 1.2, 0.9],
    ["Brook Lopez", 84, 36, 12.5, 5.2, 1.3, 0.5, 2.4],
    ["Clint Capela", 82, 30, 11.5, 10.6, 0.9, 0.7, 1.5],
    ["Myles Turner", 84, 28, 17.1, 6.9, 1.3, 0.6, 2.3],
    ["Walker Kessler", 83, 23, 8.1, 7.5, 0.9, 0.5, 2.4],
    ["Ivica Zubac", 82, 27, 11.7, 9.2, 1.2, 0.4, 1.2],
    ["Daniel Gafford", 80, 26, 10.9, 7.6, 1.1, 0.5, 1.4],
    ["Mark Williams", 81, 23, 12.7, 9.7, 0.9, 0.7, 1.1],
    ["Steven Adams", 78, 31, 8.6, 10.4, 2.3, 0.8, 0.9],
  ],
};

function deriveAttributes(overall, pos, stats) {
  const [ppg, rpg, apg, spg, bpg] = stats;
  const offense = Math.min(99, Math.round(overall * 0.4 + ppg * 1.2));
  const defense = Math.min(99, Math.round(overall * 0.35 + (spg + bpg) * 8 + rpg * 0.5));
  const playmaking = Math.min(99, Math.round(overall * 0.3 + apg * 3.5));
  const shooting = Math.min(99, Math.round(overall * 0.35 + ppg * 0.8 + (pos === "PG" || pos === "SG" ? 8 : 0)));
  return { offense, defense, playmaking, shooting };
}

function salaryEstimate(overall, age) {
  const base = overall * 450_000;
  const ageFactor = age < 26 ? 1.15 : age > 32 ? 0.85 : 1.0;
  return Math.round((base * ageFactor) / 100_000) * 100_000;
}

function playStyleFor(pos, stats, overall) {
  const [ppg, , apg, spg, bpg] = stats;
  if (apg >= 7) return "playmaker";
  if (ppg >= 25) return "scorer";
  if (spg + bpg >= 2.5 || overall >= 88) return "defender";
  if (ppg >= 18 && (pos === "SG" || pos === "SF")) return "shooter";
  return "versatile";
}

const players = [];
let idx = 0;

for (const [position, list] of Object.entries(roster)) {
  list.forEach(([name, overall, age, ...stats], i) => {
    const attrs = deriveAttributes(overall, position, stats);
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    players.push({
      id: `nba-${String(idx + 1).padStart(3, "0")}`,
      name,
      position,
      overall,
      age,
      team: teams[idx % teams.length],
      stats: { ppg: stats[0], rpg: stats[1], apg: stats[2], spg: stats[3], bpg: stats[4] },
      ...attrs,
      salaryEstimate: salaryEstimate(overall, age),
      playStyle: playStyleFor(position, stats, overall),
      photoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1a1a2e&color=c9a227&size=256&bold=true`,
    });
    idx++;
  });
}

writeFileSync(
  new URL("../src/data/nba-players.json", import.meta.url),
  JSON.stringify(players, null, 2)
);
console.log(`Generated ${players.length} NBA players`);
