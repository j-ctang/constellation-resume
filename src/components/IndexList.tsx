import type { SkyEntry } from '../sky.config'
import { groupByRegion } from '../lib/regions'
import { realTitle, toRoman } from '../lib/format'

interface Props {
  entries: SkyEntry[]
  hotId: string | null
  onSelect: (id: string) => void
  onHover: (id: string | null) => void
}

export default function IndexList({ entries, hotId, onSelect, onHover }: Props) {
  const groups = groupByRegion(entries)
  const offsets = groups.map((_, i) => groups.slice(0, i).reduce((sum, g) => sum + g.entries.length, 0))
  return (
    <nav aria-label="Index of constellations">
      {groups.map(({ region, entries: list }, gi) => (
        <section key={region.id} className="index-group" aria-labelledby={`idx-${region.id}`}>
          <h3 id={`idx-${region.id}`}>{region.name}<span>{region.section}</span></h3>
          <ol className="index">
            {list.map((e, i) => {
              const n = offsets[gi] + i + 1
              return (
                <li key={e.id} className={`entry${hotId === e.id ? ' hot' : ''}`}>
                  <button
                    type="button"
                    className="entry-main"
                    data-entry={e.id}
                    onClick={() => onSelect(e.id)}
                    onMouseEnter={() => onHover(e.id)}
                    onMouseLeave={() => onHover(null)}
                    onFocus={() => onHover(e.id)}
                    onBlur={() => onHover(null)}
                  >
                    <span className="num" aria-hidden="true">{toRoman(n)}</span>
                    <span className="names">
                      <span className="nm">{e.poeticName}</span>
                      <span className="lat">{realTitle(e)}</span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ol>
        </section>
      ))}
    </nav>
  )
}
