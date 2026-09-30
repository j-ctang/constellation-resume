import { useEffect, useRef, useState } from 'react'
import { ENTRIES } from './sky.config'
import { useMediaQuery } from './lib/useMediaQuery'
import Frame from './components/Frame'
import Masthead from './components/Masthead'
import SidePanel from './components/SidePanel'
import SkyCanvas from './components/SkyCanvas'
import ScrollView from './components/ScrollView'
import Onboarding from './components/Onboarding'
import { realTitle } from './lib/format'
import { ONBOARD_KEY, readFlag, writeFlag } from './lib/storage'

export default function App() {
  const mobile = useMediaQuery('(max-width: 760px)')
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [hoverId, setHoverId] = useState<string | null>(null)
  const selected = ENTRIES.find(e => e.id === selectedId) ?? null
  const hotId = hoverId ?? selectedId

  const [view, setView] = useState<'sky' | 'scroll'>('sky')
  const [onboardOpen, setOnboardOpen] = useState(() => !readFlag(ONBOARD_KEY))
  const dismissOnboarding = () => {
    if (!onboardOpen) return
    setOnboardOpen(false)
    writeFlag(ONBOARD_KEY)
  }

  const [sheetOpen, setSheetOpen] = useState(false)
  const select = (id: string) => { setSelectedId(id); setHoverId(null); setSheetOpen(true); dismissOnboarding() }
  const onEmptyClick = () => {
    dismissOnboarding()
    if (mobile && sheetOpen) { setSelectedId(null); setSheetOpen(false) }
  }
  const back = () => setSelectedId(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelectedId(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const lastSelected = useRef<string | null>(null)
  useEffect(() => {
    if (selectedId) { lastSelected.current = selectedId; return }
    const id = lastSelected.current
    if (!id) return
    document.querySelector<HTMLButtonElement>(`[data-entry="${id}"]`)?.focus()
  }, [selectedId])

  if (view === 'scroll') return <ScrollView entries={ENTRIES} onBack={() => setView('sky')} />

  return (
    <main className="app">
      <p className="sr-only" role="status" aria-live="polite">
        {selected ? `${selected.poeticName} — ${realTitle(selected)}` : ''}
      </p>
      <SkyCanvas
        entries={ENTRIES}
        mobile={mobile}
        reducedMotion={reducedMotion}
        hotId={hotId}
        selectedId={selectedId}
        drawingEnabled={!(mobile && sheetOpen)}
        showPulse={onboardOpen}
        onSelect={select}
        onHover={setHoverId}
        onEmptyClick={onEmptyClick}
      />
      <Frame onHelp={() => setOnboardOpen(true)} />
      <Masthead />
      <button type="button" className="tool scroll-toggle" onClick={() => setView('scroll')}>Read as scroll</button>
      <SidePanel
        entries={ENTRIES}
        selected={selected}
        hotId={hotId}
        mobile={mobile}
        sheetOpen={sheetOpen}
        onSelect={select}
        onHover={setHoverId}
        onBack={back}
        onSheetChange={setSheetOpen}
      />
      <Onboarding open={onboardOpen} onDismiss={dismissOnboarding} />
    </main>
  )
}
