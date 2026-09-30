import { describe, expect, it } from 'vitest'
import type { SkyEntry } from '../sky.config'
import { groupByRegion } from './regions'

const e = (id: string, region: SkyEntry['region']): SkyEntry => ({
  id, region, poeticName: id, lore: '', title: id, fields: [], bullets: [],
})

describe('groupByRegion', () => {
  it('orders groups by REGIONS order and keeps entry order', () => {
    const groups = groupByRegion([e('b', 'toolmakers'), e('a', 'guild'), e('c', 'toolmakers')])
    expect(groups.map(g => g.region.id)).toEqual(['guild', 'toolmakers'])
    expect(groups[1].entries.map(x => x.id)).toEqual(['b', 'c'])
  })

  it('omits regions with no entries', () => {
    const groups = groupByRegion([e('a', 'guild')])
    expect(groups.map(g => g.region.id)).toEqual(['guild'])
  })

  it('returns [] for no entries', () => {
    expect(groupByRegion([])).toEqual([])
  })
})
