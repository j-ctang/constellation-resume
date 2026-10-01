import { describe, expect, it } from 'vitest'
import { realTitle, toRoman } from './format'

describe('realTitle', () => {
  it('joins title, org, dates', () => {
    expect(realTitle({ id: 'x', region: 'guild', poeticName: '', lore: '', title: 'Intern', org: 'Acme', dates: '2026', fields: [], bullets: [] }))
      .toBe('Intern · Acme · 2026')
  })
  it('skips missing parts without stray separators', () => {
    expect(realTitle({ id: 'x', region: 'toolmakers', poeticName: '', lore: '', title: 'Systems', fields: [], bullets: [] }))
      .toBe('Systems')
    expect(realTitle({ id: 'x', region: 'academy', poeticName: '', lore: '', title: 'B.S.', dates: '2029', fields: [], bullets: [] }))
      .toBe('B.S. · 2029')
  })
})

describe('toRoman', () => {
  it('converts 1..20', () => {
    expect(toRoman(1)).toBe('I')
    expect(toRoman(4)).toBe('IV')
    expect(toRoman(9)).toBe('IX')
    expect(toRoman(14)).toBe('XIV')
    expect(toRoman(20)).toBe('XX')
  })
})
