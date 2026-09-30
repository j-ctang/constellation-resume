import { useEffect, useRef } from 'react'
import { PROFILE, type SkyEntry } from '../sky.config'
import { groupByRegion } from '../lib/regions'
import { realTitle } from '../lib/format'

export default function ScrollView({ entries, onBack }: { entries: SkyEntry[]; onBack: () => void }) {
  const headRef = useRef<HTMLHeadingElement>(null)
  useEffect(() => { headRef.current?.focus() }, [])
  return (
    <main className="scroll">
      <div className="scroll-bar">
        <button type="button" className="tool" onClick={onBack}>← Return to the sky</button>
        <a className="tool primary" href={PROFILE.pdfUrl}>Download PDF</a>
      </div>
      <header className="scroll-head">
        <h1 ref={headRef} tabIndex={-1}>{PROFILE.name}</h1>
        <p className="scroll-role">{PROFILE.role}</p>
        <p>{PROFILE.bio}</p>
        <ul className="links">
          {PROFILE.links.map(l => <li key={l.href}><a href={l.href}>{l.label}</a></li>)}
        </ul>
      </header>
      {groupByRegion(entries).map(({ region, entries: list }) => (
        <section key={region.id} aria-labelledby={`sec-${region.id}`}>
          <h2 id={`sec-${region.id}`}>{region.section} <small>{region.name}</small></h2>
          {list.map(e => (
            <article key={e.id} aria-labelledby={`art-${e.id}`}>
              <h3 id={`art-${e.id}`}>{realTitle(e)}</h3>
              {e.fields.length > 0 && (
                <dl className="fields">
                  {e.fields.map(f => (
                    <div key={f.label} style={{ display: 'contents' }}>
                      <dt>{f.label}</dt>
                      <dd>{f.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
              {e.bullets.length > 0 && (
                <ul className="bullets">{e.bullets.map((b, i) => <li key={i}>{b}</li>)}</ul>
              )}
              <p className="scroll-poetic"><em>{e.poeticName}</em> — {e.lore}</p>
            </article>
          ))}
        </section>
      ))}
    </main>
  )
}
