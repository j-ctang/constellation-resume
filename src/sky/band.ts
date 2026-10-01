import type { SkyEntry } from '../sky.config'
import { layoutSky, type Figure } from './layout'

// The printed header charts the desktop sky into a fixed-size band.
export const BAND_W = 1000
export const BAND_H = 260

/** Desktop-layout figures for the printed band, keyed by entry id. */
export function bandFigures(entries: SkyEntry[]): Map<string, Figure> {
  return new Map(layoutSky(entries, { x: 0, y: 0, w: BAND_W, h: BAND_H }, false).figures.map(f => [f.id, f]))
}
