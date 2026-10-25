import { describe, it, expect } from 'vitest'
import { episodeLabel, episodeRangeLabel, episodePosition } from '@/lib/episodes'
import { Season } from '@/types/media'

// Breaking Bad: 7, 13, 13, 13, 16 (+ a specials season that must be ignored)
const seasons: Season[] = [
  { id: 0, seasonNumber: 0, episodeCount: 9, name: 'Specials', airDate: null },
  { id: 1, seasonNumber: 1, episodeCount: 7, name: 'Season 1', airDate: null },
  { id: 2, seasonNumber: 2, episodeCount: 13, name: 'Season 2', airDate: null },
  { id: 3, seasonNumber: 3, episodeCount: 13, name: 'Season 3', airDate: null },
  { id: 4, seasonNumber: 4, episodeCount: 13, name: 'Season 4', airDate: null },
  { id: 5, seasonNumber: 5, episodeCount: 16, name: 'Season 5', airDate: null },
]

describe('episodePosition', () => {
  it('maps absolute numbers across season boundaries', () => {
    expect(episodePosition(1, seasons)).toEqual({ season: 1, episode: 1 })
    expect(episodePosition(7, seasons)).toEqual({ season: 1, episode: 7 })
    expect(episodePosition(8, seasons)).toEqual({ season: 2, episode: 1 })
    expect(episodePosition(62, seasons)).toEqual({ season: 5, episode: 16 })
  })

  it('returns null past the known seasons or without data', () => {
    expect(episodePosition(63, seasons)).toBeNull()
    expect(episodePosition(5, undefined)).toBeNull()
  })
})

describe('labels', () => {
  it('labels single episodes and ranges', () => {
    expect(episodeLabel(8, seasons)).toBe('S2 E1')
    expect(episodeRangeLabel(1, 5, seasons)).toBe('S1 E1–E5')
    expect(episodeRangeLabel(6, 10, seasons)).toBe('S1 E6 – S2 E3')
    expect(episodeRangeLabel(9, 9, seasons)).toBe('S2 E2')
  })

  it('falls back to plain numbers without season data', () => {
    expect(episodeLabel(47)).toBe('Episode 47')
    expect(episodeRangeLabel(21, 25)).toBe('Episodes 21–25')
  })
})
