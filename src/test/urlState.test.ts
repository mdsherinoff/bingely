import { describe, it, expect } from 'vitest'
import { encodeState, decodeState, toQuery } from '@/lib/urlState'

// What the browser hands a page: searchParams.get() on the built URL
function readParam(query: string, key: string): string | null {
  return new URLSearchParams(query.replace(/^\?/, '')).get(key)
}

describe('encodeState / decodeState', () => {
  it('round-trips through a real URL', () => {
    const config = { pace: 'balanced', schedule: { Saturday: { enabled: true } } }
    const raw = readParam(`?config=${encodeState(config)}`, 'config')
    expect(decodeState(raw!)).toEqual(config)
  })

  it('still reads links made before compression', () => {
    const goal = { mode: 'standard' }
    const legacy = encodeURIComponent(JSON.stringify(goal))
    expect(decodeState(readParam(`?goal=${legacy}`, 'goal')!)).toEqual(goal)
  })

  it('returns null for garbage', () => {
    expect(decodeState('%%not-a-plan')).toBeNull()
  })
})

describe('toQuery', () => {
  it('survives titles with & and + in them', () => {
    const title = "Tom & Jerry's +Picks"
    const q = toQuery({ title })
    expect(readParam(q, 'title')).toBe(title)
  })

  it('carries a decoded compressed payload forward unchanged', () => {
    // Values come from searchParams.get(), i.e. already decoded; they
    // must be re-encoded so a "+" isn't read back as a space
    const items = Array.from({ length: 20 }, (_, i) => ({
      title: `Title ${i}`,
      runtime: 40 + i,
      mediaType: i % 2 ? 'tv' : 'movie',
    }))
    const decoded = readParam(`?items=${encodeState(items)}`, 'items')!
    const forwarded = readParam(toQuery({ items: decoded }), 'items')!
    expect(forwarded).toBe(decoded)
    expect(decodeState(forwarded)).toEqual(items)
  })

  it('drops empty values and returns "" when nothing is left', () => {
    expect(toQuery({ a: null, b: undefined, c: '' })).toBe('')
    expect(toQuery({ a: '1', b: null })).toBe('?a=1')
  })
})
