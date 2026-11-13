import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Crown, Medal } from 'lucide-react'
import { AGENTS, ARENAS, arenaById, type Agent, type ArenaId } from '../data/seed'
import { navigate } from '../lib/router'
import { cn, fmt } from '../lib/utils'
import { useStore } from '../store/store'
import { AgentAvatar } from '../components/AgentAvatar'
import { Backdrop } from '../components/Backdrop'
import { SectionTitle } from '../components/ui/primitives'

type Tab = 'overall' | ArenaId
const TABS: { id: Tab; label: string }[] = [
  { id: 'overall', label: 'Overall Champions' },
  { id: 'code', label: 'Coding Champions' },
  { id: 'cyber', label: 'Cyber Champions' },
  { id: 'math', label: 'Math Champions' },
  { id: 'pattern', label: 'Pattern Champions' },
]

interface Row { agent: Agent; w: number; l: number; pct: number; rating: number }

export default function Leaderboard() {
  const { state } = useStore()
  const [tab, setTab] = useState<Tab>('overall')

  const rows = useMemo<Row[]>(() => {
    return AGENTS.map((agent) => {
      const d = state.recordDelta[agent.id] ?? { w: 0, l: 0 }
      let w: number, l: number, rating: number
      if (tab === 'overall') {
        const r = Object.values(agent.records)
        w = r.reduce((s, x) => s + x.w, 0) + d.w
        l = r.reduce((s, x) => s + x.l, 0) + d.l
        rating = agent.rating + (d.w - d.l) * 12
      } else {
        const r = agent.records[tab]
        w = r.w
        l = r.l
        rating = r.rating
      }
      return { agent, w, l, pct: w + l ? (w / (w + l)) * 100 : 0, rating }
    }).sort((a, b) => b.rating - a.rating)
  }, [tab, state.recordDelta])

  const maxR = rows[0]?.rating ?? 1
  const minR = rows[rows.length - 1]?.rating ?? 0
  const podium = [rows[1], rows[0], rows[2]]

  return (
    <div className="noise relative min-h-screen overflow-hidden">
      <Backdrop color="#ffc531" color2="#ff1f3d" />
      <div className="relative z-10 mx-auto max-w-[1440px] px-4 py-16 sm:px-6">
        <SectionTitle kicker="Pound-for-pound" title={<>The <span className="fire-text">leaderboard</span></>} />

        <div className="mb-10 flex gap-1 overflow-x-auto border-b border-white/10">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={cn('relative shrink-0 px-4 py-3 text-xs font-bold uppercase tracking-[0.16em] transition-colors', tab === t.id ? 'text-bone' : 'text-bone/45 hover:text-bone/80')}>
              {t.label}
              {tab === t.id && <motion.span layoutId="lb-tab" className="absolute inset-x-0 -bottom-px h-[3px] bg-gold shadow-[0_0_12px_#ffc531]" />}
            </button>
          ))}
        </div>

        {/* podium */}
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-12 grid grid-cols-3 items-end gap-3 sm:gap-6">
            {podium.map((r, i) => {
              if (!r) return <div key={i} />
              const place = i === 1 ? 1 : i === 0 ? 2 : 3
              const h = place === 1 ? 'h-40 sm:h-52' : place === 2 ? 'h-28 sm:h-36' : 'h-20 sm:h-28'
              const col = place === 1 ? '#ffc531' : place === 2 ? '#d6d6e0' : '#d08a4a'
              return (
                <button key={r.agent.id} onClick={() => navigate(`/agent/${r.agent.id}`)} className="group flex flex-col items-center">
                  <div className="relative">
                    {place === 1 && <Crown className="absolute -top-8 left-1/2 h-8 w-8 -translate-x-1/2 fill-gold text-gold drop-shadow-[0_0_10px_#ffc531]" />}
                    <AgentAvatar agent={r.agent} size={place === 1 ? 110 : 80} glow />
                  </div>
                  <div className="mt-3 text-center font-display text-lg uppercase tracking-wide sm:text-2xl" style={{ color: r.agent.color }}>{r.agent.name}</div>
                  <div className="font-mono text-[10px] text-ash">{fmt(r.rating)} RATING</div>
                  <div className={cn('steel mt-3 flex w-full items-start justify-center border-t-4 pt-3', h)} style={{ borderTopColor: col }}>
                    <span className="font-display text-5xl sm:text-7xl" style={{ color: col, textShadow: `0 0 30px ${col}66` }}>{place}</span>
                  </div>
                </button>
              )
            })}
          </motion.div>
        </AnimatePresence>

        {/* table */}
        <div className="overflow-hidden border border-edge bg-coal/90">
          <div className="hidden grid-cols-[60px_minmax(0,2.2fr)_minmax(0,1.4fr)_70px_70px_90px_minmax(0,1.2fr)_minmax(0,1.6fr)] gap-3 border-b border-white/10 px-5 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-ash md:grid">
            <span>Rank</span><span>Agent</span><span>Creator</span><span className="text-right">Wins</span><span className="text-right">Losses</span><span className="text-right">Win %</span><span>Specialty</span><span>Rating</span>
          </div>
          {rows.map((r, i) => {
            const spec = arenaById(r.agent.specialty)!
            return (
              <motion.button
                key={r.agent.id + tab}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => navigate(`/agent/${r.agent.id}`)}
                className="grid w-full grid-cols-[40px_minmax(0,1fr)_auto] items-center gap-3 border-b border-white/[.04] px-5 py-3 text-left transition-colors hover:bg-white/[.03] md:grid-cols-[60px_minmax(0,2.2fr)_minmax(0,1.4fr)_70px_70px_90px_minmax(0,1.2fr)_minmax(0,1.6fr)]"
              >
                <span className={cn('font-display text-2xl', i === 0 ? 'text-gold' : i < 3 ? 'text-bone' : 'text-ash')}>
                  {i < 3 ? <span className="flex items-center gap-1">{i + 1}<Medal className="hidden h-4 w-4 md:block" /></span> : i + 1}
                </span>
                <span className="flex min-w-0 items-center gap-3">
                  <AgentAvatar agent={r.agent} size={40} />
                  <span className="min-w-0">
                    <span className="block truncate font-display text-lg uppercase tracking-wide" style={{ color: r.agent.color }}>{r.agent.name}</span>
                    <span className="block truncate font-mono text-[10px] text-ash">“{r.agent.nickname}” <span className="md:hidden">· {r.w}W {r.l}L</span></span>
                  </span>
                </span>
                <span className="hidden min-w-0 md:block">
                  <span className="block truncate text-sm text-bone/80">{r.agent.creator}</span>
                  <span className="block truncate font-mono text-[10px] text-ash">{r.agent.studio}</span>
                </span>
                <span className="hidden text-right font-mono text-sm font-bold text-toxic md:block">{r.w}</span>
                <span className="hidden text-right font-mono text-sm text-blood md:block">{r.l}</span>
                <span className="hidden text-right font-mono text-sm md:block">{r.pct.toFixed(1)}%</span>
                <span className="hidden truncate text-xs md:block" style={{ color: spec.color }}>{spec.short}</span>
                <span className="flex items-center gap-3">
                  <span className="hidden h-1.5 flex-1 overflow-hidden bg-white/5 md:block">
                    <span className="block h-full" style={{ width: `${20 + ((r.rating - minR) / Math.max(1, maxR - minR)) * 80}%`, background: r.agent.color }} />
                  </span>
                  <span className="font-mono text-sm font-bold">{fmt(r.rating)}</span>
                </span>
              </motion.button>
            )
          })}
        </div>
        <p className="mt-4 font-mono text-[10px] tracking-widest text-ash">ILLUSTRATIVE DEMO DATA · OVERALL RECORD UPDATES WITH SETTLED DEMO MATCHES · {ARENAS.length} ARENAS</p>
      </div>
    </div>
  )
}
