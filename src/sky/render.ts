import type { BgStar, Figure, Point, RegionLabel } from './layout'
import { mulberry32 } from './rng'

const SERIF = '"Iowan Old Style","Palatino Linotype",Palatino,"Book Antiqua",P052,"URW Palladio L",Georgia,serif'
const TAU = Math.PI * 2
const gold = (a: number) => `rgba(232,200,114,${a})`

function line(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) {
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke()
}

/** Gradient + vignette + aquatint grain, rendered once per resize. */
export function buildBackground(w: number, h: number, dpr: number): HTMLCanvasElement {
  const c = document.createElement('canvas')
  c.width = Math.max(1, Math.round(w * dpr))
  c.height = Math.max(1, Math.round(h * dpr))
  const b = c.getContext('2d')
  if (!b) return c
  b.setTransform(dpr, 0, 0, dpr, 0, 0)
  const g = b.createLinearGradient(0, 0, w * 0.25, h)
  g.addColorStop(0, '#060818'); g.addColorStop(1, '#141a3d')
  b.fillStyle = g; b.fillRect(0, 0, w, h)
  const r = b.createRadialGradient(w * 0.42, h * 0.45, 0, w * 0.42, h * 0.45, Math.hypot(w, h) * 0.62)
  r.addColorStop(0, 'rgba(40,52,120,0.22)'); r.addColorStop(0.55, 'rgba(10,14,40,0)'); r.addColorStop(1, 'rgba(2,3,10,0.65)')
  b.fillStyle = r; b.fillRect(0, 0, w, h)
  const rand = mulberry32(77)
  const n = Math.round((w * h) / 90)
  for (let i = 0; i < n; i++) {
    b.fillStyle = rand() < 0.5 ? 'rgba(255,240,210,0.035)' : 'rgba(0,0,0,0.12)'
    b.fillRect(rand() * w, rand() * h, 1, 1)
  }
  return c
}

export function drawBgStars(ctx: CanvasRenderingContext2D, stars: BgStar[], now: number, reduced: boolean) {
  const amp = reduced ? 0 : 0.3
  for (const s of stars) {
    ctx.globalAlpha = s.a * (1 - amp * (0.5 + 0.5 * Math.sin(now * s.freq + s.phase)))
    ctx.fillStyle = s.color
    if (s.r < 1.1) ctx.fillRect(s.x - s.r, s.y - s.r, s.r * 2, s.r * 2)
    else { ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, TAU); ctx.fill() }
  }
  ctx.globalAlpha = 1
}

export function drawRegionLabel(ctx: CanvasRenderingContext2D, l: RegionLabel, alpha: number) {
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  ctx.font = `10px ${SERIF}`
  ctx.letterSpacing = '4px'
  ctx.fillStyle = gold(0.75 * alpha)
  ctx.fillText(l.name.toUpperCase(), l.at.x, l.at.y)
  ctx.letterSpacing = '0px'
  ctx.font = `italic 12px ${SERIF}`
  ctx.fillStyle = `rgba(156,162,198,${0.85 * alpha})`
  ctx.fillText(l.section, l.at.x, l.at.y + 15)
}

export interface FigureStyle { reveal: number; lit: boolean; dim: boolean }

export function drawFigure(ctx: CanvasRenderingContext2D, fig: Figure, label: string, st: FigureStyle) {
  const ea = st.dim ? 0.35 : 1
  const rv = st.reveal
  const { x: cx, y: cy } = fig.center

  // halo wash + engraved dotted ring
  const wash = ctx.createRadialGradient(cx, cy, 0, cx, cy, fig.radius)
  wash.addColorStop(0, gold((st.lit ? 0.12 : 0.05) * ea * rv))
  wash.addColorStop(1, gold(0))
  ctx.fillStyle = wash
  ctx.beginPath(); ctx.arc(cx, cy, fig.radius, 0, TAU); ctx.fill()
  ctx.strokeStyle = gold((st.lit ? 0.7 : 0.28) * ea * rv)
  ctx.lineWidth = 0.8
  ctx.setLineDash([1.2, 3.4]); ctx.stroke(); ctx.setLineDash([])

  // lines draw in edge order
  const ne = fig.edges.length
  ctx.lineCap = 'round'
  fig.edges.forEach(([a, b], e) => {
    const f = Math.min(1, Math.max(0, rv * ne * 1.15 - e))
    if (f <= 0) return
    const A = fig.stars[a], B = fig.stars[b]
    const x2 = A.x + (B.x - A.x) * f, y2 = A.y + (B.y - A.y) * f
    ctx.strokeStyle = gold((st.lit ? 0.28 : 0.12) * ea); ctx.lineWidth = st.lit ? 6 : 4
    line(ctx, A.x, A.y, x2, y2)
    ctx.strokeStyle = st.lit ? `rgba(250,230,170,${ea})` : gold(0.88 * ea); ctx.lineWidth = st.lit ? 1.6 : 1.15
    line(ctx, A.x, A.y, x2, y2)
  })

  // stars: glow, core, ring
  for (const s of fig.stars) {
    const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, 9)
    g.addColorStop(0, `rgba(255,244,214,${0.55 * ea * rv})`); g.addColorStop(1, 'rgba(255,244,214,0)')
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(s.x, s.y, 9, 0, TAU); ctx.fill()
    ctx.fillStyle = `rgba(255,248,230,${ea * rv})`
    ctx.beginPath(); ctx.arc(s.x, s.y, 1.9, 0, TAU); ctx.fill()
    ctx.strokeStyle = gold(0.55 * ea * rv); ctx.lineWidth = 0.7
    ctx.beginPath(); ctx.arc(s.x, s.y, 5, 0, TAU); ctx.stroke()
  }

  // label fades in after the lines
  const la = Math.max(0, Math.min(1, (rv - 0.45) / 0.55))
  if (la <= 0) return
  ctx.textAlign = 'center'
  ctx.font = `13px ${SERIF}`
  ctx.letterSpacing = '4px'
  ctx.shadowColor = 'rgba(4,6,20,0.95)'; ctx.shadowBlur = 8
  ctx.fillStyle = st.lit ? `rgba(255,238,190,${ea * la})` : `rgba(240,222,170,${0.92 * ea * la})`
  ctx.fillText(label.toUpperCase(), fig.labelAt.x, fig.labelAt.y)
  ctx.shadowBlur = 0; ctx.shadowColor = 'transparent'
  ctx.letterSpacing = '0px'
}

export function drawPulse(ctx: CanvasRenderingContext2D, p: Point, now: number, reduced: boolean) {
  const t = reduced ? 0.5 : (now % 1800) / 1800
  ctx.strokeStyle = gold(0.8 * (1 - t)); ctx.lineWidth = 1
  ctx.beginPath(); ctx.arc(p.x, p.y, 6 + t * 18, 0, TAU); ctx.stroke()
  ctx.fillStyle = '#f6e3a8'
  ctx.beginPath(); ctx.arc(p.x, p.y, 2.4, 0, TAU); ctx.fill()
}
