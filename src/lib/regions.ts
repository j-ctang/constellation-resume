import { REGIONS, type RegionInfo, type SkyEntry } from '../sky.config'

export function groupByRegion(entries: SkyEntry[]): { region: RegionInfo; entries: SkyEntry[] }[] {
  return REGIONS
    .map(region => ({ region, entries: entries.filter(e => e.region === region.id) }))
    .filter(g => g.entries.length > 0)
}
