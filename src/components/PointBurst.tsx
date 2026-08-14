import type { CSSProperties } from 'react'

const PARTICLE_COUNT = 8
const RADIUS = 30

const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
  const angle = (i / PARTICLE_COUNT) * Math.PI * 2
  return {
    tx: Math.cos(angle) * RADIUS,
    ty: Math.sin(angle) * RADIUS,
    delay: (i % 4) * 15,
  }
})

/** A short "+1" burst — ring pulse, radiating dots, floating label. Purely decorative. */
export function PointBurst() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10" aria-hidden="true">
      <span className="animate-point-ring absolute left-1/2 top-1/2 h-8 w-8 rounded-full border-2 border-accent" />
      {particles.map((p, i) => (
        <span
          key={i}
          className="animate-point-particle absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full bg-accent"
          style={{ '--tx': `${p.tx}px`, '--ty': `${p.ty}px`, animationDelay: `${p.delay}ms` } as CSSProperties}
        />
      ))}
      <span className="animate-point-pop absolute left-1/2 top-1/2 whitespace-nowrap text-sm font-bold text-accent">
        +1
      </span>
    </div>
  )
}
