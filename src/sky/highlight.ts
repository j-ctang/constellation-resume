/**
 * How a constellation is emphasised. Only hovering dims the others;
 * an open story keeps its own constellation lit without dimming the rest.
 */
export function figureHighlight(id: string, hoverId: string | null, selectedId: string | null): { lit: boolean; dim: boolean } {
  const lit = id === hoverId || id === selectedId
  return { lit, dim: hoverId !== null && !lit }
}

/** Move `current` toward `target` at a steady rate that covers 0→1 in `durationMs`; 0 jumps straight there. */
export function approach(current: number, target: number, dtMs: number, durationMs: number): number {
  if (durationMs <= 0) return target
  const step = dtMs / durationMs
  return current < target ? Math.min(target, current + step) : Math.max(target, current - step)
}
