import { useRef, type PointerEvent } from 'react'
import Credit from './Credit'
import { sheetGesture } from '../lib/sheet'
import { useMoreBelow } from '../lib/useMoreBelow'
import { SHEET_PEEK } from '../sky/layout'
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
  const asideRef = useRef<HTMLElement>(null)
  const indexRef = useRef<HTMLDivElement>(null)
  const moreBelow = useMoreBelow(indexRef)
  const drag = useRef<{ y: number; t: number; moving: boolean } | null>(null)
  const swiped = useRef(false)

  // Drag the sheet by its grip or header: it follows the finger, then snaps open or closed on release.
  const startDrag = (e: PointerEvent<HTMLElement>) => {
    if (!mobile || !(e.target as Element).closest('.grip, .panel-head')) return
    drag.current = { y: e.clientY, t: e.timeStamp, moving: false }
    swiped.current = false
  }
  const moveDrag = (e: PointerEvent<HTMLElement>) => {
    const d = drag.current
    const el = asideRef.current
    if (!d || !el) return
    const dy = e.clientY - d.y
    if (!d.moving) {
      if (Math.abs(dy) < 4) return
      // Capture only once it is a real drag, so a plain tap still reaches the grip's click handler.
      d.moving = true
      el.setPointerCapture?.(e.pointerId)
    }
    el.style.transition = 'none'
    el.style.transform = sheetOpen
      ? `translateY(${Math.max(0, dy)}px)`
      : `translateY(calc(100% - ${SHEET_PEEK}px + ${Math.min(0, dy)}px))`
  }
  const endDrag = (e: PointerEvent<HTMLElement>) => {
    const d = drag.current
    drag.current = null
    const el = asideRef.current
    if (!d) return
    if (el) { el.style.transition = ''; el.style.transform = '' }
    const g = sheetGesture(e.clientY - d.y, e.timeStamp - d.t)
    if (g === 'none') return
    swiped.current = true
    if (g === 'close') { onBack(); onSheetChange(false) } else onSheetChange(true)
  }

  const grip = mobile && (
    <button
      type="button"
      className="grip"
      aria-label="Toggle catalogue"
      aria-expanded={sheetOpen}
      onClick={() => {
        if (swiped.current) { swiped.current = false; return }
        // Closing the sheet dismisses the story, the same as dragging it down or tapping the sky.
        if (sheetOpen) { onBack(); onSheetChange(false) } else onSheetChange(true)
      }}
    >
      <span className="grip-bar" aria-hidden="true" />
      <span className="grip-label">{selected ? selected.poeticName : `Catalogue · ${entries.length}`}</span>
    </button>
  )

  return (
    <aside
      ref={asideRef}
      className={`panel${mobile ? ' sheet' : ''}${mobile && sheetOpen ? ' open' : ''}`}
      aria-label="Resume panel"
      onPointerDown={startDrag}
      onPointerMove={moveDrag}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      {grip}
      <div className="panel-inner" inert={mobile && !sheetOpen}>
      {selected ? (
        <EntryCard entry={selected} onBack={onBack} showBack={!mobile} />
      ) : (
        <>
          <IntroCard />
          <div className="index-wrap">
            <div className={`panel-body${moreBelow.show ? ' has-more' : ''}`} ref={indexRef} onScroll={moreBelow.check}>
              <IndexList entries={entries} hotId={hotId} onSelect={onSelect} onHover={onHover} />
            </div>
            {moreBelow.show && (
              <button type="button" className="more-below" onClick={moreBelow.scrollToEnd}>More below ↓</button>
            )}
          </div>
          <div className="panel-foot">
            <p>Hover a name to light its figure; select it to read the entry.</p>
            <p><a className="tool" href={PROFILE.pdfUrl} download>Download PDF</a></p>
            <p className="credit"><Credit /></p>
          </div>
        </>
      )}
      </div>
    </aside>
  )
}
