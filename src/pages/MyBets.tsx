import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Coins, Inbox, Lock, Skull, TrendingDown, TrendingUp, Trophy } from 'lucide-react'
import { STARTING_BALANCE, agentById, arenaById, battleById } from '../data/seed'
import { navigate } from '../lib/router'
import { cn, fmt } from '../lib/utils'
import { useStore, type Bet } from '../store/store'
import { AgentAvatar } from '../components/AgentAvatar'
import { AnimatedNumber, Badge, Button, SectionTitle } from '../components/ui/primitives'
import { useDemo } from '../components/Layout'

type Filter = 'all' | 'active' | 'won' | 'lost'

export default function MyBets() {
  const { state } = useStore()
  const [f, setF] = useState<Filter>('all')
  const demo = useDemo()
  const bets = state.bets
  const shown = f === 'all' ? bets : bets.filter((b) => b.status === f)
  const active = bets.filter((b) => b.status === 'active')
  const won = bets.filter((b) => b.status === 'won')
  const lost = bets.filter((b) => b.status === 'lost')
  const exposure = active.reduce((s, b) => s + b.amount, 0)
  const received = won.reduce((s, b) => s + (b.payout ?? 0), 0)
  const net = state.balance + exposure - STARTING_BALANCE

  const counts: Record<Filter, number> = { all: bets.length, active: active.length, won: won.length, lost: lost.length }

  return (
    <div className="mx-auto min-h-screen max-w-[1200px] px-4 py-16 sm:px-6">
      <SectionTitle kicker="Your corner" title={<>My <span className="text-blood glow-blood">bets</span></>} />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Summary label="Virtual balance" icon={<Coins className="h-4 w-4 text-gold" />} value={<AnimatedNumber value={state.balance} />} accent="#ffc531" />
        <Summary label="Active exposure" icon={<Lock className="h-4 w-4 text-ember" />} value={<AnimatedNumber value={exposure} />} accent="#ff6a13" />
        <Summary label="Credits received" icon={<Trophy className="h-4 w-4 text-toxic" />} value={<AnimatedNumber value={received} />} accent="#39ff88" />
        <Summary
          label="Net P/L (settled)"
          icon={net >= 0 ? <TrendingUp className="h-4 w-4 text-toxic" /> : <TrendingDown className="h-4 w-4 text-blood" />}
          value={<span className={net >= 0 ? 'text-toxic' : 'text-blood'}>{net >= 0 ? '+' : '−'}{fmt(Math.abs(net))}</span>}
          accent={net >= 0 ? '#39ff88' : '#ff1f3d'}
        />
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-1 border border-white/10 bg-coal p-1">
          {(['all', 'active', 'won', 'lost'] as Filter[]).map((x) => (
            <button key={x} onClick={() => setF(x)} className={cn('relative px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] transition-colors', f === x ? 'text-white' : 'text-bone/50 hover:text-bone')}>
              {f === x && <motion.span layoutId="bet-filter" className="absolute inset-0 bg-blood" />}
              <span className="relative">{x} <span className="font-mono opacity-70">{counts[x]}</span></span>
            </button>
          ))}
        </div>
        <span className="font-mono text-[10px] tracking-[0.2em] text-gold/70">ALL CREDITS VIRTUAL · NON-REDEEMABLE</span>
      </div>

      <div className="mt-5 space-y-3">
        <AnimatePresence mode="popLayout">
          {shown.map((b) => <BetRow key={b.id} bet={b} />)}
        </AnimatePresence>
        {shown.length === 0 && (
          <div className="border border-dashed border-white/10 py-20 text-center">
            <Inbox className="mx-auto h-10 w-10 text-ash" />
            <div className="mt-4 font-display text-3xl uppercase">{f === 'all' ? 'No predictions yet' : `No ${f} predictions`}</div>
            <p className="mt-2 text-sm text-bone/50">Step into the cage and back a fighter.</p>
            <div className="mt-6 flex justify-center gap-3">
              <Button variant="blood" onClick={() => navigate('/live')}>Live battles <ArrowRight className="h-4 w-4" /></Button>
              <Button variant="toxic" onClick={demo}>Demo mode</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Summary({ label, value, icon, accent }: { label: string; value: React.ReactNode; icon: React.ReactNode; accent: string }) {
  return (
    <div className="steel relative overflow-hidden border border-edge p-5">
      <div className="absolute inset-x-0 top-0 h-[2px]" style={{ background: accent }} />
      <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-ash">{icon}{label}</div>
      <div className="mt-2 font-display text-4xl tracking-wide">{value} <span className="text-lg text-ash">AC</span></div>
    </div>
  )
}

function BetRow({ bet }: { bet: Bet }) {
  const battle = battleById(bet.battleId)!
  const agent = agentById(bet.agentId)
  const opp = agentById(bet.side === 'a' ? battle.b.agentId : battle.a.agentId)
  const arena = arenaById(battle.arenaId)!
  const color = bet.status === 'won' ? '#39ff88' : bet.status === 'lost' ? '#ff1f3d' : '#ff6a13'
  return (
    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }} className="steel relative grid gap-4 border border-edge p-4 sm:grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,1fr))_auto] sm:items-center">
      <div className="absolute inset-y-0 left-0 w-1" style={{ background: color }} />
      <div className="flex min-w-0 items-center gap-3 pl-2">
        <AgentAvatar agent={agent} size={46} glow={bet.status !== 'lost'} dim={bet.status === 'lost'} />
        <div className="min-w-0">
          <div className="truncate font-display text-xl uppercase tracking-wide" style={{ color: agent.color }}>{agent.name} <span className="text-sm text-ash">vs {opp.short}</span></div>
          <div className="truncate font-mono text-[10px] text-ash">{arena.short} · {battle.challenge} · R{bet.round} · {new Date(bet.placedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
      </div>
      <Cell k="Committed" v={`${fmt(bet.amount)} AC`} />
      <Cell k={bet.status === 'active' ? 'Potential payout' : 'Odds at entry'} v={bet.status === 'active' ? `${fmt(bet.estPayout)} AC` : `${bet.oddsAtEntry.toFixed(2)}x`} />
      <Cell k="Received" v={bet.status === 'active' ? '—' : bet.status === 'won' ? `+${fmt(bet.payout ?? 0)} AC` : '0 AC'} color={bet.status === 'won' ? '#39ff88' : bet.status === 'lost' ? '#ff1f3d' : undefined} />
      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <Badge className="text-[10px]" style={{ borderColor: `${color}66`, color }}>
          {bet.status === 'won' ? <Trophy className="h-3 w-3" /> : bet.status === 'lost' ? <Skull className="h-3 w-3" /> : <span className="live-dot h-1.5 w-1.5 rounded-full" style={{ background: color }} />}
          {bet.status}
        </Badge>
        <Button variant="ghost" size="sm" onClick={() => navigate(`/battle/${battle.id}`)}>View <ArrowRight className="h-3.5 w-3.5" /></Button>
      </div>
    </motion.div>
  )
}

function Cell({ k, v, color }: { k: string; v: string; color?: string }) {
  return (
    <div className="pl-2 sm:pl-0">
      <div className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-ash">{k}</div>
      <div className="tabular font-mono text-sm font-bold" style={color ? { color } : undefined}>{v}</div>
    </div>
  )
}
