import { useEffect, useMemo, useRef } from 'react'
import Credit from './Credit'
import { PROFILE, type SkyEntry } from '../sky.config'
import { groupByRegion } from '../lib/regions'
import RealTitle from './RealTitle'
import { MiniFigure, SkyBand } from './PrintSky'
import { bandFigures } from '../sky/band'

const SITE_URL = 'https://j-ctang.github.io/constellation-resume/'

export default function ScrollView({ entries, onBack }: { entries: SkyEntry[]; onBack: () => void }) {
  const headRef = useRef<HTMLHeadingElement>(null)
  useEffect(() => { headRef.current?.focus() }, [])
  const figures = useMemo(() => bandFigures(entries), [entries])
  return (
    <main className="scroll">
      <div className="scroll-bar">
        <button type="button" className="tool" onClick={onBack}>← Return to the sky</button>
        <a className="tool primary" href={PROFILE.pdfUrl} download>Download PDF</a>
      </div>
      <header className="scroll-head">
        <SkyBand figures={[...figures.values()]} />
        <h1 ref={headRef} tabIndex={-1}>{PROFILE.name}</h1>
        <p className="scroll-role">{PROFILE.role}</p>
        <p className="scroll-caption print-only">A resume, charted as constellations</p>
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
              {figures.has(e.id) && <MiniFigure fig={figures.get(e.id)!} />}
              <h3 id={`art-${e.id}`}><RealTitle entry={e} /></h3>
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
              {e.link && <p className="entry-link"><a href={e.link.href}>{e.link.label}</a></p>}
              <p className="scroll-poetic"><em>{e.poeticName}</em><span className="scroll-lore"> — {e.lore}</span></p>
            </article>
          ))}
        </section>
      ))}
      <p className="scroll-teaser print-only">
        <em>This resume is also a night sky. Each role is a constellation; draw your own at </em>
        <a href={SITE_URL}>{SITE_URL.replace('https://', '').replace(/\/$/, '')}</a>
      </p>
      <footer className="credit">
        <Credit />
      </footer>
    </main>
  )
}
