import { describe, expect, it } from 'vitest'
import { figureHighlight } from './highlight'

describe('figureHighlight', () => {
  it('keeps every constellation bright when nothing is hovered, even with a story open', () => {
    expect(figureHighlight('a', null, 'a')).toEqual({ lit: true, dim: false })
    expect(figureHighlight('b', null, 'a')).toEqual({ lit: false, dim: false })
    expect(figureHighlight('b', null, null)).toEqual({ lit: false, dim: false })
  })

  it('lights the hovered constellation and dims the rest', () => {
    expect(figureHighlight('b', 'b', null)).toEqual({ lit: true, dim: false })
    expect(figureHighlight('c', 'b', null)).toEqual({ lit: false, dim: true })
  })

  it('never dims the open story while hovering another', () => {
    expect(figureHighlight('a', 'b', 'a')).toEqual({ lit: true, dim: false })
  })
})
