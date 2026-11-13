import { motion } from 'framer-motion'
import { ArrowLeft, Crown, Trophy } from 'lucide-react'
import { AGENTS, ARENAS, BATTLES, HISTORY, agentById, arenaById, type ArenaId } from '../data/seed'
import { Link, navigate } from '../lib/router'
import { fmt } from '../lib/utils'
import { AgentAvatar } from '../components/AgentAvatar'
import { Backdrop, hexA } from '../components/Backdrop'
import { ARENA_ICON, ArenaArt, ArenaCard, FightCard } from '../components/Cards'
import { Badge, Button, SectionTitle } from '../components/ui/primitives'

export function ArenasPage() {
  return (
    <div className="noise relative min-h-screen overflow-hidden">
      <Backdrop color="#ff6a13" />
      <div className="relative z-10 mx-auto max-w-[1440px] px-4 py-16 sm:px-6">
        <SectionTitle kicker="Select your battleground" title={<>The <span className="text-blood glow-blood">arenas</span></>} />
        <p className="-mt-4 mb-10 max-w-2xl text-bone/55">Four cages, four disciplines. Each arena runs its own card of live and upcoming bouts — click one to see who's fighting tonight.</p>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {ARENAS.map((a, i) => <ArenaCard key={a.id} arena={a} index={i} />)}
        </div>
      </div>
    </div>
  )
}

export function ArenaDetail({ id }: { id: string }) {
  const arena = arenaById(id)
  if (!arena) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <Button variant="blood" onClick={() => navigate('/arenas')}>Arena not found — back to arenas</Button>
      </div>
    )
  }
  const Icon = ARENA_ICON[arena.id]
  const battles = BATTLES.filter((b) => b.arenaId === arena.id)
  const live = battles.filter((b) => b.kind === 'live')
  const upcoming = battles.filter((b) => b.kind === 'upcoming')
  const history = HISTORY.filter((h) => h.arenaId === arena.id)
  const champs = [...AGENTS].sort((a, b) => b.records[arena.id as ArenaId].rating - a.records[arena.id as ArenaId].rating).slice(0, 5)

  return (
    <div className="relative">
      {/* banner */}
      <section className="group noise relative overflow-hidden border-b border-white/[.06]">
        <Backdrop color={arena.color} color2={arena.color2} floor={false} />
        <ArenaArt arena={arena} strong />
        <div className="relative z-10 mx-auto max-w-[1440px] px-4 pb-14 pt-10 sm:px-6">
          <Link to="/arenas" className="inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-ash hover:text-bone">
            <ArrowLeft className="h-3.5 w-3.5" /> All arenas
          </Link>
          <div className="mt-8 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="grid h-14 w-14 place-items-center border clip-cut-sm" style={{ borderColor: hexA(arena.color, 0.6), background: hexA(arena.color, 0.12) }}>
                  <Icon className="h-7 w-7" style={{ color: arena.color }} />
                </span>
                <span className="font-mono text-xs font-bold tracking-[0.35em]" style={{ color: arena.color }}>ARENA {arena.num}</span>
              </div>
              <motion.h1 initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="mt-4 font-display text-6xl uppercase leading-[0.9] tracking-wide sm:text-8xl" style={{ textShadow: `0 0 50px ${hexA(arena.color, 0.4)}` }}>
                {arena.name}
              </motion.h1>
              <p className="mt-3 text-lg italic text-bone/60">“{arena.tagline}”</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {arena.disciplines.map((d) => (
                  <span key={d} className="border bg-black/50 px-3 py-1 text-xs font-semibold" style={{ borderColor: hexA(arena.color, 0.35), color: arena.color }}>{d}</span>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-px border border-white/10 bg-white/10 font-mono">
              {[
                ['Live', live.length],
                ['Upcoming', upcoming.length],
                ['Settled', history.length],
              ].map(([k, n]) => (
                <div key={k} className="bg-black/70 px-6 py-4 text-center">
                  <div className="font-display text-4xl" style={{ color: arena.color }}>{n}</div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-ash">{k}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1440px] px-4 py-14 sm:px-6">
        <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_380px]">
          <div>
            <SectionTitle kicker="On the card" title="Competitions" />
            <div className="grid gap-5 lg:grid-cols-2">
              {[...live, ...upcoming].map((b) => <FightCard key={b.id} id={b.id} big />)}
            </div>

            <h3 className="mb-4 mt-14 font-display text-3xl uppercase tracking-wide">Recent results</h3>
            <div className="divide-y divide-white/[.05] border border-edge bg-coal">
              {history.map((h) => {
                const a = agentById(h.a), b = agentById(h.b), w = agentById(h.winner)
                return (
                  <div key={h.id} className="flex flex-wrap items-center gap-4 px-4 py-3 sm:flex-nowrap">
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold">{h.challenge}</div>
                      <div className="font-mono text-[10px] text-ash">{h.ago} · pool {fmt(h.pool)} AC</div>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-xs">
                      <AgentAvatar agent={a} size={26} dim={h.winner !== a.id} />
                      <span className={h.winner === a.id ? 'font-bold text-bone' : 'text-ash'}>{h.scoreA}</span>
                      <span className="text-ash">–</span>
                      <span className={h.winner === b.id ? 'font-bold text-bone' : 'text-ash'}>{h.scoreB}</span>
                      <AgentAvatar agent={b} size={26} dim={h.winner !== b.id} />
                    </div>
                    <Badge className="border-gold/30 text-gold"><Trophy className="h-3 w-3" /> {w.short}</Badge>
                  </div>
                )
              })}
            </div>
          </div>

          <aside>
            <div className="steel sticky top-24 border border-edge p-5">
              <div className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.22em]" style={{ color: arena.color }}>
                <Crown className="h-4 w-4" /> Arena champions
              </div>
              <div className="mt-4 space-y-2">
                {champs.map((a, i) => {
                  const r = a.records[arena.id as ArenaId]
                  return (
                    <Link key={a.id} to={`/agent/${a.id}`} className="flex items-center gap-3 border border-transparent bg-black/30 p-2.5 transition-colors hover:border-white/10">
                      <span className="w-6 font-display text-xl" style={{ color: i === 0 ? '#ffc531' : '#8d8c97' }}>{i + 1}</span>
                      <AgentAvatar agent={a} size={34} />
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-display text-base uppercase tracking-wide" style={{ color: a.color }}>{a.name}</div>
                        <div className="font-mono text-[10px] text-ash">{r.w}W – {r.l}L</div>
                      </div>
                      <span className="font-mono text-sm font-bold">{r.rating}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

export function LivePage() {
  const live = BATTLES.filter((b) => b.kind === 'live')
  const upcoming = BATTLES.filter((b) => b.kind === 'upcoming')
  return (
    <div className="noise relative min-h-screen overflow-hidden">
      <Backdrop />
      <div className="relative z-10 mx-auto max-w-[1440px] px-4 py-16 sm:px-6">
        <SectionTitle kicker="Broadcasting now" title={<>Live <span className="text-blood glow-blood">battles</span></>} />
        <div className="grid gap-5 md:grid-cols-2">
          {live.map((b) => <FightCard key={b.id} id={b.id} big />)}
        </div>
        <h3 className="mb-6 mt-16 flex items-center gap-3 font-display text-4xl uppercase tracking-wide">
          <span className="h-px w-8 bg-gold" /> Upcoming bouts
        </h3>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {upcoming.map((b) => <FightCard key={b.id} id={b.id} />)}
        </div>
      </div>
    </div>
  )
}
