import { useRef } from 'react'
import { sheetGesture } from '../lib/sheet'
import { PROFILE, type SkyEntry } from '../sky.config'
import EntryCard from './EntryCard'
import IndexList from './IndexList'
import IntroCard from './IntroCard'

export interface SidePanelProps {
  entries: SkyEntry[]
  selected: SkyEntry | null
  hotId: string | null
  mobile: boolean
  sheetOpen: boolean
  onSelect: (id: string) => void
  onHover: (id: string | null) => void
  onBack: () => void
  onSheetChange: (open: boolean) => void
}

export default function SidePanel(props: SidePanelProps) {
  const { entries, selected, hotId, mobile, sheetOpen, onSelect, onHover, onBack, onSheetChange } = props
  const drag = useRef<{ y: number; t: number } | null>(null)
  const swiped = useRef(false)

  const grip = mobile && (
    <button
      type="button"
      className="grip"
      aria-label="Toggle catalogue"
      aria-expanded={sheetOpen}
      onPointerDown={e => { drag.current = { y: e.clientY, t: e.timeStamp }; swiped.current = false }}
      onPointerUp={e => {
        if (!drag.current) return
        const g = sheetGesture(e.clientY - drag.current.y, e.timeStamp - drag.current.t)
        drag.current = null
        if (g === 'none') return
        swiped.current = true
        if (g === 'close') { onBack(); onSheetChange(false) } else onSheetChange(true)
      }}
      onClick={() => {
        if (swiped.current) { swiped.current = false; return }
        onSheetChange(!sheetOpen)
      }}
    >
      <span className="grip-bar" aria-hidden="true" />
      <span className="grip-label">{selected ? selected.poeticName : `Catalogue · ${entries.length}`}</span>
    </button>
  )

  return (
    <aside className={`panel${mobile ? ' sheet' : ''}${mobile && sheetOpen ? ' open' : ''}`} aria-label="Resume panel">
      {grip}
      {selected ? (
        <EntryCard entry={selected} onBack={onBack} />
      ) : (
        <>
          <IntroCard />
          <div className="panel-body">
            <IndexList entries={entries} hotId={hotId} onSelect={onSelect} onHover={onHover} />
          </div>
          <div className="panel-foot">
            <p>Hover a name to light its figure; select it to read the entry.</p>
            <p><a className="tool" href={PROFILE.pdfUrl}>Download PDF</a></p>
          </div>
        </>
      )}
    </aside>
  )
}
