import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import { readFlag, writeFlag } from './storage'

/** Set once the reader has seen the catalogue is scrollable; the cue never returns. */
export const MORE_BELOW_KEY = 'constellation-resume:catalogue-scrolled'
/** Slow-scroll speed for the "More below" button, in px per second. */
const SCROLL_SPEED = 300

/**
 * "More below" cue for a scrollable list. Shows while content is hidden below the fold, until the reader
 * either reaches the bottom or presses the cue (which slow-scrolls to the bottom). After that it stays gone.
 */
export function useMoreBelow(ref: RefObject<HTMLElement | null>) {
  const [retired, setRetired] = useState(() => readFlag(MORE_BELOW_KEY))
  const [hidden, setHidden] = useState(false)
  const stopScroll = useRef<() => void>(() => {})

  const retire = useCallback(() => {
    setRetired(true)
    writeFlag(MORE_BELOW_KEY)
  }, [])

  const check = useCallback(() => {
    const el = ref.current
    if (!el) return
    const below = el.scrollHeight - el.scrollTop - el.clientHeight > 8
    setHidden(below)
    if (!below && el.scrollHeight > el.clientHeight) retire()
  }, [ref, retire])

  useEffect(() => {
    check()
    window.addEventListener('resize', check)
    return () => {
      window.removeEventListener('resize', check)
      stopScroll.current()
    }
  }, [check])

  /** Slow-scroll to the bottom; any wheel, touch, pointer press or key stops it where it is. */
  const scrollToEnd = useCallback(() => {
    const el = ref.current
    retire()
    if (!el) return
    let raf = 0
    let last: number | null = null
    let stopped = false
    const stop = () => {
      stopped = true
      cancelAnimationFrame(raf)
      el.removeEventListener('wheel', stop)
      el.removeEventListener('touchstart', stop)
      el.removeEventListener('pointerdown', stop)
      window.removeEventListener('keydown', stop)
      stopScroll.current = () => {}
    }
    const step = (now: number) => {
      if (stopped) return
      const end = el.scrollHeight - el.clientHeight
      if (last !== null) el.scrollTop = Math.min(end, el.scrollTop + (SCROLL_SPEED * (now - last)) / 1000)
      last = now
      if (el.scrollTop >= end) { stop(); return }
      raf = requestAnimationFrame(step)
    }
    el.addEventListener('wheel', stop, { passive: true })
    el.addEventListener('touchstart', stop, { passive: true })
    el.addEventListener('pointerdown', stop)
    window.addEventListener('keydown', stop)
    stopScroll.current = stop
    raf = requestAnimationFrame(step)
  }, [ref, retire])

  return { show: hidden && !retired, check, scrollToEnd }
}
