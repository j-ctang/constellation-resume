import type { SkyEntry } from '../sky.config'

/** "Title · Org · Dates", with the org linked when it has a URL. Same text as realTitle(). */
export default function RealTitle({ entry }: { entry: SkyEntry }) {
  const org = entry.org && (entry.orgUrl
    ? <a href={entry.orgUrl} target="_blank" rel="noreferrer">{entry.org}</a>
    : entry.org)
  const parts = [entry.title, org, entry.dates].filter(Boolean)
  return <>{parts.map((p, i) => <span key={i}>{i > 0 && ' · '}{p}</span>)}</>
}
