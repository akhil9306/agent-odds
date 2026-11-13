import { motion } from 'framer-motion'
import { Activity, ArrowRight, Clock, Code2, Coins, Crown, Eye, ShieldAlert, Sigma, Users } from 'lucide-react'
import { ARENAS, BATTLES, arenaById, type Arena, type ArenaId } from '../data/seed'
import { navigate } from '../lib/router'
import { useBattle } from '../lib/useBattle'
import { cn, fmt, fmtCompact, fmtTime } from '../lib/utils'
import { AgentAvatar } from './AgentAvatar'
import { hexA } from './Backdrop'
import { Badge, Button, Corners, LiveBadge } from './ui/primitives'

export const ARENA_ICON: Record<ArenaId, typeof Sigma> = { math: Sigma, cyber: ShieldAlert, code: Code2, pattern: Activity }

export function StatusPill({ v }: { v: NonNullable<ReturnType<typeof useBattle>> }) {
  if (v.phase === 'pre')
    return (
      <Badge className="border-gold/40 text-gold">
        <Clock className="h-3 w-3" /> Starts {fmtTime(v.countdown)}
      </Badge>
    )
  if (v.phase === 'final') return <Badge className="border-toxic/40 text-toxic">Final</Badge>
  return <LiveBadge label={v.phase === 'judging' ? 'JUDGING' : v.phase === 'locked' ? 'LIVE · LOCKED' : 'LIVE'} />
}

export function FightCard({ id, big = false }: { id: string; big?: boolean }) {
  const v = useBattle(id)
  if (!v) return null
  const arena = arenaById(v.battle.arenaId)!
  const Icon = ARENA_ICON[arena.id]
  const winner = v.phase === 'final' ? (v.settlement?.winner ?? null) : null
  const go = () => navigate(`/battle/${id}`)
  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      onClick={go}
      className="group steel relative cursor-pointer overflow-hidden border border-edge transition-colors hover:border-white/20"
    >
      <div className="absolute inset-x-0 top-0 h-[3px]" style={{ background: `linear-gradient(90deg, ${v.agentA.color}, ${arena.color}, ${v.agentB.color})` }} />
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: `radial-gradient(ellipse at 50% 0%, ${hexA(arena.color, 0.14)}, transparent 70%)` }} />
      <div className="cage absolute inset-0 opacity-40" />

      <div className="relative p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.22em]" style={{ color: arena.color }}>
              <Icon className="h-3.5 w-3.5" /> Arena {arena.num} · {arena.name}
            </div>
            <h3 className="mt-1.5 truncate font-display text-xl uppercase tracking-wide text-bone">{v.battle.challenge}</h3>
          </div>
          <StatusPill v={v} />
        </div>

        <div className={cn('mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-2', big && 'mt-7')}>
          <Fighter v={v} side="a" big={big} winner={winner} />
          <div className="text-center">
            <div className="font-display text-3xl italic leading-none fire-text">VS</div>
          </div>
          <Fighter v={v} side="b" big={big} winner={winner} />
        </div>

        {v.phase !== 'pre' && v.phase !== 'final' && (
          <div className="mt-5 space-y-1.5">
            <MiniBar color={v.agentA.color} value={v.a.progress} />
            <MiniBar color={v.agentB.color} value={v.b.progress} />
          </div>
        )}

        <div className="mt-5 flex items-center justify-between border-t border-white/[.06] pt-4">
          <div className="flex items-center gap-4 font-mono text-[11px] text-bone/60">
            <span className="flex items-center gap-1.5" title="Total virtual credits in pool">
              <Coins className="h-3.5 w-3.5 text-gold" />
              <b className="text-gold">{fmt(v.total)}</b> AC
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" /> {fmtCompact(v.spectators)}
            </span>
          </div>
          <Button variant={v.phase === 'final' ? 'outline' : 'blood'} size="sm" onClick={(e) => { e.stopPropagation(); go() }}>
            {v.phase === 'final' ? 'Results' : v.phase === 'pre' ? 'Preview' : 'Enter Arena'} <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </motion.article>
  )
}

function Fighter({ v, side, big, winner }: { v: NonNullable<ReturnType<typeof useBattle>>; side: 'a' | 'b'; big: boolean; winner: 'a' | 'b' | null }) {
  const agent = side === 'a' ? v.agentA : v.agentB
  const odds = side === 'a' ? v.oddsA : v.oddsB
  const prob = side === 'a' ? v.probA : v.probB
  const lost = winner && winner !== side
  return (
    <div className={cn('flex min-w-0 flex-col items-center text-center', side === 'a' ? 'sm:items-start sm:text-left' : 'sm:items-end sm:text-right')}>
      <div className="relative">
        <AgentAvatar agent={agent} size={big ? 84 : 64} glow={!lost} dim={!!lost} />
        {winner === side && <Crown className="absolute -top-3 left-1/2 h-5 w-5 -translate-x-1/2 fill-gold text-gold drop-shadow-[0_0_6px_#ffc531]" />}
      </div>
      <div className="mt-2 w-full truncate font-display text-lg uppercase tracking-wide" style={{ color: lost ? '#6b6a73' : agent.color }}>
        {agent.short}
      </div>
      <div className="font-mono text-[10px] text-ash">{agent.studio}</div>
      <div className="mt-1.5 flex items-baseline gap-1.5 font-mono">
        <span className="text-base font-bold text-bone">{odds.toFixed(2)}x</span>
        <span className="text-[10px] text-ash">{Math.round(prob * 100)}%</span>
      </div>
    </div>
  )
}

function MiniBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-1.5 overflow-hidden bg-white/5">
      <motion.div className="h-full" style={{ background: color, boxShadow: `0 0 10px ${color}` }} animate={{ width: `${value}%` }} transition={{ ease: 'linear', duration: 0.3 }} />
    </div>
  )
}

export function ArenaCard({ arena, index = 0 }: { arena: Arena; index?: number }) {
  const Icon = ARENA_ICON[arena.id]
  const live = BATTLES.filter((b) => b.arenaId === arena.id && b.kind === 'live').length
  const upcoming = BATTLES.filter((b) => b.arenaId === arena.id && b.kind === 'upcoming').length
  return (
    <motion.button
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      whileHover={{ y: -6 }}
      onClick={() => navigate(`/arena/${arena.id}`)}
      className="group relative flex min-h-[380px] cursor-pointer flex-col overflow-hidden border border-edge bg-coal text-left"
    >
      <ArenaArt arena={arena} />
      <Corners color={arena.color} size={22} />
      <div className="relative z-10 flex flex-1 flex-col p-6">
        <div className="flex items-center justify-between">
          <span className="font-display text-7xl leading-none text-stroke transition-all duration-500 group-hover:[-webkit-text-stroke-color:var(--c)]" style={{ ['--c' as string]: arena.color }}>
            {arena.num}
          </span>
          <span className="grid h-12 w-12 place-items-center border clip-cut-sm" style={{ borderColor: hexA(arena.color, 0.5), background: hexA(arena.color, 0.1) }}>
            <Icon className="h-6 w-6" style={{ color: arena.color }} />
          </span>
        </div>
        <div className="mt-auto">
          <div className="font-mono text-[10px] font-bold tracking-[0.3em]" style={{ color: arena.color }}>ARENA {arena.num}</div>
          <h3 className="mt-1 font-display text-4xl uppercase leading-[0.95] tracking-wide">{arena.name}</h3>
          <p className="mt-2 text-sm italic text-bone/50">“{arena.tagline}”</p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {arena.disciplines.map((d) => (
              <span key={d} className="border border-white/10 bg-black/40 px-2 py-0.5 text-[11px] text-bone/70">{d}</span>
            ))}
          </div>
          <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 font-mono text-[11px]">
            <span className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-blood"><span className="live-dot h-1.5 w-1.5 rounded-full bg-blood" /> {live} live</span>
              <span className="flex items-center gap-1.5 text-ash"><Eye className="h-3 w-3" /> {upcoming} upcoming</span>
            </span>
            <span className="flex items-center gap-1 font-bold uppercase tracking-widest transition-transform group-hover:translate-x-1" style={{ color: arena.color }}>
              Enter <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
      </div>
    </motion.button>
  )
}

/** Visually distinct CSS art per arena. */
export function ArenaArt({ arena, strong = false }: { arena: Arena; strong?: boolean }) {
  const c = arena.color
  const o = strong ? 1.4 : 1
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute inset-0 transition-opacity duration-500 group-hover:opacity-100" style={{ opacity: 0.85, background: `radial-gradient(ellipse at 80% 0%, ${hexA(c, 0.28 * o)}, transparent 60%), radial-gradient(ellipse at 0% 100%, ${hexA(arena.color2, 0.16 * o)}, transparent 55%)` }} />
      {arena.id === 'math' && (
        <div className="absolute inset-0 overflow-hidden font-mono text-[13px] leading-6 opacity-[.13]" style={{ color: c }}>
          {Array.from({ length: 14 }).map((_, i) => (
            <div key={i} className="whitespace-nowrap" style={{ transform: `translateX(${-(i * 37) % 120}px)` }}>
              ∫ eˣ dx = eˣ + C · Σ 1/n² = π²/6 · ∂f/∂x · lim x→0 sin x / x = 1 · det(A − λI) = 0 · ∇·F · e^(iπ) + 1 = 0 ·
            </div>
          ))}
        </div>
      )}
      {arena.id === 'cyber' && (
        <>
          <div className="scanlines absolute inset-0 opacity-80" />
          <div className="absolute inset-0 opacity-[.14]" style={{ backgroundImage: `linear-gradient(${c} 1px, transparent 1px), linear-gradient(90deg, ${c} 1px, transparent 1px)`, backgroundSize: '32px 32px' }} />
          <div className="absolute -right-10 top-10 font-mono text-[11px] leading-5 opacity-25" style={{ color: c }}>
            {['SELECT * FROM users', "WHERE id = '1' OR", '-- CWE-89 FLAGGED', '0x41414141', 'ACCESS: SANDBOX', 'TRACE ▸ /account'].map((l) => <div key={l}>{l}</div>)}
          </div>
        </>
      )}
      {arena.id === 'code' && (
        <>
          <div className="cage-strong absolute inset-0" />
          <div className="absolute -right-6 -top-10 font-display text-[220px] leading-none opacity-[.08]" style={{ color: c }}>{'{ }'}</div>
        </>
      )}
      {arena.id === 'pattern' && (
        <svg className="absolute inset-0 h-full w-full opacity-30" preserveAspectRatio="none" viewBox="0 0 400 300">
          {[0, 1, 2, 3, 4].map((i) => (
            <path key={i} d={`M0 ${120 + i * 26} ${Array.from({ length: 21 }, (_, k) => `L${k * 20} ${120 + i * 26 + Math.sin(k * 0.8 + i) * (14 + i * 3) + (k === 13 && i === 2 ? -60 : 0)}`).join(' ')}`} fill="none" stroke={i === 2 ? c : arena.color2} strokeWidth={i === 2 ? 2 : 1} strokeOpacity={i === 2 ? 1 : 0.5} />
          ))}
          <circle cx="260" cy="112" r="9" fill="none" stroke={c} strokeWidth="2" />
        </svg>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-coal via-coal/70 to-transparent" />
    </div>
  )
}

export const allArenas = ARENAS
