import type { Region, SkyEntry } from '../sky.config'
import { groupByRegion } from '../lib/regions'
import { hashString, mulberry32 } from './rng'

export interface Point { x: number; y: number }
export interface Rect { x: number; y: number; w: number; h: number }

export interface Figure {
  id: string
  region: Region
  stars: Point[]
  edges: [number, number][]
  center: Point
  radius: number
  labelAt: Point
  /** Widest the label may be before wrapping. */
  labelMaxWidth: number
  /** Horizontal bounds the label must stay inside. */
  labelMinX: number
  labelMaxX: number
  /** Tap/click target: the whole grid cell on phones, the halo's bounding box otherwise. */
  hit: Rect
  /** Smaller label type on phones. */
  compact: boolean
}

export interface RegionLabel { region: Region; name: string; section: string; at: Point }

export interface BgStar { x: number; y: number; r: number; a: number; phase: number; freq: number; color: string }

export const SHEET_PEEK = 72
const PANEL_GUTTER = 40
const LABEL_BAND = 30
const LABEL_MARGIN = 8
const MOBILE_MAX_COLS = 2
const LONE_NUDGE = 0.12
// Mobile regions stack between the masthead and the sheet peek.
const MOBILE_TOP = 0.22
const MOBILE_BOTTOM = 0.99

// Fractions of the sky area. Desktop keeps the top-left clear for the masthead.
const DESKTOP_BOXES: Record<Region, Rect> = {
  guild: { x: 0.04, y: 0.3, w: 0.44, h: 0.32 },
  forge: { x: 0.52, y: 0.06, w: 0.44, h: 0.34 },
  academy: { x: 0.04, y: 0.66, w: 0.44, h: 0.28 },
  toolmakers: { x: 0.52, y: 0.44, w: 0.44, h: 0.5 },
}

export function skyArea(w: number, h: number, mobile: boolean): Rect {
  if (mobile) return { x: 0, y: 0, w, h: Math.max(0, h - SHEET_PEEK) }
  const panel = (w <= 980 ? 300 : 340) + PANEL_GUTTER
  return { x: 0, y: 0, w: Math.max(0, w - panel), h }
}

/**
 * Region rectangles for the regions that have entries.
 * Desktop uses fixed boxes; mobile stacks non-empty regions, each as tall as its rows of constellations.
 */
export function regionRects(entries: SkyEntry[], area: Rect, mobile: boolean): Partial<Record<Region, Rect>> {
  const groups = groupByRegion(entries)
  const out: Partial<Record<Region, Rect>> = {}
  if (!mobile) {
    for (const { region } of groups) {
      const b = DESKTOP_BOXES[region.id]
      out[region.id] = { x: area.x + b.x * area.w, y: area.y + b.y * area.h, w: b.w * area.w, h: b.h * area.h }
    }
    return out
  }
  const x = area.x + area.w * 0.04
  const w = area.w * 0.92
  const top = area.y + area.h * MOBILE_TOP
  const height = area.h * (MOBILE_BOTTOM - MOBILE_TOP)
  const rows = groups.map(g => Math.ceil(g.entries.length / MOBILE_MAX_COLS))
  const rowH = Math.max(1, (height - groups.length * LABEL_BAND) / Math.max(1, rows.reduce((a, b) => a + b, 0)))
  let y = top
  groups.forEach(({ region }, i) => {
    const h = LABEL_BAND + rows[i] * rowH
    out[region.id] = { x, y, w, h }
    y += h
  })
  return out
}

function gridCells(r: Rect, n: number, maxCols: number, loneRight: boolean): Rect[] {
  const cols = Math.max(1, Math.min(n, maxCols, Math.ceil(Math.sqrt((n * r.w) / Math.max(1, r.h)))))
  const rows = Math.ceil(n / cols)
  // On phones, a lone constellation in a two-column last row sits right of centre,
  // nudged left so it is not stacked directly under its right-hand neighbour.
  const lone = (i: number) => loneRight && cols === 2 && n % 2 === 1 && i === n - 1
  return Array.from({ length: n }, (_, i) => ({
    x: lone(i) ? r.x + r.w * (0.5 - LONE_NUDGE) : r.x + (r.w * (i % cols)) / cols,
    y: r.y + (r.h * Math.floor(i / cols)) / rows,
    w: r.w / cols,
    h: r.h / rows,
  }))
}

const dist = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y)

export function spanningEdges(pts: Point[]): [number, number][] {
  if (pts.length < 2) return []
  const inTree = [0]
  const rest = new Set(pts.map((_, i) => i).slice(1))
  const edges: [number, number][] = []
  while (rest.size) {
    let best: [number, number] = [0, 0]
    let bd = Infinity
    for (const a of inTree) for (const b of rest) {
      const d = dist(pts[a], pts[b])
      if (d < bd) { bd = d; best = [a, b] }
    }
    edges.push(best)
    inTree.push(best[1])
    rest.delete(best[1])
  }
  return edges
}

function figureFor(entry: SkyEntry, cell: Rect, area: Rect, compact: boolean): Figure {
  const rand = mulberry32(hashString(entry.id))
  const n = 4 + Math.floor(rand() * 4)
  const inner = { x: cell.x + cell.w * 0.12, y: cell.y + cell.h * 0.06, w: cell.w * 0.76, h: cell.h * 0.64 }
  const minD = 0.22 * Math.min(inner.w, inner.h)
  const stars: Point[] = []
  // After 150 tries, accept any point so tiny cells still get n stars.
  for (let tries = 0; stars.length < n && tries < 400; tries++) {
    const p = { x: inner.x + rand() * inner.w, y: inner.y + rand() * inner.h }
    if (tries < 150 && stars.some(s => dist(s, p) < minD)) continue
    stars.push(p)
  }
  const center = {
    x: stars.reduce((s, p) => s + p.x, 0) / stars.length,
    y: stars.reduce((s, p) => s + p.y, 0) / stars.length,
  }
  // Cap the halo so it never spills into a neighbouring cell or region.
  const spread = Math.max(...stars.map(s => dist(s, center))) + 18
  const room = Math.min(center.x - cell.x, cell.x + cell.w - center.x, center.y - cell.y, cell.y + cell.h - center.y)
  const radius = Math.max(Math.min(24, room), Math.min(spread, room))
  const bottom = Math.max(...stars.map(s => s.y))
  const labelAt = {
    x: Math.min(area.x + area.w - 4, Math.max(area.x + 4, center.x)),
    y: Math.min(area.y + area.h - 4, bottom + 22),
  }
  return {
    id: entry.id,
    region: entry.region,
    stars,
    edges: spanningEdges(stars),
    center,
    radius,
    labelAt,
    labelMaxWidth: Math.max(cell.w - LABEL_MARGIN, 1),
    labelMinX: area.x + LABEL_MARGIN,
    labelMaxX: area.x + area.w - LABEL_MARGIN,
    hit: compact ? cell : { x: center.x - radius, y: center.y - radius, w: radius * 2, h: radius * 2 },
    compact,
  }
}

export function layoutSky(entries: SkyEntry[], area: Rect, mobile: boolean): { figures: Figure[]; labels: RegionLabel[] } {
  if (area.w <= 0 || area.h <= 0) return { figures: [], labels: [] }
  const figures: Figure[] = []
  const labels: RegionLabel[] = []
  const rects = regionRects(entries, area, mobile)
  for (const { region, entries: list } of groupByRegion(entries)) {
    const r = rects[region.id]
    if (!r) continue
    labels.push({ region: region.id, name: region.name, section: region.section, at: { x: r.x, y: r.y + 12 } })
    const body = { x: r.x, y: r.y + LABEL_BAND, w: r.w, h: Math.max(1, r.h - LABEL_BAND) }
    gridCells(body, list.length, mobile ? MOBILE_MAX_COLS : Infinity, mobile).forEach((cell, i) => figures.push(figureFor(list[i], cell, area, mobile)))
  }
  return { figures, labels }
}

const STAR_COLORS = ['#dfe6ff', '#fff4e0', '#ffd9b8']

export function backgroundStars(w: number, h: number): BgStar[] {
  const rand = mulberry32(2026)
  const n = Math.min(900, Math.round((w * h) / 2200))
  return Array.from({ length: n }, () => ({
    x: rand() * w,
    y: rand() * h,
    r: 0.4 + rand() ** 3 * 1.4,
    a: 0.35 + rand() * 0.55,
    phase: rand() * Math.PI * 2,
    freq: 0.0006 + rand() * 0.0016,
    color: STAR_COLORS[Math.floor(rand() * STAR_COLORS.length)],
  }))
}

/** Grid-search the point furthest from every figure edge-of-halo. Used for the onboarding pulse. */
export function emptySpot(figures: Figure[], area: Rect): Point {
  const fallback = { x: area.x + area.w / 2, y: area.y + area.h / 2 }
  if (!figures.length) return fallback
  let best = fallback
  let bestScore = -Infinity
  for (let i = 0; i <= 8; i++) for (let j = 0; j <= 6; j++) {
    const p = { x: area.x + area.w * (0.15 + 0.7 * (i / 8)), y: area.y + area.h * (0.3 + 0.55 * (j / 6)) }
    const score = Math.min(...figures.map(f => dist(p, f.center) - f.radius))
    if (score > bestScore) { bestScore = score; best = p }
  }
  return best
}
