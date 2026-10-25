import { test, expect, Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

// A mixed list saved on this device: series and films interleaved
const list = {
  id: 'e2emix',
  title: 'Mixed Marathon',
  createdAt: '2026-10-01T00:00:00.000Z',
  items: [
    {
      tmdbId: 1,
      title: 'Show One',
      mediaType: 'tv',
      posterPath: null,
      runtime: 10 * 30,
      releaseYear: '2015',
      episodes: 10,
      seasons: [5, 5],
    },
    {
      tmdbId: 2,
      title: 'Film Two',
      mediaType: 'movie',
      posterPath: null,
      runtime: 110,
      releaseYear: '2010',
    },
    {
      tmdbId: 3,
      title: 'Show Three',
      mediaType: 'tv',
      posterPath: null,
      runtime: 6 * 45,
      releaseYear: '2020',
      episodes: 6,
    },
  ],
}

async function seed(page: Page) {
  await page.goto('/library')
  await page.evaluate(
    (l) => localStorage.setItem('bingely_custom_lists', JSON.stringify([l])),
    list
  )
}

async function axe(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()
  return results.violations.map(
    (v) =>
      `${v.id} (${v.impact}): ${v.nodes.length} × ${v.nodes[0]?.target.join(' ')}`
  )
}

test.describe('Custom lists', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await seed(page)
  })

  test('reordering in the planner saves and plans in that order', async ({
    page,
  }) => {
    await page.goto(`/list/${list.id}/plan`)
    await page.getByRole('button', { name: 'Move Show Three up' }).click()

    const order = page.getByRole('region', { name: 'Watch order' })
    await expect(order.getByRole('listitem').nth(1)).toContainText('Show Three')
    const stored = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('bingely_custom_lists')!)[0].items.map(
        (i: { title: string }) => i.title
      )
    )
    expect(stored).toEqual(['Show One', 'Show Three', 'Film Two'])

    await page.getByRole('button', { name: /generate watch plan/i }).click()
    const planned = page.getByRole('region', { name: 'In your order' })
    await expect(planned.getByRole('listitem')).toHaveText([
      /Show One/,
      /Show Three/,
      /Film Two/,
    ])
    // Sittings run strictly in list order: the film comes last
    const nights = page.getByRole('region', { name: 'Night by night' })
    const showAll = page.getByRole('button', { name: /show all/i })
    if (await showAll.count()) await showAll.click()
    await expect(nights.getByText(/^Film Two/)).toBeVisible()
    await expect(nights.getByText(/^Show One · S1 E1/).first()).toBeVisible()
  })

  test('starting a series partway through is planned from there', async ({
    page,
  }) => {
    await page.goto(`/list/${list.id}/plan`)
    const start = page.getByRole('group', { name: 'Where to start Show One' })
    await start.getByRole('combobox', { name: 'Season' }).selectOption('2')
    await page.getByRole('button', { name: /generate watch plan/i }).click()
    const planned = page.getByRole('region', { name: 'In your order' })
    await expect(planned.getByText(/S2 E1–E5 · 5 eps/)).toBeVisible()
  })

  test('a shared list can be edited and saved as your own', async ({
    page,
  }) => {
    await page.goto(`/list/${list.id}/plan`)
    await page.getByRole('button', { name: /generate watch plan/i }).click()
    await expect(page).toHaveURL(/results/)

    // Someone else opening the link has no copy of the list
    await page.evaluate(() => localStorage.clear())
    await page.getByRole('link', { name: /edit this plan/i }).click()
    await expect(page.getByText(/shared with you/i)).toBeVisible()
    await page.getByRole('button', { name: 'Remove Film Two' }).click()
    await page.getByRole('button', { name: /save to my library/i }).click()

    await expect(page).not.toHaveURL(new RegExp(`/list/${list.id}/`))
    const stored = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('bingely_custom_lists')!)[0].items.map(
        (i: { title: string }) => i.title
      )
    )
    expect(stored).toEqual(['Show One', 'Show Three'])
  })

  test('list planner and results have no accessibility violations', async ({
    page,
  }) => {
    await page.goto(`/list/${list.id}/plan`)
    await page.waitForSelector('text=Watch order')
    await page.waitForTimeout(500)
    expect(await axe(page)).toEqual([])

    await page.getByRole('button', { name: /generate watch plan/i }).click()
    await page.waitForSelector('text=Night by night')
    await page.waitForTimeout(500)
    expect(await axe(page)).toEqual([])
  })
})
