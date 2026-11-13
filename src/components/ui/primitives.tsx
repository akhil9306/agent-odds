import { forwardRef, useEffect, useState, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from 'react'
import { useSpring } from 'framer-motion'
import { cn, fmt } from '../../lib/utils'

// shadcn-style Button with arena variants
type Variant = 'blood' | 'ember' | 'toxic' | 'steel' | 'ghost' | 'outline'
type Size = 'sm' | 'md' | 'lg' | 'xl'

const variants: Record<Variant, string> = {
  blood:
    'bg-blood text-white shadow-[0_0_0_1px_rgba(255,31,61,.6),0_10px_40px_-8px_rgba(255,31,61,.7)] hover:bg-[#ff3a55] hover:shadow-[0_0_0_1px_rgba(255,31,61,.9),0_10px_50px_-6px_rgba(255,31,61,.9)]',
  ember: 'bg-ember text-black shadow-[0_10px_40px_-10px_rgba(255,106,19,.8)] hover:bg-[#ff7f33]',
  toxic: 'bg-toxic text-black shadow-[0_10px_40px_-10px_rgba(57,255,136,.7)] hover:bg-[#5dffa0]',
  steel: 'steel text-bone border border-edge hover:border-ash/60',
  ghost: 'text-bone/80 hover:text-bone hover:bg-white/5',
  outline: 'border border-white/15 text-bone hover:border-blood hover:text-white hover:bg-blood/10',
}
const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-[11px]',
  md: 'h-10 px-4 text-xs',
  lg: 'h-12 px-6 text-sm',
  xl: 'h-14 px-8 text-base',
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant = 'steel', size = 'md', ...p }, ref) => (
  <button
    ref={ref}
    className={cn(
      'clip-cut-sm inline-flex cursor-pointer select-none items-center justify-center gap-2 font-bold uppercase tracking-[0.14em] transition-all duration-200 active:scale-[.97] disabled:pointer-events-none disabled:opacity-40',
      variants[variant],
      sizes[size],
      className,
    )}
    {...p}
  />
))
Button.displayName = 'Button'

export function Badge({ className, ...p }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn('inline-flex items-center gap-1.5 rounded-sm border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-bone/80', className)}
      {...p}
    />
  )
}

export function LiveBadge({ label = 'LIVE', className }: { label?: string; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2 rounded-sm bg-blood px-2 py-0.5 font-mono text-[10px] font-bold tracking-[0.2em] text-white', className)}>
      <span className="live-dot h-1.5 w-1.5 rounded-full bg-white" />
      {label}
    </span>
  )
}

export function DemoBadge({ className }: { className?: string }) {
  return (
    <span className={cn('hazard-wrap inline-flex items-center overflow-hidden rounded-sm border border-gold/60 font-mono text-[10px] font-bold tracking-[0.2em]', className)}>
      <span className="hazard h-full w-2 self-stretch" />
      <span className="bg-black/80 px-2 py-0.5 text-gold">DEMO MODE</span>
    </span>
  )
}

export function Card({ className, ...p }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('steel relative rounded-none border border-edge', className)} {...p} />
}

export function SectionTitle({ kicker, title, right, className }: { kicker: string; title: ReactNode; right?: ReactNode; className?: string }) {
  return (
    <div className={cn('mb-8 flex flex-wrap items-end justify-between gap-4', className)}>
      <div>
        <div className="mb-2 flex items-center gap-3 font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-blood">
          <span className="h-px w-8 bg-blood" />
          {kicker}
        </div>
        <h2 className="font-display text-4xl uppercase leading-none tracking-wide text-bone sm:text-5xl md:text-6xl">{title}</h2>
      </div>
      {right}
    </div>
  )
}

export function AnimatedNumber({ value, decimals = 0, className, prefix = '' }: { value: number; decimals?: number; className?: string; prefix?: string }) {
  const mv = useSpring(value, { stiffness: 80, damping: 18 })
  const [display, setDisplay] = useState(value)
  useEffect(() => {
    mv.set(value)
  }, [value, mv])
  useEffect(() => mv.on('change', (v) => setDisplay(v)), [mv])
  return (
    <span className={cn('tabular', className)}>
      {prefix}
      {fmt(display, decimals)}
    </span>
  )
}

export function Stat({ label, value, sub, className }: { label: string; value: ReactNode; sub?: ReactNode; className?: string }) {
  return (
    <div className={cn('min-w-0', className)}>
      <div className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-ash">{label}</div>
      <div className="tabular mt-1 truncate font-display text-2xl tracking-wide text-bone">{value}</div>
      {sub && <div className="mt-0.5 font-mono text-[10px] text-ash">{sub}</div>}
    </div>
  )
}

/** Corner brackets — the "cage" frame motif. */
export function Corners({ color = '#ff1f3d', size = 18, thick = 2 }: { color?: string; size?: number; thick?: number }) {
  const s = { width: size, height: size, borderColor: color }
  const b = `${thick}px`
  return (
    <>
      <span className="pointer-events-none absolute left-0 top-0 z-10" style={{ ...s, borderLeftWidth: b, borderTopWidth: b }} />
      <span className="pointer-events-none absolute right-0 top-0 z-10" style={{ ...s, borderRightWidth: b, borderTopWidth: b }} />
      <span className="pointer-events-none absolute bottom-0 left-0 z-10" style={{ ...s, borderLeftWidth: b, borderBottomWidth: b }} />
      <span className="pointer-events-none absolute bottom-0 right-0 z-10" style={{ ...s, borderRightWidth: b, borderBottomWidth: b }} />
    </>
  )
}
