import type { Point } from './layout'

export interface DrawingState { figures: Point[][]; active: Point[] }
export type DrawingAction = { type: 'place'; p: Point } | { type: 'finish' } | { type: 'clear' }

export const SNAP = 14
export const initialDrawing: DrawingState = { figures: [], active: [] }

function finish(s: DrawingState): DrawingState {
  return { figures: s.active.length >= 2 ? [...s.figures, s.active] : s.figures, active: [] }
}

export function drawingReducer(s: DrawingState, a: DrawingAction): DrawingState {
  switch (a.type) {
    case 'place': {
      const last = s.active[s.active.length - 1]
      if (last && Math.hypot(last.x - a.p.x, last.y - a.p.y) < SNAP) return finish(s)
      return { ...s, active: [...s.active, a.p] }
    }
    case 'finish':
      return finish(s)
    case 'clear':
      return initialDrawing
  }
}
