/** Fit a constellation label into maxWidth: one line if it fits, else the most balanced two-line split. */
export function fitLabel(text: string, maxWidth: number, measure: (s: string) => number): string[] {
  const words = text.split(' ')
  if (words.length < 2 || measure(text) <= maxWidth) return [text]
  let best: string[] = [text]
  let bestWidth = Infinity
  for (let i = 1; i < words.length; i++) {
    const lines = [words.slice(0, i).join(' '), words.slice(i).join(' ')]
    const width = Math.max(...lines.map(measure))
    if (width < bestWidth) { bestWidth = width; best = lines }
  }
  return best
}

/** Shift a centred label so [x - half, x + half] stays within [minX, maxX]. */
export function placeLabel(x: number, half: number, minX: number, maxX: number): number {
  if (2 * half >= maxX - minX) return (minX + maxX) / 2
  return Math.min(maxX - half, Math.max(minX + half, x))
}
