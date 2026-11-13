// ─────────────────────────────────────────────────────────────
// Deterministic battle simulation (DEMO MODE).
// Given a battle definition and an elapsed sim-time, every number on
// screen — progress, tests, scores, logs, market flow — is reproducible.
// Progress (how far along) and Performance (how good) are separate:
// a faster agent is NOT automatically the winner. Hidden tests decide.
// ─────────────────────────────────────────────────────────────
import type { AgentPlan, ArenaId, BattleDef, Side } from '../data/seed'
import { DISTRIBUTABLE } from '../data/seed'
import { clamp, hash, mulberry32 } from './utils'

export const JUDGE_SECONDS = 10

export type Phase = 'pre' | 'open' | 'locked' | 'judging' | 'final'
export type AgentStatus = 'STANDBY' | 'EXECUTING' | 'SUBMITTED' | 'JUDGING' | 'WINNER' | 'DEFEATED'

export const judgeStart = (b: BattleDef) => Math.max(b.a.finishAt, b.b.finishAt)
export const endAt = (b: BattleDef) => judgeStart(b) + JUDGE_SECONDS

// ── progress curves ──────────────────────────────────────────
const curveCache = new Map<string, number[]>()
const SEGMENTS = 12

function knots(plan: AgentPlan) {
  const key = `${plan.agentId}:${plan.seed}:${plan.finishAt}`
  let k = curveCache.get(key)
  if (!k) {
    const rng = mulberry32(plan.seed * 7919)
    const w = Array.from({ length: SEGMENTS }, () => 0.35 + rng() * 1.3)
    const sum = w.reduce((s, x) => s + x, 0)
    k = [0]
    let acc = 0
    for (const x of w) {
      acc += x
      k.push((acc / sum) * 100)
    }
    curveCache.set(key, k)
  }
  return k
}

export function progressAt(plan: AgentPlan, t: number) {
  if (t <= 0) return 0
  if (t >= plan.finishAt) return 100
  const k = knots(plan)
  const x = (t / plan.finishAt) * SEGMENTS
  const i = Math.floor(x)
  return k[i] + (k[i + 1] - k[i]) * (x - i)
}

export const testsFor = (plan: AgentPlan, p: number) => Math.floor(plan.visPass * Math.pow(p / 100, 0.6))

const hiddenCache = new Map<string, boolean[]>()
export function hiddenResults(plan: AgentPlan, total: number) {
  const key = `${plan.agentId}:${plan.seed}:${total}`
  let r = hiddenCache.get(key)
  if (!r) {
    r = Array.from({ length: total }, (_, i) => i < plan.hiddenPass)
    const rng = mulberry32(plan.seed * 104729)
    for (let i = r.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1))
      ;[r[i], r[j]] = [r[j], r[i]]
    }
    hiddenCache.set(key, r)
  }
  return r
}

export function finalScore(b: BattleDef, plan: AgentPlan) {
  const correctness = ((plan.visPass + plan.hiddenPass) / (b.visTotal + b.hiddenTotal)) * 700
  const efficiency = plan.quality * 200
  const speed = 100 * (1 - 0.5 * (plan.finishAt / b.timeLimit))
  return Math.round(correctness + efficiency + speed)
}

export const winnerOf = (b: BattleDef): Side => (finalScore(b, b.a) >= finalScore(b, b.b) ? 'a' : 'b')

export interface AgentLive {
  progress: number
  tests: number
  hiddenDone: number
  hiddenPassed: number
  score: number
  execTime: number
  status: AgentStatus
}

export function agentAt(b: BattleDef, side: Side, t: number, started: boolean): AgentLive {
  const plan = b[side]
  const p = progressAt(plan, t)
  const tests = testsFor(plan, p)
  const js = judgeStart(b)
  const hiddenDone = t <= js ? 0 : Math.min(b.hiddenTotal, Math.floor(((t - js) / JUDGE_SECONDS) * b.hiddenTotal))
  const hr = hiddenResults(plan, b.hiddenTotal)
  const hiddenPassed = hr.slice(0, hiddenDone).filter(Boolean).length
  const live = Math.round(plan.quality * (300 + 6 * p))
  const fin = finalScore(b, plan)
  const score = hiddenDone > 0 ? Math.round(live + (fin - live) * (hiddenDone / b.hiddenTotal)) : live
  let status: AgentStatus = 'EXECUTING'
  if (!started && b.kind === 'upcoming') status = 'STANDBY'
  else if (t >= endAt(b)) status = winnerOf(b) === side ? 'WINNER' : 'DEFEATED'
  else if (t >= js) status = 'JUDGING'
  else if (t >= plan.finishAt) status = 'SUBMITTED'
  return {
    progress: p,
    tests,
    hiddenDone,
    hiddenPassed,
    score: t >= endAt(b) ? fin : score,
    execTime: Math.min(t, plan.finishAt) * plan.cpu,
    status,
  }
}

export function phaseAt(b: BattleDef, t: number, started: boolean): Phase {
  if (!started && b.kind === 'upcoming') return 'pre'
  if (t >= endAt(b)) return 'final'
  if (t >= judgeStart(b)) return 'judging'
  if (t >= b.closeAt) return 'locked'
  return 'open'
}

// ── market simulation ────────────────────────────────────────
const HANDLES = [
  'neonwolf_77', 'byte_bandit', 'sigma.grind', 'cagefan_09', 'ghostline', 'rustacean', 'deltaV', 'mx_pain', 'redcorner',
  'oddsgoblin', 'tensor_tony', 'lambda.lucy', 'hexqueen', 'nullpointer', 'quantdad', 'sudo_sam', 'kernelpanic', 'zer0day_zed',
  'overfit.olly', 'gradient_gabe', 'pixelpriest', 'stackoverflowed', 'async_annie', 'bitflip',
]

export interface MarketEvent {
  t: number
  side: Side
  amount: number
  user: string
}

export interface Market {
  A: number
  B: number
  events: MarketEvent[]
  history: { t: number; p: number }[]
}

export function marketAt(b: BattleDef, t: number): Market {
  const rng = mulberry32(hash(b.id + ':market'))
  let A = b.pool.a
  let B = b.pool.b
  const events: MarketEvent[] = []
  const history = [{ t: 0, p: A / (A + B) }]
  const until = Math.min(t, b.closeAt)
  for (let s = 2; s <= until; s += 2) {
    const r1 = rng(), r2 = rng(), r3 = rng()
    const pa = progressAt(b.a, s), pb = progressAt(b.b, s)
    const sa = b.a.quality * (300 + 6 * pa), sb = b.b.quality * (300 + 6 * pb)
    // crowd chases the progress leader, sharp money follows performance
    const lean = clamp(0.5 + (pa - pb) / 220 + (sa - sb) / 1400, 0.18, 0.82)
    const side: Side = r1 < lean ? 'a' : 'b'
    const amount = Math.round((40 + r2 * r2 * 900) / 10) * 10
    if (side === 'a') A += amount
    else B += amount
    events.push({ t: s, side, amount, user: HANDLES[Math.floor(r3 * HANDLES.length)] })
    history.push({ t: s, p: A / (A + B) })
  }
  return { A, B, events, history }
}

/** Parimutuel odds: distributable pool ÷ stake on that side. */
export function oddsFor(total: number, sideStake: number) {
  if (sideStake <= 0) return 0
  return (total * DISTRIBUTABLE) / sideStake
}

export function estimate(total: number, sideStake: number, stake: number) {
  if (stake <= 0) return { odds: oddsFor(total, sideStake), payout: 0, profit: 0 }
  const odds = oddsFor(total + stake, sideStake + stake)
  const payout = stake * odds
  return { odds, payout, profit: payout - stake }
}

export const spectatorsAt = (b: BattleDef, t: number) =>
  Math.round(b.spectatorsBase + t * 41 + Math.sin(t / 6) * 260 + Math.sin(t / 2.3) * 70)

// ── execution logs ───────────────────────────────────────────
export type LogKind = 'sys' | 'info' | 'ok' | 'warn' | 'err'
export interface LogLine {
  id: string
  t: number
  kind: LogKind
  text: string
}

const TEMPLATES: Record<ArenaId, string[]> = {
  code: [
    'parsing problem spec → 4 constraints, 2 invariants',
    'drafting approach: sliding window + token bucket',
    'compiling limiter.rs (opt-level=3)',
    'running local fuzz harness (n=500)',
    'refactor: O(n log n) → O(n) amortised',
    'profiling hot path: 41% in hash lookup',
    'patching edge case: empty window',
    'lint pass ✓ 0 warnings',
    'peak memory 38.2 MB',
    'writing property tests for clock skew',
    'swapping Mutex → lock-free ring buffer',
    'benchmark: 1.12M req/s on 8 threads',
  ],
  cyber: [
    'enumerating endpoints in lab replica (scope: sandbox)',
    'fingerprinting stack: php 7.4 / mysql 5.7',
    'static analysis: 3 tainted sinks found',
    'flag: unsanitised param `id` in /account',
    'classifying finding: CWE-89 (SQL injection)',
    'tracing data flow request → query builder',
    'checking session handling for fixation',
    'draft report: severity HIGH · CVSS 8.6',
    'proposing fix: parameterised statements',
    'verifying patch against replica build',
    'cross-referencing OWASP ASVS 5.3.4',
    'reviewing auth middleware ordering',
  ],
  math: [
    'parsing: ∫ x²·eˣ dx',
    'applying integration by parts (twice)',
    'symbolic simplification …',
    'numeric check: quadrature err < 1e-9',
    'solving system: 4 eqs / 4 unknowns',
    'eigen-decomposition of 3×3 matrix',
    "evaluating limit via L'Hôpital",
    'proof step 4/7: induction hypothesis',
    'cross-checking with Taylor expansion',
    'ratio test → series converges',
    'factoring quartic over ℚ',
    'verifying boundary conditions',
  ],
  pattern: [
    'ingesting sequence (n=10,000)',
    'fitting ARIMA(2,1,1)',
    'detected periodicity: 17',
    'z-score anomaly at idx 4,412 (σ=4.8)',
    'bootstrapping 95% confidence intervals',
    'isolation forest: 12 outliers flagged',
    'predicting next 5 terms …',
    'Fourier peak at 0.0588 Hz',
    'chi-square test p = 0.003',
    'clustering residuals (k=3)',
    'regime shift detected at t=7,031',
    'calibrating confidence (ECE 0.021)',
  ],
}

const WARNINGS: Record<ArenaId, string[]> = {
  code: ['test 11 flaky — retrying with fixed seed', 'timeout risk: p99 latency 212ms', 'race detected in refill() — re-locking'],
  cyber: ['false positive discarded: escaped input', 'rate limit on lab proxy — backing off', 'ambiguous CWE mapping — re-evaluating'],
  math: ['branch cut ambiguity — choosing principal', 'numeric drift 1e-6 — increasing precision', 'lemma 3 unproven — backtracking'],
  pattern: ['overfitting warning: val loss ↑', 'seasonality unstable — widening window', 'heavy tails — switching to robust z'],
}

const HIDDEN_FAILS = ['TIMEOUT on n=10⁶', 'wrong answer on edge case', 'memory limit exceeded', 'race under contention', 'precision loss']

export function logsAt(b: BattleDef, side: Side, t: number): LogLine[] {
  const plan = b[side]
  const rng = mulberry32(plan.seed * 31337)
  const tmpl = TEMPLATES[b.arenaId]
  const warns = WARNINGS[b.arenaId]
  const out: LogLine[] = [
    { id: '0s', t: 0, kind: 'sys', text: 'sandbox up · net=isolated · seccomp=strict' },
    { id: '0b', t: 0, kind: 'sys', text: `challenge loaded: ${b.challenge}` },
  ]
  let prevTests = 0
  let prevHidden = 0
  const js = judgeStart(b)
  const hr = hiddenResults(plan, b.hiddenTotal)
  const T = Math.floor(t)
  for (let s = 1; s <= T; s++) {
    const r1 = rng(), r2 = rng(), r3 = rng()
    if (s === js + 1) out.push({ id: `${s}judge`, t: s, kind: 'sys', text: '⚖ JUDGE: running hidden test suite' })
    if (s <= plan.finishAt) {
      const tests = testsFor(plan, progressAt(plan, s))
      for (let k = prevTests + 1; k <= tests; k++)
        out.push({ id: `${s}t${k}`, t: s, kind: 'ok', text: `✓ visible test ${String(k).padStart(2, '0')}/${b.visTotal} passed (${Math.round(4 + r2 * 60)}ms)` })
      prevTests = tests
      if (r1 < 0.24) out.push({ id: `${s}i`, t: s, kind: 'info', text: tmpl[Math.floor(r2 * tmpl.length)] })
      else if (r1 > 0.955) out.push({ id: `${s}w`, t: s, kind: 'warn', text: `⚠ ${warns[Math.floor(r3 * warns.length)]}` })
      if (s === Math.ceil(plan.finishAt))
        out.push({ id: `${s}sub`, t: s, kind: 'sys', text: `▶ SOLUTION SUBMITTED · ${tests}/${b.visTotal} visible · awaiting hidden suite` })
    } else if (s > js) {
      const done = Math.min(b.hiddenTotal, Math.floor(((s - js) / JUDGE_SECONDS) * b.hiddenTotal))
      for (let k = prevHidden; k < done; k++) {
        const pass = hr[k]
        out.push({
          id: `${s}h${k}`,
          t: s,
          kind: pass ? 'ok' : 'err',
          text: pass
            ? `hidden #${String(k + 1).padStart(2, '0')} ✓ passed`
            : `hidden #${String(k + 1).padStart(2, '0')} ✗ FAILED — ${HIDDEN_FAILS[(k + plan.seed) % HIDDEN_FAILS.length]}`,
        })
      }
      prevHidden = done
    } else if (s === Math.ceil(plan.finishAt) + 2 && s < js) {
      out.push({ id: `${s}wait`, t: s, kind: 'sys', text: '… idle — waiting for opponent to submit' })
    }
  }
  return out.slice(-60)
}
