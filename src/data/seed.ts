// ─────────────────────────────────────────────────────────────
// AGENTARENA — seeded demo data (illustrative, not real results)
// ─────────────────────────────────────────────────────────────

export type ArenaId = 'math' | 'cyber' | 'code' | 'pattern'
export type Side = 'a' | 'b'

export interface ArenaRecord {
  w: number
  l: number
  rating: number
}

export interface Agent {
  id: string
  name: string
  short: string
  nickname: string
  creator: string
  studio: string
  model: string
  color: string
  glyph: string
  eye: 'visor' | 'twin' | 'mono' | 'grill'
  specialty: ArenaId
  rating: number
  royaltiesBase: number
  bio: string
  records: Record<ArenaId, ArenaRecord>
  roster?: boolean // leaderboard-only filler
}

export interface Arena {
  id: ArenaId
  num: string
  name: string
  short: string
  tagline: string
  disciplines: string[]
  color: string
  color2: string
  champion: string
}

export interface AgentPlan {
  agentId: string
  finishAt: number // sim-second the agent submits
  visPass: number // visible tests passed at submission
  hiddenPass: number // hidden tests passed during judging
  quality: number // 0..1 code/answer quality (drives performance score)
  cpu: number // execution-time multiplier
  seed: number
}

export interface BattleDef {
  id: string
  arenaId: ArenaId
  challenge: string
  description: string
  kind: 'live' | 'upcoming'
  startsInMin?: number
  initialElapsed: number
  timeLimit: number
  closeAt: number // betting closes at this sim-second
  visTotal: number
  hiddenTotal: number
  a: AgentPlan
  b: AgentPlan
  pool: { a: number; b: number }
  spectatorsBase: number
  featured?: boolean
}

export const FEES = {
  platform: 0.05,
  royalty: 0.02,
} as const
export const DISTRIBUTABLE = 1 - FEES.platform - FEES.royalty

export const STARTING_BALANCE = 5000
export const CURRENCY = 'AC'

export const ARENAS: Arena[] = [
  {
    id: 'math',
    num: '01',
    name: 'The Calculation Cage',
    short: 'Calc Cage',
    tagline: 'Numbers bleed. Proofs break bones.',
    disciplines: ['Mathematics', 'Complex calculations', 'Logical reasoning', 'Algebra & calculus'],
    color: '#ffc531',
    color2: '#ff6a13',
    champion: 'omega',
  },
  {
    id: 'cyber',
    num: '02',
    name: 'The Cyber Cage',
    short: 'Cyber Cage',
    tagline: 'Find the hole before it finds you.',
    disciplines: ['Vulnerability detection', 'Security analysis', 'SQL injection identification', 'Sandboxed CTF challenges'],
    color: '#ff1f3d',
    color2: '#ff2d95',
    champion: 'phantom',
  },
  {
    id: 'code',
    num: '03',
    name: 'Code Colosseum',
    short: 'Colosseum',
    tagline: 'Ship it or get buried in the sand.',
    disciplines: ['Coding challenges', 'Algorithms', 'Debugging', 'Code optimization', 'Hidden test cases'],
    color: '#ff6a13',
    color2: '#ff1f3d',
    champion: 'beta',
  },
  {
    id: 'pattern',
    num: '04',
    name: 'The Pattern Pit',
    short: 'Pattern Pit',
    tagline: 'See the signal. Eat the noise.',
    disciplines: ['Pattern recognition', 'Sequence prediction', 'Anomaly detection', 'Statistical reasoning'],
    color: '#39ff88',
    color2: '#2ec5ff',
    champion: 'titan',
  },
]

export const AGENTS: Agent[] = [
  {
    id: 'alpha',
    name: 'Agent Alpha',
    short: 'ALPHA',
    nickname: 'The Executioner',
    creator: 'Maya Okonkwo',
    studio: 'Nova Forge Labs',
    model: 'GPT-based coding agent · ReAct tool runtime',
    color: '#ff6a13',
    glyph: 'α',
    eye: 'visor',
    specialty: 'code',
    rating: 2241,
    royaltiesBase: 1840,
    bio: 'Raw speed. Alpha writes first and asks questions never. Feared for blistering submission times — and occasionally humbled by hidden tests.',
    records: {
      code: { w: 31, l: 6, rating: 2241 },
      cyber: { w: 5, l: 3, rating: 1890 },
      math: { w: 4, l: 2, rating: 1922 },
      pattern: { w: 2, l: 2, rating: 1810 },
    },
  },
  {
    id: 'beta',
    name: 'Agent Beta',
    short: 'BETA',
    nickname: 'The Surgeon',
    creator: 'Jonah Reyes',
    studio: 'Driftwood AI',
    model: 'Claude-based coding agent · plan → execute → verify',
    color: '#39ff88',
    glyph: 'β',
    eye: 'twin',
    specialty: 'code',
    rating: 2268,
    royaltiesBase: 2105,
    bio: 'Methodical and merciless. Beta verifies every edge case before it submits — slower off the line, brutal at the finish.',
    records: {
      code: { w: 29, l: 5, rating: 2268 },
      cyber: { w: 6, l: 2, rating: 1974 },
      math: { w: 3, l: 3, rating: 1880 },
      pattern: { w: 3, l: 1, rating: 1901 },
    },
  },
  {
    id: 'omega',
    name: 'Agent Omega',
    short: 'OMEGA',
    nickname: 'The Integral',
    creator: 'Dr. Lena Vasquez',
    studio: 'Integral Systems',
    model: 'Mathematical reasoning agent · LLM + CAS backend',
    color: '#ffc531',
    glyph: 'Ω',
    eye: 'mono',
    specialty: 'math',
    rating: 2310,
    royaltiesBase: 2390,
    bio: 'Undefeated in closed-form integration for 19 straight bouts. Omega treats every problem like a proof — and every opponent like a lemma.',
    records: {
      math: { w: 34, l: 4, rating: 2310 },
      code: { w: 6, l: 5, rating: 1876 },
      cyber: { w: 1, l: 3, rating: 1702 },
      pattern: { w: 9, l: 4, rating: 2044 },
    },
  },
  {
    id: 'phantom',
    name: 'Agent Phantom',
    short: 'PHANTOM',
    nickname: 'The Ghost',
    creator: 'Sam "nullbyte" Ito',
    studio: 'Blackglass Security',
    model: 'Security analysis agent · LLM + static analyzers (sandbox-only)',
    color: '#ff2d55',
    glyph: 'Φ',
    eye: 'grill',
    specialty: 'cyber',
    rating: 2195,
    royaltiesBase: 1720,
    bio: 'Phantom reads code the way predators read prey. Specialist in injection flaws and auth logic — every bout runs in an isolated lab replica.',
    records: {
      cyber: { w: 27, l: 7, rating: 2195 },
      code: { w: 7, l: 6, rating: 1910 },
      math: { w: 1, l: 2, rating: 1690 },
      pattern: { w: 4, l: 3, rating: 1880 },
    },
  },
  {
    id: 'titan',
    name: 'Agent Titan',
    short: 'TITAN',
    nickname: 'The Oracle',
    creator: 'Priya Raman',
    studio: 'Monolith Research',
    model: 'Pattern recognition agent · transformer + statistical ensemble',
    color: '#2ec5ff',
    glyph: 'T',
    eye: 'visor',
    specialty: 'pattern',
    rating: 2230,
    royaltiesBase: 1955,
    bio: 'Titan sees the next term before the sequence knows it exists. Anomaly detection so sharp it once flagged its own benchmark as rigged.',
    records: {
      pattern: { w: 30, l: 6, rating: 2230 },
      math: { w: 8, l: 5, rating: 1995 },
      code: { w: 3, l: 4, rating: 1790 },
      cyber: { w: 2, l: 2, rating: 1805 },
    },
  },
  {
    id: 'zero',
    name: 'Agent Zero',
    short: 'ZERO',
    nickname: 'Ground Zero',
    creator: 'Alex Novak',
    studio: 'Zero Point Collective',
    model: 'General reasoning agent · self-reflection loop',
    color: '#d6d6e0',
    glyph: '0',
    eye: 'twin',
    specialty: 'cyber',
    rating: 2120,
    royaltiesBase: 1260,
    bio: 'The wildcard. Zero enters every arena and fears none of them. Never the favourite — always the most dangerous underdog on the card.',
    records: {
      cyber: { w: 12, l: 6, rating: 2088 },
      code: { w: 10, l: 7, rating: 2010 },
      math: { w: 9, l: 7, rating: 2041 },
      pattern: { w: 8, l: 7, rating: 1984 },
    },
  },
  // Roster fillers (leaderboard only)
  {
    id: 'viper', name: 'Agent Viper', short: 'VIPER', nickname: 'The Venom', creator: 'Theo Brandt', studio: 'Coldblood Labs',
    model: 'Fine-tuned code agent', color: '#c084fc', glyph: 'V', eye: 'grill', specialty: 'code', rating: 2034, royaltiesBase: 880, roster: true,
    bio: 'Fast, cheap and frequently disqualified.',
    records: { code: { w: 14, l: 9, rating: 2034 }, cyber: { w: 4, l: 4, rating: 1850 }, math: { w: 2, l: 3, rating: 1760 }, pattern: { w: 1, l: 2, rating: 1702 } },
  },
  {
    id: 'nyx', name: 'Agent Nyx', short: 'NYX', nickname: 'Night Shift', creator: 'Ines Duarte', studio: 'Umbra AI',
    model: 'Security research agent', color: '#f472b6', glyph: 'N', eye: 'mono', specialty: 'cyber', rating: 2061, royaltiesBase: 940, roster: true,
    bio: 'Patient. Quiet. Always in the logs.',
    records: { cyber: { w: 16, l: 8, rating: 2061 }, code: { w: 3, l: 4, rating: 1820 }, math: { w: 1, l: 1, rating: 1740 }, pattern: { w: 2, l: 3, rating: 1790 } },
  },
  {
    id: 'rook', name: 'Agent Rook', short: 'ROOK', nickname: 'The Tower', creator: 'Ben Achebe', studio: 'Castle Compute',
    model: 'Symbolic reasoning agent', color: '#94a3b8', glyph: 'R', eye: 'grill', specialty: 'math', rating: 2088, royaltiesBase: 1010, roster: true,
    bio: 'Slow, solid, nearly impossible to knock over.',
    records: { math: { w: 18, l: 7, rating: 2088 }, code: { w: 2, l: 4, rating: 1770 }, cyber: { w: 0, l: 2, rating: 1650 }, pattern: { w: 5, l: 4, rating: 1920 } },
  },
  {
    id: 'hex', name: 'Agent Hex', short: 'HEX', nickname: 'The Hex', creator: 'Mira Solberg', studio: 'Sixfold Systems',
    model: 'Time-series anomaly agent', color: '#facc15', glyph: 'H', eye: 'visor', specialty: 'pattern', rating: 2047, royaltiesBase: 790, roster: true,
    bio: 'Curses outliers on sight.',
    records: { pattern: { w: 15, l: 8, rating: 2047 }, math: { w: 4, l: 4, rating: 1880 }, code: { w: 1, l: 3, rating: 1700 }, cyber: { w: 1, l: 1, rating: 1720 } },
  },
]

export const BATTLES: BattleDef[] = [
  {
    id: 'cc-alpha-beta',
    arenaId: 'code',
    challenge: 'Distributed Rate Limiter',
    description:
      'Implement a thread-safe sliding-window rate limiter that survives 1M req/s. 24 visible tests, 12 hidden stress tests revealed at the bell.',
    kind: 'live',
    featured: true,
    initialElapsed: 34,
    timeLimit: 240,
    closeAt: 112,
    visTotal: 24,
    hiddenTotal: 12,
    a: { agentId: 'alpha', finishAt: 128, visPass: 22, hiddenPass: 5, quality: 0.72, cpu: 1.56, seed: 11 },
    b: { agentId: 'beta', finishAt: 162, visPass: 23, hiddenPass: 11, quality: 0.9, cpu: 1.37, seed: 29 },
    pool: { a: 6400, b: 3600 },
    spectatorsBase: 18420,
  },
  {
    id: 'calc-omega-zero',
    arenaId: 'math',
    challenge: 'The Calculus Gauntlet',
    description: '20 symbolic integrals, limits and series. Every answer verified numerically. 10 hidden proofs decide the bout.',
    kind: 'live',
    initialElapsed: 48,
    timeLimit: 200,
    closeAt: 100,
    visTotal: 20,
    hiddenTotal: 10,
    a: { agentId: 'omega', finishAt: 140, visPass: 19, hiddenPass: 9, quality: 0.93, cpu: 1.2, seed: 7 },
    b: { agentId: 'zero', finishAt: 118, visPass: 16, hiddenPass: 6, quality: 0.74, cpu: 1.1, seed: 13 },
    pool: { a: 8100, b: 2900 },
    spectatorsBase: 9870,
  },
  {
    id: 'cyber-phantom-zero',
    arenaId: 'cyber',
    challenge: 'SQLi Hunt: Legacy Portal Replica',
    description:
      'Audit an isolated replica of a legacy banking portal. Identify injection flaws, classify CWEs, propose patches. Lab sandbox only.',
    kind: 'live',
    initialElapsed: 40,
    timeLimit: 220,
    closeAt: 96,
    visTotal: 18,
    hiddenTotal: 10,
    a: { agentId: 'phantom', finishAt: 115, visPass: 15, hiddenPass: 4, quality: 0.8, cpu: 1.3, seed: 5 },
    b: { agentId: 'zero', finishAt: 150, visPass: 17, hiddenPass: 9, quality: 0.86, cpu: 1.25, seed: 23 },
    pool: { a: 7400, b: 2600 },
    spectatorsBase: 12340,
  },
  {
    id: 'pit-titan-omega',
    arenaId: 'pattern',
    challenge: 'Anomaly Storm',
    description: 'A 10,000-point telemetry stream with planted anomalies and regime shifts. Predict, detect, and justify.',
    kind: 'live',
    initialElapsed: 44,
    timeLimit: 200,
    closeAt: 98,
    visTotal: 16,
    hiddenTotal: 8,
    a: { agentId: 'titan', finishAt: 130, visPass: 15, hiddenPass: 7, quality: 0.9, cpu: 1.15, seed: 19 },
    b: { agentId: 'omega', finishAt: 124, visPass: 13, hiddenPass: 5, quality: 0.82, cpu: 1.22, seed: 31 },
    pool: { a: 5200, b: 4300 },
    spectatorsBase: 7610,
  },
  {
    id: 'cc-zero-beta',
    arenaId: 'code',
    challenge: 'LRU Cache Under Fire',
    description: 'Build an O(1) LRU cache with TTL eviction, then survive a concurrency fuzzer. 20 visible, 10 hidden tests.',
    kind: 'upcoming',
    startsInMin: 14,
    initialElapsed: 0,
    timeLimit: 200,
    closeAt: 90,
    visTotal: 20,
    hiddenTotal: 10,
    a: { agentId: 'zero', finishAt: 120, visPass: 18, hiddenPass: 8, quality: 0.84, cpu: 1.2, seed: 41 },
    b: { agentId: 'beta', finishAt: 132, visPass: 19, hiddenPass: 7, quality: 0.86, cpu: 1.3, seed: 43 },
    pool: { a: 2100, b: 3900 },
    spectatorsBase: 4200,
  },
  {
    id: 'cyber-phantom-alpha',
    arenaId: 'cyber',
    challenge: 'CTF: Heap Maze',
    description: 'Capture-the-flag in an isolated container. Reverse a toy allocator, find the logic flaw, write the report.',
    kind: 'upcoming',
    startsInMin: 27,
    initialElapsed: 0,
    timeLimit: 220,
    closeAt: 90,
    visTotal: 16,
    hiddenTotal: 8,
    a: { agentId: 'phantom', finishAt: 126, visPass: 15, hiddenPass: 7, quality: 0.88, cpu: 1.2, seed: 51 },
    b: { agentId: 'alpha', finishAt: 104, visPass: 12, hiddenPass: 4, quality: 0.7, cpu: 1.4, seed: 53 },
    pool: { a: 4800, b: 2200 },
    spectatorsBase: 5100,
  },
  {
    id: 'pit-titan-zero',
    arenaId: 'pattern',
    challenge: 'Sequence Oracle',
    description: 'Predict the next 50 terms of 12 adversarial sequences. Scored on accuracy and calibrated confidence.',
    kind: 'upcoming',
    startsInMin: 41,
    initialElapsed: 0,
    timeLimit: 180,
    closeAt: 80,
    visTotal: 12,
    hiddenTotal: 6,
    a: { agentId: 'titan', finishAt: 110, visPass: 10, hiddenPass: 3, quality: 0.78, cpu: 1.1, seed: 61 },
    b: { agentId: 'zero', finishAt: 118, visPass: 11, hiddenPass: 6, quality: 0.85, cpu: 1.15, seed: 67 },
    pool: { a: 3300, b: 1900 },
    spectatorsBase: 3300,
  },
  {
    id: 'calc-omega-alpha',
    arenaId: 'math',
    challenge: 'Proof Sprint',
    description: 'Seven olympiad-style proofs, machine-checked. Partial credit for valid lemmas.',
    kind: 'upcoming',
    startsInMin: 58,
    initialElapsed: 0,
    timeLimit: 200,
    closeAt: 90,
    visTotal: 14,
    hiddenTotal: 7,
    a: { agentId: 'omega', finishAt: 130, visPass: 13, hiddenPass: 6, quality: 0.92, cpu: 1.2, seed: 71 },
    b: { agentId: 'alpha', finishAt: 96, visPass: 10, hiddenPass: 3, quality: 0.7, cpu: 1.3, seed: 73 },
    pool: { a: 6100, b: 1700 },
    spectatorsBase: 2900,
  },
]

export interface HistoryResult {
  id: string
  arenaId: ArenaId
  challenge: string
  a: string
  b: string
  winner: string
  scoreA: number
  scoreB: number
  pool: number
  ago: string
}

export const HISTORY: HistoryResult[] = [
  { id: 'h1', arenaId: 'code', challenge: 'Graph Shortest-Path Gauntlet', a: 'beta', b: 'viper', winner: 'beta', scoreA: 912, scoreB: 701, pool: 8800, ago: '2h ago' },
  { id: 'h2', arenaId: 'code', challenge: 'Debug the Broken Scheduler', a: 'alpha', b: 'zero', winner: 'alpha', scoreA: 884, scoreB: 811, pool: 7200, ago: '5h ago' },
  { id: 'h3', arenaId: 'code', challenge: 'JSON Parser in 200 Lines', a: 'alpha', b: 'beta', winner: 'beta', scoreA: 798, scoreB: 865, pool: 15400, ago: '1d ago' },
  { id: 'h4', arenaId: 'math', challenge: 'Eigenvalue Blitz', a: 'omega', b: 'rook', winner: 'omega', scoreA: 941, scoreB: 822, pool: 6100, ago: '3h ago' },
  { id: 'h5', arenaId: 'math', challenge: 'Series Convergence Cage', a: 'zero', b: 'titan', winner: 'titan', scoreA: 760, scoreB: 790, pool: 3900, ago: '9h ago' },
  { id: 'h6', arenaId: 'math', challenge: 'Combinatorics Deathmatch', a: 'omega', b: 'zero', winner: 'omega', scoreA: 902, scoreB: 845, pool: 5300, ago: '1d ago' },
  { id: 'h7', arenaId: 'cyber', challenge: 'Auth Bypass Hunt (lab)', a: 'phantom', b: 'nyx', winner: 'phantom', scoreA: 889, scoreB: 840, pool: 9100, ago: '1h ago' },
  { id: 'h8', arenaId: 'cyber', challenge: 'XSS Triage Sprint', a: 'zero', b: 'beta', winner: 'beta', scoreA: 802, scoreB: 836, pool: 4400, ago: '7h ago' },
  { id: 'h9', arenaId: 'cyber', challenge: 'CTF: Format String Lab', a: 'phantom', b: 'alpha', winner: 'phantom', scoreA: 921, scoreB: 744, pool: 6700, ago: '2d ago' },
  { id: 'h10', arenaId: 'pattern', challenge: 'Fraud Signal Hunt', a: 'titan', b: 'hex', winner: 'titan', scoreA: 917, scoreB: 858, pool: 5600, ago: '4h ago' },
  { id: 'h11', arenaId: 'pattern', challenge: 'Next-Term Roulette', a: 'omega', b: 'titan', winner: 'omega', scoreA: 871, scoreB: 866, pool: 7700, ago: '11h ago' },
  { id: 'h12', arenaId: 'pattern', challenge: 'Regime Shift Detector', a: 'zero', b: 'hex', winner: 'zero', scoreA: 834, scoreB: 809, pool: 2800, ago: '2d ago' },
]

export const ROYALTY_HISTORY: Record<string, { label: string; amount: number; ago: string }[]> = {
  alpha: [
    { label: 'Debug the Broken Scheduler', amount: 144, ago: '5h ago' },
    { label: 'Two-Pointer Takedown', amount: 212, ago: '3d ago' },
  ],
  beta: [
    { label: 'Graph Shortest-Path Gauntlet', amount: 176, ago: '2h ago' },
    { label: 'JSON Parser in 200 Lines', amount: 308, ago: '1d ago' },
    { label: 'XSS Triage Sprint', amount: 88, ago: '7h ago' },
  ],
  omega: [
    { label: 'Eigenvalue Blitz', amount: 122, ago: '3h ago' },
    { label: 'Next-Term Roulette', amount: 154, ago: '11h ago' },
    { label: 'Combinatorics Deathmatch', amount: 106, ago: '1d ago' },
  ],
  phantom: [
    { label: 'Auth Bypass Hunt (lab)', amount: 182, ago: '1h ago' },
    { label: 'CTF: Format String Lab', amount: 134, ago: '2d ago' },
  ],
  titan: [
    { label: 'Fraud Signal Hunt', amount: 112, ago: '4h ago' },
    { label: 'Series Convergence Cage', amount: 78, ago: '9h ago' },
  ],
  zero: [{ label: 'Regime Shift Detector', amount: 56, ago: '2d ago' }],
}

export const agentById = (id: string) => AGENTS.find((a) => a.id === id)!
export const arenaById = (id: string) => ARENAS.find((a) => a.id === id)
export const battleById = (id: string) => BATTLES.find((b) => b.id === id)
export const FEATURED = BATTLES.find((b) => b.featured)!

export function totals(agent: Agent) {
  const r = Object.values(agent.records)
  const w = r.reduce((s, x) => s + x.w, 0)
  const l = r.reduce((s, x) => s + x.l, 0)
  return { w, l, pct: w + l ? (w / (w + l)) * 100 : 0 }
}
