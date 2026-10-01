import { afterEach, describe, expect, it, vi } from 'vitest'
import { readFlag, writeFlag } from './storage'

describe('storage flags', () => {
  afterEach(() => vi.restoreAllMocks())

  it('round-trips a flag', () => {
    expect(readFlag('k')).toBe(false)
    writeFlag('k')
    expect(readFlag('k')).toBe(true)
  })

  it('never throws when storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('SecurityError') })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('QuotaExceeded') })
    expect(readFlag('k')).toBe(false)
    expect(() => writeFlag('k')).not.toThrow()
  })
})
