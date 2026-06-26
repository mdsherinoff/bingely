import { test, expect } from '@playwright/test'

test.describe('API routes', () => {
  test('search API returns results', async ({ request }) => {
    const res = await request.get('/api/search?q=inception')
    expect(res.status()).toBe(200)
    const data = await res.json()
    expect(Array.isArray(data)).toBe(true)
    expect(data.length).toBeGreaterThan(0)
  })

  test('search API returns 400 without query', async ({ request }) => {
    const res = await request.get('/api/search')
    expect(res.status()).toBe(400)
  })

  test('trending API returns results', async ({ request }) => {
    const res = await request.get('/api/trending')
    expect(res.status()).toBe(200)
    const data = await res.json()
    expect(Array.isArray(data)).toBe(true)
    expect(data.length).toBeGreaterThan(0)
  })

  test('media API returns TV details', async ({ request }) => {
    const res = await request.get('/api/media/1396?type=tv')
    expect(res.status()).toBe(200)
    const data = await res.json()
    expect(data.title).toBe('Breaking Bad')
    expect(data.mediaType).toBe('tv')
    expect(data.episodeCount).toBeGreaterThan(0)
  })

  test('media API returns movie details', async ({ request }) => {
    const res = await request.get('/api/media/550?type=movie')
    expect(res.status()).toBe(200)
    const data = await res.json()
    expect(data.mediaType).toBe('movie')
    expect(data.runtime).toBeGreaterThan(0)
  })

  test('media API returns 400 without type', async ({ request }) => {
    const res = await request.get('/api/media/1396')
    expect(res.status()).toBe(400)
  })

  test('plan API generates a valid plan', async ({ request }) => {
    const schedule: Record<
      string,
      { enabled: boolean; windows: { start: string; end: string }[] }
    > = {
      Monday: { enabled: true, windows: [{ start: '19:00', end: '22:00' }] },
      Tuesday: { enabled: false, windows: [{ start: '19:00', end: '22:00' }] },
      Wednesday: { enabled: true, windows: [{ start: '19:00', end: '22:00' }] },
      Thursday: { enabled: false, windows: [{ start: '19:00', end: '22:00' }] },
      Friday: { enabled: false, windows: [{ start: '19:00', end: '22:00' }] },
      Saturday: { enabled: true, windows: [{ start: '14:00', end: '20:00' }] },
      Sunday: { enabled: true, windows: [{ start: '14:00', end: '20:00' }] },
    }

    const res = await request.post('/api/plan', {
      data: {
        config: { schedule, pace: 'balanced', episodeRuntime: 24 },
        totalEpisodes: 62,
        mediaType: 'tv',
      },
    })

    expect(res.status()).toBe(200)
    const plan = await res.json()
    expect(plan.totalEpisodes).toBe(62)
    expect(plan.weeklyBlocks.length).toBeGreaterThan(0)
    expect(plan.milestones.length).toBe(4)
    expect(plan.completionDate).toBeTruthy()
  })
})
