import { cn } from '../lib/utils'

/** Cinematic arena backdrop: sweeping spotlights, smoke, cage mesh, floor grid. */
export function Backdrop({ color = '#ff1f3d', color2 = '#ff6a13', className, floor = true, intensity = 1 }: { color?: string; color2?: string; className?: string; floor?: boolean; intensity?: number }) {
  return (
    <div className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)} aria-hidden>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-10%,#1a0a0e_0%,#060608_60%)]" />
      <div className="smoke left-[-10%] top-[20%] h-[50vh] w-[60vw]" style={{ background: color, opacity: 0.12 * intensity }} />
      <div className="smoke right-[-15%] top-[35%] h-[45vh] w-[55vw]" style={{ background: color2, opacity: 0.1 * intensity, animationDelay: '-7s' }} />
      <div className="smoke bottom-[-10%] left-[25%] h-[35vh] w-[50vw]" style={{ background: '#ffffff', opacity: 0.035 * intensity, animationDelay: '-12s' }} />
      <div className="spotlight left-[-20%]" style={{ ['--spot' as string]: hexA(color, 0.2 * intensity) }} />
      <div className="spotlight r right-[-20%]" style={{ ['--spot' as string]: hexA(color2, 0.16 * intensity) }} />
      <div className="cage absolute inset-0 opacity-70" />
      {floor && (
        <div className="absolute bottom-0 left-[-25%] right-[-25%] h-[45%] overflow-hidden opacity-60">
          <div className="grid-floor absolute inset-0" />
        </div>
      )}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,#060608_100%)]" />
    </div>
  )
}

export function hexA(hex: string, a: number) {
  const h = hex.replace('#', '')
  const n = parseInt(h.length === 3 ? h.split('').map((x) => x + x).join('') : h, 16)
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`
}
