import { describe, expect, it } from 'vitest'
import { drawingReducer, initialDrawing, SNAP } from './drawing'

const place = (x: number, y: number) => ({ type: 'place' as const, p: { x, y } })

describe('drawingReducer', () => {
  it('starts a figure then extends it', () => {
    let s = drawingReducer(initialDrawing, place(0, 0))
    s = drawingReducer(s, place(100, 0))
    expect(s.active).toEqual([{ x: 0, y: 0 }, { x: 100, y: 0 }])
    expect(s.figures).toEqual([])
  })

  it('finishes when clicking near the last star', () => {
    let s = drawingReducer(initialDrawing, place(0, 0))
    s = drawingReducer(s, place(100, 0))
    s = drawingReducer(s, place(100 + SNAP - 1, 0))
    expect(s.active).toEqual([])
    expect(s.figures).toEqual([[{ x: 0, y: 0 }, { x: 100, y: 0 }]])
  })

  it('finish keeps figures with 2+ stars and drops single stars', () => {
    const one = drawingReducer(drawingReducer(initialDrawing, place(0, 0)), { type: 'finish' })
    expect(one).toEqual(initialDrawing)
    let two = drawingReducer(initialDrawing, place(0, 0))
    two = drawingReducer(drawingReducer(two, place(50, 50)), { type: 'finish' })
    expect(two.figures).toHaveLength(1)
  })

  it('clear resets everything', () => {
    const s = drawingReducer(drawingReducer(initialDrawing, place(0, 0)), { type: 'clear' })
    expect(s).toEqual(initialDrawing)
  })
})
