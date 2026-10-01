import { useMemo } from 'react'
import { BAND_H, BAND_W } from '../sky/band'
import { backgroundStars, type Figure } from '../sky/layout'

const MINI = 40

function FigureLines({ fig, r = 2.4 }: { fig: Figure; r?: number }) {
  return (
    <>
      {fig.edges.map(([a, b], i) => (
        <line key={i} x1={fig.stars[a].x} y1={fig.stars[a].y} x2={fig.stars[b].x} y2={fig.stars[b].y} />
      ))}
      {fig.stars.map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={r} />)}
    </>
  )
}

/** Print-only star chart band: every constellation, as laid out on a desktop sky. */
export function SkyBand({ figures }: { figures: Figure[] }) {
  const stars = useMemo(() => backgroundStars(BAND_W, BAND_H), [])
  return (
    <svg className="sky-band print-only" viewBox={`0 0 ${BAND_W} ${BAND_H}`} aria-hidden="true">
      <rect width={BAND_W} height={BAND_H} fill="url(#sky-band-fill)" />
      <defs>
        <linearGradient id="sky-band-fill" x1="0" y1="0" x2="0.25" y2="1">
          <stop offset="0" stopColor="#060818" />
          <stop offset="1" stopColor="#141a3d" />
        </linearGradient>
      </defs>
      {stars.map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={s.r} fill={s.color} opacity={s.a} />)}
      <g className="sky-band-figs">
        {figures.map(f => <FigureLines key={f.id} fig={f} />)}
      </g>
    </svg>
  )
}

/** Print-only miniature of one entry's constellation, the same shape as in the sky. */
export function MiniFigure({ fig }: { fig: Figure }) {
  const xs = fig.stars.map(s => s.x)
  const ys = fig.stars.map(s => s.y)
  const pad = 6
  const x = Math.min(...xs) - pad
  const y = Math.min(...ys) - pad
  const size = Math.max(Math.max(...xs) - x, Math.max(...ys) - y) + pad
  return (
    <svg className="mini-fig print-only" width={MINI} height={MINI} viewBox={`${x} ${y} ${size} ${size}`} aria-hidden="true">
      <FigureLines fig={fig} r={size / 22} />
    </svg>
  )
}

