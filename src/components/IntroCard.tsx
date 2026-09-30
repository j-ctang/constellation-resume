import { PROFILE } from '../sky.config'

export function Ornament() {
  return (
    <svg className="orn" viewBox="0 0 150 10" aria-hidden="true">
      <path d="M0 5h62M88 5h62" stroke="currentColor" strokeWidth=".7" />
      <path d="M75 0l1.6 3.4L80 5l-3.4 1.6L75 10l-1.6-3.4L70 5l3.4-1.6z" fill="currentColor" />
      <circle cx="66" cy="5" r="1.2" fill="currentColor" />
      <circle cx="84" cy="5" r="1.2" fill="currentColor" />
    </svg>
  )
}

export default function IntroCard() {
  return (
    <div className="panel-head">
      <p className="kick">Catalogus</p>
      <h2>{PROFILE.role}</h2>
      <p className="lat">{PROFILE.bio}</p>
      <ul className="links">
        {PROFILE.links.map(l => (
          <li key={l.href}>
            <a href={l.href} target={l.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">{l.label}</a>
          </li>
        ))}
      </ul>
      <Ornament />
    </div>
  )
}
