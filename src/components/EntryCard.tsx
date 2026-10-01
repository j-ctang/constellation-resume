import { useEffect, useRef } from 'react'
import { REGIONS, type SkyEntry } from '../sky.config'
import RealTitle from './RealTitle'
import { Ornament } from './IntroCard'

export default function EntryCard({ entry, onBack }: { entry: SkyEntry; onBack: () => void }) {
  const headingRef = useRef<HTMLHeadingElement>(null)
  useEffect(() => { headingRef.current?.focus({ preventScroll: true }) }, [entry.id])
  const region = REGIONS.find(r => r.id === entry.region)
  return (
    <article className="card" aria-labelledby={`card-${entry.id}`}>
      <div className="panel-head">
        <button type="button" className="card-back" onClick={onBack} aria-label="Return to catalogue">‹ Catalogue</button>
        <p className="kick">{region?.name}</p>
        <h2 id={`card-${entry.id}`} ref={headingRef} tabIndex={-1}>{entry.poeticName}</h2>
        <Ornament />
      </div>
      <div className="panel-body">
        <p className="card-real"><RealTitle entry={entry} /></p>
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
        {entry.link && (
          <p className="entry-link">
            <a href={entry.link.href} target="_blank" rel="noreferrer">{entry.link.label} ↗</a>
          </p>
        )}
      </div>
    </article>
  )
}
