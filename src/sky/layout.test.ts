import { describe, expect, it } from 'vitest'
import { ENTRIES, type SkyEntry } from '../sky.config'
import {
  backgroundStars, emptySpot, layoutSky, regionRects, skyArea, spanningEdges, SHEET_PEEK, type Rect,
} from './layout'

const e = (id: string, region: SkyEntry['region']): SkyEntry => ({
  id, region, poeticName: id, lore: '', title: id, fields: [], bullets: [],
})
const FIX = [e('a', 'guild'), e('b', 'toolmakers'), e('c', 'toolmakers'), e('d', 'toolmakers'), e('u', 'academy')]
const inside = (p: { x: number; y: number }, r: Rect) =>
  p.x >= r.x - 0.5 && p.x <= r.x + r.w + 0.5 && p.y >= r.y - 0.5 && p.y <= r.y + r.h + 0.5

function connected(n: number, edges: [number, number][]) {
  const parent = Array.from({ length: n }, (_, i) => i)
  const find = (x: number): number => (parent[x] === x ? x : (parent[x] = find(parent[x])))
  for (const [a, b] of edges) parent[find(a)] = find(b)
  return new Set(parent.map((_, i) => find(i))).size === 1
}

describe('skyArea', () => {
  it('reserves the panel on desktop', () => {
    expect(skyArea(1440, 900, false)).toEqual({ x: 0, y: 0, w: 1440 - 380, h: 900 })
    expect(skyArea(900, 700, false)).toEqual({ x: 0, y: 0, w: 900 - 340, h: 700 })
  })
  it('reserves the sheet peek on mobile', () => {
    expect(skyArea(390, 844, true)).toEqual({ x: 0, y: 0, w: 390, h: 844 - SHEET_PEEK })
  })
})

describe('spanningEdges', () => {
  it('makes n-1 edges that connect every point', () => {
    const pts = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 0, y: 10 }, { x: 50, y: 50 }]
    const edges = spanningEdges(pts)
    expect(edges).toHaveLength(3)
    expect(connected(4, edges)).toBe(true)
  })
  it('handles 0 and 1 points', () => {
    expect(spanningEdges([])).toEqual([])
    expect(spanningEdges([{ x: 1, y: 1 }])).toEqual([])
  })
})

describe('layoutSky', () => {
  const area = skyArea(1440, 900, false)

  it('is deterministic', () => {
    expect(layoutSky(FIX, area, false)).toEqual(layoutSky(FIX, area, false))
  })

  it('gives each figure 4-7 stars and a connected tree', () => {
    for (const f of layoutSky(FIX, area, false).figures) {
      expect(f.stars.length).toBeGreaterThanOrEqual(4)
      expect(f.stars.length).toBeLessThanOrEqual(7)
      expect(f.edges).toHaveLength(f.stars.length - 1)
      expect(connected(f.stars.length, f.edges)).toBe(true)
    }
  })

  it('labels only regions that have entries', () => {
    const { labels } = layoutSky(FIX, area, false)
    expect(labels.map(l => l.region)).toEqual(['guild', 'academy', 'toolmakers'])
  })

  it('returns nothing for a zero-size area', () => {
    expect(layoutSky(FIX, { x: 0, y: 0, w: 0, h: 0 }, false)).toEqual({ figures: [], labels: [] })
  })

  // Review Focus #2: odd viewports
  it.each([
    [320, 480, true],
    [390, 844, true],
    [844, 390, false],
    [1024, 768, false],
    [2560, 1440, false],
  ])('keeps stars in their region and labels in the sky at %ix%i', (w, h, mobile) => {
    const a = skyArea(w, h, mobile)
    const { figures } = layoutSky(ENTRIES, a, mobile)
    expect(figures).toHaveLength(ENTRIES.length)
    for (const f of figures) {
      const r = regionRects(ENTRIES, a, mobile)[f.region]!
      for (const s of f.stars) expect(inside(s, r)).toBe(true)
      expect(inside(f.labelAt, a)).toBe(true)
    }
  })
})

describe('layoutSky on mobile', () => {
  const a = skyArea(390, 844, true)
  const { figures } = layoutSky(ENTRIES, a, true)

  it('puts at most 2 constellations side by side', () => {
    for (const f of figures) expect(f.labelMaxWidth).toBeGreaterThanOrEqual(a.w * 0.4)
  })

  it('stacks regions without overlap, top to bottom', () => {
    const rects = Object.values(regionRects(ENTRIES, a, true)).sort((p, q) => p!.y - q!.y)
    for (let i = 1; i < rects.length; i++) expect(rects[i]!.y).toBeGreaterThanOrEqual(rects[i - 1]!.y + rects[i - 1]!.h - 0.5)
  })

  it('keeps every halo inside its own region', () => {
    const rects = regionRects(ENTRIES, a, true)
    for (const f of figures) {
      const r = rects[f.region]!
      expect(f.center.y - f.radius).toBeGreaterThanOrEqual(r.y - 0.5)
      expect(f.center.y + f.radius).toBeLessThanOrEqual(r.y + r.h + 0.5)
    }
  })

  it('gives each constellation a tap target at least 44px tall and wide', () => {
    for (const f of figures) {
      expect(f.hit.w).toBeGreaterThanOrEqual(44)
      expect(f.hit.h).toBeGreaterThanOrEqual(44)
    }
  })

  it('bounds labels to the sky with an edge margin', () => {
    for (const f of figures) {
      expect(f.labelMinX).toBeGreaterThanOrEqual(a.x)
      expect(f.labelMaxX).toBeLessThanOrEqual(a.x + a.w)
    }
  })
})

describe('backgroundStars', () => {
  it('is deterministic, in bounds, and capped', () => {
    const a = backgroundStars(800, 600)
    expect(a).toEqual(backgroundStars(800, 600))
    for (const s of a) expect(inside(s, { x: 0, y: 0, w: 800, h: 600 })).toBe(true)
    expect(backgroundStars(5000, 5000).length).toBeLessThanOrEqual(900)
  })
})

describe('emptySpot', () => {
  it('lands inside the area and outside every figure', () => {
    const area = skyArea(1440, 900, false)
    const { figures } = layoutSky(ENTRIES, area, false)
    const p = emptySpot(figures, area)
    expect(inside(p, area)).toBe(true)
    for (const f of figures) expect(Math.hypot(p.x - f.center.x, p.y - f.center.y)).toBeGreaterThan(f.radius)
  })
  it('falls back to the area centre with no figures', () => {
    expect(emptySpot([], { x: 0, y: 0, w: 100, h: 50 })).toEqual({ x: 50, y: 25 })
  })
})
