import { describe, expect, it } from 'vitest'
import { hashString, mulberry32 } from './rng'

describe('rng', () => {
  it('hashString is stable and distinguishes ids', () => {
    expect(hashString('makermods')).toBe(hashString('makermods'))
    expect(hashString('makermods')).not.toBe(hashString('uci'))
  })
  it('mulberry32 repeats for the same seed and stays in [0,1)', () => {
    const a = mulberry32(42), b = mulberry32(42)
    for (let i = 0; i < 100; i++) {
      const x = a()
      expect(x).toBe(b())
      expect(x).toBeGreaterThanOrEqual(0)
      expect(x).toBeLessThan(1)
    }
  })
})
