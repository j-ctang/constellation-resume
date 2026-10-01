import { describe, expect, it } from 'vitest'
import { ENTRIES } from '../sky.config'
import { BAND_H, BAND_W, bandFigures } from './band'

describe('bandFigures', () => {
  it('gives every entry a constellation inside the band', () => {
    const figs = bandFigures(ENTRIES)
    expect([...figs.keys()]).toEqual(ENTRIES.map(e => e.id))
    for (const f of figs.values()) for (const s of f.stars) {
      expect(s.x).toBeGreaterThanOrEqual(0); expect(s.x).toBeLessThanOrEqual(BAND_W)
      expect(s.y).toBeGreaterThanOrEqual(0); expect(s.y).toBeLessThanOrEqual(BAND_H)
    }
  })
})
