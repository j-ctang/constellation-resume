/**
 * How a constellation is emphasised. Only hovering dims the others;
 * an open story keeps its own constellation lit without dimming the rest.
 */
export function figureHighlight(id: string, hoverId: string | null, selectedId: string | null): { lit: boolean; dim: boolean } {
  const lit = id === hoverId || id === selectedId
  return { lit, dim: hoverId !== null && !lit }
}
