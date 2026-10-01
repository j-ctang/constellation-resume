/**
 * How a constellation is emphasised. Hovering or selecting one lights it and
 * dims the rest; a selection stays dimmed until it is cleared.
 */
export function figureHighlight(id: string, hoverId: string | null, selectedId: string | null): { lit: boolean; dim: boolean } {
  const lit = id === hoverId || id === selectedId
  return { lit, dim: (hoverId !== null || selectedId !== null) && !lit }
}

/** Move `current` toward `target` at a steady rate that covers 0→1 in `durationMs`; 0 jumps straight there. */
export function approach(current: number, target: number, dtMs: number, durationMs: number): number {
  if (durationMs <= 0) return target
  const step = dtMs / durationMs
  return current < target ? Math.min(target, current + step) : Math.max(target, current - step)
}
