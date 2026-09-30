import { useEffect, useState } from 'react'
import { ENTRIES } from './sky.config'
import { useMediaQuery } from './lib/useMediaQuery'
import Frame from './components/Frame'
import Masthead from './components/Masthead'
import SidePanel from './components/SidePanel'
import SkyCanvas from './components/SkyCanvas'

export default function App() {
  const mobile = useMediaQuery('(max-width: 760px)')
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [hoverId, setHoverId] = useState<string | null>(null)
  const selected = ENTRIES.find(e => e.id === selectedId) ?? null
  const hotId = hoverId ?? selectedId

  const select = (id: string) => { setSelectedId(id); setHoverId(null) }
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
        showPulse={false}
        onSelect={select}
        onHover={setHoverId}
        onEmptyClick={() => {}}
      />
      <Frame onHelp={() => {}} />
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
    </main>
  )
}
