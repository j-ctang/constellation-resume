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
  const hotId = hoverId ?? selectedId // index row emphasis

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
  const pendingFocus = useRef<string | null>(null)
  const back = () => {
    if (selectedId && (!mobile || sheetOpen)) pendingFocus.current = selectedId
    setSelectedId(null)
  }

  const onKeyRef = useRef<(e: KeyboardEvent) => void>(() => {})
  useEffect(() => {
    onKeyRef.current = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || e.defaultPrevented) return
      if (onboardOpen) { dismissOnboarding(); return }
      if (!selectedId) return
      if (mobile) setSheetOpen(false)
      else pendingFocus.current = selectedId
      setSelectedId(null)
    }
  })
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => onKeyRef.current(e)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    const id = pendingFocus.current
    if (selectedId || !id) return
    pendingFocus.current = null
    document.querySelector<HTMLButtonElement>(`[data-entry="${id}"]`)?.focus()
    setHoverId(null)
  }, [selectedId])

  const toggleRef = useRef<HTMLButtonElement>(null)
  const viewChanged = useRef(false)
  useEffect(() => {
    if (!viewChanged.current) { viewChanged.current = true; return }
    if (view === 'sky') toggleRef.current?.focus()
  }, [view])

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
        hotId={hoverId}
        selectedId={selectedId}
        drawingEnabled={!(mobile && sheetOpen)}
        showPulse={onboardOpen}
        onSelect={select}
        onHover={setHoverId}
        onEmptyClick={onEmptyClick}
      />
      <Frame onHelp={() => setOnboardOpen(true)} />
      <Masthead />
      <button ref={toggleRef} type="button" className="tool scroll-toggle" onClick={() => setView('scroll')}>Read as scroll</button>
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
