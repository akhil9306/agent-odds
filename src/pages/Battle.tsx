import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeft, CheckCircle2, ChevronDown, Coins, Cpu, Crown, FastForward, Flame, Gauge, Info, Lock, Play, RotateCcw, Skull,
  Swords, Terminal, Timer, TrendingUp, Trophy, Users, Zap,
} from 'lucide-react'
import { DISTRIBUTABLE, FEES, arenaById, type Side } from '../data/seed'
import { finalScore, logsAt, type AgentLive, type LogLine } from '../lib/sim'
import { Link, navigate } from '../lib/router'
import { useBattle, type BattleView } from '../lib/useBattle'
import { cn, fmt, fmtTime } from '../lib/utils'
import { useStore } from '../store/store'
import { AgentAvatar } from '../components/AgentAvatar'
import { Backdrop, hexA } from '../components/Backdrop'
import { ARENA_ICON } from '../components/Cards'
import { AnimatedNumber, Badge, Button, Corners, DemoBadge, LiveBadge } from '../components/ui/primitives'
import { totals } from '../data/seed'

export default function BattlePage({ id, demo }: { id: string; demo: boolean }) {
  const v = useBattle(id)
  const { startBattle } = useStore()
  const [pick, setPick] = useState<Side | null>(null)

  useEffect(() => {
    if (v && v.battle.kind === 'live' && !v.started) startBattle(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])
  useEffect(() => setPick(null), [v?.round])

  if (!v) return <NotFound />
  const arena = arenaById(v.battle.arenaId)!

  return (
    <div className="noise relative min-h-screen overflow-hidden pb-20">
      <Backdrop color={arena.color} color2={arena.color2} intensity={1.2} />
      <div className="relative z-10 mx-auto max-w-[1440px] px-4 pt-6 sm:px-6">
        <Header v={v} />
        {demo && <DemoGuide v={v} pick={pick} />}
        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_400px]">
          <div className="min-w-0 space-y-5">
            <Stage v={v} />
            <Momentum v={v} />
            <div className="grid gap-5 md:grid-cols-2">
              <LogPanel v={v} side="a" />
              <LogPanel v={v} side="b" />
            </div>
          </div>
          <aside className="space-y-5">
            <BetPanel v={v} pick={pick} setPick={setPick} />
            <PoolBreakdown v={v} />
            <MarketFeed v={v} />
          </aside>
        </div>
      </div>
      <WinnerOverlay v={v} />
    </div>
  )
}

function NotFound() {
  return (
    <div className="grid min-h-[60vh] place-items-center text-center">
      <div>
        <Skull className="mx-auto h-12 w-12 text-blood" />
        <h1 className="mt-4 font-display text-5xl uppercase">Battle not found</h1>
        <Button variant="blood" className="mt-6" onClick={() => navigate('/live')}>Back to live battles</Button>
      </div>
    </div>
  )
}

// ── header ───────────────────────────────────────────────────
function Header({ v }: { v: BattleView }) {
  const { setSpeed, rematch } = useStore()
  const arena = arenaById(v.battle.arenaId)!
  const Icon = ARENA_ICON[arena.id]
  const running = v.started && v.phase !== 'final'
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        <Link to={`/arena/${arena.id}`} className="inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-ash transition-colors hover:text-bone">
          <ArrowLeft className="h-3.5 w-3.5" /> <Icon className="h-3.5 w-3.5" style={{ color: arena.color }} /> Arena {arena.num} · {arena.name}
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="font-display text-3xl uppercase leading-none tracking-wide sm:text-4xl">{v.battle.challenge}</h1>
          {v.phase === 'pre' ? <Badge className="border-gold/40 text-gold">Upcoming</Badge> : v.phase === 'final' ? <Badge className="border-toxic/40 text-toxic">Final</Badge> : <LiveBadge />}
          <DemoBadge />
          <Badge>Round {v.round}</Badge>
        </div>
        <p className="mt-2 max-w-2xl text-sm text-bone/50">{v.battle.description}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <HeaderStat icon={<Users className="h-3.5 w-3.5" />} label="Spectators" value={<AnimatedNumber value={v.spectators} />} />
        <HeaderStat icon={<Coins className="h-3.5 w-3.5 text-gold" />} label="Pool" value={<><AnimatedNumber value={v.total} /> AC</>} accent />
        {running && (
          <div className="steel flex h-[52px] items-center gap-1 border border-edge px-2" title="Simulation speed (demo)">
            <FastForward className="mx-1 h-3.5 w-3.5 text-ash" />
            {[1, 2, 4, 8].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(v.battle.id, s)}
                className={cn('h-8 min-w-8 px-2 font-mono text-xs font-bold transition-colors', v.speed === s ? 'bg-blood text-white' : 'text-bone/60 hover:bg-white/5')}
              >
                {s}x
              </button>
            ))}
          </div>
        )}
        {v.phase === 'final' && (
          <Button variant="outline" size="lg" onClick={() => rematch(v.battle.id)}>
            <RotateCcw className="h-4 w-4" /> Rematch
          </Button>
        )}
      </div>
    </div>
  )
}

function HeaderStat({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: React.ReactNode; accent?: boolean }) {
  return (
    <div className={cn('steel flex h-[52px] flex-col justify-center border px-4', accent ? 'border-gold/30' : 'border-edge')}>
      <div className="flex items-center gap-1.5 font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-ash">{icon}{label}</div>
      <div className={cn('font-mono text-sm font-bold', accent ? 'text-gold' : 'text-bone')}>{value}</div>
    </div>
  )
}

// ── demo guide ───────────────────────────────────────────────
function DemoGuide({ v, pick }: { v: BattleView; pick: Side | null }) {
  const steps = ['Pick your fighter', 'Place a virtual bet', 'Watch the fight', 'Winner & settlement']
  const step = v.phase === 'final' ? 3 : v.myBet ? 2 : v.phase === 'locked' || v.phase === 'judging' ? 2 : pick ? 1 : 0
  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-5 overflow-hidden border border-toxic/30 bg-toxic/[.04]">
      <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2 px-1 font-mono text-[10px] font-bold tracking-[0.25em] text-toxic">
          <Play className="h-3.5 w-3.5 fill-current" /> GUIDED DEMO · 2x SPEED
        </div>
        <div className="grid flex-1 grid-cols-2 gap-1.5 sm:grid-cols-4">
          {steps.map((s, i) => (
            <div
              key={s}
              className={cn(
                'flex items-center gap-2 px-3 py-2 text-xs font-semibold transition-all',
                i < step && 'bg-toxic/10 text-toxic/70',
                i === step && 'bg-toxic text-black shadow-[0_0_24px_rgba(57,255,136,.4)]',
                i > step && 'bg-white/[.03] text-bone/35',
              )}
            >
              {i < step ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> : <span className="font-mono">{i + 1}</span>}
              <span className="truncate">{s}</span>
            </div>
          ))}
        </div>
      </div>
      {!v.myBet && (v.phase === 'locked' || v.phase === 'judging') && (
        <div className="border-t border-toxic/20 px-4 py-2 text-xs text-bone/60">Betting closed before a prediction was placed — hit <b>Rematch</b> when the bout ends or press <b>Demo Mode</b> again.</div>
      )}
    </motion.div>
  )
}

// ── the stage ────────────────────────────────────────────────
function Stage({ v }: { v: BattleView }) {
  const { startBattle } = useStore()
  const arena = arenaById(v.battle.arenaId)!
  return (
    <section className="relative overflow-hidden border-2 border-[#2c2c36] bg-black/50 shadow-[inset_0_0_120px_rgba(0,0,0,.9)]">
      {/* truss lights */}
      <div className="relative flex h-7 items-center justify-between gap-1 border-b-2 border-[#2c2c36] bg-gradient-to-b from-[#1b1b22] to-[#0e0e13] px-4">
        {Array.from({ length: 24 }).map((_, i) => (
          <span key={i} className={cn('h-1.5 w-1.5 rounded-full', i % 3 === 0 ? 'flicker' : '')} style={{ background: i % 2 ? arena.color : '#fff3d6', boxShadow: `0 0 8px ${i % 2 ? arena.color : '#fff3d6'}`, animationDelay: `${i * 0.17}s` }} />
        ))}
      </div>
      <div className="cage-strong pointer-events-none absolute inset-0 opacity-50" />
      <div className="pointer-events-none absolute inset-0" style={{ background: `radial-gradient(ellipse at 20% 40%, ${hexA(v.agentA.color, 0.16)}, transparent 50%), radial-gradient(ellipse at 80% 40%, ${hexA(v.agentB.color, 0.16)}, transparent 50%)` }} />
      <Corners color={arena.color} size={28} thick={3} />

      <div className="relative grid gap-6 p-5 sm:p-7 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:gap-4">
        <AgentPanel v={v} side="a" />
        <CenterVS v={v} />
        <AgentPanel v={v} side="b" />
      </div>

      {v.phase === 'pre' && (
        <div className="absolute inset-0 z-20 grid place-items-center bg-black/75 backdrop-blur-[2px]">
          <div className="text-center">
            <div className="font-mono text-xs font-bold tracking-[0.35em] text-gold">FIGHT STARTS IN</div>
            <div className="tabular mt-2 font-display text-7xl text-bone glow-ember sm:text-8xl">{fmtTime(v.countdown)}</div>
            <p className="mt-2 text-sm text-bone/50">Pre-match market is open — lock in a prediction early.</p>
            <Button variant="blood" size="xl" className="mt-6" onClick={() => startBattle(v.battle.id)}>
              <Zap className="h-5 w-5" /> Ring the bell now (demo)
            </Button>
          </div>
        </div>
      )}
    </section>
  )
}

function AgentPanel({ v, side }: { v: BattleView; side: Side }) {
  const agent = side === 'a' ? v.agentA : v.agentB
  const s = side === 'a' ? v.a : v.b
  const o = side === 'a' ? v.b : v.a
  const right = side === 'b'
  const rec = totals(agent)
  const progressLead = s.progress > o.progress + 0.5 && v.phase !== 'pre'
  const perfLead = s.score > o.score && v.phase !== 'pre'
  const dead = s.status === 'DEFEATED'
  const won = s.status === 'WINNER'

  return (
    <div className={cn('min-w-0', right && 'md:text-right')}>
      <div className={cn('flex items-center gap-4', right && 'md:flex-row-reverse')}>
        <motion.div className="relative" animate={won ? { scale: [1, 1.06, 1] } : {}} transition={{ repeat: Infinity, duration: 1.6 }}>
          <div className="absolute inset-[-14px] rounded-full blur-2xl" style={{ background: hexA(agent.color, dead ? 0.05 : 0.35) }} />
          <AgentAvatar agent={agent} size={112} glow={!dead} dim={dead} className="relative" />
          {won && <Crown className="absolute -top-5 left-1/2 h-8 w-8 -translate-x-1/2 fill-gold text-gold drop-shadow-[0_0_10px_#ffc531]" />}
        </motion.div>
        <div className="min-w-0">
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.25em]" style={{ color: agent.color }}>
            {side === 'a' ? 'Red corner' : 'Blue corner'} · “{agent.nickname}”
          </div>
          <Link to={`/agent/${agent.id}`} className="block truncate font-display text-4xl uppercase leading-none tracking-wide transition-colors hover:text-white sm:text-5xl" style={{ color: dead ? '#6b6a73' : '#f2ede6' }}>
            {agent.name}
          </Link>
          <div className="mt-1 truncate text-xs text-bone/50">by <span className="text-bone/80">{agent.creator}</span> · {agent.studio}</div>
          <div className={cn('mt-2 flex flex-wrap gap-1.5', right && 'md:justify-end')}>
            <Badge className="normal-case tracking-normal"><Cpu className="h-3 w-3" />{agent.model.split('·')[0].trim()}</Badge>
          </div>
        </div>
      </div>

      <div className={cn('mt-4 grid grid-cols-3 gap-px overflow-hidden border border-white/[.06] bg-white/[.06] font-mono text-xs')}>
        {[
          ['Wins', fmt(rec.w)],
          ['Win %', `${rec.pct.toFixed(1)}%`],
          ['Rating', fmt(agent.rating)],
        ].map(([k, val]) => (
          <div key={k} className="bg-coal/90 px-3 py-2">
            <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-ash">{k}</div>
            <div className="mt-0.5 font-bold text-bone">{val}</div>
          </div>
        ))}
      </div>

      {/* PROGRESS */}
      <div className="mt-5">
        <div className={cn('flex items-baseline justify-between', right && 'md:flex-row-reverse')}>
          <span className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-ash">
            <TrendingUp className="h-3 w-3" /> Progress
            {progressLead && <span className="bg-white/10 px-1.5 py-px text-[9px] text-bone">FASTER</span>}
          </span>
          <span className="tabular font-display text-3xl" style={{ color: agent.color }}>{Math.round(s.progress)}%</span>
        </div>
        <div className={cn('relative mt-1.5 h-4 overflow-hidden border border-white/10 bg-black/60', right && 'md:[transform:scaleX(-1)]')}>
          <motion.div
            className={cn('relative h-full', s.status === 'EXECUTING' && 'bar-stripes')}
            style={{ background: `linear-gradient(90deg, ${hexA(agent.color, 0.55)}, ${agent.color})`, boxShadow: `0 0 18px ${agent.color}` }}
            animate={{ width: `${s.progress}%` }}
            transition={{ ease: 'linear', duration: 0.3 }}
          />
          {[25, 50, 75].map((m) => <span key={m} className="absolute top-0 h-full w-px bg-black/60" style={{ left: `${m}%` }} />)}
        </div>
      </div>

      {/* PERFORMANCE */}
      <div className="mt-4">
        <div className={cn('flex items-baseline justify-between', right && 'md:flex-row-reverse')}>
          <span className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-ash">
            <Gauge className="h-3 w-3" /> Performance
            {perfLead && <span className="bg-gold px-1.5 py-px text-[9px] text-black">LEADS</span>}
          </span>
          <span className="tabular font-display text-3xl text-gold">
            <AnimatedNumber value={s.score} /><span className="text-base text-gold/50">/1000</span>
          </span>
        </div>
        <div className={cn('mt-1.5 h-2 overflow-hidden bg-black/60', right && 'md:[transform:scaleX(-1)]')}>
          <motion.div className="h-full bg-gradient-to-r from-[#7a5a00] to-gold" animate={{ width: `${s.score / 10}%` }} transition={{ duration: 0.5 }} />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <MiniStat label="Tests passed" value={`${s.tests + s.hiddenPassed}`} sub={s.hiddenDone > 0 ? `${s.tests}/${v.battle.visTotal} vis · ${s.hiddenPassed}/${s.hiddenDone} hidden` : `of ${v.battle.visTotal} visible`} />
        <MiniStat label="Exec time" value={fmtTime(s.execTime)} sub="cpu wall-clock" />
        <StatusChip s={s} color={agent.color} />
      </div>
    </div>
  )
}

function MiniStat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="min-w-0 border border-white/[.06] bg-black/40 px-3 py-2 text-left">
      <div className="truncate font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-ash">{label}</div>
      <div className="tabular font-display text-2xl leading-tight text-bone">{value}</div>
      <div className="truncate font-mono text-[9px] text-ash">{sub}</div>
    </div>
  )
}

function StatusChip({ s, color }: { s: AgentLive; color: string }) {
  const map: Record<string, { c: string; label: string }> = {
    STANDBY: { c: '#8d8c97', label: 'STANDBY' },
    EXECUTING: { c: color, label: 'EXECUTING' },
    SUBMITTED: { c: '#2ec5ff', label: 'SUBMITTED' },
    JUDGING: { c: '#ffc531', label: 'JUDGING' },
    WINNER: { c: '#39ff88', label: 'WINNER' },
    DEFEATED: { c: '#ff1f3d', label: 'DEFEATED' },
  }
  const m = map[s.status]
  return (
    <div className="min-w-0 border bg-black/40 px-3 py-2 text-left" style={{ borderColor: hexA(m.c, 0.35) }}>
      <div className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-ash">Status</div>
      <div className="mt-1 flex items-center gap-1.5">
        <span className={cn('h-2 w-2 shrink-0 rounded-full', (s.status === 'EXECUTING' || s.status === 'JUDGING') && 'animate-pulse')} style={{ background: m.c, boxShadow: `0 0 8px ${m.c}` }} />
        <span className="truncate font-mono text-[11px] font-bold" style={{ color: m.c }}>{m.label}</span>
      </div>
    </div>
  )
}

function CenterVS({ v }: { v: BattleView }) {
  const timeLeft = v.battle.timeLimit - v.t
  const closeIn = v.battle.closeAt - v.t
  const label: Record<string, string> = {
    pre: 'PRE-MATCH',
    open: 'BETTING OPEN',
    locked: 'MARKET LOCKED',
    judging: 'HIDDEN TESTS RUNNING',
    final: 'FINAL BELL',
  }
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-2 md:w-[200px]">
      <div className="relative grid h-36 w-36 place-items-center">
        <motion.div className="absolute inset-0 rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,106,19,.35), transparent 65%)' }} animate={{ scale: [1, 1.25, 1], opacity: [0.7, 1, 0.7] }} transition={{ repeat: Infinity, duration: 1.8 }} />
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100">
          <motion.circle cx="50" cy="50" r="46" fill="none" stroke="#ff1f3d" strokeWidth="1" strokeDasharray="4 6" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 20, ease: 'linear' }} style={{ originX: '50px', originY: '50px' }} />
          <path d="M58 6 L44 46 L56 46 L40 94" fill="none" stroke="#ffc531" strokeWidth="1.2" opacity=".35" />
        </svg>
        <motion.span
          className="relative font-display text-[92px] italic leading-none fire-text"
          animate={{ scale: [1, 1.07, 1], rotate: [-2, 1, -2] }}
          transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
          style={{ filter: 'drop-shadow(0 0 24px rgba(255,60,30,.65))' }}
        >
          VS
        </motion.span>
      </div>
      <div className="w-full text-center">
        <div className={cn('mx-auto inline-flex items-center gap-1.5 px-2.5 py-1 font-mono text-[10px] font-bold tracking-[0.2em]', v.phase === 'open' ? 'bg-toxic/15 text-toxic' : v.phase === 'final' ? 'bg-gold/15 text-gold' : 'bg-blood/15 text-blood')}>
          {v.phase === 'locked' && <Lock className="h-3 w-3" />}
          {label[v.phase]}
        </div>
        <div className="mt-3 font-mono text-[9px] font-bold tracking-[0.3em] text-ash">TIME LEFT</div>
        <div className="tabular font-display text-5xl leading-none text-bone">{fmtTime(v.phase === 'final' ? 0 : timeLeft)}</div>
        {v.phase === 'open' && (
          <div className="mt-2 font-mono text-[11px] text-toxic">
            bets close in <b className="tabular">{fmtTime(closeIn)}</b>
          </div>
        )}
        <div className="mt-3 inline-flex items-center gap-1.5 border border-white/10 px-2 py-1 font-mono text-[9px] text-ash" title="A faster agent is not automatically the winner — final score weighs correctness (70%), quality (20%) and speed (10%).">
          <Info className="h-3 w-3" /> PROGRESS ≠ PERFORMANCE
        </div>
      </div>
    </div>
  )
}

// ── market momentum ──────────────────────────────────────────
function Momentum({ v }: { v: BattleView }) {
  const pts = v.market.history
  const W = 600, H = 70
  const maxT = Math.max(v.battle.closeAt, 2)
  const path = pts.map((p, i) => `${i ? 'L' : 'M'}${((p.t / maxT) * W).toFixed(1)} ${(H - p.p * H).toFixed(1)}`).join(' ')
  const lastP = pts[pts.length - 1]
  const prevP = pts[Math.max(0, pts.length - 8)]
  const delta = (lastP.p - prevP.p) * 100
  return (
    <section className="steel relative overflow-hidden border border-edge p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-bone/70">
          <TrendingUp className="h-4 w-4 text-ember" /> Market sentiment · implied win probability
        </div>
        <div className="font-mono text-[11px] text-ash">
          {v.agentA.short} {delta >= 0 ? '▲' : '▼'} <span className={delta >= 0 ? 'text-toxic' : 'text-blood'}>{Math.abs(delta).toFixed(1)} pts</span> recent
        </div>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <span className="w-16 font-display text-2xl" style={{ color: v.agentA.color }}>{Math.round(v.probA * 100)}%</span>
        <div className="relative h-6 flex-1 overflow-hidden border border-white/10 bg-black">
          <motion.div className="absolute inset-y-0 left-0" style={{ background: `linear-gradient(90deg, ${hexA(v.agentA.color, 0.4)}, ${v.agentA.color})` }} animate={{ width: `${v.probA * 100}%` }} transition={{ duration: 0.6 }} />
          <motion.div className="absolute inset-y-0 right-0" style={{ background: `linear-gradient(270deg, ${hexA(v.agentB.color, 0.4)}, ${v.agentB.color})` }} animate={{ width: `${v.probB * 100}%` }} transition={{ duration: 0.6 }} />
          <motion.div className="absolute inset-y-[-4px] w-1 bg-white shadow-[0_0_12px_#fff]" animate={{ left: `calc(${v.probA * 100}% - 2px)` }} transition={{ duration: 0.6 }} />
        </div>
        <span className="w-16 text-right font-display text-2xl" style={{ color: v.agentB.color }}>{Math.round(v.probB * 100)}%</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-4 h-[70px] w-full" preserveAspectRatio="none">
        <line x1="0" x2={W} y1={H / 2} y2={H / 2} stroke="rgba(255,255,255,.08)" strokeDasharray="4 4" />
        <line x1={W} x2={W} y1="0" y2={H} stroke="rgba(255,31,61,.5)" strokeDasharray="3 3" />
        <path d={`${path} L${((lastP.t / maxT) * W).toFixed(1)} ${H} L0 ${H} Z`} fill={hexA(v.agentA.color, 0.12)} />
        <path d={path} fill="none" stroke={v.agentA.color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="mt-1 flex justify-between font-mono text-[9px] tracking-widest text-ash">
        <span>OPEN</span>
        <span className="text-blood/80">BETTING CLOSES · {fmtTime(v.battle.closeAt)}</span>
      </div>
    </section>
  )
}

// ── execution logs ───────────────────────────────────────────
function LogPanel({ v, side }: { v: BattleView; side: Side }) {
  const agent = side === 'a' ? v.agentA : v.agentB
  const s = side === 'a' ? v.a : v.b
  const sec = Math.floor(v.t)
  const lines = useMemo<LogLine[]>(() => (v.phase === 'pre' ? [] : logsAt(v.battle, side, sec)), [v.battle, side, sec, v.phase])
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (el) el.scrollTop = el.scrollHeight
  }, [lines.length])
  const color: Record<string, string> = { sys: '#2ec5ff', info: '#c9c6cf', ok: '#39ff88', warn: '#ffc531', err: '#ff1f3d' }
  return (
    <section className="relative overflow-hidden border border-edge bg-[#050507]">
      <div className="flex items-center justify-between border-b border-white/[.06] bg-coal px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="flex gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          </span>
          <Terminal className="ml-2 h-3.5 w-3.5" style={{ color: agent.color }} />
          <span className="font-mono text-[11px] font-bold" style={{ color: agent.color }}>{agent.short.toLowerCase()}@sandbox</span>
          <span className="font-mono text-[11px] text-ash">~/run.log</span>
        </div>
        <span className="font-mono text-[10px] text-ash">{s.status}</span>
      </div>
      <div ref={ref} className="scanlines h-60 overflow-y-auto px-4 py-3 font-mono text-[11.5px] leading-[1.7]">
        {lines.length === 0 && <div className="text-ash">waiting for the bell…</div>}
        {lines.map((l) => (
          <motion.div key={l.id} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className="flex gap-3">
            <span className="shrink-0 text-ash/60">[{fmtTime(l.t)}]</span>
            <span style={{ color: color[l.kind] }}>{l.text}</span>
          </motion.div>
        ))}
        {v.phase !== 'final' && v.phase !== 'pre' && <span className="cursor-blink inline-block h-3.5 w-2 translate-y-0.5" style={{ background: agent.color }} />}
      </div>
    </section>
  )
}

// ── betting ──────────────────────────────────────────────────
function BetPanel({ v, pick, setPick }: { v: BattleView; pick: Side | null; setPick: (s: Side) => void }) {
  const { state, placeBet } = useStore()
  const [amount, setAmount] = useState('500')
  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [rules, setRules] = useState(false)
  const open = v.phase === 'open' || v.phase === 'pre'
  const amt = Math.max(0, Math.floor(Number(amount) || 0))

  const sideStake = pick === 'a' ? v.A : pick === 'b' ? v.B : 0
  const P = v.total + amt
  const W = sideStake + amt
  const estPayout = pick && amt > 0 ? (amt / W) * P * DISTRIBUTABLE : 0
  const estProfit = estPayout - amt
  const pickedAgent = pick === 'a' ? v.agentA : pick === 'b' ? v.agentB : null

  const confirm = () => {
    if (!pick || busy) return
    setBusy(true)
    const r = placeBet(v.battle.id, pick, amt)
    if (!r.ok) setErr(r.error ?? 'Could not place bet')
    else setErr(null)
    setTimeout(() => setBusy(false), 400)
  }

  return (
    <section className="steel relative overflow-hidden border border-blood/40 shadow-[0_0_60px_-20px_rgba(255,31,61,.5)]">
      <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-blood via-ember to-blood" />
      <div className="p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-3xl uppercase tracking-wide">Place your bet</h2>
          <span className="font-mono text-[9px] font-bold tracking-[0.2em] text-gold">VIRTUAL AC</span>
        </div>

        {v.myBet ? (
          <PositionCard v={v} />
        ) : !open ? (
          <div className="mt-4 border border-white/10 bg-black/40 p-5 text-center">
            <Lock className="mx-auto h-7 w-7 text-blood" />
            <div className="mt-2 font-display text-2xl uppercase">Betting closed</div>
            <p className="mt-1 text-xs text-bone/50">
              {v.phase === 'final' ? 'This bout is settled. Hit Rematch to run it back.' : `The market locked at ${fmtTime(v.battle.closeAt)}. Watch it play out.`}
            </p>
          </div>
        ) : (
          <>
            <div className="mt-4 grid grid-cols-2 gap-2.5">
              {(['a', 'b'] as Side[]).map((sd) => {
                const ag = sd === 'a' ? v.agentA : v.agentB
                const odds = sd === 'a' ? v.oddsA : v.oddsB
                const prob = sd === 'a' ? v.probA : v.probB
                const sel = pick === sd
                return (
                  <motion.button
                    key={sd}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => { setPick(sd); setErr(null) }}
                    className={cn('relative overflow-hidden border-2 bg-black/40 p-3 text-left transition-all', sel ? 'shadow-[0_0_30px_-6px_var(--c)]' : 'border-white/10 hover:border-white/25')}
                    style={{ borderColor: sel ? ag.color : undefined, ['--c' as string]: ag.color }}
                  >
                    {sel && <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${hexA(ag.color, 0.18)}, transparent 60%)` }} />}
                    <div className="relative flex items-center gap-2">
                      <AgentAvatar agent={ag} size={34} />
                      <div className="min-w-0">
                        <div className="truncate font-display text-lg uppercase leading-none" style={{ color: ag.color }}>{ag.short}</div>
                        <div className="font-mono text-[9px] text-ash">{sel ? 'SELECTED' : 'TAP TO PICK'}</div>
                      </div>
                    </div>
                    <div className="relative mt-3 flex items-end justify-between">
                      <div>
                        <div className="font-mono text-[9px] tracking-widest text-ash">ODDS</div>
                        <div className="tabular font-display text-2xl leading-none text-bone">{odds.toFixed(2)}x</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-[9px] tracking-widest text-ash">WIN PROB</div>
                        <div className="tabular font-mono text-sm font-bold text-bone">{Math.round(prob * 100)}%</div>
                      </div>
                    </div>
                    {sel && <CheckCircle2 className="absolute right-2 top-2 h-4 w-4" style={{ color: ag.color }} />}
                  </motion.button>
                )
              })}
            </div>

            <label className="mt-4 block font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-ash" htmlFor="amt">
              Amount (virtual credits)
            </label>
            <div className="mt-1.5 flex items-center border border-white/15 bg-black/60 focus-within:border-blood">
              <Coins className="ml-3 h-4 w-4 text-gold" />
              <input
                id="amt"
                type="number"
                inputMode="numeric"
                min={1}
                value={amount}
                onChange={(e) => { setAmount(e.target.value); setErr(null) }}
                className="tabular h-12 w-full bg-transparent px-3 font-display text-2xl tracking-wide outline-none"
              />
              <span className="pr-3 font-mono text-xs font-bold text-ash">AC</span>
            </div>
            <div className="mt-2 grid grid-cols-5 gap-1.5">
              {[100, 250, 500, 1000].map((q) => (
                <button key={q} onClick={() => setAmount(String(q))} className={cn('h-8 border font-mono text-[11px] font-bold transition-colors', amt === q ? 'border-blood bg-blood/15 text-white' : 'border-white/10 text-bone/60 hover:border-white/30')}>
                  {q >= 1000 ? '1K' : q}
                </button>
              ))}
              <button onClick={() => setAmount(String(state.balance))} className="h-8 border border-gold/30 font-mono text-[11px] font-bold text-gold hover:bg-gold/10">MAX</button>
            </div>

            <div className="mt-4 space-y-1.5 border border-white/[.06] bg-black/40 p-4 font-mono text-[12px]">
              <Row k="Virtual balance" val={`${fmt(state.balance)} AC`} />
              <Row k="Prediction" val={pickedAgent ? pickedAgent.name : '—'} color={pickedAgent?.color} />
              <Row k="Amount" val={`${fmt(amt)} AC`} />
              <div className="my-2 h-px bg-white/[.06]" />
              <Row k="Estimated payout" val={`${fmt(estPayout)} AC`} big />
              <Row k="Estimated profit" val={`${estProfit >= 0 ? '+' : ''}${fmt(estProfit)} AC`} color={estProfit > 0 ? '#39ff88' : undefined} />
            </div>

            <AnimatePresence>
              {err && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-3 border border-blood/40 bg-blood/10 px-3 py-2 text-xs text-blood">
                  {err}
                </motion.div>
              )}
            </AnimatePresence>

            <Button variant="blood" size="xl" className="sheen mt-4 w-full" disabled={!pick || amt <= 0 || amt > state.balance || busy} onClick={confirm}>
              <Flame className="h-5 w-5" />
              {!pick ? 'Pick a fighter' : amt > state.balance ? 'Insufficient credits' : `Confirm · ${fmt(amt)} AC on ${pickedAgent!.short}`}
            </Button>
          </>
        )}

        <button onClick={() => setRules((r) => !r)} className="mt-4 flex w-full items-center justify-between font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-ash hover:text-bone">
          <span className="flex items-center gap-1.5"><Info className="h-3.5 w-3.5" /> How payouts work</span>
          <ChevronDown className={cn('h-4 w-4 transition-transform', rules && 'rotate-180')} />
        </button>
        <AnimatePresence>
          {rules && (
            <motion.ul initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-3 list-disc space-y-1.5 overflow-hidden pl-4 text-[12px] leading-relaxed text-bone/60">
              <li>Parimutuel pool: every prediction goes into one shared pool.</li>
              <li>At the bell, {fmt(FEES.platform * 100)}% goes to the platform and {fmt(FEES.royalty * 100)}% to the winning agent's creator.</li>
              <li>The remaining {fmt(DISTRIBUTABLE * 100)}% is split between winning predictions, proportional to stake.</li>
              <li><b>Payout = your stake ÷ winning-side stake × 93% of total pool.</b> Odds move as money flows in — estimates update live.</li>
              <li>Wrong predictions lose the credits committed. One position per match. Betting closes at {fmtTime(v.battle.closeAt)}.</li>
              <li className="text-gold/80">All credits are virtual and non-redeemable. No real money is involved.</li>
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}

function Row({ k, val, color, big }: { k: string; val: string; color?: string; big?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-ash">{k}</span>
      <span className={cn('tabular truncate font-bold', big ? 'font-display text-xl tracking-wide text-gold' : 'text-bone')} style={color ? { color } : undefined}>{val}</span>
    </div>
  )
}

function PositionCard({ v }: { v: BattleView }) {
  const bet = v.myBet!
  const ag = bet.side === 'a' ? v.agentA : v.agentB
  const sideStake = bet.side === 'a' ? v.A : v.B
  const live = (bet.amount / sideStake) * v.total * DISTRIBUTABLE
  const settled = bet.status !== 'active'
  return (
    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mt-4">
      {!settled && (
        <motion.div initial={{ rotate: -8, scale: 1.4, opacity: 0 }} animate={{ rotate: -4, scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 14 }} className="mx-auto mb-4 w-fit border-4 border-toxic px-4 py-1 font-display text-3xl uppercase tracking-widest text-toxic glow-toxic">
          Bet placed
        </motion.div>
      )}
      <div className="border-2 bg-black/40 p-4" style={{ borderColor: settled ? (bet.status === 'won' ? '#39ff88' : '#ff1f3d') : ag.color }}>
        <div className="flex items-center gap-3">
          <AgentAvatar agent={ag} size={44} glow />
          <div className="min-w-0 flex-1">
            <div className="font-mono text-[10px] tracking-[0.2em] text-ash">YOUR PREDICTION</div>
            <div className="truncate font-display text-2xl uppercase" style={{ color: ag.color }}>{ag.name}</div>
          </div>
          {settled ? (
            bet.status === 'won' ? <Trophy className="h-7 w-7 text-toxic" /> : <Skull className="h-7 w-7 text-blood" />
          ) : (
            <Lock className="h-5 w-5 text-ash" />
          )}
        </div>
        <div className="mt-4 space-y-1.5 font-mono text-[12px]">
          <Row k="Committed" val={`${fmt(bet.amount)} AC`} />
          <Row k="Odds at entry" val={`${bet.oddsAtEntry.toFixed(2)}x`} />
          {settled ? (
            <Row k={bet.status === 'won' ? 'Credited' : 'Result'} val={bet.status === 'won' ? `+${fmt(bet.payout ?? 0)} AC` : `−${fmt(bet.amount)} AC`} color={bet.status === 'won' ? '#39ff88' : '#ff1f3d'} big />
          ) : (
            <Row k="Live est. payout" val={`${fmt(live)} AC`} big />
          )}
        </div>
      </div>
      {!settled && <p className="mt-3 text-center text-[11px] text-bone/40">Position locked · one prediction per match</p>}
    </motion.div>
  )
}

function PoolBreakdown({ v }: { v: BattleView }) {
  const total = v.settlement?.totalPool ?? v.total
  const rows = [
    { k: 'Winning predictions', pct: DISTRIBUTABLE, c: '#39ff88' },
    { k: 'Platform fee', pct: FEES.platform, c: '#8d8c97' },
    { k: 'Creator royalty', pct: FEES.royalty, c: '#ffc531' },
  ]
  return (
    <section className="steel border border-edge p-5">
      <div className="flex items-center justify-between">
        <div className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-bone/70">Prediction pool</div>
        <Badge>{v.settlement ? 'Settled' : 'Live'}</Badge>
      </div>
      <div className="mt-2 font-display text-4xl text-gold"><AnimatedNumber value={total} /> <span className="text-xl text-gold/50">AC</span></div>
      <div className="mt-3 flex h-3 overflow-hidden">
        {rows.map((r) => <div key={r.k} style={{ width: `${r.pct * 100}%`, background: r.c }} />)}
      </div>
      <div className="mt-4 space-y-2 font-mono text-[12px]">
        {rows.map((r) => (
          <div key={r.k} className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-bone/60"><span className="h-2 w-2" style={{ background: r.c }} />{r.k} · {Math.round(r.pct * 100)}%</span>
            <span className="tabular font-bold text-bone">{fmt(total * r.pct)} AC</span>
          </div>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 border-t border-white/[.06] pt-4 font-mono text-[11px]">
        <div><span className="text-ash">On {v.agentA.short}</span><div className="tabular font-bold" style={{ color: v.agentA.color }}>{fmt(v.A)} AC</div></div>
        <div className="text-right"><span className="text-ash">On {v.agentB.short}</span><div className="tabular font-bold" style={{ color: v.agentB.color }}>{fmt(v.B)} AC</div></div>
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-bone/40">Royalty goes to the winning agent's creator and appears on that agent's profile. Fee split is configurable (mock).</p>
    </section>
  )
}

function MarketFeed({ v }: { v: BattleView }) {
  const events = v.market.events.slice(-7).reverse()
  return (
    <section className="steel border border-edge p-5">
      <div className="flex items-center justify-between">
        <div className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-bone/70">Prediction activity</div>
        {v.phase === 'open' ? <span className="flex items-center gap-1.5 font-mono text-[10px] text-toxic"><span className="live-dot h-1.5 w-1.5 rounded-full bg-toxic" /> flowing</span> : <span className="font-mono text-[10px] text-ash">frozen</span>}
      </div>
      <div className="mt-3 space-y-1.5">
        {v.myBet && (
          <div className="flex items-center justify-between border border-gold/30 bg-gold/[.06] px-3 py-2 font-mono text-[11px]">
            <span className="text-gold">you → {(v.myBet.side === 'a' ? v.agentA : v.agentB).short}</span>
            <span className="font-bold text-gold">{fmt(v.myBet.amount)} AC</span>
          </div>
        )}
        <AnimatePresence initial={false}>
          {events.map((e) => {
            const ag = e.side === 'a' ? v.agentA : v.agentB
            return (
              <motion.div key={e.t} layout initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center justify-between bg-black/30 px-3 py-1.5 font-mono text-[11px]">
                <span className="truncate text-bone/60">
                  <span className="text-bone/90">{e.user}</span> backed <span style={{ color: ag.color }}>{ag.short}</span>
                </span>
                <span className="tabular shrink-0 font-bold text-bone">{fmt(e.amount)}</span>
              </motion.div>
            )
          })}
        </AnimatePresence>
        {events.length === 0 && <div className="py-3 text-center text-xs text-ash">No activity yet</div>}
      </div>
    </section>
  )
}

// ── winner overlay ───────────────────────────────────────────
function WinnerOverlay({ v }: { v: BattleView }) {
  const { markRevealed } = useStore()
  const st = v.settlement
  const show = v.phase === 'final' && !!st && !st.revealed
  const [stage, setStage] = useState(0)
  useEffect(() => {
    if (!show) return
    setStage(0)
    const t = setTimeout(() => setStage(1), 2000)
    return () => clearTimeout(t)
  }, [show])

  if (!st) return null
  const W = st.winner === 'a' ? v.agentA : v.agentB
  const L = st.winner === 'a' ? v.agentB : v.agentA
  const wp = v.battle[st.winner]
  const lp = v.battle[st.winner === 'a' ? 'b' : 'a']
  const total = v.battle.visTotal + v.battle.hiddenTotal
  const close = () => markRevealed(v.key)
  const sparks = Array.from({ length: 36 }, (_, i) => ({ left: (i * 37) % 100, size: 2 + (i % 4), dur: 3 + (i % 5) * 0.7, delay: (i % 9) * 0.35 }))

  return (
    <AnimatePresence>
      {show && (
        <motion.div className="fixed inset-0 z-[80] overflow-y-auto bg-black/95" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <Backdrop color={W.color} color2="#ffc531" intensity={1.6} floor={false} />
          {stage === 1 && sparks.map((s, i) => <span key={i} className="spark" style={{ left: `${s.left}%`, width: s.size, height: s.size, background: i % 3 ? W.color : '#ffc531', boxShadow: `0 0 8px ${W.color}`, animationDuration: `${s.dur}s`, animationDelay: `${s.delay}s` }} />)}
          <div className="relative z-10 flex min-h-full flex-col items-center justify-center px-4 py-14">
            <AnimatePresence mode="wait">
              {stage === 0 ? (
                <motion.div key="tease" className="text-center" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.4, filter: 'blur(10px)' }}>
                  <div className="font-mono text-xs font-bold tracking-[0.5em] text-ash">DEMO MODE · FINAL BELL</div>
                  <h2 className="shake mt-4 font-display text-6xl uppercase tracking-wide text-bone sm:text-8xl">The winner is<span className="text-blood">...</span></h2>
                </motion.div>
              ) : (
                <motion.div key="reveal" className="w-full max-w-4xl text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="font-mono text-xs font-bold tracking-[0.5em] text-gold">THE WINNER IS…</div>
                  <motion.div initial={{ scale: 3, opacity: 0, rotate: -6 }} animate={{ scale: 1, opacity: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 180, damping: 12 }} className="mt-4 flex flex-col items-center">
                    <div className="relative">
                      <div className="absolute inset-[-40px] rounded-full blur-3xl" style={{ background: hexA(W.color, 0.45) }} />
                      <AgentAvatar agent={W} size={150} glow className="relative" />
                      <Crown className="absolute -top-9 left-1/2 h-12 w-12 -translate-x-1/2 fill-gold text-gold drop-shadow-[0_0_14px_#ffc531]" />
                    </div>
                    <h2 className="mt-6 font-display text-7xl uppercase leading-none tracking-wide sm:text-9xl" style={{ color: W.color, textShadow: `0 0 40px ${hexA(W.color, 0.7)}, 0 0 120px ${hexA(W.color, 0.4)}` }}>
                      {W.name}!
                    </h2>
                    <div className="mt-3 text-sm text-bone/60">“{W.nickname}” · built by <b className="text-bone">{W.creator}</b> · {W.studio}</div>
                  </motion.div>

                  <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mt-10 grid gap-4 text-left md:grid-cols-2">
                    {/* ranking */}
                    <div className="steel border border-edge p-5">
                      <div className="font-mono text-[10px] font-bold tracking-[0.25em] text-ash">FINAL RANKING</div>
                      {[{ ag: W, p: wp, r: 1 }, { ag: L, p: lp, r: 2 }].map(({ ag, p, r }) => (
                        <div key={ag.id} className={cn('mt-3 flex items-center gap-3 p-3', r === 1 ? 'bg-gold/[.08]' : 'bg-black/30')}>
                          <span className={cn('font-display text-3xl', r === 1 ? 'text-gold' : 'text-ash')}>#{r}</span>
                          <AgentAvatar agent={ag} size={36} dim={r === 2} />
                          <div className="min-w-0 flex-1">
                            <div className="truncate font-display text-lg uppercase" style={{ color: r === 1 ? ag.color : '#8d8c97' }}>{ag.name}</div>
                            <div className="font-mono text-[10px] text-ash">{p.visPass + p.hiddenPass}/{total} tests · {fmtTime(p.finishAt * p.cpu)}</div>
                          </div>
                          <div className="text-right">
                            <div className="tabular font-display text-2xl text-bone">{finalScore(v.battle, p)}</div>
                            <div className="font-mono text-[9px] text-ash">SCORE</div>
                          </div>
                        </div>
                      ))}
                      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/[.06] pt-4">
                        <OStat k="Final score" val={`${finalScore(v.battle, wp)}`} />
                        <OStat k="Tests passed" val={`${wp.visPass + wp.hiddenPass}/${total}`} />
                        <OStat k="Completion" val={fmtTime(wp.finishAt * wp.cpu)} />
                      </div>
                      {wp.finishAt > lp.finishAt && (
                        <div className="mt-3 flex items-start gap-2 text-[11px] text-bone/50"><Zap className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ember" /> {L.short} submitted first — but failed {v.battle.hiddenTotal - lp.hiddenPass} hidden tests. Speed isn't everything.</div>
                      )}
                    </div>
                    {/* settlement */}
                    <div className="steel border border-edge p-5">
                      <div className="font-mono text-[10px] font-bold tracking-[0.25em] text-ash">MARKET SETTLEMENT</div>
                      {st.userWon === true && (
                        <div className="mt-3 border border-toxic/40 bg-toxic/10 p-4">
                          <div className="flex items-center gap-2 font-display text-2xl uppercase text-toxic"><Trophy className="h-6 w-6" /> You called it</div>
                          <div className="tabular mt-1 font-display text-5xl text-toxic glow-toxic">+{fmt(st.userPayout)} AC</div>
                          <div className="mt-1 font-mono text-[11px] text-bone/60">profit +{fmt(st.userPayout - st.userStake)} AC on {fmt(st.userStake)} staked</div>
                        </div>
                      )}
                      {st.userWon === false && (
                        <div className="mt-3 border border-blood/40 bg-blood/10 p-4">
                          <div className="flex items-center gap-2 font-display text-2xl uppercase text-blood"><Skull className="h-6 w-6" /> Wrong corner</div>
                          <div className="tabular mt-1 font-display text-5xl text-blood">−{fmt(st.userStake)} AC</div>
                          <div className="mt-1 font-mono text-[11px] text-bone/60">Virtual credits committed are lost.</div>
                        </div>
                      )}
                      {st.userWon === null && <div className="mt-3 border border-white/10 bg-black/30 p-4 text-sm text-bone/60">You sat this one out. Run it back with <b>Rematch</b> and pick a corner.</div>}
                      <div className="mt-4 space-y-1.5 font-mono text-[12px]">
                        <Row k="Total pool" val={`${fmt(st.totalPool)} AC`} />
                        <Row k={`Platform fee · ${FEES.platform * 100}%`} val={`${fmt(st.fee)} AC`} />
                        <Row k={`Creator royalty · ${FEES.royalty * 100}%`} val={`${fmt(st.royalty)} AC`} color="#ffc531" />
                        <Row k={`To winners · ${Math.round(DISTRIBUTABLE * 100)}%`} val={`${fmt(st.distributable)} AC`} color="#39ff88" />
                      </div>
                      <div className="mt-3 flex items-center gap-2 border border-gold/25 bg-gold/[.06] px-3 py-2 text-[11px] text-gold/90">
                        <Crown className="h-3.5 w-3.5 shrink-0" /> {fmt(st.royalty)} AC royalty paid to {W.creator} ({W.studio})
                      </div>
                    </div>
                  </motion.div>

                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="mt-8 flex flex-wrap justify-center gap-3">
                    <Button variant="blood" size="lg" onClick={() => { close(); navigate('/bets') }}><Coins className="h-4 w-4" /> View my bets</Button>
                    <Button variant="outline" size="lg" onClick={() => { close(); navigate(`/agent/${W.id}`) }}><Crown className="h-4 w-4" /> Creator royalties</Button>
                    <Button variant="ghost" size="lg" onClick={close}><Swords className="h-4 w-4" /> Back to the cage</Button>
                  </motion.div>
                  <div className="mt-6 font-mono text-[10px] tracking-[0.3em] text-ash"><Timer className="mr-1 inline h-3 w-3" /> SIMULATED RESULT · DEMO MODE · VIRTUAL CREDITS ONLY</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function OStat({ k, val }: { k: string; val: string }) {
  return (
    <div>
      <div className="font-mono text-[9px] tracking-[0.2em] text-ash">{k.toUpperCase()}</div>
      <div className="tabular font-display text-xl text-bone">{val}</div>
    </div>
  )
}

