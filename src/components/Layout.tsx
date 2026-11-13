import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Coins, Info, Menu, Play, RotateCcw, Skull, Swords, Trophy, Wallet, X } from 'lucide-react'
import { FEATURED, agentById } from '../data/seed'
import { Link, navigate } from '../lib/router'
import { cn, fmt } from '../lib/utils'
import { useStore } from '../store/store'
import { AnimatedNumber, Button } from './ui/primitives'

const NAV = [
  { to: '/', label: 'Home' },
  { to: '/arenas', label: 'Arenas' },
  { to: '/live', label: 'Live Battles' },
  { to: '/leaderboard', label: 'Leaderboard' },
  { to: '/bets', label: 'My Bets' },
]

export function useDemo() {
  const { rematch } = useStore()
  return () => {
    rematch(FEATURED.id, 2)
    navigate(`/battle/${FEATURED.id}?demo=1`)
  }
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link to="/" className={cn('group flex items-center gap-2.5', className)}>
      <span className="relative grid h-9 w-9 place-items-center bg-blood clip-cut-sm shadow-[0_0_30px_rgba(255,31,61,.55)]">
        <Swords className="h-5 w-5 text-white transition-transform duration-300 group-hover:rotate-12" strokeWidth={2.5} />
      </span>
      <span className="font-display text-2xl leading-none tracking-wider">
        AGENTS<span className="text-blood glow-blood">ODDS</span>
      </span>
    </Link>
  )
}

function isActive(path: string, to: string) {
  if (to === '/') return path === '/'
  if (to === '/arenas') return path.startsWith('/arena')
  if (to === '/live') return path.startsWith('/live') || path.startsWith('/battle')
  return path.startsWith(to)
}

export function Navbar({ path }: { path: string }) {
  const { state, connectWallet, disconnectWallet, reset } = useStore()
  const [open, setOpen] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const demo = useDemo()
  const active = state.bets.filter((b) => b.status === 'active').length

  const doReset = () => {
    reset()
    setConfirmReset(false)
    setOpen(false)
    navigate('/')
  }

  return (
    <>
      <Ticker />
      <header className="sticky top-0 z-50 border-b border-white/[.06] bg-ink/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-4 px-4 sm:px-6">
          <Logo />
          <nav className="ml-6 hidden items-center gap-1 lg:flex">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  'relative px-3 py-2 text-[12px] font-bold uppercase tracking-[0.16em] text-bone/60 transition-colors hover:text-bone',
                  isActive(path, n.to) && 'text-bone',
                )}
              >
                {n.label}
                {n.to === '/bets' && active > 0 && (
                  <span className="ml-1.5 rounded-sm bg-blood px-1.5 py-px font-mono text-[10px] text-white">{active}</span>
                )}
                {isActive(path, n.to) && <motion.span layoutId="nav-underline" className="absolute inset-x-3 -bottom-[13px] h-[3px] bg-blood shadow-[0_0_12px_#ff1f3d]" />}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <Button variant="toxic" size="sm" onClick={demo} className="hidden md:inline-flex" title="One-click guided demo of the full flow">
              <Play className="h-3.5 w-3.5 fill-current" /> Demo Mode
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setConfirmReset(true)} className="hidden xl:inline-flex" title="Restore initial demo data">
              <RotateCcw className="h-3.5 w-3.5" /> Reset Demo
            </Button>
            <Link
              to="/bets"
              className="clip-cut-sm flex h-10 items-center gap-2 border border-gold/30 bg-gold/[.07] px-3 transition-colors hover:border-gold/70"
              title="Virtual, non-redeemable credits"
            >
              <Coins className="h-4 w-4 text-gold" />
              <span className="font-mono text-sm font-bold text-gold">
                <AnimatedNumber value={state.balance} />
              </span>
              <span className="hidden font-mono text-[10px] font-bold tracking-widest text-gold/60 sm:inline">AC</span>
            </Link>
            {state.wallet ? (
              <Button variant="outline" size="md" onClick={disconnectWallet} className="hidden sm:inline-flex" title="Disconnect demo wallet">
                <span className="h-2 w-2 rounded-full bg-toxic shadow-[0_0_8px_#39ff88]" />
                <span className="font-mono normal-case tracking-normal">{state.wallet}</span>
              </Button>
            ) : (
              <Button variant="blood" size="md" onClick={connectWallet} className="hidden sm:inline-flex">
                <Wallet className="h-4 w-4" /> Connect Wallet
              </Button>
            )}
            <button className="grid h-10 w-10 place-items-center border border-white/10 lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* mobile sidebar */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
            <motion.aside
              className="noise fixed bottom-0 right-0 top-0 z-[61] flex w-[86%] max-w-sm flex-col border-l border-blood/40 bg-coal p-6"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            >
              <div className="flex items-center justify-between">
                <Logo />
                <button onClick={() => setOpen(false)} className="grid h-10 w-10 place-items-center border border-white/10" aria-label="Close menu">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="mt-10 flex flex-col">
                {NAV.map((n, i) => (
                  <Link
                    key={n.to}
                    to={n.to}
                    onClick={() => setOpen(false)}
                    className={cn('border-b border-white/5 py-4 font-display text-3xl uppercase tracking-wide text-bone/70', isActive(path, n.to) && 'text-blood')}
                  >
                    <span className="mr-3 font-mono text-xs text-ash">0{i + 1}</span>
                    {n.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-auto grid gap-3">
                <Button variant="toxic" size="lg" onClick={() => { setOpen(false); demo() }}>
                  <Play className="h-4 w-4 fill-current" /> One-click demo
                </Button>
                {state.wallet ? (
                  <Button variant="outline" size="lg" onClick={disconnectWallet}>{state.wallet}</Button>
                ) : (
                  <Button variant="blood" size="lg" onClick={connectWallet}>
                    <Wallet className="h-4 w-4" /> Connect demo wallet
                  </Button>
                )}
                <Button variant="ghost" size="lg" onClick={() => setConfirmReset(true)}>
                  <RotateCcw className="h-4 w-4" /> Reset demo
                </Button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <ResetDialog open={confirmReset} onCancel={() => setConfirmReset(false)} onConfirm={doReset} />
    </>
  )
}

export function ResetDialog({ open, onCancel, onConfirm }: { open: boolean; onCancel: () => void; onConfirm: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[90] grid place-items-center bg-black/80 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onCancel}>
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.92, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="steel clip-cut w-full max-w-md border border-blood/50 p-7"
          >
            <div className="flex items-center gap-3 text-blood">
              <RotateCcw className="h-5 w-5" />
              <span className="font-mono text-xs font-bold tracking-[0.25em]">RESET DEMO</span>
            </div>
            <h3 className="mt-3 font-display text-3xl uppercase">Wipe the slate?</h3>
            <p className="mt-2 text-sm text-bone/60">Balance returns to 5,000 AC, all predictions are cleared and every match rewinds to its starting bell.</p>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="ghost" onClick={onCancel}>Cancel</Button>
              <Button variant="blood" onClick={onConfirm}>Reset everything</Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Ticker() {
  const items = [
    'VIRTUAL CREDITS ONLY — NON-REDEEMABLE — NO REAL MONEY',
    `MAIN EVENT: ${agentById(FEATURED.a.agentId).short} vs ${agentById(FEATURED.b.agentId).short} — CODE COLOSSEUM`,
    'OMEGA vs ZERO — THE CALCULATION CAGE',
    'PHANTOM vs ZERO — CYBER CAGE (SANDBOXED LAB)',
    'TITAN vs OMEGA — THE PATTERN PIT',
    'PROGRESS ≠ PERFORMANCE — HIDDEN TESTS DECIDE THE BOUT',
    '5% PLATFORM · 2% CREATOR ROYALTY · 93% TO WINNING PREDICTIONS',
  ]
  const row = items.map((t, i) => (
    <span key={i} className="flex items-center gap-6 px-6">
      <Skull className="h-3 w-3 text-blood" />
      {t}
    </span>
  ))
  return (
    <div className="relative z-50 overflow-hidden border-b border-blood/30 bg-blood-deep/60 py-1.5 font-mono text-[10px] font-bold tracking-[0.25em] text-bone/80">
      <div className="marquee flex w-max whitespace-nowrap">
        {row}
        {row}
      </div>
    </div>
  )
}

export function Footer() {
  const { reset } = useStore()
  const [confirm, setConfirm] = useState(false)
  return (
    <footer className="relative mt-24 border-t border-white/[.06] bg-coal">
      <div className="hazard h-1.5 opacity-80" />
      <div className="mx-auto grid max-w-[1440px] gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-md text-sm leading-relaxed text-bone/50">
            The underground championship for artificial intelligence. Different agents. Different skills. One champion.
          </p>
          <div className="mt-6 flex items-start gap-3 border border-gold/25 bg-gold/[.05] p-4 text-xs leading-relaxed text-gold/80">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              Hackathon prototype. All credits (AC) are <b>virtual, non-redeemable</b> and hold no monetary value. No deposits, withdrawals, crypto or payments.
              Simulated match results are labeled <b>DEMO MODE</b>.
            </span>
          </div>
        </div>
        <div className="grid content-start gap-2 text-sm">
          <div className="mb-2 font-mono text-[10px] font-bold tracking-[0.3em] text-ash">NAVIGATE</div>
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} className="text-bone/60 transition-colors hover:text-blood">{n.label}</Link>
          ))}
        </div>
        <div className="grid content-start gap-3">
          <div className="mb-1 font-mono text-[10px] font-bold tracking-[0.3em] text-ash">DEMO CONTROLS</div>
          <Button variant="outline" onClick={() => setConfirm(true)} className="w-fit">
            <RotateCcw className="h-4 w-4" /> Reset Demo
          </Button>
          <div className="flex items-center gap-2 text-xs text-bone/40">
            <Trophy className="h-3.5 w-3.5" /> Settlement: parimutuel · 93% distributable
          </div>
        </div>
      </div>
      <div className="border-t border-white/5 py-5 text-center font-mono text-[10px] tracking-[0.3em] text-ash">AGENTARENA — WELCOME TO THE FIGHT.</div>
      <ResetDialog open={confirm} onCancel={() => setConfirm(false)} onConfirm={() => { reset(); setConfirm(false); navigate('/') }} />
    </footer>
  )
}

export function Toaster() {
  const { toasts, dismissToast } = useStore()
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[min(380px,calc(100vw-2rem))] flex-col gap-2">
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, x: 60, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60 }}
            className={cn(
              'steel clip-cut-sm pointer-events-auto flex items-start gap-3 border-l-4 p-4 shadow-2xl',
              t.tone === 'win' && 'border-l-toxic',
              t.tone === 'loss' && 'border-l-blood',
              t.tone === 'bet' && 'border-l-ember',
              t.tone === 'info' && 'border-l-gold',
            )}
          >
            {t.tone === 'win' ? <Trophy className="h-5 w-5 shrink-0 text-toxic" /> : t.tone === 'loss' ? <Skull className="h-5 w-5 shrink-0 text-blood" /> : t.tone === 'bet' ? <CheckCircle2 className="h-5 w-5 shrink-0 text-ember" /> : <Info className="h-5 w-5 shrink-0 text-gold" />}
            <div className="min-w-0 flex-1">
              <div className="font-display text-lg uppercase leading-tight tracking-wide">{t.title}</div>
              {t.body && <div className="mt-0.5 text-xs text-bone/60">{t.body}</div>}
            </div>
            <button onClick={() => dismissToast(t.id)} className="text-bone/40 hover:text-bone" aria-label="Dismiss">
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

