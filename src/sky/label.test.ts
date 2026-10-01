import { describe, expect, it } from 'vitest'
import { fitLabel, placeLabel } from './label'

// 10px per character keeps the arithmetic obvious.
const measure = (s: string) => s.length * 10

describe('fitLabel', () => {
  it('keeps a label that fits on one line', () => {
    expect(fitLabel('THE MIMIC', 200, measure)).toEqual(['THE MIMIC'])
  })

  it('wraps a long label onto two balanced lines', () => {
    expect(fitLabel("THE PRUNER'S SHEARS", 120, measure)).toEqual(["THE PRUNER'S", 'SHEARS'])
    expect(fitLabel('THE WATCHFUL BELL', 120, measure)).toEqual(['THE WATCHFUL', 'BELL'])
  })

  it('never splits a single word', () => {
    expect(fitLabel('ASTERISM', 30, measure)).toEqual(['ASTERISM'])
  })
})

describe('placeLabel', () => {
  it('keeps the centre when the label fits', () => {
    expect(placeLabel(100, 40, 0, 390)).toBe(100)
  })

  it('shifts right when the label would leave the left edge', () => {
    expect(placeLabel(20, 60, 6, 384)).toBe(66)
  })

  it('shifts left when the label would leave the right edge', () => {
    expect(placeLabel(370, 60, 6, 384)).toBe(324)
  })

  it('centres in the bounds when the label is wider than them', () => {
    expect(placeLabel(20, 300, 0, 400)).toBe(200)
  })
})
