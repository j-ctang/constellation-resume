import { PROFILE } from '../sky.config'

export default function Masthead() {
  return (
    <header className="masthead">
      <p className="kicker">Tabula Caeli<span className="yr"> · Anno MMXXVI</span></p>
      <h1>{PROFILE.name}</h1>
      <svg className="rule" viewBox="0 0 360 14" aria-hidden="true" preserveAspectRatio="none">
        <path d="M0 7H150M210 7H360" stroke="currentColor" strokeWidth=".8" opacity=".7" />
        <path d="M20 10H150M210 10H340" stroke="currentColor" strokeWidth=".4" opacity=".45" />
        <path d="M180 0l2.2 4.8L187 7l-4.8 2.2L180 14l-2.2-4.8L173 7l4.8-2.2z" fill="currentColor" />
        <circle cx="160" cy="7" r="1.6" fill="currentColor" />
        <circle cx="200" cy="7" r="1.6" fill="currentColor" />
      </svg>
      <p className="sub"><em>A resume in the stars.</em> Select a <b>constellation</b> to read its entry.</p>
    </header>
  )
}
