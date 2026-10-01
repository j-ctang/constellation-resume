import { describe, expect, it } from 'vitest'
import { ENTRIES, PROFILE, REGIONS } from './sky.config'

describe('sky.config', () => {
  it('has unique kebab-case ids', () => {
    const ids = ENTRIES.map(e => e.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ids) expect(id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/)
  })

  it('uses only known regions', () => {
    const known = new Set(REGIONS.map(r => r.id))
    for (const e of ENTRIES) expect(known.has(e.region)).toBe(true)
  })

  it('keeps bullets to at most 4 and never blank', () => {
    for (const e of ENTRIES) {
      expect(e.bullets.length).toBeLessThanOrEqual(4)
      for (const b of e.bullets) expect(b.trim()).not.toBe('')
    }
  })

  it('has a title, poetic name, and lore for every entry', () => {
    for (const e of ENTRIES) {
      expect(e.title.trim()).not.toBe('')
      expect(e.poeticName.trim()).not.toBe('')
      expect(e.lore.trim()).not.toBe('')
    }
  })

  it('lists the robot arms worked with at MakerMods', () => {
    const arms = ENTRIES.find(e => e.id === 'makermods')!.fields.find(f => f.label === 'Robot arms')!
    expect(arms.value).toBe('Metal Arm · MakerArm · Custom SO-101')
  })

  it('points the PDF at the base path', () => {
    expect(PROFILE.pdfUrl).toMatch(/resume\.pdf$/)
  })
})
