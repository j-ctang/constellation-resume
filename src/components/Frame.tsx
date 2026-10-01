const CORNER = (
  <>
    <path d="M6 29V6h23" fill="none" stroke="currentColor" strokeWidth="1" />
    <path d="M10 29V10h19" fill="none" stroke="currentColor" strokeWidth=".6" opacity=".6" />
    <path d="M6 6l6 6" stroke="currentColor" strokeWidth=".8" />
    <circle cx="13.5" cy="13.5" r="2" fill="currentColor" />
  </>
)

export default function Frame({ onHelp }: { onHelp: () => void }) {
  return (
    <>
      <div className="frame" aria-hidden="true">
        {(['tl', 'tr', 'bl', 'br'] as const).map(c => (
          <svg key={c} className={`corner ${c}`} viewBox="0 0 30 30">{CORNER}</svg>
        ))}
      </div>
      <button type="button" className="help" onClick={onHelp} aria-label="How to draw your own constellations">?</button>
    </>
  )
}
