import { useCallback, useEffect, useState, type RefObject } from 'react'

/** True while a scrollable element has content hidden below its bottom edge. */
export function useMoreBelow(ref: RefObject<HTMLElement | null>): [boolean, () => void] {
  const [more, setMore] = useState(false)
  const check = useCallback(() => {
    const el = ref.current
    if (el) setMore(el.scrollHeight - el.scrollTop - el.clientHeight > 8)
  }, [ref])
  useEffect(() => {
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [check])
  return [more, check]
}
