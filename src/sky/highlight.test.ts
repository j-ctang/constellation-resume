import { describe, expect, it } from 'vitest'
import { approach, figureHighlight } from './highlight'

describe('figureHighlight', () => {
  it('keeps every constellation bright when nothing is hovered or selected', () => {
    expect(figureHighlight('b', null, null)).toEqual({ lit: false, dim: false })
  })

  it('lights the selected constellation and dims the rest until cleared', () => {
    expect(figureHighlight('a', null, 'a')).toEqual({ lit: true, dim: false })
    expect(figureHighlight('b', null, 'a')).toEqual({ lit: false, dim: true })
  })

  it('lights the hovered constellation and dims the rest', () => {
    expect(figureHighlight('b', 'b', null)).toEqual({ lit: true, dim: false })
    expect(figureHighlight('c', 'b', null)).toEqual({ lit: false, dim: true })
  })

  it('never dims the open story while hovering another', () => {
    expect(figureHighlight('a', 'b', 'a')).toEqual({ lit: true, dim: false })
  })
})

describe('approach', () => {
  it('eases toward the target instead of jumping', () => {
    const v = approach(0, 1, 16, 450)
    expect(v).toBeGreaterThan(0)
    expect(v).toBeLessThan(0.1)
  })

  it('arrives after about the given duration', () => {
    let v = 0
    for (let t = 0; t < 450 * 3; t += 16) v = approach(v, 1, 16, 450)
    expect(v).toBeGreaterThan(0.99)
  })

  it('jumps straight there when duration is 0 (reduced motion)', () => {
    expect(approach(0, 1, 16, 0)).toBe(1)
  })
})
