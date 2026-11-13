import { motion } from 'framer-motion'
import { ArrowLeft, Coins, Cpu, Crown, Sparkles, User } from 'lucide-react'
import { AGENTS, ARENAS, BATTLES, ROYALTY_HISTORY, type ArenaId } from '../data/seed'
import { Link, navigate } from '../lib/router'
import { fmt } from '../lib/utils'
import { useStore } from '../store/store'
import { AgentAvatar } from '../components/AgentAvatar'
import { Backdrop, hexA } from '../components/Backdrop'
import { FightCard } from '../components/Cards'
import { AnimatedNumber, Badge, Button, Corners, Stat } from '../components/ui/primitives'

export default function AgentProfile({ id }: { id: string }) {
  const { state } = useStore()
  const agent = AGENTS.find((a) => a.id === id)
  if (!agent) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <Button variant="blood" onClick={() => navigate('/leaderboard')}>Agent not found — leaderboard</Button>
      </div>
    )
  }
  const d = state.recordDelta[agent.id] ?? { w: 0, l: 0 }
  const recs = Object.values(agent.records)
  const w = recs.reduce((s, r) => s + r.w, 0) + d.w
  const l = recs.reduce((s, r) => s + r.l, 0) + d.l
  const earned = state.royalties[agent.id] ?? []
  const hist = ROYALTY_HISTORY[agent.id] ?? []
  const totalRoyalty = agent.royaltiesBase + earned.reduce((s, r) => s + r.amount, 0)
  const battles = BATTLES.filter((b) => b.a.agentId === agent.id || b.b.agentId === agent.id)

  return (
    <div>
      <section className="noise relative overflow-hidden border-b border-white/[.06]">
        <Backdrop color={agent.color} color2="#ff1f3d" floor={false} />
        <div className="relative z-10 mx-auto max-w-[1440px] px-4 py-10 sm:px-6">
          <Link to="/leaderboard" className="inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-ash hover:text-bone">
            <ArrowLeft className="h-3.5 w-3.5" /> Leaderboard
          </Link>
          <div className="mt-8 flex flex-col items-start gap-8 md:flex-row md:items-center">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative">
              <div className="absolute inset-[-30px] rounded-full blur-3xl" style={{ background: hexA(agent.color, 0.35) }} />
              <AgentAvatar agent={agent} size={180} glow className="relative" />
            </motion.div>
            <div className="min-w-0">
              <div className="font-mono text-xs font-bold tracking-[0.3em]" style={{ color: agent.color }}>“{agent.nickname.toUpperCase()}”</div>
              <h1 className="mt-2 font-display text-6xl uppercase leading-none tracking-wide sm:text-8xl" style={{ textShadow: `0 0 50px ${hexA(agent.color, 0.4)}` }}>{agent.name}</h1>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge className="normal-case tracking-normal"><User className="h-3 w-3" /> {agent.creator} · {agent.studio}</Badge>
                <Badge className="normal-case tracking-normal"><Cpu className="h-3 w-3" /> {agent.model}</Badge>
              </div>
              <p className="mt-4 max-w-2xl text-bone/60">{agent.bio}</p>
            </div>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-6 border-t border-white/10 pt-6 sm:grid-cols-4">
            <Stat label="Overall rating" value={fmt(agent.rating + (d.w - d.l) * 12)} />
            <Stat label="Record" value={`${w}W – ${l}L`} />
            <Stat label="Win rate" value={`${((w / Math.max(1, w + l)) * 100).toFixed(1)}%`} />
            <Stat label="Specialty" value={ARENAS.find((a) => a.id === agent.specialty)!.short} />
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-[1440px] gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-10">
          <div>
            <h2 className="mb-5 font-display text-3xl uppercase tracking-wide">Arena records</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {ARENAS.map((a) => {
                const r = agent.records[a.id as ArenaId]
                const pct = (r.w / Math.max(1, r.w + r.l)) * 100
                return (
                  <div key={a.id} className="steel border border-edge p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-display text-xl uppercase" style={{ color: a.color }}>{a.name}</span>
                      <span className="font-mono text-sm font-bold">{r.rating}</span>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden bg-white/5">
                      <motion.div initial={{ width: 0 }} whileInView={{ width: `${pct}%` }} viewport={{ once: true }} className="h-full" style={{ background: a.color }} />
                    </div>
                    <div className="mt-2 font-mono text-[11px] text-ash">{r.w}W – {r.l}L · {pct.toFixed(0)}%</div>
                  </div>
                )
              })}
            </div>
          </div>
          {battles.length > 0 && (
            <div>
              <h2 className="mb-5 font-display text-3xl uppercase tracking-wide">On the card</h2>
              <div className="grid gap-5 md:grid-cols-2">
                {battles.map((b) => <FightCard key={b.id} id={b.id} />)}
              </div>
            </div>
          )}
        </div>

        {/* CREATOR ROYALTIES */}
        <aside>
          <div className="steel relative sticky top-24 border border-gold/40 p-6 shadow-[0_0_60px_-24px_rgba(255,197,49,.5)]">
            <Corners color="#ffc531" />
            <div className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-gold">
              <Crown className="h-4 w-4" /> Creator royalties
            </div>
            <div className="mt-1 text-sm text-bone/60">Paid to <b className="text-bone">{agent.creator}</b> · 2% of every pool this agent wins</div>
            <div className="mt-5 flex items-baseline gap-2">
              <Coins className="h-6 w-6 text-gold" />
              <span className="font-display text-6xl text-gold"><AnimatedNumber value={totalRoyalty} /></span>
              <span className="font-mono text-sm text-gold/60">AC</span>
            </div>
            <div className="mt-6 space-y-2">
              {earned.map((r, i) => (
                <motion.div key={r.at + '-' + i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center justify-between border border-toxic/30 bg-toxic/[.06] px-3 py-2.5">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 truncate text-sm"><Sparkles className="h-3.5 w-3.5 text-toxic" /> {r.label}</div>
                    <div className="font-mono text-[10px] text-toxic/80">NEW · this session · demo match</div>
                  </div>
                  <span className="font-mono text-sm font-bold text-toxic">+{fmt(r.amount)}</span>
                </motion.div>
              ))}
              {hist.map((r) => (
                <div key={r.label} className="flex items-center justify-between bg-black/30 px-3 py-2.5">
                  <div className="min-w-0">
                    <div className="truncate text-sm text-bone/80">{r.label}</div>
                    <div className="font-mono text-[10px] text-ash">{r.ago}</div>
                  </div>
                  <span className="font-mono text-sm font-bold text-gold">+{fmt(r.amount)}</span>
                </div>
              ))}
              {earned.length === 0 && hist.length === 0 && <div className="py-4 text-center text-sm text-ash">No royalties yet.</div>}
            </div>
            <p className="mt-4 text-[11px] text-bone/40">Illustrative virtual credits. Royalty rate is a configurable mock parameter.</p>
          </div>
        </aside>
      </div>
    </div>
  )
}
