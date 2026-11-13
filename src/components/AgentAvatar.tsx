import { useId } from 'react'
import type { Agent } from '../data/seed'
import { cn } from '../lib/utils'

/** Procedural robot-fighter portrait. Pure SVG — no image dependencies. */
export function AgentAvatar({ agent, size = 56, glow = false, className, dim = false }: { agent: Agent; size?: number; glow?: boolean; className?: string; dim?: boolean }) {
  const uid = useId().replace(/:/g, '')
  const c = agent.color
  return (
    <div
      className={cn('relative shrink-0', className)}
      style={{
        width: size,
        height: size,
        filter: dim ? 'grayscale(.9) brightness(.55)' : glow ? `drop-shadow(0 0 ${size / 6}px ${c}88)` : undefined,
      }}
    >
      <svg viewBox="0 0 100 100" width={size} height={size} aria-label={agent.name}>
        <defs>
          <linearGradient id={`bg${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1d1d26" />
            <stop offset="1" stopColor="#08080b" />
          </linearGradient>
          <linearGradient id={`hd${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#3a3a46" />
            <stop offset=".5" stopColor="#1a1a22" />
            <stop offset="1" stopColor="#0d0d12" />
          </linearGradient>
          <radialGradient id={`gl${uid}`} cx=".5" cy=".42" r=".55">
            <stop offset="0" stopColor={c} stopOpacity=".55" />
            <stop offset="1" stopColor={c} stopOpacity="0" />
          </radialGradient>
          <clipPath id={`cl${uid}`}>
            <polygon points="50,2 94,26 94,74 50,98 6,74 6,26" />
          </clipPath>
        </defs>
        <polygon points="50,2 94,26 94,74 50,98 6,74 6,26" fill={`url(#bg${uid})`} stroke={c} strokeWidth="2.5" />
        <g clipPath={`url(#cl${uid})`}>
          <rect width="100" height="100" fill={`url(#gl${uid})`} />
          {/* shoulders */}
          <path d="M8 100 L20 78 Q50 68 80 78 L92 100 Z" fill="#15151c" stroke={c} strokeOpacity=".5" strokeWidth="1.2" />
          <path d="M42 74 L50 88 L58 74" fill="none" stroke={c} strokeWidth="1.5" strokeOpacity=".8" />
          {/* neck */}
          <rect x="42" y="64" width="16" height="10" fill="#101016" stroke="#2c2c36" />
          {/* head */}
          <path d="M28 30 Q28 18 50 17 Q72 18 72 30 L74 56 Q72 68 50 69 Q28 68 26 56 Z" fill={`url(#hd${uid})`} stroke="#4a4a58" strokeWidth="1.2" />
          {/* antenna / crest */}
          <path d="M50 17 L50 8" stroke={c} strokeWidth="2" />
          <circle cx="50" cy="7" r="2.6" fill={c} />
          {agent.eye === 'visor' && (
            <>
              <path d="M31 36 L69 36 L66 47 L34 47 Z" fill="#050507" stroke={c} strokeWidth="1" />
              <path d="M35 40.5 L65 40.5" stroke={c} strokeWidth="3.2" strokeLinecap="round" />
            </>
          )}
          {agent.eye === 'twin' && (
            <>
              <circle cx="39.5" cy="41" r="6.5" fill="#050507" stroke="#3a3a46" />
              <circle cx="60.5" cy="41" r="6.5" fill="#050507" stroke="#3a3a46" />
              <circle cx="39.5" cy="41" r="3.2" fill={c} />
              <circle cx="60.5" cy="41" r="3.2" fill={c} />
            </>
          )}
          {agent.eye === 'mono' && (
            <>
              <circle cx="50" cy="41" r="9" fill="#050507" stroke={c} strokeWidth="1.2" />
              <circle cx="50" cy="41" r="4.5" fill={c} />
              <circle cx="51.5" cy="39.5" r="1.3" fill="#fff" />
            </>
          )}
          {agent.eye === 'grill' && (
            <>
              <path d="M32 35 L46 39 L46 44 L32 41 Z" fill={c} />
              <path d="M68 35 L54 39 L54 44 L68 41 Z" fill={c} />
            </>
          )}
          {/* mouth grill */}
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={40 + i * 5.5} y="55" width="3" height="7" rx="1" fill="#2c2c36" />
          ))}
          {/* cheek plates */}
          <path d="M27 50 L33 52 L32 60" fill="none" stroke={c} strokeOpacity=".6" strokeWidth="1.2" />
          <path d="M73 50 L67 52 L68 60" fill="none" stroke={c} strokeOpacity=".6" strokeWidth="1.2" />
          {/* glyph badge */}
          <circle cx="50" cy="86" r="7" fill="#08080b" stroke={c} strokeWidth="1.2" />
          <text x="50" y="89.6" textAnchor="middle" fontSize="10" fontWeight="800" fill={c} fontFamily="Inter, sans-serif">
            {agent.glyph}
          </text>
        </g>
      </svg>
    </div>
  )
}
