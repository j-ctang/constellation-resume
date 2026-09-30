import { useState } from 'react'
import { ENTRIES } from './sky.config'
import Frame from './components/Frame'
import Masthead from './components/Masthead'
import SidePanel from './components/SidePanel'

export default function App() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [hoverId, setHoverId] = useState<string | null>(null)
  const selected = ENTRIES.find(e => e.id === selectedId) ?? null
  const hotId = hoverId ?? selectedId

  return (
    <main className="app">
      <Frame onHelp={() => {}} />
      <Masthead />
      <SidePanel
        entries={ENTRIES}
        selected={selected}
        hotId={hotId}
        mobile={false}
        sheetOpen={false}
        onSelect={id => { setSelectedId(id); setHoverId(null) }}
        onHover={setHoverId}
        onBack={() => setSelectedId(null)}
        onSheetChange={() => {}}
      />
    </main>
  )
}
