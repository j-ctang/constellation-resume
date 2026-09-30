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

export default function SidePanel({ entries, selected, hotId, onSelect, onHover, onBack }: SidePanelProps) {
  return (
    <aside className="panel" aria-label="Resume panel">
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
