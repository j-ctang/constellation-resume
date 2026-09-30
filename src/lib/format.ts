import type { SkyEntry } from '../sky.config'

export function realTitle(e: SkyEntry): string {
  return [e.title, e.org, e.dates].filter(Boolean).join(' · ')
}

const ROMAN: [number, string][] = [[10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']]

export function toRoman(n: number): string {
  let out = ''
  for (const [v, s] of ROMAN) while (n >= v) { out += s; n -= v }
  return out
}
