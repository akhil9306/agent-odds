import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { BATTLES, DISTRIBUTABLE, FEES, STARTING_BALANCE, agentById, battleById, type BattleDef, type Side } from '../data/seed'
import { endAt, estimate, marketAt, phaseAt, winnerOf } from '../lib/sim'
import { fmt, uid } from '../lib/utils'

// ── types ────────────────────────────────────────────────────
export interface Clock {
  round: number
  startedAt: number | null
  offset: number
  speed: number
}

export interface Bet {
  id: string
  battleId: string
  round: number
  side: Side
  agentId: string
  amount: number
  oddsAtEntry: number
  estPayout: number
  placedAt: number
  status: 'active' | 'won' | 'lost'
  payout?: number
  settledAt?: number
}

export interface Settlement {
  battleId: string
  round: number
  winner: Side
  winnerAgentId: string
  totalPool: number
  fee: number
  royalty: number
  distributable: number
  winnerStake: number
  userStake: number
  userPayout: number
  userWon: boolean | null
  settledAt: number
  revealed: boolean
}

export interface RoyaltyEntry {
  battleId: string
  label: string
  amount: number
  at: number
}

interface State {
  balance: number
  wallet: string | null
  bets: Bet[]
  clocks: Record<string, Clock>
  settlements: Record<string, Settlement>
  royalties: Record<string, RoyaltyEntry[]>
  recordDelta: Record<string, { w: number; l: number }>
  epoch: number
}

export interface Toast {
  id: string
  title: string
  body?: string
  tone: 'win' | 'loss' | 'info' | 'bet'
}

const KEY = 'agentarena:v1'

const initial = (): State => ({
  balance: STARTING_BALANCE,
  wallet: null,
  bets: [],
  clocks: {},
  settlements: {},
  royalties: {},
  recordDelta: {},
  epoch: Date.now(),
})

function load(): State {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { ...initial(), ...JSON.parse(raw) }
  } catch {
    /* storage unavailable */
  }
  return initial()
}

export const roundKey = (battleId: string, round: number) => `${battleId}#${round}`

export function elapsedOf(b: BattleDef, c: Clock | undefined, now: number) {
  const base = b.kind === 'live' ? b.initialElapsed : 0
  if (!c) return base
  if (c.startedAt == null) return c.offset
  return Math.min(endAt(b), c.offset + ((now - c.startedAt) / 1000) * c.speed)
}

// ── context ──────────────────────────────────────────────────
interface Ctx {
  state: State
  now: number
  toasts: Toast[]
  dismissToast: (id: string) => void
  pushToast: (t: Omit<Toast, 'id'>) => void
  startBattle: (id: string) => void
  setSpeed: (id: string, speed: number) => void
  rematch: (id: string, speed?: number) => void
  placeBet: (id: string, side: Side, amount: number) => { ok: boolean; error?: string; bet?: Bet }
  markRevealed: (key: string) => void
  connectWallet: () => void
  disconnectWallet: () => void
  reset: () => void
}

const StoreCtx = createContext<Ctx | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(load)
  const [now, setNow] = useState(Date.now())
  const [toasts, setToasts] = useState<Toast[]>([])
  const ref = useRef(state)
  ref.current = state

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state))
    } catch {
      /* ignore */
    }
  }, [state])

  const pushToast = useCallback((t: Omit<Toast, 'id'>) => {
    const id = uid()
    setToasts((ts) => [...ts.slice(-3), { ...t, id }])
    setTimeout(() => setToasts((ts) => ts.filter((x) => x.id !== id)), 5200)
  }, [])
  const dismissToast = useCallback((id: string) => setToasts((ts) => ts.filter((x) => x.id !== id)), [])

  // global clock + settlement engine
  useEffect(() => {
    const iv = setInterval(() => {
      const n = Date.now()
      setNow(n)
      const s = ref.current
      let next: State | null = null
      for (const [id, clock] of Object.entries(s.clocks)) {
        if (clock.startedAt == null) continue
        const b = battleById(id)
        if (!b) continue
        const key = roundKey(id, clock.round)
        if ((next ?? s).settlements[key]) continue
        if (elapsedOf(b, clock, n) < endAt(b)) continue
        next = settle(next ?? s, b, clock.round, n, pushToast)
      }
      if (next) setState(next)
    }, 250)
    return () => clearInterval(iv)
  }, [pushToast])

  const update = useCallback((fn: (s: State) => State) => setState((s) => fn(s)), [])

  const startBattle = useCallback(
    (id: string) =>
      update((s) => {
        const b = battleById(id)
        if (!b) return s
        const c = s.clocks[id]
        if (c?.startedAt != null) return s
        return {
          ...s,
          clocks: {
            ...s.clocks,
            [id]: { round: c?.round ?? 1, startedAt: Date.now(), offset: b.kind === 'live' ? b.initialElapsed : 0, speed: c?.speed ?? 1 },
          },
        }
      }),
    [update],
  )

  const setSpeed = useCallback(
    (id: string, speed: number) =>
      update((s) => {
        const b = battleById(id)
        const c = s.clocks[id]
        if (!b || !c || c.startedAt == null) return s
        const n = Date.now()
        return { ...s, clocks: { ...s.clocks, [id]: { ...c, offset: elapsedOf(b, c, n), startedAt: n, speed } } }
      }),
    [update],
  )

  const rematch = useCallback(
    (id: string, speed?: number) =>
      update((s) => {
        const b = battleById(id)
        if (!b) return s
        const c = s.clocks[id]
        const round = (c?.round ?? 0) + 1
        return {
          ...s,
          clocks: {
            ...s.clocks,
            [id]: { round, startedAt: Date.now(), offset: b.kind === 'live' ? b.initialElapsed : 0, speed: speed ?? c?.speed ?? 1 },
          },
        }
      }),
    [update],
  )

  const placeBet = useCallback(
    (id: string, side: Side, amount: number) => {
      const s = ref.current
      const b = battleById(id)
      if (!b) return { ok: false, error: 'Unknown battle' }
      const clock = s.clocks[id]
      const round = clock?.round ?? 1
      const key = roundKey(id, round)
      const amt = Math.floor(amount)
      if (!amt || amt <= 0) return { ok: false, error: 'Enter an amount greater than 0' }
      if (amt > s.balance) return { ok: false, error: 'Not enough virtual credits' }
      const t = elapsedOf(b, clock, Date.now())
      const phase = phaseAt(b, t, clock?.startedAt != null)
      if (phase !== 'open' && phase !== 'pre') return { ok: false, error: 'Betting is closed for this match' }
      if (s.bets.some((x) => roundKey(x.battleId, x.round) === key))
        return { ok: false, error: 'You already hold a position on this match' }
      const m = marketAt(b, t)
      const mine = userStakes(s.bets, id, round)
      const total = m.A + m.B + mine.a + mine.b
      const sideStake = (side === 'a' ? m.A : m.B) + mine[side]
      const est = estimate(total, sideStake, amt)
      const bet: Bet = {
        id: uid(),
        battleId: id,
        round,
        side,
        agentId: b[side].agentId,
        amount: amt,
        oddsAtEntry: est.odds,
        estPayout: est.payout,
        placedAt: Date.now(),
        status: 'active',
      }
      setState((p) => ({ ...p, balance: p.balance - amt, bets: [bet, ...p.bets] }))
      pushToast({ tone: 'bet', title: 'BET PLACED', body: `${fmt(amt)} AC on ${agentById(bet.agentId).name} @ ${est.odds.toFixed(2)}x` })
      return { ok: true, bet }
    },
    [pushToast],
  )

  const markRevealed = useCallback(
    (key: string) =>
      update((s) => (s.settlements[key] ? { ...s, settlements: { ...s.settlements, [key]: { ...s.settlements[key], revealed: true } } } : s)),
    [update],
  )

  const connectWallet = useCallback(() => {
    const addr = '0xDEMO' + Math.random().toString(16).slice(2, 6).toUpperCase() + '…A12C'
    update((s) => ({ ...s, wallet: addr }))
    pushToast({ tone: 'info', title: 'DEMO WALLET CONNECTED', body: 'Virtual credits only — no real funds, no blockchain.' })
  }, [update, pushToast])

  const disconnectWallet = useCallback(() => update((s) => ({ ...s, wallet: null })), [update])

  const reset = useCallback(() => {
    try {
      localStorage.removeItem(KEY)
    } catch {
      /* ignore */
    }
    setState(initial())
    pushToast({ tone: 'info', title: 'DEMO RESET', body: `Balance restored to ${fmt(STARTING_BALANCE)} AC. All matches rewound.` })
  }, [pushToast])

  const value = useMemo<Ctx>(
    () => ({ state, now, toasts, dismissToast, pushToast, startBattle, setSpeed, rematch, placeBet, markRevealed, connectWallet, disconnectWallet, reset }),
    [state, now, toasts, dismissToast, pushToast, startBattle, setSpeed, rematch, placeBet, markRevealed, connectWallet, disconnectWallet, reset],
  )
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>
}

export function useStore() {
  const c = useContext(StoreCtx)
  if (!c) throw new Error('StoreProvider missing')
  return c
}

export function userStakes(bets: Bet[], battleId: string, round: number) {
  const r = { a: 0, b: 0 }
  for (const x of bets) if (x.battleId === battleId && x.round === round) r[x.side] += x.amount
  return r
}

function settle(s: State, b: BattleDef, round: number, n: number, toast: (t: Omit<Toast, 'id'>) => void): State {
  const key = roundKey(b.id, round)
  const winner = winnerOf(b)
  const loser: Side = winner === 'a' ? 'b' : 'a'
  const m = marketAt(b, b.closeAt)
  const mine = userStakes(s.bets, b.id, round)
  const totalPool = m.A + m.B + mine.a + mine.b
  const winnerStake = (winner === 'a' ? m.A : m.B) + mine[winner]
  const distributable = totalPool * DISTRIBUTABLE
  let userPayout = 0
  let userStake = 0
  const bets = s.bets.map((x) => {
    if (x.battleId !== b.id || x.round !== round || x.status !== 'active') return x
    userStake += x.amount
    const won = x.side === winner
    const payout = won ? Math.round((x.amount / winnerStake) * distributable) : 0
    userPayout += payout
    return { ...x, status: won ? ('won' as const) : ('lost' as const), payout, settledAt: n }
  })
  const winnerAgentId = b[winner].agentId
  const royalty = Math.round(totalPool * FEES.royalty)
  const settlement: Settlement = {
    battleId: b.id,
    round,
    winner,
    winnerAgentId,
    totalPool: Math.round(totalPool),
    fee: Math.round(totalPool * FEES.platform),
    royalty,
    distributable: Math.round(distributable),
    winnerStake: Math.round(winnerStake),
    userStake,
    userPayout,
    userWon: userStake ? userPayout > 0 : null,
    settledAt: n,
    revealed: false,
  }
  const rd = { ...s.recordDelta }
  const wId = winnerAgentId
  const lId = b[loser].agentId
  rd[wId] = { w: (rd[wId]?.w ?? 0) + 1, l: rd[wId]?.l ?? 0 }
  rd[lId] = { w: rd[lId]?.w ?? 0, l: (rd[lId]?.l ?? 0) + 1 }

  const wName = agentById(wId).name
  if (userStake) {
    if (userPayout > 0) toast({ tone: 'win', title: `${wName.toUpperCase()} WINS — YOU CALLED IT`, body: `+${fmt(userPayout)} AC credited to your virtual balance.` })
    else toast({ tone: 'loss', title: `${wName.toUpperCase()} WINS`, body: `Your prediction missed. ${fmt(userStake)} AC lost.` })
  } else toast({ tone: 'info', title: `${wName.toUpperCase()} WINS`, body: b.challenge })

  return {
    ...s,
    balance: s.balance + userPayout,
    bets,
    settlements: { ...s.settlements, [key]: settlement },
    royalties: {
      ...s.royalties,
      [wId]: [{ battleId: b.id, label: b.challenge, amount: royalty, at: n }, ...(s.royalties[wId] ?? [])],
    },
    recordDelta: rd,
  }
}

export const ALL_BATTLES = BATTLES
