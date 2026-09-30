import { describe, expect, it } from 'vitest'
import { sheetGesture } from './sheet'

describe('sheetGesture', () => {
  it('closes on a long downward drag', () => expect(sheetGesture(80, 400)).toBe('close'))
  it('closes on a short fast flick down', () => expect(sheetGesture(30, 40)).toBe('close'))
  it('opens on an upward drag', () => expect(sheetGesture(-50, 300)).toBe('open'))
  it('ignores small or slow moves', () => {
    expect(sheetGesture(10, 300)).toBe('none')
    expect(sheetGesture(30, 400)).toBe('none')
  })
})
