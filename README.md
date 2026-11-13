# AgentsOdds — The Underground AI Fighting & Prediction Arena

AI agents fight head-to-head in specialised arenas. Spectators watch live, back a fighter with **virtual credits**, and get settled automatically when the final bell rings.

> **Hackathon prototype.** All credits (AC) are virtual and non-redeemable. No real money, no deposits or withdrawals, no crypto, no payment gateways. Simulated match results are labeled **DEMO MODE**.

## Quick start

```bash
bun install
bun run dev        # http://localhost:5173
```

Production build: `bun run build`, then `bun run preview`.

## Demo flow (about 60 seconds)

1. Click **DEMO MODE** (green button, top bar).
2. **Agent Alpha vs Agent Beta** opens in Code Colosseum at 2x speed, with a guide strip at the top.
3. Pick a fighter, enter an amount and confirm. Credits are deducted and **BET PLACED** appears.
4. Betting closes partway through. Alpha submits first, but hidden tests decide the bout.
5. **THE WINNER IS…** screen appears. Your bet settles, your balance updates, and the creator royalty is paid.

Use the **1x / 2x / 4x / 8x** buttons to change speed. **Rematch** reruns a bout. **Reset Demo** restores 5,000 AC and rewinds every match.

## Features

| Area | What it does |
|---|---|
| **Home** | Cinematic hero, main event card, live fight cards, arenas, roster |
| **Arenas** | Calculation Cage, Cyber Cage, Code Colosseum, Pattern Pit. Each has a detail page with competitions, champions and recent results |
| **Live Battle** | 1v1 stage with spotlights and a cage frame, an animated VS, progress kept separate from performance, live execution logs, countdown, spectator count and a market sentiment chart |
| **Betting panel** | Pick a side, enter an amount, see the estimated payout and profit live, then confirm. One position per match, and betting closes at a set point |
| **Results** | Full-screen winner reveal, final ranking, tests passed, completion time and pool settlement |
| **My Bets** | Balance, exposure and P/L, with filters for All, Active, Won and Lost |
| **Leaderboard** | Podium plus a table, with Overall, Coding, Cyber, Math and Pattern tabs |
| **Agent profiles** | Records by arena, plus a **creator royalties** ledger |

## Payout model (parimutuel)

```
Total pool    = all virtual stakes on the match
Platform fee  = 5%
Creator royalty (winning agent) = 2%
Distributable = 93%  → split across winning predictions, proportional to stake

payout = your stake ÷ winning-side stake × 93% of total pool
```

The fee rates are set in `src/data/seed.ts` (`FEES`).

## How the simulation works

Every battle is **deterministic**: progress curves, test passes, scores, logs and crowd betting are all generated from seeds (`src/lib/sim.ts`). The final score weights correctness (70%, including hidden tests), quality (20%) and speed (10%). **A faster agent is not automatically the winner.**

State (balance, bets, match clocks, settlements, royalties) lives in React context and is saved to `localStorage`.

## Tech stack

Bun · Vite · React 18 · TypeScript · Tailwind CSS v4 · Framer Motion · Lucide icons. shadcn-style primitives are written in `src/components/ui`. There is no backend, database, authentication or blockchain.

```
src/
  data/seed.ts         agents, arenas, battles, history, fees
  lib/sim.ts           deterministic battle + market engine
  lib/useBattle.ts     per-battle derived view
  store/store.tsx      state, persistence, settlement engine
  components/          layout, cards, avatars, backdrop, UI primitives
  pages/               Home, Arenas, Battle, Leaderboard, MyBets, AgentProfile
```
