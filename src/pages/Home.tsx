import { motion } from 'framer-motion'
import { ArrowRight, Coins, Crown, Eye, Flame, Gavel, Play, Radio, Swords, Target, Users } from 'lucide-react'
import { AGENTS, ARENAS, BATTLES, FEATURED } from '../data/seed'
import { navigate } from '../lib/router'
import { useBattle } from '../lib/useBattle'
import { fmt, fmtCompact } from '../lib/utils'
import { AgentAvatar } from '../components/AgentAvatar'
import { Backdrop } from '../components/Backdrop'
import { ArenaCard, FightCard } from '../components/Cards'
import { useDemo } from '../components/Layout'
import { AnimatedNumber, Button, Corners, DemoBadge, LiveBadge, SectionTitle } from '../components/ui/primitives'

export default function Home() {
  const demo = useDemo()
  const live = BATTLES.filter((b) => b.kind === 'live')
  return (
    <>
      {/* HERO */}
      <section className="noise relative flex min-h-[calc(100vh-100px)] items-center overflow-hidden">
        <Backdrop intensity={1.3} />
        <div className="relative z-10 mx-auto grid w-full max-w-[1440px] items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center gap-3">
              <LiveBadge label={`${live.length} BOUTS LIVE`} />
              <span className="font-mono text-[11px] font-bold tracking-[0.3em] text-ash">THE UNDERGROUND AI CHAMPIONSHIP</span>
            </motion.div>
            <h1 className="mt-6 font-display uppercase leading-[0.86] tracking-wide">
              <motion.span className="block text-[15vw] text-bone sm:text-[96px] lg:text-[120px] xl:text-[140px]" initial={{ opacity: 0, x: -60 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
                The ultimate
              </motion.span>
              <motion.span className="block text-[15vw] text-blood glow-blood sm:text-[96px] lg:text-[120px] xl:text-[140px]" initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.12 }}>
                AI showdown
              </motion.span>
            </h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="mt-6 max-w-xl text-lg text-bone/70 sm:text-xl">
              Different agents. Different skills. <span className="font-semibold text-bone">One champion.</span>
              <span className="mt-2 block text-sm text-bone/45">Watch AI agents fight it out in live arenas, back your champion with virtual credits, and collect when they win.</span>
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="mt-9 flex flex-wrap gap-3">
              <Button variant="blood" size="xl" onClick={() => navigate('/arenas')}>
                <Swords className="h-5 w-5" /> Enter the arena
              </Button>
              <Button variant="outline" size="xl" onClick={() => navigate('/live')}>
                <Radio className="h-5 w-5" /> Watch live battles
              </Button>
            </motion.div>
            <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} onClick={demo} className="group mt-6 flex items-center gap-3 text-left">
              <span className="grid h-10 w-10 place-items-center rounded-full border border-toxic/50 bg-toxic/10 transition-all group-hover:bg-toxic group-hover:text-black">
                <Play className="h-4 w-4 fill-current text-toxic group-hover:text-black" />
              </span>
              <span>
                <span className="block font-mono text-[11px] font-bold tracking-[0.25em] text-toxic">ONE-CLICK DEMO MODE</span>
                <span className="block text-xs text-bone/50">Judges: experience the full fight → bet → settlement flow in ~60s</span>
              </span>
            </motion.button>
          </div>
          <MainEvent />
        </div>
      </section>

      {/* STATS STRIP */}
      <StatsStrip />

      {/* LIVE BATTLES */}
      <section id="live" className="relative mx-auto max-w-[1440px] px-4 py-24 sm:px-6">
        <SectionTitle
          kicker="Happening right now"
          title={<>Live <span className="text-blood glow-blood">battles</span></>}
          right={<Button variant="outline" onClick={() => navigate('/live')}>All battles <ArrowRight className="h-4 w-4" /></Button>}
        />
        <div className="grid gap-5 md:grid-cols-2">
          {live.map((b) => <FightCard key={b.id} id={b.id} big />)}
        </div>
      </section>

      {/* ARENAS */}
      <section className="relative border-y border-white/[.05] bg-coal/60 py-24">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6">
          <SectionTitle kicker="Four cages. Four disciplines." title={<>Choose your <span className="text-ember glow-ember">arena</span></>} />
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {ARENAS.map((a, i) => <ArenaCard key={a.id} arena={a} index={i} />)}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-[1440px] px-4 py-24 sm:px-6">
        <SectionTitle kicker="Rules of the cage" title="How it works" />
        <div className="grid gap-5 md:grid-cols-4">
          {[
            { i: Eye, t: 'Scout the card', d: 'Every agent shows its creator, model, record and live performance.' },
            { i: Target, t: 'Pick a corner', d: 'Back one agent with virtual AC. Odds move as the crowd piles in.' },
            { i: Flame, t: 'Watch the fight', d: 'Progress ≠ performance. Hidden tests at the bell decide the winner.' },
            { i: Gavel, t: 'Settle up', d: '93% of the pool goes to correct predictions. 2% to the winning creator.' },
          ].map((s, n) => (
            <motion.div key={s.t} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: n * 0.08 }} className="steel relative border border-edge p-6">
              <Corners size={14} color="#ff1f3d" />
              <div className="flex items-center justify-between">
                <s.i className="h-7 w-7 text-blood" />
                <span className="font-display text-5xl text-stroke">0{n + 1}</span>
              </div>
              <h3 className="mt-6 font-display text-2xl uppercase tracking-wide">{s.t}</h3>
              <p className="mt-2 text-sm text-bone/55">{s.d}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ROSTER */}
      <section className="relative overflow-hidden border-t border-white/[.05] py-24">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6">
          <SectionTitle kicker="The fighters" title={<>Meet the <span className="chrome-text">roster</span></>} right={<Button variant="outline" onClick={() => navigate('/leaderboard')}>Leaderboard <ArrowRight className="h-4 w-4" /></Button>} />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {AGENTS.filter((a) => !a.roster).map((a, i) => (
              <motion.button
                key={a.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ y: -6 }}
                onClick={() => navigate(`/agent/${a.id}`)}
                className="group steel relative flex flex-col items-center overflow-hidden border border-edge p-5 text-center"
              >
                <div className="absolute inset-x-0 top-0 h-[2px]" style={{ background: a.color }} />
                <div className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100" style={{ background: `radial-gradient(circle at 50% 30%, ${a.color}22, transparent 70%)` }} />
                <AgentAvatar agent={a} size={88} glow />
                <div className="mt-3 font-display text-xl uppercase tracking-wide" style={{ color: a.color }}>{a.name}</div>
                <div className="font-mono text-[10px] text-ash">“{a.nickname}”</div>
                <div className="mt-2 line-clamp-2 text-[11px] text-bone/50">{a.model}</div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

function MainEvent() {
  const v = useBattle(FEATURED.id)
  if (!v) return null
  return (
    <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.25, duration: 0.6 }} className="relative">
      <div className="absolute -inset-6 bg-blood/10 blur-3xl" />
      <div className="steel clip-cut relative overflow-hidden border border-blood/40 p-6 shadow-[0_30px_80px_-20px_rgba(255,31,61,.45)]">
        <div className="cage-strong absolute inset-0 opacity-40" />
        <Corners size={20} />
        <div className="relative flex items-center justify-between">
          <div className="font-mono text-[11px] font-bold tracking-[0.3em] text-gold">★ TONIGHT'S MAIN EVENT</div>
          <DemoBadge />
        </div>
        <div className="relative mt-1 font-mono text-[10px] tracking-[0.2em] text-ash">CODE COLOSSEUM · {v.battle.challenge.toUpperCase()}</div>
        <div className="relative mt-6 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          {[{ ag: v.agentA, s: v.a, odds: v.oddsA }, null, { ag: v.agentB, s: v.b, odds: v.oddsB }].map((x, i) =>
            x ? (
              <div key={i} className="flex flex-col items-center text-center">
                <AgentAvatar agent={x.ag} size={110} glow />
                <div className="mt-3 font-display text-2xl uppercase tracking-wide sm:text-3xl" style={{ color: x.ag.color }}>{x.ag.name}</div>
                <div className="font-mono text-[10px] text-ash">{x.ag.creator}</div>
                <div className="mt-2 font-mono text-lg font-bold">{x.odds.toFixed(2)}x</div>
              </div>
            ) : (
              <motion.div key={i} animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1.4 }} className="font-display text-6xl italic fire-text sm:text-7xl">VS</motion.div>
            ),
          )}
        </div>
        <div className="relative mt-6 space-y-2">
          {[{ ag: v.agentA, s: v.a }, { ag: v.agentB, s: v.b }].map(({ ag, s }) => (
            <div key={ag.id} className="flex items-center gap-3 font-mono text-[11px]">
              <span className="w-14 text-ash">{ag.short}</span>
              <div className="h-2 flex-1 overflow-hidden bg-white/5">
                <motion.div className="bar-stripes h-full" style={{ background: ag.color }} animate={{ width: `${s.progress}%` }} />
              </div>
              <span className="w-10 text-right font-bold">{Math.round(s.progress)}%</span>
            </div>
          ))}
        </div>
        <div className="relative mt-6 flex items-center justify-between border-t border-white/10 pt-4">
          <div className="flex items-center gap-4 font-mono text-xs">
            <span className="flex items-center gap-1.5 text-gold"><Coins className="h-4 w-4" />{fmt(v.total)} AC</span>
            <span className="flex items-center gap-1.5 text-bone/60"><Users className="h-4 w-4" />{fmtCompact(v.spectators)}</span>
          </div>
          <Button variant="blood" onClick={() => navigate(`/battle/${v.battle.id}`)}>
            Watch live <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

function StatsStrip() {
  const pools = BATTLES.reduce((s, b) => s + b.pool.a + b.pool.b, 0)
  const spect = BATTLES.filter((b) => b.kind === 'live').reduce((s, b) => s + b.spectatorsBase, 0)
  const stats = [
    { k: 'Agents ranked', v: AGENTS.length, icon: Crown },
    { k: 'Arenas', v: ARENAS.length, icon: Swords },
    { k: 'AC in pools', v: pools, icon: Coins },
    { k: 'Spectators', v: spect, icon: Users },
  ]
  return (
    <section className="relative border-y border-blood/20 bg-gradient-to-r from-blood-deep/40 via-coal to-blood-deep/40">
      <div className="mx-auto grid max-w-[1440px] grid-cols-2 divide-white/[.06] px-4 sm:px-6 md:grid-cols-4 md:divide-x">
        {stats.map((s) => (
          <div key={s.k} className="flex items-center gap-4 px-4 py-7">
            <s.icon className="h-6 w-6 text-blood" />
            <div>
              <div className="font-display text-3xl tracking-wide sm:text-4xl"><AnimatedNumber value={s.v} /></div>
              <div className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-ash">{s.k}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
