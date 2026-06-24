# NBA Auction Draft

Real-time multiplayer NBA auction draft game. Build the best 5-man roster under a **$100M salary cap** while competing against 2–8 players in live blind auctions.

## Tech Stack

- **Next.js 15** (App Router) + TypeScript
- **Tailwind CSS** — dark ESPN/NBA 2K-inspired UI
- **Firebase Authentication** — Google + Guest sign-in
- **Firebase Firestore** — game state, profiles, chat, leaderboards
- **Firebase Admin SDK** — server-side bid validation (API routes)
- **Framer Motion** — animations and transitions
- **Vercel** — deployment target

## Features

- Google & guest authentication with user profiles (ELO, W/L, games played)
- Create/join private rooms with 6-character codes
- Public matchmaking queue (casual & ranked)
- Real-time lobby with chat, ready status, host kick
- Blind auction draft: 15s timer, simultaneous bid reveal
- 75 NBA players with stats, ratings, positions, salary estimates
- Team scoring with chemistry bonuses (positional balance, spacing, defense)
- Global leaderboard, friends list, daily challenges, match history
- Disconnect/reconnect handling with automatic host transfer
- Mobile-responsive dark UI with confetti, skeletons, animated cards

## Getting Started

### 1. Clone & install

```bash
npm install
```

### 2. Firebase setup

1. Create a [Firebase project](https://console.firebase.google.com)
2. Enable **Authentication** → Google + Anonymous providers
3. Create a **Firestore** database
4. Deploy security rules: `firebase deploy --only firestore:rules`
5. Deploy indexes: `firebase deploy --only firestore:indexes`
6. Generate a **service account key** for Admin SDK (Project Settings → Service Accounts)

### 3. Environment variables

Copy `.env.example` to `.env.local` and fill in your Firebase credentials:

```bash
cp .env.example .env.local
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Deploy to GitHub Pages

1. Push to GitHub (repo name must be `draftgame` for the URL to work)
2. **Settings → Pages → Build and deployment → Source: GitHub Actions**
3. Add these **repository secrets** (Settings → Secrets → Actions):
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
4. Push to `main` — the workflow deploys automatically

Live URL: `https://<username>.github.io/draftgame/`

### 6. Deploy to Vercel (alternative)

```bash
npx vercel
```

Add all environment variables from `.env.local` in the Vercel dashboard.

## Project Structure

```
src/
├── app/
│   ├── page.tsx                 # Home (create/join/matchmaking)
│   ├── lobby/[code]/            # Multiplayer lobby
│   ├── game/[code]/             # Live auction draft
│   ├── results/[gameId]/        # Final rankings & scores
│   ├── leaderboard/             # Global ELO rankings
│   ├── profile/                   # User stats
│   ├── friends/                   # Friends list
│   ├── history/                   # Match history
│   ├── daily-challenge/           # Daily challenges
│   └── api/game/                  # Server-side game actions
│       ├── bid/                   # Validate & submit bids
│       ├── resolve-auction/       # Resolve auction & advance
│       ├── start/                 # Start draft
│       └── kick/                  # Kick player / transfer host
├── components/
│   ├── ui/                        # Button, Card, Modal, etc.
│   ├── layout/                    # Header
│   ├── game/                      # PlayerCard, AuctionPanel, etc.
│   ├── lobby/                     # PlayerList
│   └── results/                   # TeamResults, Confetti
├── contexts/                      # AuthContext
├── hooks/                         # useGame
├── lib/
│   ├── firebase/                  # Config, auth, firestore, admin
│   └── game/                      # Auction logic, team scoring
├── types/                         # TypeScript interfaces
└── data/
    └── nba-players.json           # 75 NBA players
```

## Firestore Collections

| Collection | Purpose |
|---|---|
| `users/` | Profiles, stats, friends |
| `games/` | Room state, rosters, bids, auction phase |
| `messages/` | Lobby & in-game chat |
| `leaderboards/` | Global ELO rankings |
| `matchmaking/` | Public queue entries |
| `matchHistory/` | Per-game results |
| `dailyChallenges/` | Daily challenge definitions |

## Game Flow

1. **Lobby** — Host creates room, players join via code, everyone readies up
2. **Draft** — NBA players appear one at a time; all players submit secret bids (15s)
3. **Reveal** — Bids shown simultaneously; highest bidder wins (ties broken randomly)
4. **Repeat** — 5 rounds per player (1 per position: PG, SG, SF, PF, C)
5. **Results** — Teams scored on overall, offense, defense, playmaking, shooting, chemistry

## Team Score Formula

| Category | Weight |
|---|---|
| Overall Rating | 50% |
| Offense | 15% |
| Defense | 15% |
| Playmaking | 10% |
| Shooting | 5% |
| Chemistry | 5% |

Chemistry bonuses: +5 positional balance, +3 elite shooters, +3 strong defense, -5 poor spacing, -5 duplicate play styles.

## License

MIT
