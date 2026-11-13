import { useMemo } from 'react'
import { agentById, battleById, type BattleDef } from '../data/seed'
import { agentAt, endAt, marketAt, oddsFor, phaseAt, spectatorsAt } from './sim'
import { elapsedOf, roundKey, useStore, userStakes } from '../store/store'

export function useBattle(id: string) {
  const { state, now } = useStore()
  const battle = battleById(id) as BattleDef | undefined
  return useMemo(() => {
    if (!battle) return null
    const clock = state.clocks[id]
    const started = clock?.startedAt != null
    const round = clock?.round ?? 1
    const t = elapsedOf(battle, clock, now)
    const phase = phaseAt(battle, t, started)
    const a = agentAt(battle, 'a', t, started)
    const b = agentAt(battle, 'b', t, started)
    const market = marketAt(battle, t)
    const mine = userStakes(state.bets, id, round)
    const A = market.A + mine.a
    const B = market.B + mine.b
    const total = A + B
    const key = roundKey(id, round)
    const myBet = state.bets.find((x) => x.battleId === id && x.round === round)
    const settlement = state.settlements[key]
    const startAt = state.epoch + (battle.startsInMin ?? 0) * 60_000
    return {
      battle,
      agentA: agentById(battle.a.agentId),
      agentB: agentById(battle.b.agentId),
      clock,
      started,
      round,
      t,
      end: endAt(battle),
      phase,
      a,
      b,
      market,
      A,
      B,
      total,
      oddsA: oddsFor(total, A),
      oddsB: oddsFor(total, B),
      probA: A / total,
      probB: B / total,
      spectators: spectatorsAt(battle, t),
      key,
      myBet,
      settlement,
      countdown: Math.max(0, (startAt - now) / 1000),
      speed: clock?.speed ?? 1,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [battle, state.clocks, state.bets, state.settlements, state.epoch, now, id])
}

export type BattleView = NonNullable<ReturnType<typeof useBattle>>
