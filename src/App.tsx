import { useEffect, useState } from 'react'
import { ENTRIES } from './sky.config'
import { useMediaQuery } from './lib/useMediaQuery'
import Frame from './components/Frame'
import Masthead from './components/Masthead'
import SidePanel from './components/SidePanel'
import SkyCanvas from './components/SkyCanvas'
import Onboarding from './components/Onboarding'
import { ONBOARD_KEY, readFlag, writeFlag } from './lib/storage'

export default function App() {
  const mobile = useMediaQuery('(max-width: 760px)')
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [hoverId, setHoverId] = useState<string | null>(null)
  const selected = ENTRIES.find(e => e.id === selectedId) ?? null
  const hotId = hoverId ?? selectedId

  const [onboardOpen, setOnboardOpen] = useState(() => !readFlag(ONBOARD_KEY))
  const dismissOnboarding = () => {
    if (!onboardOpen) return
    setOnboardOpen(false)
    writeFlag(ONBOARD_KEY)
  }

  const select = (id: string) => { setSelectedId(id); setHoverId(null); dismissOnboarding() }
  const back = () => setSelectedId(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelectedId(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <main className="app">
      <SkyCanvas
        entries={ENTRIES}
        mobile={mobile}
        reducedMotion={reducedMotion}
        hotId={hotId}
        selectedId={selectedId}
        drawingEnabled
        showPulse={onboardOpen}
        onSelect={select}
        onHover={setHoverId}
        onEmptyClick={dismissOnboarding}
      />
      <Frame onHelp={() => setOnboardOpen(true)} />
      <Masthead />
      <SidePanel
        entries={ENTRIES}
        selected={selected}
        hotId={hotId}
        mobile={mobile}
        sheetOpen={false}
        onSelect={select}
        onHover={setHoverId}
        onBack={back}
        onSheetChange={() => {}}
      />
      <Onboarding open={onboardOpen} onDismiss={dismissOnboarding} />
    </main>
  )
}
