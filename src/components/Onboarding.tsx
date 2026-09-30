export default function Onboarding({ open, onDismiss }: { open: boolean; onDismiss: () => void }) {
  if (!open) return null
  return (
    <div className="onboard" role="dialog" aria-modal="false" aria-labelledby="onboard-title">
      <span className="t1" id="onboard-title">An open sky</span>
      <span className="t2">This sky is yours too — click empty space to draw your own constellations.</span>
      <button type="button" className="tool" onClick={onDismiss}>Understood</button>
    </div>
  )
}
