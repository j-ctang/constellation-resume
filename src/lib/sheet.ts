/** Classify a vertical drag on the bottom sheet. dy > 0 means downward. */
export function sheetGesture(dy: number, dtMs: number): 'open' | 'close' | 'none' {
  const velocity = dy / Math.max(1, dtMs)
  if (dy > 60 || (dy > 20 && velocity > 0.5)) return 'close'
  if (dy < -40 || (dy < -20 && velocity < -0.5)) return 'open'
  return 'none'
}
