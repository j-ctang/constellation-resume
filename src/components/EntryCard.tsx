import { useEffect, useRef } from 'react'
import { REGIONS, type SkyEntry } from '../sky.config'
import { realTitle } from '../lib/format'
import { Ornament } from './IntroCard'

export default function EntryCard({ entry, onBack }: { entry: SkyEntry; onBack: () => void }) {
  const headingRef = useRef<HTMLHeadingElement>(null)
  useEffect(() => { headingRef.current?.focus() }, [entry.id])
  const region = REGIONS.find(r => r.id === entry.region)
  return (
    <article className="card" aria-labelledby={`card-${entry.id}`}>
      <div className="panel-head">
        <p className="kick">{region?.name}</p>
        <h2 id={`card-${entry.id}`} ref={headingRef} tabIndex={-1}>{entry.poeticName}</h2>
        <Ornament />
      </div>
      <div className="panel-body">
        <p className="card-real">{realTitle(entry)}</p>
        {entry.fields.length > 0 && (
          <dl className="fields">
            {entry.fields.map(f => (
              <div key={f.label} style={{ display: 'contents' }}>
                <dt>{f.label}</dt>
                <dd>{f.value}</dd>
              </div>
            ))}
          </dl>
        )}
        <p className="lore">{entry.lore}</p>
        {entry.bullets.length > 0 && (
          <ul className="bullets">
            {entry.bullets.map((b, i) => <li key={i}>{b}</li>)}
          </ul>
        )}
      </div>
      <div className="panel-foot">
        <button type="button" className="tool" onClick={onBack}>← Return to catalogue</button>
      </div>
    </article>
  )
}
