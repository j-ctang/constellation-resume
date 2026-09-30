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
}

export interface RegionLabel { region: Region; name: string; section: string; at: Point }

export interface BgStar { x: number; y: number; r: number; a: number; phase: number; freq: number; color: string }

export const SHEET_PEEK = 72
const PANEL_GUTTER = 40
const LABEL_BAND = 30

// Fractions of the sky area. Desktop keeps the top-left clear for the masthead.
const DESKTOP_BOXES: Record<Region, Rect> = {
  guild: { x: 0.04, y: 0.3, w: 0.44, h: 0.32 },
  forge: { x: 0.52, y: 0.06, w: 0.44, h: 0.34 },
  academy: { x: 0.04, y: 0.66, w: 0.44, h: 0.28 },
  toolmakers: { x: 0.52, y: 0.44, w: 0.44, h: 0.5 },
}
const MOBILE_BOXES: Record<Region, Rect> = {
  guild: { x: 0.05, y: 0.22, w: 0.9, h: 0.17 },
  forge: { x: 0.05, y: 0.4, w: 0.9, h: 0.15 },
  academy: { x: 0.05, y: 0.56, w: 0.9, h: 0.14 },
  toolmakers: { x: 0.05, y: 0.71, w: 0.9, h: 0.27 },
}

export function skyArea(w: number, h: number, mobile: boolean): Rect {
  if (mobile) return { x: 0, y: 0, w, h: Math.max(0, h - SHEET_PEEK) }
  const panel = (w <= 980 ? 300 : 340) + PANEL_GUTTER
  return { x: 0, y: 0, w: Math.max(0, w - panel), h }
}

export function regionRect(region: Region, area: Rect, mobile: boolean): Rect {
  const b = (mobile ? MOBILE_BOXES : DESKTOP_BOXES)[region]
  return { x: area.x + b.x * area.w, y: area.y + b.y * area.h, w: b.w * area.w, h: b.h * area.h }
}

function gridCells(r: Rect, n: number): Rect[] {
  const cols = Math.max(1, Math.min(n, Math.ceil(Math.sqrt((n * r.w) / Math.max(1, r.h)))))
  const rows = Math.ceil(n / cols)
  return Array.from({ length: n }, (_, i) => ({
    x: r.x + (r.w * (i % cols)) / cols,
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

function figureFor(entry: SkyEntry, cell: Rect, area: Rect): Figure {
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
  const radius = Math.max(24, Math.max(...stars.map(s => dist(s, center))) + 18)
  const bottom = Math.max(...stars.map(s => s.y))
  const labelAt = {
    x: Math.min(area.x + area.w - 4, Math.max(area.x + 4, center.x)),
    y: Math.min(area.y + area.h - 4, bottom + 22),
  }
  return { id: entry.id, region: entry.region, stars, edges: spanningEdges(stars), center, radius, labelAt }
}

export function layoutSky(entries: SkyEntry[], area: Rect, mobile: boolean): { figures: Figure[]; labels: RegionLabel[] } {
  if (area.w <= 0 || area.h <= 0) return { figures: [], labels: [] }
  const figures: Figure[] = []
  const labels: RegionLabel[] = []
  for (const { region, entries: list } of groupByRegion(entries)) {
    const r = regionRect(region.id, area, mobile)
    labels.push({ region: region.id, name: region.name, section: region.section, at: { x: r.x, y: r.y + 12 } })
    const body = { x: r.x, y: r.y + LABEL_BAND, w: r.w, h: Math.max(1, r.h - LABEL_BAND) }
    gridCells(body, list.length).forEach((cell, i) => figures.push(figureFor(list[i], cell, area)))
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
